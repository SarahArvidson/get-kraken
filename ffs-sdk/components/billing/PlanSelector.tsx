import React, { useState } from "react";
import { Button, Spinner, Toast } from "../ui";
import { useBillingData } from "./hooks/useBillingData";

/**
 * PlanSelector Component
 * ----------------------
 * Displays available subscription plans with comparison features.
 * Allows users to select and upgrade/downgrade their current plan.
 */

export interface BillingSubscriptionPlan {
  /** Unique identifier for the plan */
  id: string;
  /** Display name of the plan */
  name: string;
  /** Price per billing cycle */
  price: number;
  /** Currency code */
  currency: string;
  /** Billing cycle */
  billingCycle: "monthly" | "yearly" | "one-time";
  /** Description of the plan */
  description: string;
  /** Array of features included in this plan */
  features: string[];
  /** Whether this plan is popular/recommended */
  popular?: boolean;
  /** Whether this plan is the current plan */
  current?: boolean;
  /** Custom styling for the plan */
  className?: string;
}

export interface PlanSelectorProps {
  /** Array of available subscription plans */
  plans: BillingSubscriptionPlan[];
  /** Callback when a plan is selected */
  onPlanSelect?: (planId: string) => void | Promise<void>;
  /** Custom CSS classes for the container */
  className?: string;
  /** Whether to show the current plan indicator */
  showCurrentPlan?: boolean;
  /** Whether to show billing cycle toggle */
  showBillingToggle?: boolean;
  /** Custom title for the selector */
  title?: string;
  /** Custom subtitle for the selector */
  subtitle?: string;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
};

// ✅ Get billing cycle display
const getBillingCycleDisplay = (cycle: string) => {
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

// ✅ Toast message interface
interface ToastMessage {
  id: number;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  show: boolean;
}

function PlanSelector({
  plans,
  onPlanSelect,
  className,
  showCurrentPlan = true,
  showBillingToggle = false,
  title = "Choose Your Plan",
  subtitle = "Select a subscription plan that fits your needs",
}: PlanSelectorProps) {
  const { data: billingData, loading } = useBillingData();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  // ✅ Handle plan selection
  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);

    if (onPlanSelect) {
      setIsSubmitting(true);
      try {
        await onPlanSelect(planId);
        addToast("Plan selected successfully!", "success");
      } catch {
        addToast("Failed to select plan. Please try again.", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ✅ Check if plan is current
  const isCurrentPlan = (planId: string) => {
    return billingData?.plan.id === planId;
  };

  // ✅ Get plan button text and variant
  const getPlanButtonProps = (plan: BillingSubscriptionPlan) => {
    if (isCurrentPlan(plan.id)) {
      return {
        text: "Current Plan",
        variant: "secondary" as const,
        disabled: true,
      };
    }

    if (selectedPlan === plan.id && isSubmitting) {
      return {
        text: "Selecting...",
        variant: "primary" as const,
        disabled: true,
        loading: true,
      };
    }

    return {
      text: "Select Plan",
      variant: "primary" as const,
      disabled: false,
      loading: false,
    };
  };

  if (loading) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
      >
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading plans...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const buttonProps = getPlanButtonProps(plan);
            const isCurrent = isCurrentPlan(plan.id);

            return (
              <div
                key={plan.id}
                className={cx(
                  "relative border rounded-lg p-6 transition-all duration-200",
                  "hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600",
                  selectedPlan === plan.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                    : "border-gray-300 dark:border-gray-600",
                  plan.popular && "ring-2 ring-indigo-200 dark:ring-indigo-800",
                  isCurrent &&
                    "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400",
                  plan.className
                )}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && showCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(plan.price, plan.currency)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {getBillingCycleDisplay(plan.billingCycle)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
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
                </div>

                {/* Select Button */}
                <Button
                  variant={buttonProps.variant}
                  size="lg"
                  fullWidth
                  loading={buttonProps.loading}
                  disabled={buttonProps.disabled}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={cx(
                    isCurrent && "bg-green-600 hover:bg-green-700 text-white"
                  )}
                >
                  {buttonProps.text}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Billing Cycle Toggle */}
        {showBillingToggle && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 rounded-md">
                Monthly
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md">
                Yearly
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Save 20% with yearly billing
            </p>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              24/7 support
            </span>
            <span className="flex items-center">
              <svg
                className="h-4 w-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Secure payments
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
          onDismiss={() => removeToast(toast.id)}
          className={`top-${4 + index * 20}`}
        />
      ))}
    </div>
  );
}

export default PlanSelector;
