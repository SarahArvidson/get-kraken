/**
 * Get Kraken v2 - Reward Data Mapping Utilities
 * 
 * Functions to derive RewardSummary and RewardDetail from existing v1 ShopItem data
 */

import type { ShopItem, ShopLog } from "../types";
import type { RewardSummary, RewardDetail } from "../types/rewards";

/**
 * Get starred status from localStorage (temporary until schema migration)
 */
function getRewardStarred(itemId: string): boolean {
  try {
    const starred = localStorage.getItem(`reward_starred_${itemId}`);
    return starred === 'true';
  } catch {
    return false;
  }
}

/**
 * Set starred status in localStorage (temporary until schema migration)
 */
export function setRewardStarred(itemId: string, isStarred: boolean): void {
  try {
    if (isStarred) {
      localStorage.setItem(`reward_starred_${itemId}`, 'true');
    } else {
      localStorage.removeItem(`reward_starred_${itemId}`);
    }
  } catch (error) {
    console.error('Error saving starred status:', error);
  }
}

/**
 * Get linked quest ID from localStorage (temporary until schema migration)
 */
function getLinkedQuestId(itemId: string): string | undefined {
  try {
    const linked = localStorage.getItem(`reward_linked_quest_${itemId}`);
    return linked || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Set linked quest ID in localStorage (temporary until schema migration)
 */
export function setLinkedQuestId(itemId: string, questId: string | undefined): void {
  try {
    if (questId) {
      localStorage.setItem(`reward_linked_quest_${itemId}`, questId);
    } else {
      localStorage.removeItem(`reward_linked_quest_${itemId}`);
    }
  } catch (error) {
    console.error('Error saving linked quest ID:', error);
  }
}

/**
 * Derive RewardSummary from ShopItem and logs
 */
export function deriveRewardSummary(
  item: ShopItem,
  userPurchaseCount: number
): RewardSummary {
  return {
    id: item.id,
    name: item.name,
    tags: item.tags,
    price: item.price,
    dollar_amount: item.dollar_amount || 0,
    created_by: item.created_by || null,
    created_at: item.created_at,
    userPurchaseCount,
    isStarred: getRewardStarred(item.id),
    linkedQuestId: getLinkedQuestId(item.id),
    // rarity will be undefined until schema migration
  };
}

/**
 * Derive RewardDetail from RewardSummary, logs, and optional metadata
 */
export async function deriveRewardDetail(
  summary: RewardSummary,
  logs: ShopLog[],
  options?: {
    description?: string;
    linkedQuest?: {
      id: string;
      name: string;
    };
  }
): Promise<RewardDetail> {
  return {
    ...summary,
    description: options?.description,
    logs,
    linkedQuest: options?.linkedQuest || (summary.linkedQuestId ? {
      id: summary.linkedQuestId,
      name: 'Unknown Quest', // Will be loaded from quests if needed
    } : undefined),
  };
}
