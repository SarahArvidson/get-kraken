/**
 * Get Kraken v2 - Quest Habits Hook
 * 
 * Manages quest habits and habit logs
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useCurrentUser } from "./useCurrentUser";
import { logDualWriteError } from "../utils/dualWriteLogger";

export interface QuestHabit {
  id: string;
  quest_id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  difficulty: number;
  dollars_saved: number;
  logged_at: string;
  created_at: string;
}

export function useQuestHabits(questId: string | null) {
  const { userId } = useCurrentUser();
  const [habits, setHabits] = useState<QuestHabit[]>([]);
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load habits for a quest
  const loadHabits = useCallback(async () => {
    if (!userId || !questId) {
      setHabits([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("quest_habits")
        .select("*")
        .eq("quest_id", questId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setHabits(data || []);
      setError(null);

      // Load logs for all habits
      if (data && data.length > 0) {
        const habitIds = data.map((h) => h.id);
        const { data: logs, error: logsError } = await supabase
          .from("habit_logs")
          .select("*")
          .in("habit_id", habitIds)
          .eq("user_id", userId)
          .order("logged_at", { ascending: false });

        if (logsError) throw logsError;

        // Group logs by habit_id
        const logsByHabit: Record<string, HabitLog[]> = {};
        (logs || []).forEach((log) => {
          if (!logsByHabit[log.habit_id]) {
            logsByHabit[log.habit_id] = [];
          }
          logsByHabit[log.habit_id].push(log);
        });
        setHabitLogs(logsByHabit);
      }
    } catch (err: any) {
      console.error("Error loading quest habits:", err);
      setError(err.message || "Failed to load habits");
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }, [userId, questId]);

  // Create a new habit
  const createHabit = useCallback(
    async (name: string) => {
      if (!userId || !questId) throw new Error("User and quest ID required");

      try {
        const { data, error: insertError } = await supabase
          .from("quest_habits")
          .insert({
            quest_id: questId,
            user_id: userId,
            name,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        await loadHabits();
        return data;
      } catch (err: any) {
        console.error("Error creating habit:", err);
        throw err;
      }
    },
    [userId, questId, loadHabits]
  );

  // Delete a habit
  const deleteHabit = useCallback(
    async (habitId: string) => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        const { error: deleteError } = await supabase
          .from("quest_habits")
          .delete()
          .eq("id", habitId)
          .eq("user_id", userId);

        if (deleteError) throw deleteError;
        await loadHabits();
      } catch (err: any) {
        console.error("Error deleting habit:", err);
        throw err;
      }
    },
    [userId, loadHabits]
  );

  // Log a habit
  const logHabit = useCallback(
    async (
      habitId: string,
      difficulty: number,
      dollarsSaved: number
    ) => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        // Insert into habit_logs
        const { data: logData, error: logError } = await supabase
          .from("habit_logs")
          .insert({
            habit_id: habitId,
            user_id: userId,
            difficulty,
            dollars_saved: dollarsSaved || 0,
            logged_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (logError) throw logError;

        // Dual-write to activity_logs
        try {
          const habit = habits.find((h) => h.id === habitId);
          const { error: activityError } = await supabase
            .from("activity_logs")
            .insert({
              user_id: userId,
              quest_id: questId || null,
              habit_id: habitId,
              action_type: "habit_log",
              difficulty,
              dollars_saved: dollarsSaved || 0,
              logged_at: new Date().toISOString(),
            });

          if (activityError) {
            logDualWriteError("habit_log", {
              habit_id: habitId,
              quest_id: questId,
              difficulty,
              dollars_saved: dollarsSaved,
              error: activityError.message,
            });
          }
        } catch (dualWriteErr: any) {
          logDualWriteError("habit_log", {
            habit_id: habitId,
            quest_id: questId,
            difficulty,
            dollars_saved: dollarsSaved,
            error: dualWriteErr.message || "Unknown error",
          });
        }

        await loadHabits();
        return logData;
      } catch (err: any) {
        console.error("Error logging habit:", err);
        throw err;
      }
    },
    [userId, questId, habits]
  );

  // Load habits on mount and when questId changes
  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return {
    habits,
    habitLogs,
    loading,
    error,
    createHabit,
    deleteHabit,
    logHabit,
    refresh: loadHabits,
  };
}
