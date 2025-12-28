/**
 * Kibblings - Quests Hook
 * 
 * Manages quests data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Quest, QuestLog, QuestWithLogs } from "../types";

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all quests
  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from<Quest>("quests")
        .select("*")
        .order("created_at", { ascending: false });

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
    async (quest: Omit<Quest, "id" | "created_at" | "updated_at" | "completion_count">) => {
      try {
        const { data, error: createError } = await supabase
          .from<Quest>("quests")
          .insert({
            ...quest,
            completion_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        if (data) {
          setQuests((prev) => [data, ...prev]);
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

  // Update a quest
  const updateQuest = useCallback(async (id: string, updates: Partial<Quest>) => {
    try {
      const { data, error: updateError } = await supabase
        .from<Quest>("quests")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setQuests((prev) => prev.map((q) => (q.id === id ? data : q)));
      }
      return data;
    } catch (err: any) {
      console.error("Error updating quest:", err);
      setError(err.message || "Failed to update quest");
      throw err;
    }
  }, []);

  // Complete a quest (adds to log and increments count)
  const completeQuest = useCallback(
    async (questId: string, reward: number) => {
      try {
        // Create log entry
        const { error: logError } = await supabase.from<QuestLog>("quest_logs").insert({
          quest_id: questId,
          completed_at: new Date().toISOString(),
        });

        if (logError) throw logError;

        // Update quest completion count
        const quest = quests.find((q) => q.id === questId);
        if (quest) {
          await updateQuest(questId, {
            completion_count: quest.completion_count + 1,
          });
        }

        return reward;
      } catch (err: any) {
        console.error("Error completing quest:", err);
        setError(err.message || "Failed to complete quest");
        throw err;
      }
    },
    [quests, updateQuest]
  );

  // Get quest with logs
  const getQuestWithLogs = useCallback(
    async (questId: string): Promise<QuestWithLogs | null> => {
      try {
        const { data: quest, error: questError } = await supabase
          .from<Quest>("quests")
          .select("*")
          .eq("id", questId)
          .single();

        if (questError) throw questError;

        const { data: logs, error: logsError } = await supabase
          .from<QuestLog>("quest_logs")
          .select("*")
          .eq("quest_id", questId)
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

  return {
    quests,
    loading,
    error,
    createQuest,
    updateQuest,
    completeQuest,
    getQuestWithLogs,
    refresh: loadQuests,
  };
}

