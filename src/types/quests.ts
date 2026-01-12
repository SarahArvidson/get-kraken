/**
 * Get Kraken v2 - Quest Types
 * 
 * Type definitions for v2 quest features, derived from v1 data
 */

import type { QuestLog, Tag } from "../types";

/**
 * QuestSummary - Minimal quest data for list views
 */
export interface QuestSummary {
  id: string;
  name: string;
  tags: Tag[];
  reward: number;
  dollar_amount: number;
  created_by: string | null;
  created_at: string;
  // Derived/computed fields
  userCompletionCount: number; // from quest_logs count
  isStarred: boolean; // from localStorage (temporary) or future is_starred column
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; // future field, optional for now
}

/**
 * HabitSummary - Temporary structure for Phase 2 (localStorage)
 * Future: will come from habits table
 */
export interface HabitSummary {
  id: string; // temporary ID
  name: string;
  description?: string;
  // Recent log for autofill
  lastLog?: {
    difficulty: number;
    saved_money: boolean;
    dollars_saved?: number;
  };
}

/**
 * TaskSummary - Temporary structure for Phase 2 (localStorage)
 * Future: will come from quest_tasks table
 */
export interface TaskSummary {
  id: string; // temporary ID
  name: string;
  description?: string;
  is_completed: boolean;
  order_index: number;
}

/**
 * QuestRunSummary - Placeholder for future quest_runs table
 */
export interface QuestRunSummary {
  id: string; // placeholder
  started_at: string;
  completed_at?: string;
  abandoned_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

/**
 * QuestDetail - Full quest data for detail view
 */
export interface QuestDetail extends QuestSummary {
  description?: string; // future field, optional for now
  target_completion_date?: string; // future field, optional for now
  associated_item_id?: string; // future field, optional for now
  is_repeatable: boolean; // future field, default true for now
  // Logs
  logs: QuestLog[]; // from quest_logs table
  // Placeholder fields (UI-only for Phase 2)
  habits?: HabitSummary[]; // temporary, local storage or UI-only
  tasks?: TaskSummary[]; // temporary, local storage or UI-only
  currentRun?: QuestRunSummary; // placeholder for future quest_runs
  pastRuns?: QuestRunSummary[]; // placeholder for future quest_runs
}
