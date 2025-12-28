/**
 * Integration Tests for Flying Fox SDK
 *
 * Basic tests to ensure integrations work correctly.
 * These tests use mock implementations and verify the API contracts.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SupabaseIntegration } from "../integrations/supabase";
import { StripeIntegration } from "../integrations/stripe";
import { SlickTextIntegration } from "../integrations/slicktext";
import { HubSpotIntegration } from "../integrations/hubspot";
import { SquareIntegration } from "../integrations/square";
import { QuickBooksIntegration } from "../integrations/quickbooks";
import { XeroIntegration } from "../integrations/xero";

describe("Integration Services", () => {
  describe("SupabaseIntegration", () => {
    let supabase: SupabaseIntegration;

    beforeEach(() => {
      supabase = new SupabaseIntegration({
        url: "https://test.supabase.co",
        anonKey: "test-anon-key",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = supabase.getConnectionInfo();
      expect(info.url).toBe("https://test.supabase.co");
      expect(info.hasServiceKey).toBe(false);
    });

    it("should perform health check", async () => {
      const result = await supabase.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });

  describe("StripeIntegration", () => {
    let stripe: StripeIntegration;

    beforeEach(() => {
      stripe = new StripeIntegration({
        secretKey: "sk_test_123",
        publishableKey: "pk_test_123",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = stripe.getConnectionInfo();
      expect(info.testMode).toBe(true);
      expect(info.initialized).toBe(false);
    });

    it("should perform health check", async () => {
      const result = await stripe.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });

  describe("SlickTextIntegration", () => {
    let slicktext: SlickTextIntegration;

    beforeEach(() => {
      slicktext = new SlickTextIntegration({
        apiKey: "test-api-key",
        textword: "TEST",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = slicktext.getConnectionInfo();
      expect(info.version).toBe("v2");
      expect(info.textword).toBe("TEST");
    });

    it("should perform health check", async () => {
      const result = await slicktext.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });

  describe("HubSpotIntegration", () => {
    let hubspot: HubSpotIntegration;

    beforeEach(() => {
      hubspot = new HubSpotIntegration({
        accessToken: "test-access-token",
        portalId: "test-portal-id",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = hubspot.getConnectionInfo();
      expect(info.portalId).toBe("test-portal-id");
      expect(info.initialized).toBe(false);
    });

    it("should perform health check", async () => {
      const result = await hubspot.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });

  describe("SquareIntegration", () => {
    let square: SquareIntegration;

    beforeEach(() => {
      square = new SquareIntegration({
        applicationId: "test-app-id",
        accessToken: "test-access-token",
        environment: "sandbox",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = square.getConnectionInfo();
      expect(info.environment).toBe("sandbox");
      expect(info.initialized).toBe(false);
    });

    it("should perform health check", async () => {
      const result = await square.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });

  describe("QuickBooksIntegration", () => {
    let quickbooks: QuickBooksIntegration;

    beforeEach(() => {
      quickbooks = new QuickBooksIntegration({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        companyId: "test-company-id",
        environment: "sandbox",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = quickbooks.getConnectionInfo();
      expect(info.environment).toBe("sandbox");
      expect(info.initialized).toBe(false);
    });

    it("should perform health check", async () => {
      const result = await quickbooks.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });

  describe("XeroIntegration", () => {
    let xero: XeroIntegration;

    beforeEach(() => {
      xero = new XeroIntegration({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
        tenantId: "test-tenant-id",
        environment: "sandbox",
      });
    });

    it("should initialize with correct configuration", () => {
      const info = xero.getConnectionInfo();
      expect(info.environment).toBe("sandbox");
      expect(info.initialized).toBe(false);
    });

    it("should perform health check", async () => {
      const result = await xero.healthCheck();
      expect(result.healthy).toBe(true);
    });
  });
});
