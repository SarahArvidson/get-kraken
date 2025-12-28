/**
 * POS Blueprint - Hooks Barrel Export
 *
 * Exports all custom hooks for the Point of Sale system.
 */

export { useCart } from "./useCart";
export { useProducts } from "./useProducts";
export { useOrders } from "./useOrders";

// Re-export types for convenience
export type {
  UseCartReturn,
  UseProductsReturn,
  UseOrdersReturn,
} from "../types";
