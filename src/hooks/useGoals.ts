/**
 * Get Kraken - Goals Hook
 *
 * Manages user goals data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Goal } from "../types";

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all goals for current user
  const loadGoals = useCallback(async () => {
    try {
      setLoading(true);
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) {
        setGoals([]);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setGoals(data || []);
      setError(null);
    } catch (err: any) {
      console.error("Error loading goals:", err);
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new goal
  const createGoal = useCallback(
    async (goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at" | "is_completed" | "completed_at">) => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Build insert object
        const insertData: any = {
          name: goal.name,
          target_amount: goal.target_amount,
          user_id: user.id,
          is_completed: false,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Try to include dollar_amount if provided
        // If the column doesn't exist, we'll retry without it
        if (goal.dollar_amount !== null && goal.dollar_amount !== undefined && goal.dollar_amount > 0) {
          insertData.dollar_amount = goal.dollar_amount;
        }

        let { data, error: createError } = await supabase
          .from("goals")
          .insert(insertData)
          .select()
          .single();

        // If error is due to missing dollar_amount column, retry without it
        if (createError && insertData.dollar_amount !== undefined) {
          const errorMessage = createError.message || "";
          if (errorMessage.includes("dollar_amount") || errorMessage.includes("PGRST204")) {
            console.warn("dollar_amount column not found in goals table, creating goal without it");
            // Remove dollar_amount and retry
            const { dollar_amount, ...retryData } = insertData;
            const retryResult = await supabase
              .from("goals")
              .insert(retryData)
              .select()
              .single();
            
            if (retryResult.error) throw retryResult.error;
            data = retryResult.data;
            createError = null;
          } else {
            throw createError;
          }
        } else if (createError) {
          throw createError;
        }

        if (data) {
          setGoals((prev) => [data, ...prev]);
        }
        return data;
      } catch (err: any) {
        console.error("Error creating goal:", err);
        setError(err.message || "Failed to create goal");
        throw err;
      }
    },
    []
  );

  // Update a goal
  const updateGoal = useCallback(
    async (id: string, updates: Partial<Goal>) => {
      try {
        const { data, error: updateError } = await supabase
          .from("goals")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (data) {
          setGoals((prev) => prev.map((g) => (g.id === id ? data : g)));
        }
        return data;
      } catch (err: any) {
        console.error("Error updating goal:", err);
        setError(err.message || "Failed to update goal");
        throw err;
      }
    },
    []
  );

  // Delete a goal
  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      console.error("Error deleting goal:", err);
      setError(err.message || "Failed to delete goal");
      throw err;
    }
  }, []);

  // Check and update goal completion based on wallet total and dollar total
  const checkGoalCompletion = useCallback(
    async (walletTotal: number, walletDollarTotal: number = 0) => {
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) return;

      // Get fresh goals list for current user
      const { data: freshGoals } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false);
      
      if (!freshGoals) return;
      
      // Check both sea dollar and dollar targets
      const incompleteGoals = freshGoals.filter((g: Goal) => {
        const seaDollarMet = walletTotal >= g.target_amount;
        const dollarMet = g.dollar_amount ? walletDollarTotal >= g.dollar_amount : true;
        return seaDollarMet && dollarMet;
      });
      
      for (const goal of incompleteGoals) {
        await updateGoal(goal.id, {
          is_completed: true,
          completed_at: new Date().toISOString(),
        });
      }
    },
    [updateGoal]
  );

  // Subscribe to real-time changes
  useEffect(() => {
    loadGoals();

    const subscription = supabase.subscribe("goals", (payload: any) => {
      if (payload.eventType === "INSERT") {
        setGoals((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setGoals((prev) =>
          prev.map((g) => (g.id === payload.new.id ? payload.new : g))
        );
      } else if (payload.eventType === "DELETE") {
        setGoals((prev) => prev.filter((g) => g.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    checkGoalCompletion,
    refresh: loadGoals,
  };
}

