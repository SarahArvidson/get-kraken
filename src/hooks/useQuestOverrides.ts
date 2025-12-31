/**
 * Get Kraken - Quest Overrides Hook
 *
 * Manages per-user quest overrides (name, tags, reward, dollar_amount)
 * and hidden quests
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserQuestOverride, Quest, Tag } from "../types";

export function useQuestOverrides() {
  const [overrides, setOverrides] = useState<Record<string, UserQuestOverride>>({});
  const [hiddenQuestIds, setHiddenQuestIds] = useState<Set<string>>(new Set());
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

      // Load hidden quests
      const { data: hiddenData, error: hiddenError } = await supabase
        .from("user_hidden_quests")
        .select("quest_id")
        .eq("user_id", userId);

      if (hiddenError) throw hiddenError;
      setHiddenQuestIds(new Set((hiddenData || []).map((h: { quest_id: string }) => h.quest_id)));
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

  // Get effective name for a quest (override or base)
  const getEffectiveName = useCallback(
    (questId: string, baseName: string): string => {
      const override = overrides[questId];
      return override?.name || baseName;
    },
    [overrides]
  );

  // Get effective tags for a quest (override or base)
  const getEffectiveTags = useCallback(
    (questId: string, baseTags: Tag[]): Tag[] => {
      const override = overrides[questId];
      return override?.tags || baseTags;
    },
    [overrides]
  );

  // Check if a quest is hidden for the current user
  const isQuestHidden = useCallback(
    (questId: string): boolean => {
      return hiddenQuestIds.has(questId);
    },
    [hiddenQuestIds]
  );

  // Update or create override (supports name, tags, reward, dollar_amount)
  const updateOverride = useCallback(
    async (questId: string, updates: { name?: string; tags?: Tag[]; reward?: number; dollar_amount?: number }) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        // Check if override exists
        const existing = overrides[questId];

        if (existing) {
          // Update existing override
          const updateData: any = { updated_at: new Date().toISOString() };
          if (updates.name !== undefined) updateData.name = updates.name;
          if (updates.tags !== undefined) updateData.tags = updates.tags;
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
              name: updates.name ?? null,
              tags: updates.tags ?? null,
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

  // Hide a quest for the current user
  const hideQuest = useCallback(
    async (questId: string) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        // Check if already hidden
        const { data: existing } = await supabase
          .from("user_hidden_quests")
          .select("id")
          .eq("user_id", userId)
          .eq("quest_id", questId)
          .maybeSingle();

        // If already hidden, no need to insert again
        if (existing) {
          setHiddenQuestIds((prev) => new Set([...prev, questId]));
          return;
        }

        // Insert if not already hidden
        const { error } = await supabase
          .from("user_hidden_quests")
          .insert({
            user_id: userId,
            quest_id: questId,
            created_at: new Date().toISOString(),
          });

        if (error) {
          // If it's a unique constraint violation, the quest is already hidden - that's fine
          if (error.code === "23505") {
            setHiddenQuestIds((prev) => new Set([...prev, questId]));
            return;
          }
          throw error;
        }
        setHiddenQuestIds((prev) => new Set([...prev, questId]));
      } catch (err) {
        console.error("Error hiding quest:", err);
        throw err;
      }
    },
    [getUserId]
  );

  // Unhide a quest for the current user
  const unhideQuest = useCallback(
    async (questId: string) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        const { error } = await supabase
          .from("user_hidden_quests")
          .delete()
          .eq("user_id", userId)
          .eq("quest_id", questId);

        if (error) throw error;
        setHiddenQuestIds((prev) => {
          const next = new Set(prev);
          next.delete(questId);
          return next;
        });
      } catch (err) {
        console.error("Error unhiding quest:", err);
        throw err;
      }
    },
    [getUserId]
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

  // Merge base quest with user overrides
  const mergeQuestWithOverrides = useCallback(
    (baseQuest: Quest): Quest => {
      const override = overrides[baseQuest.id];
      if (!override) return baseQuest;

      return {
        ...baseQuest,
        name: override.name || baseQuest.name,
        tags: override.tags || baseQuest.tags,
        reward: override.reward !== null && override.reward !== undefined ? override.reward : baseQuest.reward,
        dollar_amount: override.dollar_amount !== null && override.dollar_amount !== undefined ? override.dollar_amount : baseQuest.dollar_amount,
      };
    },
    [overrides]
  );

  return {
    overrides,
    hiddenQuestIds,
    loading,
    getEffectiveReward,
    getEffectiveDollarAmount,
    getEffectiveName,
    getEffectiveTags,
    isQuestHidden,
    updateOverride,
    hideQuest,
    unhideQuest,
    mergeQuestWithOverrides,
    refresh: loadOverrides,
  };
}

