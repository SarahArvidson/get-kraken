/**
 * Flying Fox Solutions - Consulting Site Starter
 *
 * Complete SaaS-style web application template that demonstrates how to build
 * a consulting site using our atomic components and blueprints.
 */

import React, { useState } from "react";
import { Layout } from "./layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { MessagingPage } from "./pages/MessagingPage";
import { BillingPage } from "./pages/BillingPage";
import { POSPage } from "./pages/POSPage";
import { SettingsPage } from "./pages/SettingsPage";
import type {
  ConsultingSiteProps,
  User,
  NavigationConfig,
  DashboardStats,
  ActivityItem,
} from "./types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

// Mock data for demonstration
const mockUser: User = {
  id: "user_123",
  email: "john.doe@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "admin",
  company: "Acme Consulting",
  lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  isActive: true,
};

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

const defaultNavigation: NavigationConfig = {
  brand: {
    name: "Consulting Pro",
    href: "/",
  },
  items: [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/dashboard",
      icon: "📊",
    },
    {
      id: "messaging",
      label: "Messaging",
      href: "/messaging",
      icon: "💬",
      badge: "3",
    },
    {
      id: "billing",
      label: "Billing",
      href: "/billing",
      icon: "💳",
    },
    {
      id: "pos",
      label: "POS / Orders",
      href: "/pos",
      icon: "🛒",
    },
    {
      id: "analytics",
      label: "Analytics",
      href: "/analytics",
      icon: "📈",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "⚙️",
      children: [
        {
          id: "profile",
          label: "Profile",
          href: "/settings/profile",
          icon: "👤",
        },
        {
          id: "preferences",
          label: "Preferences",
          href: "/settings/preferences",
          icon: "🎨",
        },
        {
          id: "integrations",
          label: "Integrations",
          href: "/settings/integrations",
          icon: "🔗",
        },
      ],
    },
  ],
  userMenu: {
    profile: {
      id: "profile",
      label: "Profile",
      href: "/profile",
      icon: "👤",
    },
    settings: {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon: "⚙️",
    },
    logout: {
      id: "logout",
      label: "Sign Out",
      href: "/logout",
      icon: "🚪",
    },
  },
};

export const ConsultingSite: React.FC<ConsultingSiteProps> = ({
  config,
  user = mockUser,
}) => {
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "messaging" | "billing" | "pos" | "settings"
  >("dashboard");

  // Simple routing logic for demo purposes
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            stats={mockStats}
            recentActivity={mockActivity}
            children={undefined}
          />
        );
      case "messaging":
        return <MessagingPage children={undefined} />;
      case "billing":
        return <BillingPage children={undefined} />;
      case "pos":
        return <POSPage children={undefined} />;
      case "settings":
        return <SettingsPage children={undefined} />;
      default:
        return (
          <Dashboard
            stats={mockStats}
            recentActivity={mockActivity}
            children={undefined}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Layout
        user={user}
        navigation={{
          ...defaultNavigation,
          brand: {
            name: config.branding.companyName,
            href: "/",
          },
        }}
      >
        {/* Page Navigation for Demo */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "messaging", label: "Messaging", icon: "💬" },
              { id: "billing", label: "Billing", icon: "💳" },
              { id: "pos", label: "POS", icon: "🛒" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((page) => (
              <button
                key={page.id}
                onClick={() =>
                  setCurrentPage(
                    page.id as
                      | "dashboard"
                      | "messaging"
                      | "billing"
                      | "pos"
                      | "settings"
                  )
                }
                className={cx(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentPage === page.id
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                )}
              >
                <span className="mr-2">{page.icon}</span>
                {page.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Status */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">🚀</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Consulting Site Starter
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                This is a complete SaaS-style web application template built
                using our atomic components and blueprints. Click the page
                buttons above to explore different sections. All data is mocked
                for demonstration purposes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(config.features).map(([feature, enabled]) => (
                  <span
                    key={feature}
                    className={cx(
                      "px-2 py-1 text-xs font-medium rounded-full",
                      enabled
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    )}
                  >
                    {feature}: {enabled ? "Enabled" : "Disabled"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Page */}
        {renderPage()}
      </Layout>
    </div>
  );
};
