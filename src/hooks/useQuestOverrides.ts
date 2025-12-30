/**
 * Get Kraken - Quest Overrides Hook
 *
 * Manages per-user quest overrides (reward, dollar_amount)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserQuestOverride } from "../types";

export function useQuestOverrides() {
  const [overrides, setOverrides] = useState<Record<string, UserQuestOverride>>({});
  const [loading, setLoading] = useState(true);

  // Get current user ID
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.supabase.auth.getUser();
    return user?.id;
  }, []);

  // Load all overrides for current user
  const loadOverrides = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        setOverrides({});
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_quest_overrides")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const overridesMap: Record<string, UserQuestOverride> = {};
      (data || []).forEach((override: UserQuestOverride) => {
        overridesMap[override.quest_id] = override;
      });
      setOverrides(overridesMap);
    } catch (err) {
      console.error("Error loading quest overrides:", err);
      setOverrides({});
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Get effective reward for a quest (override or base)
  const getEffectiveReward = useCallback(
    (questId: string, baseReward: number): number => {
      const override = overrides[questId];
      return override?.reward !== null && override?.reward !== undefined
        ? override.reward
        : baseReward;
    },
    [overrides]
  );

  // Get effective dollar amount for a quest (override or base)
  const getEffectiveDollarAmount = useCallback(
    (questId: string, baseDollarAmount: number): number => {
      const override = overrides[questId];
      return override?.dollar_amount !== null && override?.dollar_amount !== undefined
        ? override.dollar_amount
        : baseDollarAmount;
    },
    [overrides]
  );

  // Update or create override
  const updateOverride = useCallback(
    async (questId: string, updates: { reward?: number; dollar_amount?: number }) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        // Check if override exists
        const existing = overrides[questId];

        if (existing) {
          // Update existing override
          const updateData: any = { updated_at: new Date().toISOString() };
          if (updates.reward !== undefined) updateData.reward = updates.reward;
          if (updates.dollar_amount !== undefined) updateData.dollar_amount = updates.dollar_amount;

          const { data, error } = await supabase
            .from("user_quest_overrides")
            .update(updateData)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setOverrides((prev) => ({ ...prev, [questId]: data }));
          }
        } else {
          // Create new override
          const { data, error } = await supabase
            .from("user_quest_overrides")
            .insert({
              user_id: userId,
              quest_id: questId,
              reward: updates.reward ?? null,
              dollar_amount: updates.dollar_amount ?? null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setOverrides((prev) => ({ ...prev, [questId]: data }));
          }
        }
      } catch (err) {
        console.error("Error updating quest override:", err);
        throw err;
      }
    },
    [getUserId, overrides]
  );

  // Load on mount and when user changes
  useEffect(() => {
    loadOverrides();

    const { data: { subscription } } = supabase.supabase.auth.onAuthStateChange(() => {
      loadOverrides();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadOverrides]);

  return {
    overrides,
    loading,
    getEffectiveReward,
    getEffectiveDollarAmount,
    updateOverride,
    refresh: loadOverrides,
  };
}

