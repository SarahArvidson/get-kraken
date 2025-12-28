import React, { useState, useCallback } from "react";
import { InputField, Button, Toast, FormGroup, Modal } from "../../ui";

/**
 * CheckoutPanel (Blueprint Component)
 * ----------------------------------
 * A comprehensive billing blueprint that combines multiple atomic components
 * into a complete subscription checkout flow for the Flying Fox Solutions Template Library.
 *
 * This blueprint demonstrates how to compose atomic components (InputField, Button, Toast, FormGroup, Modal)
 * into a production-ready subscription management experience that can be dropped into any project.
 *
 * How to reuse:
 * 1) Import it: `import { CheckoutPanel } from "@ffx/sdk/blueprints";`
 * 2) Use it anywhere:
 *    <CheckoutPanel
 *      plans={subscriptionPlans}
 *      onCheckout={(planId, email, paymentMethod) => handleCheckout(planId, email, paymentMethod)}
 *      currency="$"
 *    />
 *
 * Notes:
 * - Combines InputField, Button, Toast, FormGroup, and Modal atomic components
 * - Supports multiple subscription plans with flexible pricing
 * - Built-in form validation with real-time feedback
 * - Full accessibility with ARIA attributes and screen reader support
 * - Dark mode compatible with Tailwind CSS
 * - Production-ready with comprehensive error handling
 */

export interface SubscriptionPlan {
  /** Unique identifier for the plan */
  id: string;
  /** Display name of the plan */
  name: string;
  /** Price per billing cycle */
  price: number;
  /** Currency code */
  currency: string;
  /** Description of the plan features */
  description: string;
  /** Billing cycle (monthly, yearly, etc.) */
  billingCycle: "monthly" | "yearly" | "one-time";
  /** Array of features included in this plan */
  features?: string[];
  /** Whether this plan is popular/recommended */
  popular?: boolean;
  /** Custom styling for the plan */
  className?: string;
}

export interface CheckoutData {
  planId: string;
  email: string;
  paymentMethod: string;
}

export interface CheckoutPanelProps {
  /** Callback for checkout form submission */
  onCheckout?: (
    planId: string,
    email: string,
    paymentMethod: string
  ) => void | Promise<void>;
  /** Array of subscription plans to display */
  plans: SubscriptionPlan[];
  /** Currency symbol for pricing display */
  currency?: string;
  /** Whether to show test mode UI */
  testMode?: boolean;
  /** Custom CSS classes for the container */
  className?: string;
  /** Custom title for the checkout panel */
  title?: string;
  /** Custom subtitle for the checkout panel */
  subtitle?: string;
  /** Whether to show the summary section */
  showSummary?: boolean;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ✅ Toast message types
interface ToastMessage {
  id: number;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  show: boolean;
}

function CheckoutPanel({
  onCheckout,
  plans,
  currency = "$",
  testMode = false,
  className,
  title = "Choose Your Plan",
  subtitle = "Select a subscription plan that fits your needs",
  showSummary = true,
}: CheckoutPanelProps) {
  // ✅ State management
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // ✅ Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Toast management
  const addToast = useCallback(
    (message: string, variant: ToastMessage["variant"]) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, variant, show: true }]);

      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // ✅ Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email.trim()) return "Email is required";
    if (!EMAIL_REGEX.test(email)) return "Please enter a valid email address";
    return null;
  };

  const validatePlan = (planId: string): string | null => {
    if (!planId.trim()) return "Please select a subscription plan";
    return null;
  };

  // ✅ Get selected plan details
  const getSelectedPlanDetails = () => {
    return plans.find((plan) => plan.id === selectedPlan);
  };

  // ✅ Form submission handlers
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    const planError = validatePlan(selectedPlan);
    const emailError = validateEmail(email);

    if (planError) newErrors.plan = planError;
    if (emailError) newErrors.email = emailError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const handleConfirmCheckout = async () => {
    setIsSubmitting(true);
    setErrors({});
    setShowConfirmModal(false);

    try {
      await onCheckout?.(selectedPlan, email, paymentMethod);
      addToast("Checkout successful! Welcome to your new plan.", "success");
    } catch (error) {
      addToast("Checkout failed. Please try again.", "error");
      setErrors({ general: "Checkout failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Input change handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    // Clear error when user selects a plan
    if (errors.plan) {
      setErrors((prev) => ({ ...prev, plan: "" }));
    }
  };

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPaymentMethod(e.target.value);
  };

  // ✅ Format price display
  const formatPrice = (price: number) => {
    return `${currency}${price.toFixed(2)}`;
  };

  // ✅ Get billing cycle display
  const getBillingCycleDisplay = (cycle?: string) => {
    switch (cycle) {
      case "monthly":
        return "/month";
      case "yearly":
        return "/year";
      case "one-time":
        return " one-time";
      default:
        return "/month";
    }
  };

  return (
    <div className={cx("w-full max-w-4xl mx-auto", className)}>
      {/* ✅ Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
        {testMode && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            🧪 Test Mode - Demo Only
          </div>
        )}
      </div>

      {/* ✅ Error Display */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ✅ Plan Selection */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Select Your Plan
          </h2>

          {errors.plan && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.plan}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cx(
                  "relative border rounded-lg p-6 cursor-pointer transition-all duration-200",
                  "hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600",
                  selectedPlan === plan.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                    : "border-gray-300 dark:border-gray-600",
                  plan.popular && "ring-2 ring-indigo-200 dark:ring-indigo-800",
                  plan.className
                )}
                onClick={() => handlePlanChange(plan.id)}
                role="radio"
                aria-checked={selectedPlan === plan.id}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handlePlanChange(plan.id);
                  }
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id={`plan-${plan.id}`}
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={() => handlePlanChange(plan.id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label
                      htmlFor={`plan-${plan.id}`}
                      className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {plan.name}
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(plan.price)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getBillingCycleDisplay(plan.billingCycle)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {plan.description}
                </p>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ✅ Checkout Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Complete Your Order
            </h2>

            <form
              onSubmit={handleCheckout}
              className="space-y-6"
              role="form"
              aria-label="Checkout form"
            >
              {/* Email Input */}
              <FormGroup label="Email Address" error={errors.email} required>
                <InputField
                  type="email"
                  label=""
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </FormGroup>

              {/* Payment Method */}
              <FormGroup
                label="Payment Method"
                description="Choose your preferred payment method"
              >
                <select
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  disabled={isSubmitting}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="card">💳 Credit/Debit Card</option>
                  <option value="paypal">🅿️ PayPal</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  {testMode && <option value="test">🧪 Test Payment</option>}
                </select>
              </FormGroup>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                loadingText="Processing..."
                disabled={isSubmitting || !selectedPlan || !email}
              >
                {testMode ? "Complete Test Checkout" : "Complete Checkout"}
              </Button>

              {/* Security Notice */}
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ✅ Summary Section */}
      {showSummary && selectedPlan && (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Order Summary
          </h3>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Plan:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {getSelectedPlanDetails()?.name}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 dark:text-gray-400">Billing:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {getBillingCycleDisplay(getSelectedPlanDetails()?.billingCycle)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-400">Payment:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {paymentMethod === "card"
                  ? "Credit/Debit Card"
                  : paymentMethod === "paypal"
                  ? "PayPal"
                  : paymentMethod === "bank"
                  ? "Bank Transfer"
                  : "Test Payment"}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Total:
                </span>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {formatPrice(getSelectedPlanDetails()?.price || 0)}
                  {getBillingCycleDisplay(
                    getSelectedPlanDetails()?.billingCycle
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Your Subscription"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to subscribe to the{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {getSelectedPlanDetails()?.name}
            </span>{" "}
            plan for{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {formatPrice(getSelectedPlanDetails()?.price || 0)}
              {getBillingCycleDisplay(getSelectedPlanDetails()?.billingCycle)}
            </span>
            ?
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Email:</strong> {email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Payment Method:</strong>{" "}
              {paymentMethod === "card"
                ? "Credit/Debit Card"
                : paymentMethod === "paypal"
                ? "PayPal"
                : paymentMethod === "bank"
                ? "Bank Transfer"
                : "Test Payment"}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmCheckout}
              loading={isSubmitting}
              className="flex-1"
            >
              Confirm Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ Toast Stack */}
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

// ✅ Export types + component for easy importing
export type {
  CheckoutPanelProps as TCheckoutPanelProps,
  SubscriptionPlan as TSubscriptionPlan,
  CheckoutData as TCheckoutData,
};
export default CheckoutPanel;
