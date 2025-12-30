/**
 * Get Kraken - Purchase Count Utilities
 *
 * Utilities for calculating purchase counts from logs
 */

import type { ShopLog } from "../types";

/**
 * Calculates per-shop-item purchase counts from logs
 */
export function calculateUserPurchaseCounts(
  logs: ShopLog[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    counts[log.shop_item_id] = (counts[log.shop_item_id] || 0) + 1;
  });
  return counts;
}


