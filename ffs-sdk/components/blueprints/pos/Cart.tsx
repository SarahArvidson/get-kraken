/**
 * POS Blueprint - Cart Component
 *
 * Displays items in cart with quantity controls, total cost, and remove functionality.
 * Uses atomic components (Button, InputField, Toast) for consistent styling.
 */

import React, { useState } from "react";
import Button from "../../ui/Button";
import InputField from "../../ui/InputField";
import Toast from "../../ui/Toast";
import Spinner from "../../ui/Spinner";
import { CartProps, CartItem } from "./types";

const cx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function Cart({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyDiscount,
  loading = false,
  className,
}: CartProps) {
  const [discountCode, setDiscountCode] = useState("");
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      variant: "success" | "error" | "info" | "warning";
      show: boolean;
    }>
  >([]);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const addToast = (
    message: string,
    variant: "success" | "error" | "info" | "warning"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant, show: true }]);

    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const handleApplyDiscount = () => {
    if (!discountCode.trim() || !onApplyDiscount) return;

    const success = onApplyDiscount(discountCode.trim());
    if (success) {
      addToast("Discount applied successfully!", "success");
      setDiscountCode("");
      setShowDiscountInput(false);
    } else {
      addToast("Invalid discount code", "error");
    }
  };

  const handleClearCart = () => {
    if (cart.items.length === 0) return;

    if (window.confirm("Are you sure you want to clear the cart?")) {
      onClearCart();
      addToast("Cart cleared", "info");
    }
  };

  if (loading) {
    return (
      <div className={cx("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Spinner size="lg" color="primary" aria-label="Loading cart" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading cart...
          </p>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
      >
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add some products to get started!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Cart Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Cart ({cart.items.length} item{cart.items.length !== 1 ? "s" : ""})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear Cart
          </Button>
        </div>
      </div>

      {/* Cart Items */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {cart.items.map((item) => (
          <CartItemRow
            key={item.product.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      {/* Discount Code Section */}
      {onApplyDiscount && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {cart.discountCode ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Discount Applied: {cart.discountCode}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You saved {formatPrice(cart.discount || 0)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Remove discount logic would be handled by parent
                  addToast("Discount removed", "info");
                }}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>
          ) : (
            <div>
              {showDiscountInput ? (
                <div className="flex gap-2">
                  <InputField
                    type="text"
                    label=""
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDiscountCode(e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyDiscount}
                    disabled={!discountCode.trim()}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowDiscountInput(false);
                      setDiscountCode("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDiscountInput(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  + Add discount code
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cart Summary */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatPrice(cart.subtotal)}
          </span>
        </div>

        {cart.discount && cart.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount ({cart.discountCode}):</span>
            <span>-{formatPrice(cart.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax:</span>
          <span className="text-gray-900 dark:text-gray-100">
            {formatPrice(cart.tax)}
          </span>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900 dark:text-gray-100">Total:</span>
            <span className="text-gray-900 dark:text-gray-100">
              {formatPrice(cart.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Stack */}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => {
            setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          }}
          className={`top-${4 + index * 20}`}
        />
      ))}
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps) {
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const itemTotal = item.product.price * item.quantity;

  return (
    <div className="p-4">
      <div className="flex items-center gap-4">
        {/* Product Image Placeholder */}
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
          {item.product.imageUrl ? (
            <img
              src={item.product.imageUrl}
              alt={item.product.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <span className="text-gray-400 dark:text-gray-500 text-lg">📦</span>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {item.product.name}
          </h4>
          {item.product.category && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {item.product.category}
            </p>
          )}
          {item.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              Note: {item.notes}
            </p>
          )}
        </div>

        {/* Price and Quantity Controls */}
        <div className="flex items-center gap-4">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onUpdateQuantity(
                  item.product.id,
                  Math.max(1, item.quantity - 1)
                )
              }
              className="!p-1 !min-w-0 h-8 w-8 rounded-r-none"
              disabled={item.quantity <= 1}
            >
              -
            </Button>
            <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onUpdateQuantity(item.product.id, item.quantity + 1)
              }
              className="!p-1 !min-w-0 h-8 w-8 rounded-l-none"
            >
              +
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right min-w-[4rem]">
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {formatPrice(itemTotal)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {formatPrice(item.product.price)} each
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(item.product.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 !p-1 !min-w-0 h-8 w-8"
          >
            ×
          </Button>
        </div>
      </div>
    </div>
  );
}
