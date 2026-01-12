/**
 * Get Kraken v2 - Reward Types
 * 
 * Type definitions for v2 reward features, derived from v1 shop item data
 */

import type { ShopLog, ShopTag } from "../types";

/**
 * RewardSummary - Minimal reward data for list views
 */
export interface RewardSummary {
  id: string;
  name: string;
  tags: ShopTag[];
  price: number;
  dollar_amount: number;
  created_by: string | null;
  created_at: string;
  // Derived/computed fields
  userPurchaseCount: number; // from shop_logs count
  isStarred: boolean; // from localStorage (temporary) or future is_starred column
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; // future field, optional for now
  linkedQuestId?: string; // future field, optional for now
}

/**
 * RewardDetail - Full reward data for detail view
 */
export interface RewardDetail extends RewardSummary {
  description?: string; // future field, optional for now
  // Logs
  logs: ShopLog[]; // from shop_logs table
  // Linked quest info (if linked)
  linkedQuest?: {
    id: string;
    name: string;
  };
}
