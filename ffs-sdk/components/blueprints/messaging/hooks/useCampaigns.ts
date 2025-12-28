import { useState, useCallback } from "react";
import type { Campaign, Message, Contact, DeliveryStats } from "../types";

/**
 * useCampaigns Hook
 * ----------------
 * Hook for managing SMS campaigns
 */

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Create campaign
  const createCampaign = useCallback(
    (data: {
      name: string;
      message: Message;
      recipients: Contact[];
      scheduledAt?: string;
    }): Campaign => {
      const campaign: Campaign = {
        id: `camp-${Date.now()}`,
        name: data.name,
        message: data.message,
        recipients: data.recipients,
        status: data.scheduledAt ? "scheduled" : "draft",
        scheduledAt: data.scheduledAt,
        deliveryStats: {
          totalSent: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
          deliveryRate: 0,
          cost: 0,
          currency: "USD",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCampaigns((prev) => [campaign, ...prev]);
      return campaign;
    },
    []
  );

  // ✅ Update campaign
  const updateCampaign = useCallback(
    (campaignId: string, updates: Partial<Campaign>) => {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
            : campaign
        )
      );
    },
    []
  );

  // ✅ Update campaign status
  const updateCampaignStatus = useCallback(
    (campaignId: string, status: Campaign["status"]) => {
      setCampaigns((prev) =>
        prev.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status, updatedAt: new Date().toISOString() }
            : campaign
        )
      );
    },
    []
  );

  // ✅ Update delivery stats
  const updateDeliveryStats = useCallback(
    (campaignId: string, stats: Partial<DeliveryStats>) => {
      setCampaigns((prev) =>
        prev.map((campaign) => {
          if (campaign.id === campaignId) {
            const updatedStats = { ...campaign.deliveryStats, ...stats };
            // Recalculate delivery rate
            if (updatedStats.totalSent > 0) {
              updatedStats.deliveryRate =
                (updatedStats.delivered / updatedStats.totalSent) * 100;
            }
            return {
              ...campaign,
              deliveryStats: updatedStats,
              updatedAt: new Date().toISOString(),
            };
          }
          return campaign;
        })
      );
    },
    []
  );

  // ✅ Delete campaign
  const deleteCampaign = useCallback((campaignId: string) => {
    setCampaigns((prev) =>
      prev.filter((campaign) => campaign.id !== campaignId)
    );
  }, []);

  // ✅ Get campaign by ID
  const getCampaign = useCallback(
    (campaignId: string): Campaign | undefined => {
      return campaigns.find((campaign) => campaign.id === campaignId);
    },
    [campaigns]
  );

  // ✅ Get campaigns by status
  const getCampaignsByStatus = useCallback(
    (status: Campaign["status"]): Campaign[] => {
      return campaigns.filter((campaign) => campaign.status === status);
    },
    [campaigns]
  );

  // ✅ Get active campaigns
  const getActiveCampaigns = useCallback((): Campaign[] => {
    return campaigns.filter(
      (campaign) =>
        campaign.status === "sending" || campaign.status === "scheduled"
    );
  }, [campaigns]);

  // ✅ Get completed campaigns
  const getCompletedCampaigns = useCallback((): Campaign[] => {
    return campaigns.filter(
      (campaign) => campaign.status === "sent" || campaign.status === "failed"
    );
  }, [campaigns]);

  // ✅ Get draft campaigns
  const getDraftCampaigns = useCallback((): Campaign[] => {
    return campaigns.filter((campaign) => campaign.status === "draft");
  }, [campaigns]);

  // ✅ Search campaigns
  const searchCampaigns = useCallback(
    (query: string): Campaign[] => {
      if (!query.trim()) return campaigns;

      const lowercaseQuery = query.toLowerCase();
      return campaigns.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(lowercaseQuery) ||
          campaign.message.content.toLowerCase().includes(lowercaseQuery)
      );
    },
    [campaigns]
  );

  // ✅ Get campaign statistics
  const getCampaignStats = useCallback(() => {
    const total = campaigns.length;
    const sent = campaigns.filter((c) => c.status === "sent").length;
    const sending = campaigns.filter((c) => c.status === "sending").length;
    const scheduled = campaigns.filter((c) => c.status === "scheduled").length;
    const drafts = campaigns.filter((c) => c.status === "draft").length;
    const failed = campaigns.filter((c) => c.status === "failed").length;

    // Calculate total messages sent
    const totalMessagesSent = campaigns.reduce(
      (sum, c) => sum + c.deliveryStats.totalSent,
      0
    );
    const totalDelivered = campaigns.reduce(
      (sum, c) => sum + c.deliveryStats.delivered,
      0
    );
    const totalFailed = campaigns.reduce(
      (sum, c) => sum + c.deliveryStats.failed,
      0
    );
    const totalCost = campaigns.reduce(
      (sum, c) => sum + c.deliveryStats.cost,
      0
    );

    // Calculate average delivery rate
    const avgDeliveryRate =
      totalMessagesSent > 0 ? (totalDelivered / totalMessagesSent) * 100 : 0;

    return {
      total,
      sent,
      sending,
      scheduled,
      drafts,
      failed,
      totalMessagesSent,
      totalDelivered,
      totalFailed,
      totalCost,
      avgDeliveryRate,
    };
  }, [campaigns]);

  // ✅ Get recent campaigns
  const getRecentCampaigns = useCallback(
    (limit = 5): Campaign[] => {
      return campaigns
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit);
    },
    [campaigns]
  );

  // ✅ Get campaigns by date range
  const getCampaignsByDateRange = useCallback(
    (startDate: Date, endDate: Date): Campaign[] => {
      return campaigns.filter((campaign) => {
        const campaignDate = new Date(campaign.createdAt);
        return campaignDate >= startDate && campaignDate <= endDate;
      });
    },
    [campaigns]
  );

  // ✅ Duplicate campaign
  const duplicateCampaign = useCallback(
    (campaignId: string): Campaign | null => {
      const campaign = getCampaign(campaignId);
      if (!campaign) return null;

      const duplicated: Campaign = {
        ...campaign,
        id: `camp-${Date.now()}`,
        name: `${campaign.name} (Copy)`,
        status: "draft",
        scheduledAt: undefined,
        sentAt: undefined,
        deliveryStats: {
          totalSent: 0,
          delivered: 0,
          failed: 0,
          pending: 0,
          deliveryRate: 0,
          cost: 0,
          currency: "USD",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCampaigns((prev) => [duplicated, ...prev]);
      return duplicated;
    },
    [getCampaign]
  );

  // ✅ Pause campaign
  const pauseCampaign = useCallback(
    (campaignId: string) => {
      updateCampaignStatus(campaignId, "paused");
    },
    [updateCampaignStatus]
  );

  // ✅ Resume campaign
  const resumeCampaign = useCallback(
    (campaignId: string) => {
      const campaign = getCampaign(campaignId);
      if (campaign) {
        const status = campaign.scheduledAt ? "scheduled" : "sending";
        updateCampaignStatus(campaignId, status);
      }
    },
    [getCampaign, updateCampaignStatus]
  );

  // ✅ Cancel campaign
  const cancelCampaign = useCallback(
    (campaignId: string) => {
      updateCampaignStatus(campaignId, "cancelled");
    },
    [updateCampaignStatus]
  );

  // ✅ Export campaigns to CSV
  const exportCampaignsToCSV = useCallback(
    (campaignsToExport: Campaign[] = campaigns): string => {
      const headers = [
        "Name",
        "Status",
        "Message",
        "Recipients",
        "Sent",
        "Delivered",
        "Failed",
        "Delivery Rate",
        "Cost",
        "Created",
        "Sent At",
      ];

      const rows = campaignsToExport.map((campaign) => [
        campaign.name,
        campaign.status,
        campaign.message.content.substring(0, 50) +
          (campaign.message.content.length > 50 ? "..." : ""),
        campaign.message.recipientCount,
        campaign.deliveryStats.totalSent,
        campaign.deliveryStats.delivered,
        campaign.deliveryStats.failed,
        `${campaign.deliveryStats.deliveryRate.toFixed(2)}%`,
        `$${campaign.deliveryStats.cost.toFixed(2)}`,
        new Date(campaign.createdAt).toLocaleDateString(),
        campaign.sentAt ? new Date(campaign.sentAt).toLocaleDateString() : "",
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      return csvContent;
    },
    [campaigns]
  );

  return {
    campaigns,
    loading,
    error,
    setLoading,
    setError,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,
    updateDeliveryStats,
    deleteCampaign,
    getCampaign,
    getCampaignsByStatus,
    getActiveCampaigns,
    getCompletedCampaigns,
    getDraftCampaigns,
    searchCampaigns,
    getCampaignStats,
    getRecentCampaigns,
    getCampaignsByDateRange,
    duplicateCampaign,
    pauseCampaign,
    resumeCampaign,
    cancelCampaign,
    exportCampaignsToCSV,
  };
};
