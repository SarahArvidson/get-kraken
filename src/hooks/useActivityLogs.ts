/**
 * Get Kraken v2 - Activity Logs Hook
 * 
 * Manages activity_logs data for calendar and timeline views
 * Fetches raw activity_logs only - no SQL joins for performance
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Tag } from "../types";

export type ActionType = 'habit_log' | 'quest_complete' | 'reward_purchase';

// Raw activity log from database (no joins)
export interface RawActivityLog {
  id: string;
  user_id: string;
  quest_id: string | null;
  habit_id: string | null;
  reward_id: string | null;
  action_type: ActionType;
  difficulty: number | null;
  dollars_saved: number | null;
  sand_dollars_earned: number | null;
  logged_at: string;
  source_user_id: string | null;
  created_at: string;
}

// Hydrated activity log with metadata merged in JavaScript
export interface ActivityLog extends RawActivityLog {
  quest_name?: string | null;
  quest_tags?: Tag[] | null;
  reward_name?: string | null;
}

export interface UseActivityLogsOptions {
  questMetadata?: Record<string, { id: string; name: string; tags: Tag[] }>;
  rewardMetadata?: Record<string, { id: string; name: string }>;
}

export function useActivityLogs(options?: UseActivityLogsOptions) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load activity logs for current user - NO JOINS, raw data only
  const loadActivityLogs = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Fetch only raw activity_logs fields - NO JOINS
      let query = supabase
        .from("activity_logs")
        .select("id, user_id, quest_id, habit_id, reward_id, action_type, difficulty, dollars_saved, sand_dollars_earned, logged_at, source_user_id, created_at")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false });

      // Apply date filters if provided
      if (startDate) {
        query = query.gte("logged_at", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("logged_at", endDate.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("[useActivityLogs] Error fetching activity logs:", fetchError);
        throw fetchError;
      }

      // Hydrate raw logs with metadata in JavaScript (no SQL joins)
      const hydratedLogs: ActivityLog[] = (data || []).map((log: RawActivityLog) => {
        const hydrated: ActivityLog = { ...log };
        
        // Merge quest metadata if available
        if (log.quest_id && options?.questMetadata?.[log.quest_id]) {
          const questMeta = options.questMetadata[log.quest_id];
          hydrated.quest_name = questMeta.name;
          hydrated.quest_tags = questMeta.tags;
        }
        
        // Merge reward metadata if available
        if (log.reward_id && options?.rewardMetadata?.[log.reward_id]) {
          const rewardMeta = options.rewardMetadata[log.reward_id];
          hydrated.reward_name = rewardMeta.name;
        }
        
        return hydrated;
      });

      setLogs(hydratedLogs);
      setError(null);
    } catch (err: any) {
      console.error("Error loading activity logs:", err);
      setError(err.message || "Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [options]);

  // Load logs on mount
  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  // Get activity count by date (for calendar grid)
  const getActivityCountByDate = useCallback(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      const date = new Date(log.logged_at).toISOString().split('T')[0];
      counts[date] = (counts[date] || 0) + 1;
    });
    return counts;
  }, [logs]);

  // Get activities for a specific date
  const getActivitiesForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return logs.filter((log) => {
      const logDate = new Date(log.logged_at).toISOString().split('T')[0];
      return logDate === dateStr;
    });
  }, [logs]);

  // Update an activity log
  const updateActivityLog = useCallback(async (
    logId: string,
    updates: {
      difficulty?: number | null;
      dollars_saved?: number | null;
      logged_at?: string;
    }
  ) => {
    try {
      const { data, error: updateError } = await supabase
        .from("activity_logs")
        .update(updates)
        .eq("id", logId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setLogs((prev) =>
        prev.map((log) => (log.id === logId ? { ...log, ...updates } : log))
      );

      return data;
    } catch (err: any) {
      console.error("Error updating activity log:", err);
      throw err;
    }
  }, []);

  return {
    logs,
    loading,
    error,
    loadActivityLogs,
    getActivityCountByDate,
    getActivitiesForDate,
    updateActivityLog,
  };
}
