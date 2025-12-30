/**
 * Get Kraken - Core Types
 *
 * Type definitions for quests, shop items, wallet, and logs
 */

export type Tag = "work" | "finance" | "home" | "health" | "relationship";
export type ShopTag =
  | "hobbies"
  | "social life"
  | "relationship"
  | "travel"
  | "family";

export interface Quest {
  id: string;
  name: string;
  tags: Tag[];
  reward: number; // sea dollars earned per completion
  dollar_amount: number; // real dollars saved per completion
  completion_count: number;
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
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  user_id: string; // user who owns this wallet
  total: number; // sea dollars total (can be negative)
  dollar_total: number; // real dollars total (can be negative)
  updated_at: string;
}

export interface QuestLog {
  id: string;
  quest_id: string;
  completed_at: string;
}

export interface ShopLog {
  id: string;
  shop_item_id: string;
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
  name: string;
  target_amount: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}
