/**
 * Get Kraken v2 - Goals Hook
 * 
 * Manages goals CRUD operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { useCurrentUser } from "./useCurrentUser";
import type { Goal } from "../types";

export function useGoals() {
  const { userId } = useCurrentUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all goals for current user
  const loadGoals = useCallback(async () => {
    if (!userId) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setGoals(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading goals:", err);
      setError(err.message || "Failed to load goals");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Create a new goal
  const createGoal = useCallback(
    async (goalData: {
      name: string;
      description?: string;
      sand_dollars: number;
      dollars?: number | null;
      reward_item_id?: string | null;
      share_mode?: 'private' | 'copyable' | 'co-op';
    }): Promise<Goal> => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        const { data, error: insertError } = await supabase
          .from("goals")
          .insert({
            user_id: userId,
            name: goalData.name,
            description: goalData.description || null,
            sand_dollars: goalData.sand_dollars,
            dollars: goalData.dollars || null,
            reward_item_id: goalData.reward_item_id || null,
            share_mode: goalData.share_mode || 'private',
            is_completed: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        await loadGoals();
        return data;
      } catch (err: any) {
        console.error("Error creating goal:", err);
        throw err;
      }
    },
    [userId, loadGoals]
  );

  // Update a goal
  const updateGoal = useCallback(
    async (
      goalId: string,
      updates: {
        name?: string;
        description?: string | null;
        sand_dollars?: number;
        dollars?: number | null;
        reward_item_id?: string | null;
        share_mode?: 'private' | 'copyable' | 'co-op';
        is_completed?: boolean;
      }
    ): Promise<void> => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        const { error: updateError } = await supabase
          .from("goals")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", goalId)
          .eq("user_id", userId);

        if (updateError) throw updateError;
        await loadGoals();
      } catch (err: any) {
        console.error("Error updating goal:", err);
        throw err;
      }
    },
    [userId, loadGoals]
  );

  // Delete a goal
  const deleteGoal = useCallback(
    async (goalId: string): Promise<void> => {
      if (!userId) throw new Error("User must be authenticated");

      try {
        const { error: deleteError } = await supabase
          .from("goals")
          .delete()
          .eq("id", goalId)
          .eq("user_id", userId);

        if (deleteError) throw deleteError;
        await loadGoals();
      } catch (err: any) {
        console.error("Error deleting goal:", err);
        throw err;
      }
    },
    [userId, loadGoals]
  );

  // Load goals on mount and when userId changes
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    refresh: loadGoals,
  };
}
