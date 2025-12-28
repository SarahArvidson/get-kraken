import React from "react";
import { Button } from "../ui";
import { useBillingData } from "./hooks/useBillingData";

/**
 * SubscriptionStatusBanner Component
 * -----------------------------------
 * Displays subscription status with visual indicators for active, trial, expired, and cancelled states.
 * Provides quick actions based on the current status.
 */

export interface SubscriptionStatusBannerProps {
  /** Custom CSS classes for the container */
  className?: string;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Callback when upgrade is clicked */
  onUpgrade?: () => void;
  /** Callback when renew is clicked */
  onRenew?: () => void;
  /** Callback when reactivate is clicked */
  onReactivate?: () => void;
  /** Custom title for the banner */
  title?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Callback when close is clicked */
  onClose?: () => void;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Get status configuration
const getStatusConfig = (
  status: string,
  isTrial: boolean,
  trialDaysRemaining?: number
) => {
  switch (status) {
    case "active":
      return {
        bgColor: "bg-green-50 dark:bg-green-900/20",
        borderColor: "border-green-200 dark:border-green-800",
        iconColor: "text-green-600 dark:text-green-400",
        textColor: "text-green-800 dark:text-green-200",
        icon: (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: isTrial ? "Trial Active" : "Subscription Active",
        description: isTrial
          ? `Your trial is active with ${trialDaysRemaining} days remaining.`
          : "Your subscription is active and will auto-renew.",
        showActions: false,
      };
    case "trial":
      return {
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        borderColor: "border-blue-200 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        textColor: "text-blue-800 dark:text-blue-200",
        icon: (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: "Trial Period",
        description: `Your trial ends in ${trialDaysRemaining} days. Upgrade now to continue using all features.`,
        showActions: true,
        actionText: "Upgrade Now",
        actionVariant: "primary" as const,
      };
    case "expired":
      return {
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        iconColor: "text-red-600 dark:text-red-400",
        textColor: "text-red-800 dark:text-red-200",
        icon: (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: "Subscription Expired",
        description:
          "Your subscription has expired. Renew now to restore access to all features.",
        showActions: true,
        actionText: "Renew Subscription",
        actionVariant: "primary" as const,
      };
    case "cancelled":
      return {
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        borderColor: "border-yellow-200 dark:border-yellow-800",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        textColor: "text-yellow-800 dark:text-yellow-200",
        icon: (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm1-1a1 1 0 10-2 0v3a1 1 0 102 0v-3z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: "Subscription Cancelled",
        description:
          "Your subscription has been cancelled. Reactivate to restore access to all features.",
        showActions: true,
        actionText: "Reactivate",
        actionVariant: "primary" as const,
      };
    default:
      return {
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800",
        iconColor: "text-gray-600 dark:text-gray-400",
        textColor: "text-gray-800 dark:text-gray-200",
        icon: (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        ),
        title: "Subscription Status",
        description: "Unable to determine subscription status.",
        showActions: false,
      };
  }
};

function SubscriptionStatusBanner({
  className,
  showActions = true,
  onUpgrade,
  onRenew,
  onReactivate,
  title,
  showCloseButton = false,
  onClose,
}: SubscriptionStatusBannerProps) {
  const { data, loading } = useBillingData();

  if (loading) {
    return null; // Don't show banner while loading
  }

  if (!data) {
    return null; // Don't show banner if no data
  }

  const { plan, status } = data;
  const statusConfig = getStatusConfig(
    plan.status,
    status.isTrial,
    status.trialDaysRemaining
  );

  // ✅ Don't show banner for active subscriptions (unless it's a trial)
  if (status.isActive && !status.isTrial) {
    return null;
  }

  // ✅ Handle action click
  const handleActionClick = () => {
    switch (plan.status) {
      case "trial":
        onUpgrade?.();
        break;
      case "expired":
        onRenew?.();
        break;
      case "cancelled":
        onReactivate?.();
        break;
    }
  };

  return (
    <div
      className={cx(
        "border rounded-lg p-4",
        statusConfig.bgColor,
        statusConfig.borderColor,
        className
      )}
    >
      <div className="flex items-start">
        <div className={cx("flex-shrink-0 mr-3", statusConfig.iconColor)}>
          {statusConfig.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className={cx("text-sm font-medium mb-1", statusConfig.textColor)}
          >
            {title || statusConfig.title}
          </h3>

          <p className={cx("text-sm mb-3", statusConfig.textColor)}>
            {statusConfig.description}
          </p>

          {showActions && statusConfig.showActions && (
            <div className="flex items-center gap-3">
              <Button
                variant={statusConfig.actionVariant}
                size="sm"
                onClick={handleActionClick}
              >
                {statusConfig.actionText}
              </Button>

              {plan.status === "trial" && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // In real implementation, this would extend trial
                    console.log("Extend trial");
                  }}
                >
                  Extend Trial
                </Button>
              )}
            </div>
          )}
        </div>

        {showCloseButton && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={onClose}
              className={cx(
                "inline-flex items-center justify-center p-1 rounded-md transition-colors",
                "hover:bg-black/10 dark:hover:bg-white/10",
                statusConfig.iconColor
              )}
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionStatusBanner;
