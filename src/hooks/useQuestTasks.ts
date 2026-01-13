/**
 * Get Kraken v2 - Quest Tasks Hook
 * 
 * Manages quest tasks
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useCurrentUser } from "./useCurrentUser";

export interface QuestTask {
  id: string;
  quest_id: string;
  user_id: string;
  name: string;
  completed: boolean;
  created_at: string;
}

export function useQuestTasks(questId: string | null) {
  const { userId } = useCurrentUser();
  const [tasks, setTasks] = useState<QuestTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks for a quest
  const loadTasks = useCallback(async () => {
    if (!userId || !questId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("quest_tasks")
        .select("*")
        .eq("quest_id", questId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setTasks(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading quest tasks:", err);
      setError(err.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [userId, questId]);

  // Create a new task
  const createTask = useCallback(
    async (name: string) => {
      if (!userId || !questId) throw new Error("User and quest ID required");

      try {
        const { data, error: insertError } = await supabase
          .from("quest_tasks")
          .insert({
            quest_id: questId,
            user_id: userId,
            name,
            completed: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        await loadTasks();
        return data;
      } catch (err: any) {
        console.error("Error creating task:", err);
        throw err;
      }
    },
    [userId, questId, loadTasks]
  );

  // Toggle task completion
  const toggleTask = useCallback(
    async (taskId: string, completed: boolean) => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        const { error: updateError } = await supabase
          .from("quest_tasks")
          .update({ completed })
          .eq("id", taskId)
          .eq("user_id", userId);

        if (updateError) throw updateError;
        await loadTasks();
      } catch (err: any) {
        console.error("Error toggling task:", err);
        throw err;
      }
    },
    [userId, loadTasks]
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        const { error: deleteError } = await supabase
          .from("quest_tasks")
          .delete()
          .eq("id", taskId)
          .eq("user_id", userId);

        if (deleteError) throw deleteError;
        await loadTasks();
      } catch (err: any) {
        console.error("Error deleting task:", err);
        throw err;
      }
    },
    [userId, loadTasks]
  );

  // Load tasks on mount and when questId changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    toggleTask,
    deleteTask,
    refresh: loadTasks,
  };
}
