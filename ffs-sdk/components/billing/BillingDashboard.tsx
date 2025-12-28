import React, { useState, useCallback } from "react";
import {
  BillingSummary,
  PaymentMethodForm,
  PlanSelector,
  InvoiceList,
  SubscriptionStatusBanner,
  useBillingData,
  BillingSubscriptionPlan,
} from "./index";
import { Toast } from "../ui";

/**
 * BillingDashboard Component
 * -------------------------
 * A complete billing dashboard that combines all billing components into a single cohesive view.
 * Provides a comprehensive billing management interface with status banners, summaries, and actions.
 */

export interface BillingDashboardProps {
  /** Available subscription plans */
  plans: BillingSubscriptionPlan[];
  /** Callback when a plan is selected */
  onSelectPlan?: (planId: string) => void | Promise<void>;
  /** Callback when payment method is added */
  onAddPaymentMethod?: (cardDetails: {
    cardNumber: string;
    expDate: string;
    cvc: string;
    cardName: string;
  }) => void | Promise<void>;
  /** Callback when payment method is updated */
  onUpdatePaymentMethod?: (cardDetails: {
    cardNumber?: string;
    expDate?: string;
    cvc?: string;
    cardName?: string;
  }) => void | Promise<void>;
  /** Callback when subscription is upgraded */
  onUpgrade?: () => void;
  /** Callback when subscription is renewed */
  onRenew?: () => void;
  /** Callback when subscription is reactivated */
  onReactivate?: () => void;
  /** Callback when invoice is downloaded */
  onDownloadInvoice?: (invoiceId: string) => void;
  /** Callback when subscription is cancelled */
  onCancelSubscription?: () => void;
  /** Custom CSS classes for the container */
  className?: string;
  /** Dashboard title */
  title?: string;
  /** Dashboard subtitle */
  subtitle?: string;
  /** Whether to show the plan selector section */
  showPlanSelector?: boolean;
  /** Whether to show the payment method section */
  showPaymentMethod?: boolean;
  /** Whether to show the invoice history section */
  showInvoiceHistory?: boolean;
}

// ✅ Utility for merging Tailwind classes
const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// ✅ Toast message interface
interface ToastMessage {
  id: number;
  message: string;
  variant: "success" | "error" | "info" | "warning";
  show: boolean;
}

function BillingDashboard({
  plans,
  onSelectPlan,
  onAddPaymentMethod,
  onUpdatePaymentMethod,
  onUpgrade,
  onRenew,
  onReactivate,
  onDownloadInvoice,
  onCancelSubscription,
  className,
  title = "Billing Dashboard",
  subtitle = "Manage your subscription, payment methods, and billing history",
  showPlanSelector = true,
  showPaymentMethod = true,
  showInvoiceHistory = true,
}: BillingDashboardProps) {
  const { data: billingData } = useBillingData();
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeSection, setActiveSection] = useState<
    "overview" | "plans" | "payment" | "invoices"
  >("overview");

  // ✅ Toast management
  const addToast = useCallback(
    (message: string, variant: ToastMessage["variant"]) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, variant, show: true }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // ✅ Enhanced handlers with toast feedback
  const handleSelectPlan = useCallback(
    async (planId: string) => {
      try {
        await onSelectPlan?.(planId);
        addToast("Plan updated successfully!", "success");
      } catch {
        addToast("Failed to update plan. Please try again.", "error");
      }
    },
    [onSelectPlan, addToast]
  );

  const handleAddPaymentMethod = useCallback(
    async (cardDetails: {
      cardNumber: string;
      expDate: string;
      cvc: string;
      cardName: string;
    }) => {
      try {
        await onAddPaymentMethod?.(cardDetails);
        addToast("Payment method added successfully!", "success");
      } catch {
        addToast("Failed to add payment method. Please try again.", "error");
      }
    },
    [onAddPaymentMethod, addToast]
  );

  const handleUpdatePaymentMethod = useCallback(
    async (cardDetails: {
      cardNumber?: string;
      expDate?: string;
      cvc?: string;
      cardName?: string;
    }) => {
      try {
        await onUpdatePaymentMethod?.(cardDetails);
        addToast("Payment method updated successfully!", "success");
      } catch {
        addToast("Failed to update payment method. Please try again.", "error");
      }
    },
    [onUpdatePaymentMethod, addToast]
  );

  const handleUpgrade = useCallback(() => {
    onUpgrade?.();
    addToast("Redirecting to upgrade page...", "info");
  }, [onUpgrade, addToast]);

  const handleRenew = useCallback(() => {
    onRenew?.();
    addToast("Processing subscription renewal...", "info");
  }, [onRenew, addToast]);

  const handleReactivate = useCallback(() => {
    onReactivate?.();
    addToast("Reactivating subscription...", "info");
  }, [onReactivate, addToast]);

  const handleDownloadInvoice = useCallback(
    (invoiceId: string) => {
      onDownloadInvoice?.(invoiceId);
      addToast("Downloading invoice...", "info");
    },
    [onDownloadInvoice, addToast]
  );

  const handleCancelSubscription = useCallback(() => {
    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? This action cannot be undone."
      )
    ) {
      onCancelSubscription?.();
      addToast("Subscription cancelled successfully.", "warning");
    }
  }, [onCancelSubscription, addToast]);

  return (
    <div className={cx("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        {/* Status Banner */}
        {billingData && (
          <div className="mb-8">
            <SubscriptionStatusBanner
              onUpgrade={handleUpgrade}
              onRenew={handleRenew}
              onReactivate={handleReactivate}
              showActions={true}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "plans", label: "Plans", icon: "💎" },
              { id: "payment", label: "Payment", icon: "💳" },
              { id: "invoices", label: "Invoices", icon: "📄" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setActiveSection(
                    item.id as "overview" | "plans" | "payment" | "invoices"
                  )
                }
                className={cx(
                  "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Overview Section */}
          {activeSection === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <BillingSummary />
              </div>
              <div>
                <InvoiceList />
              </div>
            </div>
          )}

          {/* Plans Section */}
          {activeSection === "plans" && showPlanSelector && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Subscription Plans
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose the plan that best fits your needs. You can upgrade or
                  downgrade at any time.
                </p>
              </div>
              <PlanSelector
                plans={plans.map((plan) => ({
                  ...plan,
                  billingCycle: plan.billingCycle || "monthly",
                  features: plan.features || [],
                }))}
                onPlanSelect={handleSelectPlan}
              />
            </div>
          )}

          {/* Payment Method Section */}
          {activeSection === "payment" && showPaymentMethod && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Payment Methods
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your payment methods and billing information.
                </p>
              </div>
              <PaymentMethodForm
                onAddPaymentMethod={handleAddPaymentMethod}
                onUpdatePaymentMethod={handleUpdatePaymentMethod}
                currentPaymentMethod={billingData?.paymentMethod}
              />
            </div>
          )}

          {/* Invoices Section */}
          {activeSection === "invoices" && showInvoiceHistory && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Invoice History
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View and download your past invoices and receipts.
                </p>
              </div>
              <InvoiceList onDownloadInvoice={handleDownloadInvoice} />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {billingData?.plan.status === "active" && (
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Account Actions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your subscription settings
                </p>
              </div>
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
              >
                Cancel Subscription
              </button>
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
          onDismiss={() => removeToast(toast.id)}
          className={`top-${4 + index * 20}`}
        />
      ))}
    </div>
  );
}

export type { BillingDashboardProps as TBillingDashboardProps };
export default BillingDashboard;
