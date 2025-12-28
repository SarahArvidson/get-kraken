import React, { useState, useCallback, useEffect } from "react";
import { Button, Toast } from "../../ui";
import {
  MessageComposer,
  ContactListUploader,
  MessageHistory,
  AutoReplyManager,
} from "./";
import { messagingApiClient } from "./services/apiClient";
import { slickTextService } from "./services/slicktext";
import { useMessaging } from "./hooks/useMessaging";
import { useContacts } from "./hooks/useContacts";
import type {
  MessagingDashboardProps,
  Message,
  Contact,
  Campaign,
  AutoReply,
} from "./types";

/**
 * MessagingDashboard Component
 * ----------------------------
 * Main dashboard combining all messaging components into a cohesive interface
 */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const MessagingDashboard: React.FC<MessagingDashboardProps> = ({
  slickTextConfig,
  className,
}) => {
  const [activeSection, setActiveSection] = useState<
    "compose" | "contacts" | "history" | "autoreply" | "settings"
  >("compose");
  const [serviceStatus, setServiceStatus] = useState<{
    usingMocks: boolean;
    service: "mock" | "real";
  } | null>(null);
  const [toasts, setToasts] = useState<
    Array<{
      id: number;
      message: string;
      variant: "success" | "error" | "info" | "warning";
      show: boolean;
    }>
  >([]);

  // Initialize messaging hooks
  const {
    sendMessage,
    serviceStatus: messagingServiceStatus,
    switchToMockMode,
    switchToRealMode,
  } = useMessaging();

  useContacts();

  // ✅ Toast management
  const addToast = useCallback(
    (message: string, variant: "success" | "error" | "info" | "warning") => {
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

  // Load service status on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const status = await messagingApiClient.getServiceStatus();
        setServiceStatus(status);
      } catch {
        console.error("Failed to load service status");
      }
    };
    loadStatus();
  }, []);

  // Update service status when messaging service status changes
  useEffect(() => {
    if (messagingServiceStatus) {
      setServiceStatus(messagingServiceStatus);
    }
  }, [messagingServiceStatus]);

  // Handle mode switching
  const handleSwitchMode = useCallback(
    async (mode: "mock" | "real") => {
      try {
        if (mode === "mock") {
          await switchToMockMode();
          addToast("Switched to mock mode", "info");
        } else {
          await switchToRealMode();
          addToast("Switched to real API mode", "info");
        }
      } catch {
        addToast("Failed to switch mode", "error");
      }
    },
    [switchToMockMode, switchToRealMode, addToast]
  );

  // ✅ Handle message send
  const handleSendMessage = useCallback(
    async (message: Message, recipients: Contact[]) => {
      try {
        await sendMessage({
          message: message.content,
          recipients: recipients.map((contact) => contact.phoneNumber),
          scheduledAt: message.scheduledAt,
        });

        addToast(
          `Message sent successfully to ${recipients.length} recipients!`,
          "success"
        );
        setActiveSection("history");
      } catch {
        console.error("Send message error");
        addToast("Failed to send message. Please try again.", "error");
      }
    },
    [sendMessage, addToast]
  );

  // ✅ Handle message schedule
  const handleScheduleMessage = useCallback(
    async (message: Message, scheduledAt: string, recipients: Contact[]) => {
      try {
        if (!slickTextConfig?.apiKey) {
          addToast(
            "SlickText configuration required. Please configure your API settings.",
            "error"
          );
          return;
        }

        // Update service config
        slickTextService.updateConfig(slickTextConfig);

        // Schedule message via SlickText
        const response = await slickTextService.sendMessage({
          message: message.content,
          recipients: recipients.map((contact) => contact.phoneNumber),
          scheduledAt,
          campaignName: `Scheduled Campaign ${Date.now()}`,
        });

        if (response.success) {
          addToast(
            `Message scheduled successfully for ${new Date(
              scheduledAt
            ).toLocaleString()}!`,
            "success"
          );
        } else {
          addToast(`Failed to schedule message: ${response.error}`, "error");
        }
      } catch {
        console.error("Schedule message error");
        addToast("Failed to schedule message. Please try again.", "error");
      }
    },
    [slickTextConfig, addToast]
  );

  // ✅ Handle save draft
  const handleSaveDraft = useCallback(
    async (message: Message) => {
      try {
        // In a real app, this would save to a database
        console.log("Saving draft:", message);
        addToast("Draft saved successfully!", "success");
      } catch {
        console.error("Save draft error");
        addToast("Failed to save draft. Please try again.", "error");
      }
    },
    [addToast]
  );

  // ✅ Handle contact upload
  const handleContactUpload = useCallback(
    async (contacts: Contact[]) => {
      try {
        if (!slickTextConfig?.apiKey) {
          addToast(
            "SlickText configuration required. Please configure your API settings.",
            "error"
          );
          return;
        }

        // Update service config
        slickTextService.updateConfig(slickTextConfig);

        // Upload contacts via SlickText
        const response = await slickTextService.uploadContacts(contacts);

        if (response.success && response.data) {
          addToast(
            `Successfully uploaded ${response.data.successCount} contacts!`,
            "success"
          );
        } else {
          addToast(`Failed to upload contacts: ${response.error}`, "error");
        }
      } catch {
        console.error("Upload contacts error");
        addToast("Failed to upload contacts. Please try again.", "error");
      }
    },
    [slickTextConfig, addToast]
  );

  // ✅ Handle auto-reply save
  const handleAutoReplySave = useCallback(
    async (autoReply: AutoReply) => {
      try {
        if (!slickTextConfig?.apiKey) {
          addToast(
            "SlickText configuration required. Please configure your API settings.",
            "error"
          );
          return;
        }

        // Update service config
        slickTextService.updateConfig(slickTextConfig);

        // Create auto-reply via SlickText
        const response = await slickTextService.createAutoReply(
          autoReply.keyword,
          autoReply.message
        );

        if (response.success) {
          addToast("Auto-reply created successfully!", "success");
        } else {
          addToast(`Failed to create auto-reply: ${response.error}`, "error");
        }
      } catch {
        console.error("Save auto-reply error");
        addToast("Failed to save auto-reply. Please try again.", "error");
      }
    },
    [slickTextConfig, addToast]
  );

  // ✅ Handle auto-reply delete
  const handleAutoReplyDelete = useCallback(
    async (autoReplyId: string) => {
      try {
        // In a real app, this would call the SlickText API
        console.log("Deleting auto-reply:", autoReplyId);
        addToast("Auto-reply deleted successfully!", "success");
      } catch {
        console.error("Delete auto-reply error");
        addToast("Failed to delete auto-reply. Please try again.", "error");
      }
    },
    [addToast]
  );

  // ✅ Handle auto-reply toggle
  const handleAutoReplyToggle = useCallback(
    async (autoReplyId: string, isActive: boolean) => {
      try {
        // In a real app, this would call the SlickText API
        console.log("Toggling auto-reply:", autoReplyId, isActive);
        addToast(
          `Auto-reply ${isActive ? "enabled" : "disabled"} successfully!`,
          "success"
        );
      } catch {
        console.error("Toggle auto-reply error");
        addToast("Failed to update auto-reply. Please try again.", "error");
      }
    },
    [addToast]
  );

  // ✅ Handle campaign view
  const handleViewCampaign = useCallback(
    (campaign: Campaign) => {
      console.log("Viewing campaign:", campaign);
      addToast(`Viewing campaign: ${campaign.name}`, "info");
    },
    [addToast]
  );

  // ✅ Handle campaign resend
  const handleResendCampaign = useCallback(
    async (campaign: Campaign) => {
      try {
        console.log("Resending campaign:", campaign);
        addToast(`Resending campaign: ${campaign.name}`, "info");
      } catch {
        console.error("Resend campaign error");
        addToast("Failed to resend campaign. Please try again.", "error");
      }
    },
    [addToast]
  );

  // ✅ Handle campaign delete
  const handleDeleteCampaign = useCallback(
    async (campaign: Campaign) => {
      try {
        console.log("Deleting campaign:", campaign);
        addToast(
          `Campaign "${campaign.name}" deleted successfully!`,
          "success"
        );
      } catch {
        console.error("Delete campaign error");
        addToast("Failed to delete campaign. Please try again.", "error");
      }
    },
    [addToast]
  );

  // ✅ Navigation items
  const navigationItems = [
    { id: "compose", label: "Compose", icon: "✍️" },
    { id: "contacts", label: "Contacts", icon: "👥" },
    { id: "history", label: "History", icon: "📋" },
    { id: "autoreply", label: "Auto-Reply", icon: "🤖" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ] as const;

  return (
    <div className={cx("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                SMS Messaging Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                Send, manage, and track your SMS campaigns
              </p>
            </div>

            {/* Service Status Indicator */}
            {serviceStatus && (
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    serviceStatus.usingMocks
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      serviceStatus.usingMocks ? "bg-blue-500" : "bg-green-500"
                    }`}
                  />
                  <span>
                    {serviceStatus.usingMocks ? "Mock Mode" : "Live API"}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSwitchMode("mock")}
                    disabled={serviceStatus.usingMocks}
                  >
                    Mock
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleSwitchMode("real")}
                    disabled={!serviceStatus.usingMocks}
                  >
                    Live
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
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
          {/* Compose Section */}
          {activeSection === "compose" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <MessageComposer
                  onSend={handleSendMessage}
                  onSaveDraft={handleSaveDraft}
                  onSchedule={handleScheduleMessage}
                />
              </div>
              <div>
                <ContactListUploader onUpload={handleContactUpload} />
              </div>
            </div>
          )}

          {/* Contacts Section */}
          {activeSection === "contacts" && (
            <div className="max-w-4xl">
              <ContactListUploader onUpload={handleContactUpload} />
            </div>
          )}

          {/* History Section */}
          {activeSection === "history" && (
            <div className="max-w-6xl">
              <MessageHistory
                onViewCampaign={handleViewCampaign}
                onResend={handleResendCampaign}
                onDelete={handleDeleteCampaign}
              />
            </div>
          )}

          {/* Auto-Reply Section */}
          {activeSection === "autoreply" && (
            <div className="max-w-4xl">
              <AutoReplyManager
                onSave={handleAutoReplySave}
                onDelete={handleAutoReplyDelete}
                onToggle={handleAutoReplyToggle}
              />
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="max-w-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  SlickText Configuration
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Configure your SlickText API credentials to enable messaging
                  functionality.
                </p>

                {!slickTextConfig?.apiKey ? (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 11a1 1 0 100-2 1 1 0 000 2zm1-1a1 1 0 10-2 0v3a1 1 0 102 0v-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        SlickText API configuration required
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-green-800 dark:text-green-200">
                        SlickText API configured and ready
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>To configure SlickText:</p>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Sign up for a SlickText account</li>
                    <li>Generate an API key from your dashboard</li>
                    <li>Update the configuration in your application</li>
                    <li>Test with the sandbox environment first</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
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
};

export default MessagingDashboard;
