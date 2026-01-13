/**
 * Get Kraken v2 - Quest Runs Hook
 * 
 * Manages quest_runs data (scaffold-only implementation)
 */

import { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface QuestRun {
  id: string;
  quest_id: string;
  user_id: string;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export function useQuestRuns() {
  // Get current in-progress quest run for a quest
  const getCurrentRun = useCallback(async (questId: string): Promise<QuestRun | null> => {
    try {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from("quest_runs")
        .select("*")
        .eq("quest_id", questId)
        .eq("user_id", user.id)
        .is("completed_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading current quest run:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error loading current quest run:", err);
      return null;
    }
  }, []);

  // Get past completed quest runs for a quest
  const getPastRuns = useCallback(async (questId: string): Promise<QuestRun[]> => {
    try {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from("quest_runs")
        .select("*")
        .eq("quest_id", questId)
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false });

      if (error) {
        console.error("Error loading past quest runs:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error loading past quest runs:", err);
      return [];
    }
  }, []);

  // Create a new quest run
  const createRun = useCallback(async (questId: string): Promise<QuestRun | null> => {
    try {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      const { data, error } = await supabase
        .from("quest_runs")
        .insert({
          quest_id: questId,
          user_id: user.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("Error creating quest run:", err);
      throw err;
    }
  }, []);

  // Complete a quest run
  const completeRun = useCallback(async (runId: string): Promise<void> => {
    try {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      const { error } = await supabase
        .from("quest_runs")
        .update({
          completed_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("user_id", user.id);

      if (error) throw error;
    } catch (err: any) {
      console.error("Error completing quest run:", err);
      throw err;
    }
  }, []);

  return {
    getCurrentRun,
    getPastRuns,
    createRun,
    completeRun,
  };
}
