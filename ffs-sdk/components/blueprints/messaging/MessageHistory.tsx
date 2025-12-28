import React, { useState, useCallback } from "react";
import { Button, Spinner, Toast } from "../../ui";
import type { MessageHistoryProps, Campaign, DeliveryStats } from "./types";

/**
 * MessageHistory Component
 * ------------------------
 * Display past SMS campaigns with delivery statistics and actions
 */

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const MessageHistory: React.FC<MessageHistoryProps> = ({
  onViewCampaign,
  onResend,
  onDelete,
  className,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info" | "warning";
    show: boolean;
  } | null>(null);

  // ✅ Load campaigns (mock data for now)
  React.useEffect(() => {
    const loadCampaigns = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock campaign data
        const mockCampaigns: Campaign[] = [
          {
            id: "camp-1",
            name: "Weekly Newsletter",
            message: {
              id: "msg-1",
              content:
                "Check out our latest deals and promotions! Limited time offers available now.",
              segments: [
                {
                  id: "seg-1",
                  content:
                    "Check out our latest deals and promotions! Limited time offers available now.",
                  characterCount: 85,
                  isUnicode: false,
                  estimatedCost: 0.0075,
                },
              ],
              recipientCount: 1250,
              status: "sent",
              createdAt: "2024-01-15T10:30:00Z",
              sentAt: "2024-01-15T10:35:00Z",
              cost: 0.0075,
              currency: "USD",
            },
            recipients: [],
            status: "sent",
            sentAt: "2024-01-15T10:35:00Z",
            deliveryStats: {
              totalSent: 1250,
              delivered: 1187,
              failed: 63,
              pending: 0,
              deliveryRate: 94.96,
              cost: 9.38,
              currency: "USD",
            },
            createdAt: "2024-01-15T10:30:00Z",
            updatedAt: "2024-01-15T10:35:00Z",
          },
          {
            id: "camp-2",
            name: "Holiday Sale",
            message: {
              id: "msg-2",
              content:
                "🎉 Holiday Sale Alert! 50% off everything. Use code HOLIDAY50. Ends tomorrow!",
              segments: [
                {
                  id: "seg-2",
                  content:
                    "🎉 Holiday Sale Alert! 50% off everything. Use code HOLIDAY50. Ends tomorrow!",
                  characterCount: 82,
                  isUnicode: true,
                  estimatedCost: 0.015,
                },
              ],
              recipientCount: 850,
              status: "sent",
              createdAt: "2024-01-10T14:00:00Z",
              sentAt: "2024-01-10T14:05:00Z",
              cost: 0.015,
              currency: "USD",
            },
            recipients: [],
            status: "sent",
            sentAt: "2024-01-10T14:05:00Z",
            deliveryStats: {
              totalSent: 850,
              delivered: 816,
              failed: 34,
              pending: 0,
              deliveryRate: 96.0,
              cost: 12.75,
              currency: "USD",
            },
            createdAt: "2024-01-10T14:00:00Z",
            updatedAt: "2024-01-10T14:05:00Z",
          },
          {
            id: "camp-3",
            name: "Appointment Reminder",
            message: {
              id: "msg-3",
              content:
                "Reminder: Your appointment is tomorrow at 2:00 PM. Reply YES to confirm or NO to reschedule.",
              segments: [
                {
                  id: "seg-3",
                  content:
                    "Reminder: Your appointment is tomorrow at 2:00 PM. Reply YES to confirm or NO to reschedule.",
                  characterCount: 98,
                  isUnicode: false,
                  estimatedCost: 0.0075,
                },
              ],
              recipientCount: 45,
              status: "sending",
              createdAt: "2024-01-20T09:00:00Z",
              cost: 0.0075,
              currency: "USD",
            },
            recipients: [],
            status: "sending",
            deliveryStats: {
              totalSent: 45,
              delivered: 32,
              failed: 2,
              pending: 11,
              deliveryRate: 71.11,
              cost: 0.34,
              currency: "USD",
            },
            createdAt: "2024-01-20T09:00:00Z",
            updatedAt: "2024-01-20T09:00:00Z",
          },
        ];

        setCampaigns(mockCampaigns);
      } catch (err) {
        setError("Failed to load campaign history");
        console.error("Error loading campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  // ✅ Handle view campaign
  const handleViewCampaign = useCallback(
    (campaign: Campaign) => {
      setSelectedCampaign(campaign);
      onViewCampaign?.(campaign);
    },
    [onViewCampaign]
  );

  // ✅ Handle resend campaign
  const handleResend = useCallback(
    async (campaign: Campaign) => {
      try {
        await onResend?.(campaign);
        setToast({
          message: "Campaign resent successfully!",
          variant: "success",
          show: true,
        });
      } catch (error) {
        console.error("Resend error:", error);
        setToast({
          message: "Failed to resend campaign. Please try again.",
          variant: "error",
          show: true,
        });
      }
    },
    [onResend]
  );

  // ✅ Handle delete campaign
  const handleDelete = useCallback(
    async (campaign: Campaign) => {
      if (
        window.confirm(
          `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`
        )
      ) {
        try {
          await onDelete?.(campaign);
          setCampaigns((prev) => prev.filter((c) => c.id !== campaign.id));
          setToast({
            message: "Campaign deleted successfully!",
            variant: "success",
            show: true,
          });
        } catch (error) {
          console.error("Delete error:", error);
          setToast({
            message: "Failed to delete campaign. Please try again.",
            variant: "error",
            show: true,
          });
        }
      }
    },
    [onDelete]
  );

  // ✅ Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "sending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      case "paused":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200";
    }
  };

  // ✅ Format delivery rate
  const formatDeliveryRate = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  // ✅ Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
          className
        )}
      >
        <div className="flex items-center justify-center py-8">
          <Spinner size="md" color="primary" aria-label="Loading campaigns" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Loading campaign history...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cx(
          "bg-white dark:bg-gray-800 rounded-lg shadow p-6",
          className
        )}
      >
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto mb-4 text-red-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Campaigns
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx("bg-white dark:bg-gray-800 rounded-lg shadow", className)}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Campaign History
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View and manage your past SMS campaigns
            </p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {campaigns.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Campaigns Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Start by creating your first SMS campaign
            </p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                      {campaign.name}
                    </h4>
                    <span
                      className={cx(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        getStatusBadge(campaign.status)
                      )}
                    >
                      {campaign.status.charAt(0).toUpperCase() +
                        campaign.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {campaign.message.content}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Recipients:
                      </span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                        {campaign.message.recipientCount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Delivered:
                      </span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                        {campaign.deliveryStats.delivered.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Delivery Rate:
                      </span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                        {formatDeliveryRate(
                          campaign.deliveryStats.deliveryRate
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">
                        Cost:
                      </span>
                      <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                        ${campaign.deliveryStats.cost.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {campaign.sentAt
                      ? `Sent: ${formatDate(campaign.sentAt)}`
                      : `Created: ${formatDate(campaign.createdAt)}`}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewCampaign(campaign)}
                  >
                    View
                  </Button>

                  {campaign.status === "sent" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResend(campaign)}
                    >
                      Resend
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(campaign)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              {/* Delivery Progress Bar */}
              {campaign.status === "sending" && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Delivery Progress
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {campaign.deliveryStats.delivered +
                        campaign.deliveryStats.failed}{" "}
                      / {campaign.deliveryStats.totalSent}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((campaign.deliveryStats.delivered +
                            campaign.deliveryStats.failed) /
                            campaign.deliveryStats.totalSent) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          show={toast.show}
          onDismiss={() => setToast(null)}
          className="bottom-4 right-4"
        />
      )}
    </div>
  );
};

export default MessageHistory;
