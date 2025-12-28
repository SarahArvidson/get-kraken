import React, { useState, forwardRef } from "react";
import { Button, InputField, FormGroup, Toast } from "../ui";
import { useBillingData } from "./hooks/useBillingData";

/**
 * PaymentMethodForm Component
 * ---------------------------
 * Form for adding or updating payment method information.
 * Handles card, bank, and PayPal payment methods.
 */

export interface PaymentMethodFormProps {
  /** Custom CSS classes for the container */
  className?: string;
  /** Whether to show the form in edit mode */
  editMode?: boolean;
  /** Callback when payment method is successfully updated */
  onSuccess?: () => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Custom title for the form */
  title?: string;
  /** Whether to show the cancel button */
  showCancelButton?: boolean;
  /** Callback when payment method is added */
  onAddPaymentMethod?: (_cardDetails: any) => Promise<void>;
  /** Callback when payment method is updated */
  onUpdatePaymentMethod?: (_cardDetails: any) => Promise<void>;
  /** Current payment method */
  currentPaymentMethod?: {
    id: string;
    type: "card" | "bank" | "paypal";
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    name?: string;
    isDefault: boolean;
  } | null;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Payment method types
type PaymentMethodType = "card" | "bank" | "paypal";

// ✅ Form data interface
interface FormData {
  type: PaymentMethodType;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  bankAccountNumber: string;
  routingNumber: string;
  accountHolderName: string;
  paypalEmail: string;
}

// ✅ Toast message interface
interface ToastMessage {
  id: number;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  show: boolean;
}

const PaymentMethodForm = forwardRef<HTMLDivElement, PaymentMethodFormProps>(
  function PaymentMethodForm(
    {
      className,
      editMode = false,
      onSuccess,
      onCancel,
      title,
      showCancelButton = true,
    },
    ref
  ) {
    const { data, updatePaymentMethod, loading } = useBillingData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // ✅ Form state
    const [formData, setFormData] = useState<FormData>({
      type: "card",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardholderName: "",
      bankAccountNumber: "",
      routingNumber: "",
      accountHolderName: "",
      paypalEmail: "",
    });

    // ✅ Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ✅ Toast management
    const addToast = (message: string, variant: ToastMessage["variant"]) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, variant, show: true }]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    };

    const removeToast = (id: number) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // ✅ Validation functions
    const validateCardNumber = (cardNumber: string): string | null => {
      const cleaned = cardNumber.replace(/\s/g, "");
      if (!cleaned) return "Card number is required";
      if (cleaned.length < 13 || cleaned.length > 19)
        return "Card number must be 13-19 digits";
      if (!/^\d+$/.test(cleaned)) return "Card number must contain only digits";
      return null;
    };

    const validateExpiry = (month: string, year: string): string | null => {
      if (!month || !year) return "Expiry date is required";
      const expiryDate = new Date(parseInt(year), parseInt(month) - 1);
      const now = new Date();
      if (expiryDate < now) return "Card has expired";
      return null;
    };

    const validateCVV = (cvv: string): string | null => {
      if (!cvv) return "CVV is required";
      if (cvv.length < 3 || cvv.length > 4) return "CVV must be 3-4 digits";
      if (!/^\d+$/.test(cvv)) return "CVV must contain only digits";
      return null;
    };

    const validateBankAccount = (accountNumber: string): string | null => {
      if (!accountNumber) return "Account number is required";
      if (accountNumber.length < 4 || accountNumber.length > 17)
        return "Account number must be 4-17 digits";
      if (!/^\d+$/.test(accountNumber))
        return "Account number must contain only digits";
      return null;
    };

    const validateRoutingNumber = (routingNumber: string): string | null => {
      if (!routingNumber) return "Routing number is required";
      if (routingNumber.length !== 9) return "Routing number must be 9 digits";
      if (!/^\d+$/.test(routingNumber))
        return "Routing number must contain only digits";
      return null;
    };

    const validateEmail = (email: string): string | null => {
      if (!email) return "Email is required";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "Please enter a valid email address";
      return null;
    };

    // ✅ Form submission
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      const newErrors: Record<string, string> = {};

      // Validate based on payment method type
      if (formData.type === "card") {
        const cardError = validateCardNumber(formData.cardNumber);
        const expiryError = validateExpiry(
          formData.expiryMonth,
          formData.expiryYear
        );
        const cvvError = validateCVV(formData.cvv);

        if (cardError) newErrors.cardNumber = cardError;
        if (expiryError) newErrors.expiry = expiryError;
        if (cvvError) newErrors.cvv = cvvError;
        if (!formData.cardholderName)
          newErrors.cardholderName = "Cardholder name is required";
      } else if (formData.type === "bank") {
        const accountError = validateBankAccount(formData.bankAccountNumber);
        const routingError = validateRoutingNumber(formData.routingNumber);

        if (accountError) newErrors.bankAccountNumber = accountError;
        if (routingError) newErrors.routingNumber = routingError;
        if (!formData.accountHolderName)
          newErrors.accountHolderName = "Account holder name is required";
      } else if (formData.type === "paypal") {
        const emailError = validateEmail(formData.paypalEmail);
        if (emailError) newErrors.paypalEmail = emailError;
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsSubmitting(true);
      setErrors({});

      try {
        // Prepare payment method data
        const paymentMethodData = {
          type: formData.type,
          ...(formData.type === "card" && {
            last4: formData.cardNumber.slice(-4),
            brand: "visa", // In real implementation, detect brand from card number
            expiryMonth: parseInt(formData.expiryMonth),
            expiryYear: parseInt(formData.expiryYear),
          }),
          ...(formData.type === "bank" && {
            last4: formData.bankAccountNumber.slice(-4),
          }),
          ...(formData.type === "paypal" && {
            email: formData.paypalEmail,
          }),
          isDefault: true,
        };

        await updatePaymentMethod(paymentMethodData);

        addToast("Payment method updated successfully!", "success");
        onSuccess?.();
      } catch (error) {
        addToast("Failed to update payment method. Please try again.", "error");
        setErrors({ general: "Failed to update payment method" });
      } finally {
        setIsSubmitting(false);
      }
    };

    // ✅ Handle form field changes
    const handleFieldChange = (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

    // ✅ Format card number
    const formatCardNumber = (value: string) => {
      const cleaned = value.replace(/\s/g, "");
      const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
      return formatted.slice(0, 19); // Max 16 digits + 3 spaces
    };

    return (
      <div
        ref={ref}
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
          className
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title ||
              (editMode ? "Update Payment Method" : "Add Payment Method")}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.general}
              </p>
            </div>
          )}

          {/* Payment Method Type */}
          <FormGroup label="Payment Method Type" required>
            <select
              value={formData.type}
              onChange={(e) =>
                handleFieldChange("type", e.target.value as PaymentMethodType)
              }
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="card">💳 Credit/Debit Card</option>
              <option value="bank">🏦 Bank Account</option>
              <option value="paypal">🅿️ PayPal</option>
            </select>
          </FormGroup>

          {/* Card Payment Method */}
          {formData.type === "card" && (
            <div className="space-y-4">
              <FormGroup label="Card Number" error={errors.cardNumber} required>
                <InputField
                  type="text"
                  label=""
                  value={formData.cardNumber}
                  onChange={(e) =>
                    handleFieldChange(
                      "cardNumber",
                      formatCardNumber(e.target.value)
                    )
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  disabled={isSubmitting}
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="Expiry Month" error={errors.expiry} required>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) =>
                      handleFieldChange("expiryMonth", e.target.value)
                    }
                    disabled={isSubmitting}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {String(i + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </FormGroup>

                <FormGroup label="Expiry Year" required>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) =>
                      handleFieldChange("expiryYear", e.target.value)
                    }
                    disabled={isSubmitting}
                    className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </FormGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormGroup label="CVV" error={errors.cvv} required>
                  <InputField
                    type="text"
                    label=""
                    value={formData.cvv}
                    onChange={(e) =>
                      handleFieldChange(
                        "cvv",
                        e.target.value.replace(/\D/g, "").slice(0, 4)
                      )
                    }
                    placeholder="123"
                    maxLength={4}
                    disabled={isSubmitting}
                  />
                </FormGroup>

                <FormGroup
                  label="Cardholder Name"
                  error={errors.cardholderName}
                  required
                >
                  <InputField
                    type="text"
                    label=""
                    value={formData.cardholderName}
                    onChange={(e) =>
                      handleFieldChange("cardholderName", e.target.value)
                    }
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                </FormGroup>
              </div>
            </div>
          )}

          {/* Bank Account Payment Method */}
          {formData.type === "bank" && (
            <div className="space-y-4">
              <FormGroup
                label="Account Number"
                error={errors.bankAccountNumber}
                required
              >
                <InputField
                  type="text"
                  label=""
                  value={formData.bankAccountNumber}
                  onChange={(e) =>
                    handleFieldChange(
                      "bankAccountNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 17)
                    )
                  }
                  placeholder="123456789"
                  disabled={isSubmitting}
                />
              </FormGroup>

              <FormGroup
                label="Routing Number"
                error={errors.routingNumber}
                required
              >
                <InputField
                  type="text"
                  label=""
                  value={formData.routingNumber}
                  onChange={(e) =>
                    handleFieldChange(
                      "routingNumber",
                      e.target.value.replace(/\D/g, "").slice(0, 9)
                    )
                  }
                  placeholder="123456789"
                  maxLength={9}
                  disabled={isSubmitting}
                />
              </FormGroup>

              <FormGroup
                label="Account Holder Name"
                error={errors.accountHolderName}
                required
              >
                <InputField
                  type="text"
                  label=""
                  value={formData.accountHolderName}
                  onChange={(e) =>
                    handleFieldChange("accountHolderName", e.target.value)
                  }
                  placeholder="John Doe"
                  disabled={isSubmitting}
                />
              </FormGroup>
            </div>
          )}

          {/* PayPal Payment Method */}
          {formData.type === "paypal" && (
            <div className="space-y-4">
              <FormGroup
                label="PayPal Email"
                error={errors.paypalEmail}
                required
              >
                <InputField
                  type="email"
                  label=""
                  value={formData.paypalEmail}
                  onChange={(e) =>
                    handleFieldChange("paypalEmail", e.target.value)
                  }
                  placeholder="your@paypal.com"
                  disabled={isSubmitting}
                />
              </FormGroup>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg
                    className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      PayPal Integration
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      You'll be redirected to PayPal to complete the setup
                      process.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            {showCancelButton && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="flex-1"
            >
              {editMode ? "Update Payment Method" : "Add Payment Method"}
            </Button>
          </div>
        </form>

        {/* Toast Stack */}
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            show={toast.show}
            onDismiss={() => removeToast(toast.id)}
            className={`top-${4 + index * 20}`}
          />
        ))}
      </div>
    );
  }
);

export default PaymentMethodForm;
