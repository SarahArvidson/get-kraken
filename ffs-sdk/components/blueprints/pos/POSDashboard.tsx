/**
 * POS Blueprint - POSDashboard Component
 *
 * Main dashboard that combines all POS components into a cohesive interface.
 * Demonstrates end-to-end POS flow from product browsing to checkout.
 */

import React, { useState } from "react";
import Button from "../../ui/Button";
import Toast from "../../ui/Toast";
import {
  POSDashboardProps,
  Product,
  Order,
  PaymentMethod,
  CustomerInfo,
} from "./types";
import { useCart } from "./hooks/useCart";
import { useProducts } from "./hooks/useProducts";
import { useOrders } from "./hooks/useOrders";
import ProductList from "./ProductList";
import Cart from "./Cart";
import CheckoutSummary from "./CheckoutSummary";
import PaymentButton from "./PaymentButton";

const cx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function POSDashboard({
  products: initialProducts,
  onProductUpdate,
  onOrderComplete,
  onPaymentProcess,
  className,
}: POSDashboardProps) {
  // State management
  const { products } = useProducts(initialProducts);
  const {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscount,
    isEmpty,
  } = useCart();
  const { addOrder } = useOrders();

  // UI state
  const [currentStep, setCurrentStep] = useState<
    "browse" | "checkout" | "payment"
  >("browse");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | undefined>();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      variant: "success" | "error" | "info" | "warning";
      show: boolean;
    }>
  >([]);

  const addToast = (
    message: string,
    variant: "success" | "error" | "info" | "warning"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant, show: true }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const handleAddToCart = (product: Product, quantity: number = 1) => {
    addItem(product, quantity);
    addToast(`${product.name} added to cart`, "success");
  };

  const handleViewProduct = (product: Product) => {
    // In a real implementation, this might open a product detail modal
    addToast(`Viewing ${product.name}`, "info");
  };

  const handleApplyDiscount = (code: string): boolean => {
    const success = applyDiscount(code);
    if (success) {
      addToast(`Discount code "${code}" applied!`, "success");
    } else {
      addToast(`Invalid discount code: "${code}"`, "error");
    }
    return success;
  };

  const handleCheckout = () => {
    if (isEmpty) {
      addToast("Cart is empty", "error");
      return;
    }
    setCurrentStep("checkout");
  };

  const handlePayment = async (paymentMethod: PaymentMethod) => {
    setIsProcessingPayment(true);

    try {
      // Create order
      const order: Order = {
        id: `ORD-${Date.now()}`,
        items: cart.items,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        discount: cart.discount,
        discountCode: cart.discountCode,
        customerInfo,
        paymentMethod: paymentMethod.type,
        status: "completed",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to order history
      addOrder(order);

      // Call payment processing handler if provided
      if (onPaymentProcess) {
        await onPaymentProcess(order, paymentMethod);
      }

      // Call order completion handler if provided
      if (onOrderComplete) {
        onOrderComplete(order);
      }

      // Clear cart and reset UI
      clearCart();
      setCurrentStep("browse");
      setCustomerInfo(undefined);

      addToast(`Order completed successfully! Order #${order.id}`, "success");
    } catch (error) {
      console.error("Payment processing failed:", error);
      addToast("Payment processing failed. Please try again.", "error");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelCheckout = () => {
    setCurrentStep("browse");
    setCustomerInfo(undefined);
  };

  const handleCustomerInfoChange = (info: CustomerInfo) => {
    setCustomerInfo(info);
  };

  return (
    <div className={cx("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Point of Sale System
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep === "browse" && "Browse products and add to cart"}
                {currentStep === "checkout" &&
                  "Review order and customer information"}
                {currentStep === "payment" && "Process payment"}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Cart Summary */}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Cart: {cart.items.length} item
                  {cart.items.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total: ${cart.total.toFixed(2)}
                </p>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant={currentStep === "browse" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setCurrentStep("browse")}
                >
                  Browse
                </Button>
                {!isEmpty && (
                  <Button
                    variant={
                      currentStep === "checkout" ? "primary" : "secondary"
                    }
                    size="sm"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentStep === "browse" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products */}
            <div className="lg:col-span-2">
              <ProductList
                products={products}
                onAddToCart={handleAddToCart}
                onViewProduct={handleViewProduct}
              />
            </div>

            {/* Cart Sidebar */}
            <div className="lg:col-span-1">
              <Cart
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onClearCart={clearCart}
                onApplyDiscount={handleApplyDiscount}
              />

              {!isEmpty && (
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === "checkout" && (
          <div className="max-w-4xl mx-auto">
            <CheckoutSummary
              cart={cart}
              onCheckout={() => setCurrentStep("payment")}
              onCancel={handleCancelCheckout}
              customerInfo={customerInfo}
              onCustomerInfoChange={handleCustomerInfoChange}
            />
          </div>
        )}

        {currentStep === "payment" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Payment Processing
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete your order by selecting a payment method
                </p>
              </div>

              <PaymentButton
                amount={cart.total}
                onPayment={handlePayment}
                loading={isProcessingPayment}
              />

              <div className="mt-4 text-center">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep("checkout")}
                  disabled={isProcessingPayment}
                >
                  Back to Checkout
                </Button>
              </div>
            </div>
          </div>
        )}
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
