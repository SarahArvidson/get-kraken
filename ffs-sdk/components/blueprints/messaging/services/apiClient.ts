/**
 * Flying Fox Solutions - Messaging API Client
 *
 * Client for connecting the Messaging Dashboard frontend to the backend API routes.
 * Supports both mock and real API modes with seamless switching.
 */

import type {
  Campaign,
  AutoReply,
  MessagingSendMessageRequest,
  SendMessageResponse,
  SubscribeContactRequest,
  SubscribeContactResponse,
} from "../types";

// ============================================================================
// API Configuration
// ============================================================================

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: "http://localhost:3001/api",
  timeout: 10000,
};

// ============================================================================
// API Response Types
// ============================================================================

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  requestId?: string;
  timestamp?: string;
}

interface ServiceStatusResponse {
  usingMocks: boolean;
  service: "mock" | "real";
  timestamp: string;
}

interface ModeSwitchResponse {
  mode: "mock" | "real";
  usingMocks: boolean;
  timestamp: string;
}

// ============================================================================
// API Client Class
// ============================================================================

export class MessagingApiClient {
  private config: ApiConfig;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as ApiResponse<T>;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout - please try again");
        }
        throw error;
      }

      throw new Error("Unknown error occurred");
    }
  }

  // ============================================================================
  // Service Management
  // ============================================================================

  /**
   * Get current service status (mock vs real)
   */
  async getServiceStatus(): Promise<ServiceStatusResponse> {
    const response = await this.makeRequest<ServiceStatusResponse>(
      "/test/slicktext/status"
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to get service status");
    }

    return response.data!;
  }

  /**
   * Switch between mock and real API mode
   */
  async switchMode(mode: "mock" | "real"): Promise<ModeSwitchResponse> {
    const response = await this.makeRequest<ModeSwitchResponse>(
      "/test/slicktext/mode",
      {
        method: "POST",
        body: JSON.stringify({ mode }),
      }
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to switch mode");
    }

    return response.data!;
  }

  // ============================================================================
  // Messaging Operations
  // ============================================================================

  /**
   * Send a message
   */
  async sendMessage(
    request: MessagingSendMessageRequest
  ): Promise<SendMessageResponse> {
    const response = await this.makeRequest<{ result: SendMessageResponse }>(
      "/test/slicktext/send",
      {
        method: "POST",
        body: JSON.stringify({
          message: request.message,
          recipients: request.recipients,
          scheduledAt: request.scheduledAt,
          campaignName: request.campaignName,
        }),
      }
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to send message");
    }

    return response.data!.result;
  }

  /**
   * Subscribe a contact to a list
   */
  async subscribeContact(
    request: SubscribeContactRequest
  ): Promise<SubscribeContactResponse> {
    const response = await this.makeRequest<{
      result: SubscribeContactResponse;
    }>("/test/slicktext/subscribe", {
      method: "POST",
      body: JSON.stringify({
        listId: request.listId,
        phone: request.phoneNumber,
        firstName: request.customFields?.firstName,
        lastName: request.customFields?.lastName,
        email: request.customFields?.email,
      }),
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to subscribe contact");
    }

    return response.data!.result;
  }

  /**
   * Get all contact lists
   */
  async getLists(): Promise<{
    result: Array<{ id: string; name: string; subscriber_count: number }>;
  }> {
    const response = await this.makeRequest<{
      result: Array<{ id: string; name: string; subscriber_count: number }>;
    }>("/test/slicktext/lists");

    if (!response.success) {
      throw new Error(response.error || "Failed to get lists");
    }

    return response.data!;
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(campaignId: string): Promise<{ result: Campaign }> {
    const response = await this.makeRequest<{ result: Campaign }>(
      `/test/slicktext/campaigns/${campaignId}/stats`
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to get campaign stats");
    }

    return response.data!;
  }

  /**
   * Get account balance
   */
  async getAccountBalance(): Promise<{
    result: { balance: number; currency: string };
  }> {
    const response = await this.makeRequest<{
      result: { balance: number; currency: string };
    }>("/test/slicktext/balance");

    if (!response.success) {
      throw new Error(response.error || "Failed to get account balance");
    }

    return response.data!;
  }

  /**
   * Create an auto-reply
   */
  async createAutoReply(
    keyword: string,
    message: string,
    isActive: boolean = true
  ): Promise<{ result: AutoReply }> {
    const response = await this.makeRequest<{ result: AutoReply }>(
      "/test/slicktext/auto-reply",
      {
        method: "POST",
        body: JSON.stringify({
          keyword,
          message,
          isActive,
        }),
      }
    );

    if (!response.success) {
      throw new Error(response.error || "Failed to create auto-reply");
    }

    return response.data!;
  }

  /**
   * Test webhook processing
   */
  async testWebhook(eventType: string): Promise<{
    webhookPayload: unknown;
    verifyResult: boolean;
    processResult: { status: string; event_id: string };
  }> {
    const response = await this.makeRequest<{
      webhookPayload: unknown;
      verifyResult: boolean;
      processResult: { status: string; event_id: string };
    }>("/test/slicktext/webhook", {
      method: "POST",
      body: JSON.stringify({ eventType }),
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to test webhook");
    }

    return response.data!;
  }

  /**
   * Test error handling
   */
  async testError(
    errorType:
      | "authentication_failed"
      | "validation_error"
      | "rate_limit_exceeded"
      | "not_found"
      | "server_error"
  ): Promise<{
    result: { success: false; error: string };
    errorType: string;
  }> {
    const response = await this.makeRequest<{
      result: { success: false; error: string };
      errorType: string;
    }>("/test/slicktext/error", {
      method: "POST",
      body: JSON.stringify({ errorType }),
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to test error");
    }

    return response.data!;
  }

  /**
   * Run complete workflow test
   */
  async testWorkflow(): Promise<{
    workflowSteps: Array<{
      step: string;
      result: unknown;
      timestamp: string;
    }>;
    summary: {
      totalSteps: number;
      duration: string;
      allSuccessful: boolean;
    };
  }> {
    const response = await this.makeRequest<{
      workflowSteps: Array<{
        step: string;
        result: unknown;
        timestamp: string;
      }>;
      summary: {
        totalSteps: number;
        duration: string;
        allSuccessful: boolean;
      };
    }>("/test/slicktext/workflow", {
      method: "POST",
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to run workflow test");
    }

    return response.data!;
  }

  /**
   * Get webhook event examples
   */
  async getWebhookEvents(): Promise<{ result: Record<string, unknown> }> {
    const response = await this.makeRequest<{
      result: Record<string, unknown>;
    }>("/test/slicktext/webhook-events");

    if (!response.success) {
      throw new Error(response.error || "Failed to get webhook events");
    }

    return response.data!;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const messagingApiClient = new MessagingApiClient();

// ============================================================================
// Convenience Functions
// ============================================================================

export const getServiceStatus = () => messagingApiClient.getServiceStatus();
export const switchMode = (mode: "mock" | "real") =>
  messagingApiClient.switchMode(mode);
export const sendMessage = (request: MessagingSendMessageRequest) =>
  messagingApiClient.sendMessage(request);
export const subscribeContact = (request: SubscribeContactRequest) =>
  messagingApiClient.subscribeContact(request);
export const getLists = () => messagingApiClient.getLists();
export const getCampaignStats = (campaignId: string) =>
  messagingApiClient.getCampaignStats(campaignId);
export const getAccountBalance = () => messagingApiClient.getAccountBalance();
export const createAutoReply = (
  keyword: string,
  message: string,
  isActive?: boolean
) => messagingApiClient.createAutoReply(keyword, message, isActive);
export const testWebhook = (eventType: string) =>
  messagingApiClient.testWebhook(eventType);
export const testError = (
  errorType:
    | "authentication_failed"
    | "validation_error"
    | "rate_limit_exceeded"
    | "not_found"
    | "server_error"
) => messagingApiClient.testError(errorType);
export const testWorkflow = () => messagingApiClient.testWorkflow();
export const getWebhookEvents = () => messagingApiClient.getWebhookEvents();
