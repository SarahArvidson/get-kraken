/**
 * Flying Fox Solutions - Consulting Site Settings Page
 *
 * Settings page with user preferences and account management.
 * Demonstrates how to build forms using atomic components.
 */

import React, { useState } from "react";
import { Button, InputField, FormGroup, Toast, Modal } from "../../../";
import type { PageProps, SettingsFormData } from "../types";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const defaultSettings: SettingsFormData = {
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    company: "Acme Consulting",
  },
  preferences: {
    theme: "system",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    dashboard: {
      defaultView: "overview",
      widgets: ["stats", "activity", "recent_orders"],
    },
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: true,
  },
};

export const SettingsPage: React.FC<PageProps> = ({
  title = "Settings",
  description = "Manage your account preferences and settings",
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
  const [settings, setSettings] = useState<SettingsFormData>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "profile" | "preferences" | "notifications" | "integrations"
  >("profile");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addToast("Settings saved successfully!", "success");
    } catch {
      addToast("Failed to save settings. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      addToast(
        "Account deletion initiated. Check your email for confirmation.",
        "info"
      );
      setShowDeleteModal(false);
    } catch {
      addToast(
        "Failed to initiate account deletion. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "preferences", label: "Preferences", icon: "🎨" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "integrations", label: "Integrations", icon: "🔗" },
  ] as const;

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

      {/* Settings Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Profile Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup label="First Name" htmlFor="firstName" required>
                  <InputField
                    id="firstName"
                    type="text"
                    label="First Name"
                    value={settings.profile.firstName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, firstName: e.target.value },
                      }))
                    }
                    placeholder="Enter your first name"
                  />
                </FormGroup>
                <FormGroup label="Last Name" htmlFor="lastName" required>
                  <InputField
                    id="lastName"
                    type="text"
                    label="Last Name"
                    value={settings.profile.lastName}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, lastName: e.target.value },
                      }))
                    }
                    placeholder="Enter your last name"
                  />
                </FormGroup>
                <FormGroup label="Email Address" htmlFor="email" required>
                  <InputField
                    id="email"
                    type="email"
                    label="Email Address"
                    value={settings.profile.email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, email: e.target.value },
                      }))
                    }
                    placeholder="Enter your email"
                  />
                </FormGroup>
                <FormGroup label="Phone Number" htmlFor="phone">
                  <InputField
                    id="phone"
                    type="tel"
                    label="Phone Number"
                    value={settings.profile.phone || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, phone: e.target.value },
                      }))
                    }
                    placeholder="Enter your phone number"
                  />
                </FormGroup>
                <FormGroup label="Company" htmlFor="company">
                  <InputField
                    id="company"
                    type="text"
                    label="Company"
                    value={settings.profile.company || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        profile: { ...prev.profile, company: e.target.value },
                      }))
                    }
                    placeholder="Enter your company name"
                  />
                </FormGroup>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Appearance & Preferences
              </h2>
              <div className="space-y-4">
                <FormGroup label="Theme" htmlFor="theme">
                  <select
                    id="theme"
                    value={settings.preferences.theme}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          theme: e.target.value as "light" | "dark" | "system",
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </FormGroup>
                <FormGroup
                  label="Default Dashboard View"
                  htmlFor="dashboardView"
                >
                  <select
                    id="dashboardView"
                    value={settings.preferences.dashboard.defaultView}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          dashboard: {
                            ...prev.preferences.dashboard,
                            defaultView: e.target.value as
                              | "overview"
                              | "analytics"
                              | "activity",
                          },
                        },
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="overview">Overview</option>
                    <option value="analytics">Analytics</option>
                    <option value="activity">Activity</option>
                  </select>
                </FormGroup>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    key: "email",
                    label: "Email Notifications",
                    description: "Receive notifications via email",
                  },
                  {
                    key: "push",
                    label: "Push Notifications",
                    description: "Receive push notifications in your browser",
                  },
                  {
                    key: "sms",
                    label: "SMS Notifications",
                    description: "Receive notifications via SMS",
                  },
                  {
                    key: "marketing",
                    label: "Marketing Emails",
                    description: "Receive promotional and marketing emails",
                  },
                ].map((notification) => (
                  <div
                    key={notification.key}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {notification.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={
                          settings.notifications[
                            notification.key as keyof typeof settings.notifications
                          ]
                        }
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            notifications: {
                              ...prev.notifications,
                              [notification.key]: e.target.checked,
                            },
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Third-Party Integrations
              </h2>
              <div className="space-y-4">
                {[
                  {
                    name: "SlickText",
                    description: "SMS messaging platform",
                    status: "Connected",
                    icon: "💬",
                  },
                  {
                    name: "Stripe",
                    description: "Payment processing",
                    status: "Connected",
                    icon: "💳",
                  },
                  {
                    name: "Square",
                    description: "Point of sale system",
                    status: "Not Connected",
                    icon: "🛒",
                  },
                  {
                    name: "HubSpot",
                    description: "CRM and marketing automation",
                    status: "Not Connected",
                    icon: "📈",
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {integration.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {integration.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={cx(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          integration.status === "Connected"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300"
                        )}
                      >
                        {integration.status}
                      </span>
                      <Button
                        variant={
                          integration.status === "Connected"
                            ? "secondary"
                            : "primary"
                        }
                        size="sm"
                      >
                        {integration.status === "Connected"
                          ? "Manage"
                          : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Account
            </Button>
            <Button variant="primary" onClick={handleSave} loading={isLoading}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete your account? This action cannot be
            undone. All your data will be permanently removed.
          </p>
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={isLoading}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
