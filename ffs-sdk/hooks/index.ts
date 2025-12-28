/**
 * Flying Fox Solutions - Hooks Barrel Export
 *
 * Centralized export for all custom hooks across the template library.
 * This provides a single import point for all hooks.
 */

// ============================================================================
// Blueprint Hooks
// ============================================================================

// Messaging Hooks
export { useMessaging } from "../components/blueprints/messaging/hooks/useMessaging";
export { useContacts } from "../components/blueprints/messaging/hooks/useContacts";
export { useCampaigns } from "../components/blueprints/messaging/hooks/useCampaigns";

// POS Hooks
export { useCart } from "../components/blueprints/pos/hooks/useCart";
export { useProducts } from "../components/blueprints/pos/hooks/useProducts";
export { useOrders } from "../components/blueprints/pos/hooks/useOrders";

// Billing Hooks
export { useBillingData } from "../components/billing/hooks/useBillingData";
export { useInvoices } from "../components/billing/hooks/useInvoices";

// ============================================================================
// Hook Types
// ============================================================================

// Note: Hook return types are defined inline in the hook files

export type {
  // POS Hook Types
  UseCartReturn,
  UseProductsReturn,
  UseOrdersReturn,
} from "../components/blueprints/pos/types";

export type {
  // Billing Hook Types
  BillingData,
} from "../components/billing/hooks/useBillingData";

export type {
  // Invoice Types
  Invoice,
} from "../components/billing/hooks/useInvoices";
