/**
 * Get Kraken v2 - Activity Logs Hook
 * 
 * Manages activity_logs data for calendar and timeline views
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Tag } from "../types";

export type ActionType = 'habit_log' | 'quest_complete' | 'reward_purchase';

export interface ActivityLog {
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
  // Joined data from quests table
  quest_name?: string | null;
  quest_tags?: Tag[] | null;
}

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load activity logs for current user
  const loadActivityLogs = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Join with quests table to get quest name and tags for quest_complete activities
      let query = supabase
        .from("activity_logs")
        .select(`
          *,
          quests:quest_id (
            name,
            tags
          )
        `)
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

      // Transform the joined data to flatten quest name and tags into ActivityLog
      const transformedLogs = (data || []).map((log: any) => ({
        ...log,
        quest_name: log.quests?.name || null,
        quest_tags: log.quests?.tags || null,
      }));

      setLogs(transformedLogs);
      setError(null);
    } catch (err: any) {
      console.error("Error loading activity logs:", err);
      setError(err.message || "Failed to load activity logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
