/**
 * Flying Fox Solutions - Consulting Site POS Page
 *
 * Page that integrates the POS Dashboard blueprint.
 * Demonstrates how to embed point-of-sale functionality into a larger application.
 */

import React, { useState } from "react";
import POSDashboard from "../../pos/POSDashboard";
import { Button, Toast } from "../../../";
import type { PageProps } from "../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export const POSPage: React.FC<PageProps> = ({
  title = "POS / Orders",
  description = "Manage your point-of-sale and order processing",
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

  const handleCheckout = (orderData: Record<string, unknown>) => {
    console.log("Order processed:", orderData);
    addToast("Order processed successfully!", "success");
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

      {/* POS Dashboard */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Point of Sale Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Complete POS system with product management and order processing
          </p>
        </div>
        <div className="p-6">
          <POSDashboard onCheckout={handleCheckout} />
        </div>
      </div>

      {/* Order Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Orders
            </h3>
            <Button variant="ghost" size="sm" href="/orders">
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {[
              {
                id: "#1234",
                customer: "John Doe",
                total: "$45.99",
                status: "Completed",
                time: "2 min ago",
              },
              {
                id: "#1233",
                customer: "Sarah Wilson",
                total: "$89.50",
                status: "Processing",
                time: "15 min ago",
              },
              {
                id: "#1232",
                customer: "Mike Johnson",
                total: "$23.75",
                status: "Completed",
                time: "1 hour ago",
              },
              {
                id: "#1231",
                customer: "Lisa Brown",
                total: "$156.00",
                status: "Pending",
                time: "2 hours ago",
              },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {order.id}
                    </span>
                    <span
                      className={cx(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        order.status === "Completed"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : order.status === "Processing"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      )}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.customer} • {order.time}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {order.total}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Today's Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Orders
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                47
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Revenue
              </span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                $2,847.50
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average Order
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                $60.58
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Products Sold
              </span>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                234
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="primary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/pos/new-order"
          >
            <span>🛒</span>
            <span>New Order</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/products"
          >
            <span>📦</span>
            <span>Manage Products</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/customers"
          >
            <span>👥</span>
            <span>View Customers</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/reports"
          >
            <span>📊</span>
            <span>View Reports</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
