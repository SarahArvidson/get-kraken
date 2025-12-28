/**
 * POS Blueprint - PaymentButton Component
 *
 * Handles payment processing with placeholder for future integration.
 * Supports multiple payment methods and provides loading states.
 */

import React, { useState } from "react";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Spinner from "../../ui/Spinner";
import { PaymentButtonProps, PaymentMethod } from "./types";

const cx = (...classes: (string | undefined | null | false)[]) =>
  classes.filter(Boolean).join(" ");

export default function PaymentButton({
  amount,
  onPayment,
  loading = false,
  disabled = false,
  className,
}: PaymentButtonProps) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  // Mock payment methods - in real implementation, these would come from your payment provider
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cash",
      type: "cash",
      name: "Cash Payment",
    },
    {
      id: "card",
      type: "card",
      name: "Credit/Debit Card",
      brand: "Visa",
      last4: "****",
    },
    {
      id: "digital_wallet",
      type: "digital_wallet",
      name: "Digital Wallet (Apple Pay, Google Pay)",
    },
    {
      id: "check",
      type: "check",
      name: "Check Payment",
    },
  ];

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Call the payment handler
      await onPayment(selectedPaymentMethod);

      // Close modal on success
      setShowPaymentModal(false);
      setSelectedPaymentMethod(null);
    } catch (error) {
      console.error("Payment failed:", error);
      // Error handling would be implemented here
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = () => {
    setShowPaymentModal(false);
    setSelectedPaymentMethod(null);
    setIsProcessing(false);
  };

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        onClick={() => setShowPaymentModal(true)}
        loading={loading}
        disabled={disabled || amount <= 0}
        className={cx("w-full", className)}
      >
        {loading ? "Processing..." : `Pay ${formatPrice(amount)}`}
      </Button>

      {/* Payment Method Selection Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={handleCancelPayment}
        title="Select Payment Method"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Payment Amount
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatPrice(amount)}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              Choose Payment Method:
            </h4>

            {paymentMethods.map((method) => (
              <PaymentMethodOption
                key={method.id}
                method={method}
                isSelected={selectedPaymentMethod?.id === method.id}
                onSelect={() => handlePaymentMethodSelect(method)}
              />
            ))}
          </div>

          {/* Payment Processing State */}
          {isProcessing && (
            <div className="text-center py-4">
              <Spinner
                size="lg"
                color="primary"
                aria-label="Processing payment"
              />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Processing payment...
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="primary"
              onClick={handleProcessPayment}
              disabled={!selectedPaymentMethod || isProcessing}
              loading={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Processing..." : "Process Payment"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancelPayment}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>

          {/* Integration Note */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Integration Note:</strong> This is a placeholder for
              payment processing. In a real implementation, this would integrate
              with Square, Stripe, or other payment providers to process actual
              transactions.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}

interface PaymentMethodOptionProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
}

function PaymentMethodOption({
  method,
  isSelected,
  onSelect,
}: PaymentMethodOptionProps) {
  const getPaymentIcon = (type: PaymentMethod["type"]) => {
    switch (type) {
      case "card":
        return "💳";
      case "cash":
        return "💵";
      case "digital_wallet":
        return "📱";
      case "check":
        return "📝";
      default:
        return "💳";
    }
  };

  return (
    <button
      onClick={onSelect}
      className={cx(
        "w-full p-4 rounded-lg border-2 transition-colors",
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getPaymentIcon(method.type)}</span>
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {method.name}
          </p>
          {method.brand && method.last4 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {method.brand} •••• {method.last4}
            </p>
          )}
          {method.expiryMonth && method.expiryYear && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Expires {method.expiryMonth}/{method.expiryYear}
            </p>
          )}
        </div>
        {isSelected && (
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
    </button>
  );
}
