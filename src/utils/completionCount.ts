/**
 * Get Kraken - Completion Count Utilities
 *
 * Utilities for calculating completion counts from logs
 */

import type { QuestLog } from "../types";

/**
 * Calculates per-quest completion counts from logs
 */
export function calculateUserCompletionCounts(
  logs: QuestLog[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  logs.forEach((log) => {
    counts[log.quest_id] = (counts[log.quest_id] || 0) + 1;
  });
  return counts;
}

