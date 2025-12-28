/**
 * Flying Fox Solutions - Consulting Site Dashboard
 *
 * Main dashboard page showing overview stats and recent activity.
 * Demonstrates how to build dashboards using atomic components and blueprints.
 */

import React from "react";
import { Button } from "../../../";
import type { HomePageProps, DashboardStats, ActivityItem } from "../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const mockStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  revenue: 45680,
  orders: 234,
  growth: {
    users: 12.5,
    revenue: 8.3,
    orders: 15.2,
  },
};

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "user_login",
    description: "John Doe logged in",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    user: {
      name: "John Doe",
      avatar: undefined,
    },
  },
  {
    id: "2",
    type: "order_created",
    description: "New order #1234 created",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    user: {
      name: "Sarah Wilson",
    },
  },
  {
    id: "3",
    type: "payment_received",
    description: "Payment of $299.00 received",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "4",
    type: "message_sent",
    description: "SMS campaign sent to 150 recipients",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
];

export const Dashboard: React.FC<HomePageProps> = ({
  title = "Dashboard",
  description = "Overview of your business metrics and recent activity",
  stats = mockStats,
  recentActivity = mockActivity,
  className,
  children,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "user_login":
        return "🔐";
      case "order_created":
        return "🛒";
      case "payment_received":
        return "💳";
      case "message_sent":
        return "💬";
      default:
        return "📋";
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "user_login":
        return "text-blue-600 dark:text-blue-400";
      case "order_created":
        return "text-green-600 dark:text-green-400";
      case "payment_received":
        return "text-yellow-600 dark:text-yellow-400";
      case "message_sent":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className={cx("space-y-6", className)}>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(stats.totalUsers)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{stats.growth.users}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Users
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(stats.activeUsers)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {Math.round((stats.activeUsers / stats.totalUsers) * 100)}% of
                total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats.revenue)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{stats.growth.revenue}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Orders
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {formatNumber(stats.orders)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{stats.growth.orders}% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/messaging"
          >
            <span>💬</span>
            <span>Send Message</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/pos"
          >
            <span>🛒</span>
            <span>Create Order</span>
          </Button>
          <Button
            variant="secondary"
            className="flex items-center justify-center space-x-2 py-3"
            href="/billing"
          >
            <span>💳</span>
            <span>View Billing</span>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
          <Button variant="ghost" size="sm" href="/activity">
            View All
          </Button>
        </div>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-lg">
                  {getActivityIcon(activity.type)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.timestamp.toLocaleString()}
                </p>
              </div>
              <div
                className={cx(
                  "text-sm font-medium",
                  getActivityColor(activity.type)
                )}
              >
                {activity.type.replace("_", " ").toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom children content */}
      {children}
    </div>
  );
};
