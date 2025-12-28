/**
 * Flying Fox Solutions - Services Barrel Export
 *
 * Centralized export for all service clients and API wrappers.
 * This provides a single import point for all services.
 */

// ============================================================================
// Backend Services (Primary)
// ============================================================================

// Note: Backend services are not included in the main project scope
// They are available in the backend directory separately

// ============================================================================
// Component Services (Secondary)
// ============================================================================

// Export component services for frontend use
export { messagingApiClient } from "../components/blueprints/messaging/services/apiClient";
export {
  SlickTextService,
  slickTextService,
} from "../components/blueprints/messaging/services/slicktext";

// ============================================================================
// Integration Services
// ============================================================================

// Export integration services
export { default as HubSpotIntegration } from "../integrations/hubspot";
export { default as QuickBooksIntegration } from "../integrations/quickbooks";
export { default as XeroIntegration } from "../integrations/xero";
export { default as SlickTextIntegration } from "../integrations/slicktext";
export { default as SquareIntegration } from "../integrations/square";
export { default as StripeIntegration } from "../integrations/stripe";
export { default as SupabaseIntegration } from "../integrations/supabase";

// ============================================================================
// Service Types
// ============================================================================

export type {
  SlickTextConfig,
  SlickTextContact,
  SendMessageRequest,
  SlickTextCampaign,
  SlickTextTemplate,
  SlickTextAutomation,
  SlickTextWebhookEvent,
  SlickTextAnalytics,
} from "../integrations/slicktext";

// Supabase integration types
export type {
  SupabaseConfig,
  AuthResult,
  SignUpData,
  SignInData,
  ResetPasswordData,
  SupabaseError,
  DatabaseValue,
  DatabaseTable,
} from "../integrations/supabase";

// Stripe integration types
export type {
  StripeConfig,
  StripeCustomer,
  StripePaymentIntent,
  StripeSubscription,
  CreatePaymentIntentRequest,
  CreateCustomerRequest,
  StripeWebhookEvent,
  StripeProduct,
  StripePrice,
  StripeInvoice,
  StripeTerminal,
} from "../integrations/stripe";

// HubSpot integration types
export type {
  HubSpotConfig,
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
  CreateContactRequest as HubSpotCreateContactRequest,
  CreateCompanyRequest,
  CreateDealRequest,
  HubSpotWorkflow,
  HubSpotAnalytics,
} from "../integrations/hubspot";

// Square integration types
export type {
  SquareConfig,
  SquarePayment,
  SquareCustomer,
  SquareOrder,
  SquareInventoryItem,
  CreatePaymentRequest as SquareCreatePaymentRequest,
  CreateCustomerRequest as SquareCreateCustomerRequest,
  SquareTerminal,
  SquareWebhookEvent,
  SquareAnalytics,
} from "../integrations/square";

// QuickBooks integration types
export type {
  QuickBooksConfig,
  QuickBooksCustomer,
  QuickBooksInvoice,
  QuickBooksItem,
  CreateCustomerRequest as QuickBooksCreateCustomerRequest,
  CreateInvoiceRequest as QuickBooksCreateInvoiceRequest,
  CreateItemRequest,
  QuickBooksAnalytics,
} from "../integrations/quickbooks";

// Xero integration types
export type {
  XeroConfig,
  XeroContact,
  XeroInvoice,
  XeroItem,
  CreateContactRequest as XeroCreateContactRequest,
  CreateInvoiceRequest as XeroCreateInvoiceRequest,
  CreateItemRequest as XeroCreateItemRequest,
  XeroAnalytics,
} from "../integrations/xero";
