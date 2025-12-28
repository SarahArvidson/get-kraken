import { useState, useEffect, useCallback } from "react";
import { messagingApiClient } from "../services/apiClient";
import type {
  Message,
  Campaign,
  MessagingSendMessageRequest,
  SubscribeContactRequest,
} from "../types";

/**
 * useMessaging Hook
 * ----------------
 * Main hook for messaging functionality using the backend API
 */

export const useMessaging = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [campaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{
    usingMocks: boolean;
    service: "mock" | "real";
  } | null>(null);

  // Load service status
  const loadServiceStatus = useCallback(async () => {
    try {
      const status = await messagingApiClient.getServiceStatus();
      setServiceStatus({
        usingMocks: status.usingMocks,
        service: status.service,
      });
    } catch (err) {
      console.error("Failed to load service status:", err);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    async (request: MessagingSendMessageRequest) => {
      setLoading(true);
      setError(null);

      try {
        const result = await messagingApiClient.sendMessage(request);

        // Convert the result to our Message format
        const newMessage: Message = {
          id: result.messageId || result.message_id || `msg_${Date.now()}`,
          content: request.message,
          segments: [],
          recipientCount: result.recipientCount || 0,
          status: result.status || "sent",
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          cost: result.estimatedCost || 0,
          currency: "USD",
        };

        // Add to messages list
        setMessages((prev) => [newMessage, ...prev]);

        // Refresh service status to show updated stats
        await loadServiceStatus();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    },
    [loadServiceStatus]
  );

  // Subscribe contact
  const subscribeContact = useCallback(
    async (request: SubscribeContactRequest) => {
      setLoading(true);
      setError(null);

      try {
        const result = await messagingApiClient.subscribeContact(request);

        // Refresh service status to show updated subscriber counts
        await loadServiceStatus();

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadServiceStatus]
  );

  // Get message history (mock data for now)
  const getMessageHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // For now, we'll use mock data since the backend doesn't have a getMessages endpoint
      const mockMessages: Message[] = [
        {
          id: "msg_1",
          content: "Welcome to our service!",
          segments: [],
          recipientCount: 150,
          status: "sent",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          sentAt: new Date(Date.now() - 86400000).toISOString(),
          cost: 15.0,
          currency: "USD",
        },
        {
          id: "msg_2",
          content: "Special offer: 20% off your next order!",
          segments: [],
          recipientCount: 89,
          status: "sent",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          sentAt: new Date(Date.now() - 172800000).toISOString(),
          cost: 8.9,
          currency: "USD",
        },
      ];

      setMessages(mockMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get contact lists
  const getLists = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await messagingApiClient.getLists();
      return response.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get campaign stats
  const getCampaignStats = useCallback(async (campaignId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await messagingApiClient.getCampaignStats(campaignId);
      return response.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create auto-reply
  const createAutoReply = useCallback(
    async (keyword: string, message: string, isActive: boolean = true) => {
      setLoading(true);
      setError(null);

      try {
        const response = await messagingApiClient.createAutoReply(
          keyword,
          message,
          isActive
        );
        return response.result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get account balance
  const getAccountBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await messagingApiClient.getAccountBalance();
      return response.result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Switch to mock mode
  const switchToMockMode = useCallback(async () => {
    try {
      await messagingApiClient.switchMode("mock");
      await loadServiceStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to switch to mock mode"
      );
    }
  }, [loadServiceStatus]);

  // Switch to real mode
  const switchToRealMode = useCallback(async () => {
    try {
      await messagingApiClient.switchMode("real");
      await loadServiceStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to switch to real mode"
      );
    }
  }, [loadServiceStatus]);

  // Load initial data
  useEffect(() => {
    getMessageHistory();
    loadServiceStatus();
  }, [getMessageHistory, loadServiceStatus]);

  return {
    messages,
    campaigns,
    loading,
    error,
    serviceStatus,
    sendMessage,
    subscribeContact,
    getMessageHistory,
    getLists,
    getCampaignStats,
    createAutoReply,
    getAccountBalance,
    switchToMockMode,
    switchToRealMode,
  };
};
