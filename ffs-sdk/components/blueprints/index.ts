/**
 * Flying Fox Solutions - Blueprints Barrel Export
 *
 * Centralized export for all blueprint components.
 * Blueprints are composed applications that demonstrate how to use atomic components.
 */

// ============================================================================
// Messaging Blueprint
// ============================================================================

export * from "./messaging";

// ============================================================================
// POS Blueprint
// ============================================================================

export * from "./pos";

// ============================================================================
// Auth Blueprint
// ============================================================================

export * from "./auth";

// ============================================================================
// Billing Blueprint
// ============================================================================

export { default as CheckoutPanel } from "./billing/CheckoutPanel";
export type {
  CheckoutPanelProps,
  TCheckoutPanelProps,
  SubscriptionPlan as BillingSubscriptionPlan,
  TSubscriptionPlan,
  CheckoutData,
  TCheckoutData,
} from "./billing/CheckoutPanel";

// ============================================================================
// Consulting Site Archetype
// ============================================================================

// Export consulting site components and types
export { ConsultingSite } from "./consulting-site";
export * from "./consulting-site/layout";
export * from "./consulting-site/pages";
export type * from "./consulting-site/types";
