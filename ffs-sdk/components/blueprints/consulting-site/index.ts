/**
 * Flying Fox Solutions - Consulting Site Barrel Export
 *
 * Main export for the consulting site archetype.
 */

// Main component - use lazy loading for heavy consulting site
export { LazyConsultingSiteWithSuspense as ConsultingSite } from "../../ui/LazyComponents";

// Layout components
export * from "./layout";

// Page components
export * from "./pages";

// Types
export type * from "./types";
