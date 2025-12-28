import React from "react";
import { Button, Spinner } from "../ui";
import { useBillingData } from "./hooks/useBillingData";

/**
 * BillingSummary Component
 * ------------------------
 * Displays current subscription plan, next billing date, and amount due.
 * Provides quick access to billing management actions.
 */

export interface BillingSummaryProps {
  /** Custom CSS classes for the container */
  className?: string;
  /** Whether to show the manage billing button */
  showManageButton?: boolean;
  /** Callback when manage billing is clicked */
  onManageBilling?: () => void;
  /** Whether to show usage information */
  showUsage?: boolean;
  /** Custom title for the summary */
  title?: string;
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

// ✅ Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ✅ Get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    case "trial":
      return "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
    case "expired":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    case "cancelled":
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
    default:
      return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20";
  }
};

// ✅ Get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "trial":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "expired":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    case "cancelled":
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      );
  }
};

function BillingSummary({
  className,
  showManageButton = true,
  onManageBilling,
  showUsage = true,
  title = "Billing Summary",
}: BillingSummaryProps) {
  const { data, loading, error } = useBillingData();

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
            Loading billing information...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
      >
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 mb-2">
            <svg
              className="h-8 w-8 mx-auto"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { plan, paymentMethod, status, usage } = data;

  return (
    <div
      className={cx(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          {showManageButton && (
            <Button variant="secondary" size="sm" onClick={onManageBilling}>
              Manage Billing
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Plan */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {plan.name}
              </h3>
              <span
                className={cx(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  getStatusColor(plan.status)
                )}
              >
                {getStatusIcon(plan.status)}
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatCurrency(plan.price, plan.currency)} per{" "}
              {plan.billingCycle}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(plan.price, plan.currency)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              per {plan.billingCycle}
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Next Billing Date
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {plan.nextBillingDate ? formatDate(plan.nextBillingDate) : "N/A"}
            </p>
            {status.daysUntilRenewal && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {status.daysUntilRenewal} days remaining
              </p>
            )}
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Payment Method
            </h4>
            {paymentMethod ? (
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {paymentMethod.brand && (
                    <span className="capitalize">{paymentMethod.brand}</span>
                  )}
                  {paymentMethod.last4 && ` •••• ${paymentMethod.last4}`}
                </div>
                {paymentMethod.isDefault && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    Default
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No payment method on file
              </p>
            )}
          </div>
        </div>

        {/* Usage Information */}
        {showUsage && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Current Usage
              </h4>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {usage.itemsUsed} / {usage.itemsLimit} items
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(usage.itemsUsed / usage.itemsLimit) * 100}%`,
                }}
              />
            </div>
            {usage.overageAmount && usage.overageAmount > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Overage: {formatCurrency(usage.overageAmount, plan.currency)}
              </p>
            )}
          </div>
        )}

        {/* Trial Information */}
        {status.isTrial && status.trialDaysRemaining && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-600 dark:text-blue-400"
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
                  Trial Period
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {status.trialDaysRemaining} days remaining in your trial
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Subscription Notice */}
        {status.isCancelled && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm1-1a1 1 0 10-2 0v3a1 1 0 102 0v-3z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Subscription Cancelled
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Your subscription has been cancelled and will not renew
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BillingSummary;
