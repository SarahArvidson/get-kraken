/**
 * Get Kraken - Quests Hook
 *
 * Manages quests data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Quest, QuestWithLogs, QuestLog } from "../types";
import { useQuestOverrides } from "./useQuestOverrides";

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mergeQuestWithOverrides, isQuestHidden, updateOverride, hideQuest: hideQuestForUser, refresh: refreshOverrides, loading: overridesLoading } = useQuestOverrides();

  // Load all quests
  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      // Get current user to filter quests
      const { data: { user }, error: userError } = await supabase.supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        throw new Error("Failed to get user session");
      }
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Wait for overrides to be loaded before filtering (to ensure hidden quests are properly filtered)
      // Retry up to 10 times with 100ms delay if overrides are still loading
      let retries = 0;
      while (overridesLoading && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }

      // Only load seeded quests (created_by IS NULL) or quests created by current user
      let { data, error: fetchError } = await supabase
        .from("quests")
        .select("*")
        .or(`created_by.is.null,created_by.eq.${user.id}`)
        .order("name", { ascending: true });

      if (fetchError) {
        console.error("[useQuests] Error fetching quests:", fetchError);
        throw fetchError;
      }

      // Verify all returned quests are either seeded or owned by current user
      const invalidQuests = data?.filter(
        (quest: Quest) => quest.created_by !== null && quest.created_by !== user.id
      );
      if (invalidQuests && invalidQuests.length > 0) {
        console.error(
          `[useQuests] SECURITY WARNING: Found ${invalidQuests.length} quests from other users!`,
          invalidQuests
        );
        // Filter them out as a safeguard
        data = data?.filter(
          (quest: Quest) => quest.created_by === null || quest.created_by === user.id
        );
      }

      // Merge with overrides and filter hidden quests
      const mergedQuests = (data || [])
        .filter((quest: Quest) => !isQuestHidden(quest.id))
        .map((quest: Quest) => mergeQuestWithOverrides(quest));
      
      setQuests(mergedQuests);
      setError(null);
    } catch (err: any) {
      console.error("Error loading quests:", err);
      setError(err.message || "Failed to load quests");
    } finally {
      setLoading(false);
    }
  }, [isQuestHidden, mergeQuestWithOverrides, overridesLoading]);

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

  // Update a quest (user-created quests update base, seeded quests update overrides)
  const updateQuest = useCallback(
    async (id: string, updates: Partial<Quest>) => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Handle completion_count separately - it's calculated from logs, so we need to adjust logs
        if (updates.completion_count !== undefined) {
          // Get current completion count from logs, sorted by date (oldest first for deletion)
          const { data: currentLogs } = await supabase
            .from("quest_logs")
            .select("id")
            .eq("quest_id", id)
            .eq("user_id", user.id)
            .order("completed_at", { ascending: true });

          const currentCount = currentLogs?.length || 0;
          const targetCount = updates.completion_count;
          const difference = targetCount - currentCount;

          if (difference > 0) {
            // Need to add log entries
            const newLogs = Array.from({ length: difference }, () => ({
              quest_id: id,
              user_id: user.id,
              completed_at: new Date().toISOString(),
            }));
            const { error: logError } = await supabase
              .from("quest_logs")
              .insert(newLogs);
            if (logError) throw logError;
          } else if (difference < 0) {
            // Need to remove log entries (remove oldest ones first)
            const logsToDelete = currentLogs?.slice(0, Math.abs(difference)) || [];
            if (logsToDelete.length > 0) {
              const idsToDelete = logsToDelete.map((log: { id: string }) => log.id);
              const { error: deleteError } = await supabase
                .from("quest_logs")
                .delete()
                .in("id", idsToDelete);
              if (deleteError) throw deleteError;
            }
          }
          // Remove completion_count from updates since we handled it via logs
          const { completion_count, ...restUpdates } = updates;
          updates = restUpdates;
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

        // If user created it, update the base quest
        // Note: created_by can be null (seeded quests) or a different user's ID
        if (existingQuest.created_by === user.id) {
          const { data, error: updateError } = await supabase
            .from("quests")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .maybeSingle();

          if (updateError) throw updateError;
          if (!data) {
            // Update returned 0 rows - likely RLS blocked it or quest was deleted
            throw new Error("Quest update was blocked or quest not found");
          }
          setQuests((prev) => {
            const updated = prev.map((q) => (q.id === id ? data : q));
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
          return data;
        } else {
          // Seeded quest - update user override instead
          const overrideUpdates: any = {};
          if (updates.name !== undefined) overrideUpdates.name = updates.name;
          if (updates.tags !== undefined) overrideUpdates.tags = updates.tags;
          if (updates.reward !== undefined) overrideUpdates.reward = updates.reward;
          if (updates.dollar_amount !== undefined) overrideUpdates.dollar_amount = updates.dollar_amount;

          await updateOverride(id, overrideUpdates);
          await refreshOverrides();
          // Reload quests to get merged data
          await loadQuests();
          // Return the quest from the newly loaded state
          // Note: loadQuests updates the state, so we need to wait for it
          return null; // Will be refreshed by loadQuests
        }
      } catch (err: any) {
        console.error("Error updating quest:", err);
        setError(err.message || "Failed to update quest");
        throw err;
      }
    },
    [updateOverride, refreshOverrides, loadQuests, quests]
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

  // Subscribe to real-time changes and reload when overrides are ready
  useEffect(() => {
    // Wait for overrides to load before loading quests (ensures hidden quests are properly filtered)
    const loadWhenReady = async () => {
      // Wait for overrides to finish loading
      let retries = 0;
      while (overridesLoading && retries < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
      }
      // Small additional delay to ensure hidden quests set is populated
      await new Promise(resolve => setTimeout(resolve, 50));
      loadQuests();
    };

    loadWhenReady();

    // Subscribe to quests changes
    const questsSubscription = supabase.subscribe("quests", (payload: any) => {
      if (payload.eventType === "INSERT" || payload.eventType === "UPDATE" || payload.eventType === "DELETE") {
        loadQuests(); // loadQuests already waits for overrides
      }
    });

    // Subscribe to user_hidden_quests changes so we reload when quests are hidden/unhidden
    const hiddenQuestsSubscription = supabase.subscribe("user_hidden_quests", () => {
      loadQuests(); // loadQuests already waits for overrides
    });

    return () => {
      questsSubscription.unsubscribe();
      hiddenQuestsSubscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overridesLoading]); // Reload when overrides finish loading

  // Delete a quest (user-created quests delete base, seeded quests hide for user)
  const deleteQuest = useCallback(async (id: string) => {
    try {
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) throw new Error("User must be authenticated");

      // Fetch the existing quest to check ownership
      const { data: existingQuest, error: fetchError } = await supabase
        .from("quests")
        .select("created_by")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!existingQuest) throw new Error("Quest not found.");

      // If user created it, delete the base quest
      if (existingQuest.created_by === user.id) {
        const { error: deleteError } = await supabase
          .from("quests")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        setQuests((prev) => prev.filter((q) => q.id !== id));
      } else {
        // Seeded quest - hide it for this user
        await hideQuestForUser(id);
        // Refresh overrides to update hidden quests set (must complete before subscription fires)
        await refreshOverrides();
        // Small delay to ensure state is updated before subscription callback runs
        await new Promise(resolve => setTimeout(resolve, 50));
        // Subscription will trigger reload via user_hidden_quests subscription
        // Update UI immediately for better UX
        setQuests((prev) => prev.filter((q) => q.id !== id));
      }
    } catch (err: any) {
      console.error("Error deleting quest:", err);
      setError(err.message || "Failed to delete quest");
      throw err;
    }
  }, [hideQuestForUser, refreshOverrides, loadQuests]);

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
