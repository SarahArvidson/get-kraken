/**
 * Get Kraken - Core Types
 *
 * Type definitions for quests, shop items, wallet, and logs
 */

export type Tag = "work" | "finance" | "home" | "health" | "relationship" | "social life";
export type ShopTag =
  | "hobbies"
  | "social life"
  | "relationship"
  | "travel"
  | "family"
  | "little treat";

export interface Quest {
  id: string;
  name: string;
  tags: Tag[];
  reward: number; // sea dollars earned per completion
  dollar_amount: number; // real dollars saved per completion
  completion_count: number;
  created_by?: string | null; // user ID who created this quest (null for seeded quests, optional for backwards compatibility)
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  tags: ShopTag[];
  price: number; // sea dollars cost
  dollar_amount: number; // real dollars spent per purchase
  purchase_count: number;
  created_by?: string | null; // user ID who created this item (null for seeded items, optional for backwards compatibility)
  created_at: string;
  updated_at: string;
}

export interface UserQuestOverride {
  id: string;
  user_id: string;
  quest_id: string;
  name: string | null;
  tags: Tag[] | null;
  reward: number | null;
  dollar_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserShopItemOverride {
  id: string;
  user_id: string;
  shop_item_id: string;
  name: string | null;
  tags: ShopTag[] | null;
  price: number | null;
  dollar_amount: number | null;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string | null; // nullable for backwards compatibility, but not used as primary key
  user_id: string; // user who owns this wallet (primary key)
  total: number; // sea dollars total (can be negative)
  dollar_total: number; // real dollars total (can be negative)
  updated_at: string;
}

export interface QuestLog {
  id: string;
  quest_id: string;
  user_id: string; // user who completed this quest
  completed_at: string;
}

export interface ShopLog {
  id: string;
  shop_item_id: string;
  user_id: string; // user who purchased this item
  purchased_at: string;
}

export interface QuestWithLogs extends Quest {
  logs: QuestLog[];
}

export interface ShopItemWithLogs extends ShopItem {
  logs: ShopLog[];
}

export interface WeeklyRecap {
  earned: number;
  spent: number;
  net: number;
  week_start: string;
  week_end: string;
}

export interface QuestStreak {
  quest_id: string;
  current_streak: number;
  last_completed: string | null;
}

export interface Goal {
  id: string;
  user_id: string; // user who owns this goal
  name: string;
  target_amount: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
