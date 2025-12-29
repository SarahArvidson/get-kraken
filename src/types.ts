/**
 * Kibblings - Core Types
 *
 * Type definitions for quests, shop items, wallet, and logs
 */

export type Tag = "work" | "finance" | "home" | "health" | "relationship";

export interface Quest {
  id: string;
  name: string;
  tags: Tag[];
  reward: number; // kibblings earned per completion
  completion_count: number;
  created_at: string;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  tags: Tag[];
  price: number; // kibblings cost
  purchase_count: number;
  created_at: string;
  updated_at: string;
}

export interface Wallet {
  id: string;
  total: number; // can be negative
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
