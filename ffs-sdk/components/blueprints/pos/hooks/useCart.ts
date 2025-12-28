/**
 * POS Blueprint - Cart State Management Hook
 *
 * Manages cart state including items, quantities, totals, and discounts.
 * Provides methods for adding, removing, and updating cart items.
 */

import { useState, useCallback, useMemo } from "react";
import { Cart, CartItem, Product, Discount, UseCartReturn } from "../types";

const TAX_RATE = 0.08; // 8% tax rate - configurable in real implementation

export function useCart(initialCart?: Cart): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>(
    initialCart?.items || []
  );
  const [discount, setDiscount] = useState<Discount | null>(null);

  // Calculate cart totals
  const cart = useMemo((): Cart => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Apply discount
    let discountAmount = 0;
    if (discount) {
      if (discount.type === "percentage") {
        discountAmount = subtotal * (discount.value / 100);
      } else {
        discountAmount = discount.value;
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = discountedSubtotal * TAX_RATE;
    const total = discountedSubtotal + tax;

    return {
      items: cartItems,
      subtotal,
      tax,
      total,
      discount: discountAmount,
      discountCode: discount?.code,
    };
  }, [cartItems, discount]);

  // Add item to cart
  const addItem = useCallback((product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity }];
      }
    });
  }, []);

  // Remove item from cart
  const removeItem = useCallback((productId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      );
    },
    [removeItem]
  );

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    setDiscount(null);
  }, []);

  // Apply discount code
  const applyDiscount = useCallback((code: string): boolean => {
    // Mock discount validation - in real implementation, this would call an API
    const mockDiscounts: Discount[] = [
      {
        id: "SAVE10",
        code: "SAVE10",
        type: "percentage",
        value: 10,
        description: "10% off your order",
        isActive: true,
      },
      {
        id: "SAVE20",
        code: "SAVE20",
        type: "percentage",
        value: 20,
        description: "20% off your order",
        isActive: true,
      },
      {
        id: "FIXED5",
        code: "FIXED5",
        type: "fixed",
        value: 5,
        description: "$5 off your order",
        isActive: true,
      },
    ];

    const foundDiscount = mockDiscounts.find(
      (d) => d.code.toUpperCase() === code.toUpperCase()
    );

    if (foundDiscount && foundDiscount.isActive) {
      setDiscount(foundDiscount);
      return true;
    }

    return false;
  }, []);

  // Remove discount
  const removeDiscount = useCallback(() => {
    setDiscount(null);
  }, []);

  // Computed properties
  const isEmpty = cartItems.length === 0;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    removeDiscount,
    isEmpty,
    itemCount,
  };
}
