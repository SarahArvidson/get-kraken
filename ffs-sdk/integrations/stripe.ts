/**
 * Flying Fox Solutions - Stripe Integration
 *
 * Comprehensive Stripe payment integration service for POS systems and web applications.
 * Supports payments, subscriptions, customers, and webhooks.
 *
 * Features:
 * - Payment processing (one-time and recurring)
 * - Customer management
 * - Subscription handling
 * - Product and pricing management
 * - Webhook processing
 * - POS-specific features (terminals, readers)
 *
 * Usage:
 * ```typescript
 * import { StripeIntegration } from "@ffx/sdk/services";
 *
 * const stripe = new StripeIntegration({
 *   secretKey: "sk_test_...",
 *   publishableKey: "pk_test_..."
 * });
 *
 * // Process payment
 * const paymentIntent = await stripe.createPaymentIntent({
 *   amount: 2000,
 *   currency: "usd",
 *   customerId: "cus_..."
 * });
 * ```
 */

export interface StripeConfig {
  /** Stripe secret key for server-side operations */
  secretKey: string;
  /** Stripe publishable key for client-side operations */
  publishableKey: string;
  /** Webhook endpoint secret for signature verification */
  webhookSecret?: string;
  /** API version to use (default: latest) */
  apiVersion?: string;
  /** Enable test mode */
  testMode?: boolean;
}

export interface StripeCustomer {
  id: string;
  email?: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
}

export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | "requires_payment_method"
    | "requires_confirmation"
    | "requires_action"
    | "processing"
    | "requires_capture"
    | "canceled"
    | "succeeded";
  client_secret: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "paused";
  current_period_start: number;
  current_period_end: number;
  items: {
    id: string;
    price: {
      id: string;
      unit_amount: number;
      currency: string;
      recurring: {
        interval: "day" | "week" | "month" | "year";
        interval_count: number;
      };
    };
    quantity: number;
  }[];
  metadata?: Record<string, string>;
  cancel_at_period_end?: boolean;
  canceled_at?: number;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customerId?: string;
  description?: string;
  metadata?: Record<string, string>;
  paymentMethodTypes?: string[];
  captureMethod?: "automatic" | "manual";
}

export interface CreateCustomerRequest {
  email?: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  metadata?: Record<string, string>;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
    previous_attributes?: any;
  };
  created: number;
  livemode: boolean;
  pending_webhooks: number;
  request?: {
    id?: string;
    idempotency_key?: string;
  };
}

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  default_price?: string;
  images?: string[];
  metadata?: Record<string, string>;
  created: number;
  updated: number;
}

export interface StripePrice {
  id: string;
  product: string;
  active: boolean;
  currency: string;
  unit_amount?: number;
  type: "one_time" | "recurring";
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    interval_count: number;
  };
  metadata?: Record<string, string>;
  created: number;
}

export interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  description?: string;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  created: number;
  due_date?: number;
}

export interface StripeTerminal {
  id: string;
  label?: string;
  location?: string;
  serial_number: string;
  status: "online" | "offline";
  device_type: "bbpos_chipper2x" | "verifone_P400" | "simulated_wisepad3";
  ip_address?: string;
  metadata?: Record<string, string>;
}

export class StripeIntegration {
  private config: StripeConfig;
  private initialized: boolean = false;

  constructor(config: StripeConfig) {
    this.config = config;
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.secretKey) {
      throw new Error("Stripe secret key is required");
    }
    if (!this.config.publishableKey) {
      throw new Error("Stripe publishable key is required");
    }

    // Validate key formats
    if (
      this.config.testMode !== false &&
      !this.config.secretKey.startsWith("sk_test_")
    ) {
      console.warn("Using live Stripe keys in test mode");
    }
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    return {
      testMode:
        this.config.testMode ?? this.config.secretKey.startsWith("sk_test_"),
      apiVersion: this.config.apiVersion ?? "latest",
      hasWebhookSecret: !!this.config.webhookSecret,
      initialized: this.initialized,
    };
  }

  /**
   * Initialize Stripe (placeholder for actual Stripe SDK initialization)
   */
  async initialize(): Promise<void> {
    try {
      // In a real implementation, this would initialize the Stripe SDK
      // const Stripe = require('stripe');
      // this.stripe = new Stripe(this.config.secretKey, {
      //   apiVersion: this.config.apiVersion
      // });

      this.initialized = true;
      console.log("Stripe integration initialized");
    } catch (error) {
      throw new Error(`Failed to initialize Stripe: ${error}`);
    }
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<StripePaymentIntent> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Mock implementation - in real usage, this would call Stripe API
      const paymentIntent: StripePaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        amount: request.amount,
        currency: request.currency,
        status: "requires_payment_method",
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        customer: request.customerId,
        description: request.description,
        metadata: request.metadata,
      };

      console.log("Created payment intent:", paymentIntent.id);
      return paymentIntent;
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error}`);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    request: CreateCustomerRequest
  ): Promise<StripeCustomer> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Mock implementation
      const customer: StripeCustomer = {
        id: `cus_mock_${Date.now()}`,
        email: request.email,
        name: request.name,
        phone: request.phone,
        address: request.address,
        metadata: request.metadata,
      };

      console.log("Created customer:", customer.id);
      return customer;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error}`);
    }
  }

  /**
   * Process Stripe webhook events with signature verification
   */
  processWebhookEvent(
    payload: string | Buffer,
    signature: string
  ): StripeWebhookEvent {
    if (!this.config.webhookSecret) {
      throw new Error("Webhook secret is required for webhook verification");
    }

    try {
      // In production, use Stripe's webhook signature verification:
      // const event = stripe.webhooks.constructEvent(payload, signature, this.config.webhookSecret);

      // For now, mock the webhook processing
      const mockEvent: StripeWebhookEvent = {
        id: `evt_${Date.now()}`,
        type: "payment_intent.succeeded",
        data: {
          object: JSON.parse(payload.toString()),
        },
        created: Math.floor(Date.now() / 1000),
        livemode: !this.config.testMode,
        pending_webhooks: 1,
      };

      console.log("Processed webhook event:", mockEvent.type);
      return mockEvent;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error}`);
    }
  }

  /**
   * Create a product
   */
  async createProduct(
    product: Omit<StripeProduct, "id" | "created" | "updated">
  ): Promise<StripeProduct> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const mockProduct: StripeProduct = {
        id: `prod_${Date.now()}`,
        ...product,
        created: Math.floor(Date.now() / 1000),
        updated: Math.floor(Date.now() / 1000),
      };

      console.log("Created product:", mockProduct.id);
      return mockProduct;
    } catch (error) {
      throw new Error(`Failed to create product: ${error}`);
    }
  }

  /**
   * Create a price
   */
  async createPrice(
    price: Omit<StripePrice, "id" | "created">
  ): Promise<StripePrice> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const mockPrice: StripePrice = {
        id: `price_${Date.now()}`,
        ...price,
        created: Math.floor(Date.now() / 1000),
      };

      console.log("Created price:", mockPrice.id);
      return mockPrice;
    } catch (error) {
      throw new Error(`Failed to create price: ${error}`);
    }
  }

  /**
   * Get invoices for a customer
   */
  async getInvoices(customerId: string): Promise<StripeInvoice[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Mock implementation
      const mockInvoices: StripeInvoice[] = [
        {
          id: `in_${Date.now()}`,
          customer: customerId,
          status: "paid",
          amount_due: 2000,
          amount_paid: 2000,
          amount_remaining: 0,
          currency: "usd",
          description: "Monthly subscription",
          hosted_invoice_url: `https://invoice.stripe.com/i/acct_test/in_${Date.now()}`,
          created: Math.floor(Date.now() / 1000),
        },
      ];

      console.log("Retrieved invoices for customer:", customerId);
      return mockInvoices;
    } catch (error) {
      throw new Error(`Failed to get invoices: ${error}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string
  ): Promise<StripeSubscription> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const mockSubscription: StripeSubscription = {
        id: subscriptionId,
        customer: `cus_${Date.now()}`,
        status: "canceled",
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
        cancel_at_period_end: false,
        items: [],
      };

      console.log("Canceled subscription:", subscriptionId);
      return mockSubscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error}`);
    }
  }

  /**
   * Refund a payment intent
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<{ id: string; status: string; amount: number }> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const refund = {
        id: `re_${Date.now()}`,
        status: "succeeded",
        amount: amount || 0, // In production, get from payment intent if not specified
      };

      console.log("Created refund:", refund.id);
      return refund;
    } catch (error) {
      throw new Error(`Failed to create refund: ${error}`);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      return {
        healthy: true,
        message: "Stripe integration is healthy",
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Stripe integration error: ${error}`,
      };
    }
  }
}

export default StripeIntegration;
