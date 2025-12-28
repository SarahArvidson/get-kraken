/**
 * Flying Fox Solutions - Consulting Site Messaging Page
 *
 * Page that integrates the Messaging Dashboard blueprint.
 * Demonstrates how to embed blueprints into a larger application.
 */

import React, { useState } from "react";
import MessagingDashboard from "../../messaging/MessagingDashboard";
import { Toast } from "../../../";
import type { PageProps } from "../types";
import type { MessagingSlickTextConfig } from "../../../../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const MessagingPage: React.FC<PageProps> = ({
  title = "Messaging",
  description = "Send and manage SMS campaigns",
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

  // Mock SlickText configuration
  const slickTextConfig: MessagingSlickTextConfig = {
    apiKey: "demo_public_key", // This is actually the public key for API v2
    accountId: "demo_brand_123", // This is actually the brand ID for API v2
    baseUrl: "https://dev.slicktext.com/v1",
    sandboxMode: true,
  };

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

  const handleConfigUpdate = (newConfig: MessagingSlickTextConfig) => {
    console.log("SlickText config updated:", newConfig);
    addToast("Messaging configuration updated successfully", "success");
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

      {/* Integration Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Messaging Integration
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              This page demonstrates how to integrate the Messaging Dashboard
              blueprint into your consulting site. The dashboard below includes
              all messaging functionality: composing messages, managing
              contacts, viewing history, and configuring auto-replies.
            </p>
          </div>
        </div>
      </div>

      {/* Messaging Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <MessagingDashboard
          slickTextConfig={slickTextConfig}
          onConfigUpdate={handleConfigUpdate}
        />
      </div>

      {/* Additional Messaging Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campaign Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📝 Campaign Templates
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Pre-built message templates for common business communications.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Welcome Message</span>
              <button className="text-indigo-600 hover:text-indigo-500 text-sm">
                Use Template
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Order Confirmation</span>
              <button className="text-indigo-600 hover:text-indigo-500 text-sm">
                Use Template
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium">Appointment Reminder</span>
              <button className="text-indigo-600 hover:text-indigo-500 text-sm">
                Use Template
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Messaging Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Messages Sent Today
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                47
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Delivery Rate
              </span>
              <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                98.2%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Response Rate
              </span>
              <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                12.4%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Subscribers
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                1,247
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
