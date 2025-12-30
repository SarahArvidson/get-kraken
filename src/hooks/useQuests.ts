/**
 * Get Kraken - Quests Hook
 *
 * Manages quests data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Quest, QuestWithLogs, QuestLog } from "../types";

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all quests
  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("quests")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;
      setQuests(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading quests:", err);
      setError(err.message || "Failed to load quests");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new quest
  const createQuest = useCallback(
    async (
      quest: Omit<
        Quest,
        "id" | "created_at" | "updated_at" | "completion_count"
      >
    ) => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        const { data, error: createError } = await supabase
          .from("quests")
          .insert({
            ...quest,
            created_by: user.id,
            completion_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        if (data) {
          setQuests((prev) => {
            const updated = [data, ...prev];
            // Sort alphabetically by name
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
        }
        return data;
      } catch (err: any) {
        console.error("Error creating quest:", err);
        setError(err.message || "Failed to create quest");
        throw err;
      }
    },
    []
  );

  // Update a quest (only if user created it)
  const updateQuest = useCallback(
    async (id: string, updates: Partial<Quest>) => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // First, check if the quest exists and if the user created it
        const { data: existingQuest, error: fetchError } = await supabase
          .from("quests")
          .select("created_by")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!existingQuest) {
          throw new Error("Quest not found");
        }

        // Check ownership: user can only update quests they created
        // Seeded quests (created_by IS NULL) cannot be updated by anyone
        if (existingQuest.created_by !== user.id) {
          throw new Error("You can only update quests that you created");
        }

        const { data, error: updateError } = await supabase
          .from("quests")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (data) {
          setQuests((prev) => {
            const updated = prev.map((q) => (q.id === id ? data : q));
            // Sort alphabetically by name
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
        }
        return data;
      } catch (err: any) {
        console.error("Error updating quest:", err);
        setError(err.message || "Failed to update quest");
        throw err;
      }
    },
    []
  );

  // Complete a quest (adds to log with user_id)
  const completeQuest = useCallback(
    async (questId: string, reward: number) => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Create log entry with user_id
        const { error: logError } = await supabase.from("quest_logs").insert({
          quest_id: questId,
          user_id: user.id,
          completed_at: new Date().toISOString(),
        });

        if (logError) {
          console.error("Quest log insert error:", logError);
          console.error("User ID:", user.id);
          console.error("Quest ID:", questId);
          throw new Error(`Failed to create quest log: ${logError.message || JSON.stringify(logError)}`);
        }

        // Note: We don't update completion_count anymore since it's shared
        // Per-user counts are calculated from logs

        return reward;
      } catch (err: any) {
        console.error("Error completing quest:", err);
        setError(err.message || "Failed to complete quest");
        throw err;
      }
    },
    []
  );

  // Get quest with logs for current user
  const getQuestWithLogs = useCallback(
    async (questId: string): Promise<QuestWithLogs | null> => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          return null;
        }

        const { data: quest, error: questError } = await supabase
          .from("quests")
          .select("*")
          .eq("id", questId)
          .single();

        if (questError) throw questError;

        const { data: logs, error: logsError } = await supabase
          .from("quest_logs")
          .select("*")
          .eq("quest_id", questId)
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false });

        if (logsError) throw logsError;

        return {
          ...quest,
          logs: logs || [],
        };
      } catch (err: any) {
        console.error("Error loading quest with logs:", err);
        return null;
      }
    },
    []
  );

  // Subscribe to real-time changes
  useEffect(() => {
    loadQuests();

    const subscription = supabase.subscribe("quests", (payload: any) => {
      if (payload.eventType === "INSERT") {
        setQuests((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setQuests((prev) =>
          prev.map((q) => (q.id === payload.new.id ? payload.new : q))
        );
      } else if (payload.eventType === "DELETE") {
        setQuests((prev) => prev.filter((q) => q.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadQuests]);

  // Delete a quest (but keep logs)
  const deleteQuest = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("quests")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (err: any) {
      console.error("Error deleting quest:", err);
      setError(err.message || "Failed to delete quest");
      throw err;
    }
  }, []);

  // Load all quest logs for current user
  const loadAllQuestLogs = useCallback(async (): Promise<QuestLog[]> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error: fetchError } = await supabase
        .from("quest_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      console.error("Error loading quest logs:", err);
      return [];
    }
  }, []);

  // Delete all quest logs for current user and reset completion counts
  const deleteAllQuestLogs = useCallback(async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Delete all quest logs for this user
      const { error: deleteError } = await supabase
        .from("quest_logs")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Reset all quest completion_count to 0
      const { error: updateError } = await supabase
        .from("quests")
        .update({ completion_count: 0 })
        .not("id", "is", null); // Update all quests

      if (updateError) throw updateError;

      // Refresh quests to reflect the reset counts
      await loadQuests();
    } catch (err: any) {
      console.error("Error deleting all quest logs:", err);
      setError(err.message || "Failed to delete quest logs");
      throw err;
    }
  }, [loadQuests]);

  return {
    quests,
    loading,
    error,
    createQuest,
    updateQuest,
    completeQuest,
    deleteQuest,
    getQuestWithLogs,
    loadAllQuestLogs,
    deleteAllQuestLogs,
    refresh: loadQuests,
  };
}
