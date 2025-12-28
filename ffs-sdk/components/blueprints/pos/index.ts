/**
 * POS Blueprint - Barrel Export
 *
 * Exports all components and hooks for the Point of Sale system.
 */

// Main Components
export { default as ProductList } from "./ProductList";
export { default as Cart } from "./Cart";
export { default as CheckoutSummary } from "./CheckoutSummary";
export { default as PaymentButton } from "./PaymentButton";

// Heavy components - use lazy loading
export { LazyPOSDashboardWithSuspense as POSDashboard } from "../../ui/LazyComponents";
export { LazyInventoryManagerWithSuspense as InventoryManager } from "../../ui/LazyComponents";

// Hooks
export * from "./hooks";

// Types
export type * from "./types";
