/**
 * Flying Fox Solutions - Consulting Site Billing Page
 *
 * Page that integrates the Billing Dashboard blueprint.
 * Demonstrates how to embed billing functionality into a larger application.
 */

import React, { useState } from "react";
import BillingDashboard from "../../../billing/BillingDashboard";
import CheckoutPanel from "../../billing/CheckoutPanel";
import { Button, Toast } from "../../../";
import type { PageProps, ConsultingSubscriptionPlan } from "../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const mockPlans: ConsultingSubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "Perfect for small businesses getting started",
    price: 29,
    currency: "USD",
    billingCycle: "monthly",
    features: [
      "Up to 1,000 messages/month",
      "Basic analytics",
      "Email support",
      "Standard integrations",
    ],
    isPopular: false,
  },
  {
    id: "professional",
    name: "Professional Plan",
    description: "Ideal for growing businesses with advanced needs",
    price: 79,
    currency: "USD",
    billingCycle: "monthly",
    features: [
      "Up to 10,000 messages/month",
      "Advanced analytics",
      "Priority support",
      "All integrations",
      "Custom branding",
    ],
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise Plan",
    description: "For large organizations with custom requirements",
    price: 199,
    currency: "USD",
    billingCycle: "monthly",
    features: [
      "Unlimited messages",
      "Advanced analytics & reporting",
      "24/7 dedicated support",
      "Custom integrations",
      "White-label solution",
      "API access",
    ],
    isPopular: false,
  },
];

export const BillingPage: React.FC<PageProps> = ({
  title = "Billing & Subscriptions",
  description = "Manage your subscription and payment methods",
  className,
}) => {
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      variant: "success" | "error" | "info" | "warning";
      show: boolean;
    }>
  >([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToast = (
    message: string,
    variant: "success" | "error" | "info" | "warning"
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant, show: true }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleCheckout = (
    planId: string,
    email: string,
    paymentMethod: string
  ) => {
    console.log("Checkout initiated:", { planId, email, paymentMethod });
    addToast("Checkout process initiated successfully", "success");
    setShowCheckout(false);
  };

  return (
    <div className={cx("space-y-6", className)}>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            show={toast.show}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Plan
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-sm font-medium rounded-full">
            Active
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Professional Plan
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Next Billing
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              March 15, 2024
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              $79.00/month
            </p>
          </div>
        </div>
      </div>

      {/* Billing Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Billing Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete billing management interface
          </p>
        </div>
        <div className="p-6">
          <BillingDashboard plans={mockPlans} />
        </div>
      </div>

      {/* Upgrade Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Available Plans
          </h2>
          <Button variant="primary" onClick={() => setShowCheckout(true)}>
            Upgrade Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockPlans.map((plan) => (
            <div
              key={plan.id}
              className={cx(
                "relative p-6 rounded-lg border-2 transition-all",
                plan.isPopular
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-3 py-1 text-sm font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    /{plan.billingCycle}
                  </span>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.isPopular ? "primary" : "secondary"}
                className="w-full mt-6"
                onClick={() => setShowCheckout(true)}
              >
                {plan.id === "professional" ? "Current Plan" : "Choose Plan"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Complete Your Subscription
              </h3>
              <CheckoutPanel
                plans={mockPlans}
                currency="$"
                onCheckout={handleCheckout}
                testMode={true}
              />
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={() => setShowCheckout(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
