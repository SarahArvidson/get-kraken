/**
 * Get Kraken v2 - Quest Data Mapping Utilities
 * 
 * Functions to derive QuestSummary and QuestDetail from existing v1 Quest data
 */

import type { Quest, QuestLog } from "../types";
import type { QuestSummary, QuestDetail } from "../types/quests";

/**
 * Get starred status from localStorage (temporary until schema migration)
 */
function getQuestStarred(questId: string): boolean {
  try {
    const starred = localStorage.getItem(`quest_starred_${questId}`);
    return starred === 'true';
  } catch {
    return false;
  }
}

/**
 * Set starred status in localStorage (temporary until schema migration)
 */
export function setQuestStarred(questId: string, isStarred: boolean): void {
  try {
    if (isStarred) {
      localStorage.setItem(`quest_starred_${questId}`, 'true');
    } else {
      localStorage.removeItem(`quest_starred_${questId}`);
    }
  } catch (error) {
    console.error('Error saving starred status:', error);
  }
}

/**
 * Derive QuestSummary from Quest and logs
 */
export function deriveQuestSummary(
  quest: Quest,
  userCompletionCount: number
): QuestSummary {
  return {
    id: quest.id,
    name: quest.name,
    tags: quest.tags,
    reward: quest.reward,
    dollar_amount: quest.dollar_amount || 0,
    created_by: quest.created_by || null,
    created_at: quest.created_at,
    userCompletionCount,
    isStarred: getQuestStarred(quest.id),
    // rarity will be undefined until schema migration
  };
}

/**
 * Derive QuestDetail from QuestSummary, logs, and optional metadata
 */
export function deriveQuestDetail(
  summary: QuestSummary,
  logs: QuestLog[],
  options?: {
    description?: string;
    target_completion_date?: string;
    associated_item_id?: string;
    habits?: Array<{
      id: string;
      name: string;
      description?: string;
    }>;
    tasks?: Array<{
      id: string;
      name: string;
      description?: string;
      is_completed: boolean;
      order_index: number;
    }>;
  }
): QuestDetail {
  // Load habits from localStorage if not provided (temporary)
  const habits = options?.habits || loadHabitsFromStorage(summary.id);
  
  // Load tasks from localStorage if not provided (temporary)
  const tasks = options?.tasks || loadTasksFromStorage(summary.id);

  return {
    ...summary,
    description: options?.description,
    target_completion_date: options?.target_completion_date,
    associated_item_id: options?.associated_item_id,
    is_repeatable: true, // default for now
    logs,
    habits,
    tasks,
    // Placeholder for future quest runs
    currentRun: undefined,
    pastRuns: [],
  };
}

/**
 * Load habits from localStorage (temporary until habits table exists)
 */
function loadHabitsFromStorage(questId: string): Array<{
  id: string;
  name: string;
  description?: string;
}> {
  try {
    const stored = localStorage.getItem(`quest_habits_${questId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading habits from storage:', error);
  }
  return [];
}

/**
 * Save habits to localStorage (temporary until habits table exists)
 */
export function saveHabitsToStorage(questId: string, habits: Array<{
  id: string;
  name: string;
  description?: string;
}>): void {
  try {
    localStorage.setItem(`quest_habits_${questId}`, JSON.stringify(habits));
  } catch (error) {
    console.error('Error saving habits to storage:', error);
  }
}

/**
 * Load tasks from localStorage (temporary until quest_tasks table exists)
 */
function loadTasksFromStorage(questId: string): Array<{
  id: string;
  name: string;
  description?: string;
  is_completed: boolean;
  order_index: number;
}> {
  try {
    const stored = localStorage.getItem(`quest_tasks_${questId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading tasks from storage:', error);
  }
  return [];
}

/**
 * Save tasks to localStorage (temporary until quest_tasks table exists)
 */
export function saveTasksToStorage(questId: string, tasks: Array<{
  id: string;
  name: string;
  description?: string;
  is_completed: boolean;
  order_index: number;
}>): void {
  try {
    localStorage.setItem(`quest_tasks_${questId}`, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks to storage:', error);
  }
}

/**
 * Load last habit log for autofill (temporary until habit_logs table exists)
 */
export function loadLastHabitLog(habitId: string): {
  difficulty: number;
  saved_money: boolean;
  dollars_saved?: number;
} | null {
  try {
    const stored = localStorage.getItem(`habit_last_log_${habitId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading last habit log:', error);
  }
  return null;
}

/**
 * Save last habit log for autofill (temporary until habit_logs table exists)
 */
export function saveLastHabitLog(
  habitId: string,
  log: {
    difficulty: number;
    saved_money: boolean;
    dollars_saved?: number;
  }
): void {
  try {
    localStorage.setItem(`habit_last_log_${habitId}`, JSON.stringify(log));
  } catch (error) {
    console.error('Error saving last habit log:', error);
  }
}
