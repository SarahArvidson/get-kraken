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
// Only fields we actually fetch from activity_logs
export interface RawActivityLog {
  id: string;
  user_id: string;
  quest_id: string | null;
  reward_id: string | null;
  habit_id: string | null;
  action_type: ActionType;
  difficulty: number | null;
  dollars_saved: number | null;
  logged_at: string;
  source_user_id: string | null;
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

  // Helper function to hydrate a raw log with metadata
  const hydrateLog = useCallback((log: RawActivityLog): ActivityLog => {
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
  }, [options?.questMetadata, options?.rewardMetadata]);

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
      // Select fields needed for calendar rendering and editing
      let query = supabase
        .from("activity_logs")
        .select("id, user_id, quest_id, reward_id, habit_id, action_type, difficulty, dollars_saved, logged_at, source_user_id")
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
      const hydratedLogs: ActivityLog[] = (data || []).map((log: RawActivityLog) => hydrateLog(log));

      setLogs(hydratedLogs);
      setError(null);
    } catch (err: any) {
      console.error("Error loading activity logs:", err);
      setError(err.message || "Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [hydrateLog]);

  // Load logs on mount
  useEffect(() => {
    loadActivityLogs();
  }, [loadActivityLogs]);

  // Re-hydrate logs when metadata becomes available (stable, no re-renders)
  useEffect(() => {
    setLogs((prevLogs) => {
      // Only re-hydrate if we have logs and metadata is available
      if (prevLogs.length === 0) return prevLogs;
      if (!options?.questMetadata && !options?.rewardMetadata) return prevLogs;
      
      // Check if any logs need hydration
      const needsHydration = prevLogs.some(log => {
        if (log.quest_id && !log.quest_name && options?.questMetadata?.[log.quest_id]) return true;
        if (log.reward_id && !log.reward_name && options?.rewardMetadata?.[log.reward_id]) return true;
        return false;
      });
      
      if (!needsHydration) return prevLogs;
      
      // Re-hydrate logs that need metadata
      return prevLogs.map((log) => hydrateLog(log));
    });
  }, [options?.questMetadata, options?.rewardMetadata, hydrateLog]);

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
        .select("id, user_id, quest_id, reward_id, habit_id, action_type, difficulty, dollars_saved, logged_at, source_user_id")
        .single();

      if (updateError) {
        throw updateError;
      }

      // Update local state - re-hydrate the updated log
      setLogs((prev) =>
        prev.map((log) => {
          if (log.id === logId) {
            const updatedRaw: RawActivityLog = data;
            return hydrateLog(updatedRaw);
          }
          return log;
        })
      );

      return data;
    } catch (err: any) {
      console.error("Error updating activity log:", err);
      throw err;
    }
  }, [hydrateLog]);

  // Delete activity logs for a specific quest
  const deleteActivityLogsForQuest = useCallback(async (questId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Delete activity logs for this quest
      const { error: deleteError } = await supabase
        .from("activity_logs")
        .delete()
        .eq("user_id", user.id)
        .eq("quest_id", questId);

      if (deleteError) throw deleteError;

      // Update local state
      setLogs((prev) => prev.filter((log) => log.quest_id !== questId));
    } catch (err: any) {
      console.error("Error deleting activity logs for quest:", err);
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
    deleteActivityLogsForQuest,
  };
}
