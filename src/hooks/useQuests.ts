/**
 * Get Kraken - Quests Hook
 *
 * Manages quests data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Quest, QuestWithLogs, QuestLog } from "../types";
import { useQuestOverrides } from "./useQuestOverrides";
import { registerPendingWalletMutation } from "../utils/mutationGuard";
import { logDualWriteError } from "../utils/dualWriteLogger";

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    mergeQuestWithOverrides,
    isQuestHidden,
    updateOverride,
    hideQuest: hideQuestForUser,
    refresh: refreshOverrides,
  } = useQuestOverrides();

  // Load all quests
  const loadQuests = useCallback(async () => {
    try {
      setLoading(true);
      // Get current user to filter quests
      const {
        data: { user },
        error: userError,
      } = await supabase.supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        throw new Error("Failed to get user session");
      }
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Load base quests immediately - progressive render
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
        (quest: Quest) =>
          quest.created_by !== null && quest.created_by !== user.id
      );
      if (invalidQuests && invalidQuests.length > 0) {
        console.error(
          `[useQuests] SECURITY WARNING: Found ${invalidQuests.length} quests from other users!`,
          invalidQuests
        );
        // Filter them out as a safeguard
        data = data?.filter(
          (quest: Quest) =>
            quest.created_by === null || quest.created_by === user.id
        );
      }

      // Progressive render: merge with overrides when ready, filter hidden
      // If overrides still loading, show base data; overrides will merge via effect
      // Note: isQuestHidden and mergeQuestWithOverrides are used but not dependencies
      // to allow immediate quest loading without waiting for overrides to resolve
      const mergedQuests = (data || [])
        .filter((quest: Quest) => !isQuestHidden(quest.id))
        .map((quest: Quest) => {
          const merged = mergeQuestWithOverrides(quest);
          // Log status for debugging
          if (merged.status === "active") {
            console.log(
              "[loadQuests] Found active quest:",
              merged.id,
              merged.name
            );
          }
          return merged;
        });

      console.log("[loadQuests] Loaded", mergedQuests.length, "quests");
      console.log(
        "[loadQuests] Active quests:",
        mergedQuests
          .filter((q: Quest) => q.status === "active")
          .map((q: Quest) => q.name)
      );
      setQuests(mergedQuests);
      setError(null);
    } catch (err: any) {
      console.error("Error loading quests:", err);
      setError(err.message || "Failed to load quests");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // No dependencies - load immediately, overrides merge when ready

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
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Extract fields that don't belong in quests table
        // description, include_tasks, include_habits go to user_quest_overrides
        const questData = quest as any;
        const {
          description,
          include_tasks,
          include_habits,
          reward_item_id,
          reward_rarity,
          status,
          ...questFields // name, tags, reward, dollar_amount - these go to quests table
        } = questData;

        // Insert into quests table (only fields that exist in the table)
        const { data, error: createError } = await supabase
          .from("quests")
          .insert({
            ...questFields,
            created_by: user.id,
            completion_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        
          // If quest was created, store override fields in user_quest_overrides
          if (data) {
            const overrideFields: any = {};
            if (description !== undefined && description !== null && description !== '') overrideFields.description = description;
            if (include_tasks !== undefined) overrideFields.include_tasks = include_tasks;
            if (include_habits !== undefined) overrideFields.include_habits = include_habits;
            if (reward_item_id !== undefined) overrideFields.reward_item_id = reward_item_id;
            if (reward_rarity !== undefined) overrideFields.reward_rarity = reward_rarity;
            if (status !== undefined) overrideFields.status = status;

            // Create override if there are any override fields
            if (Object.keys(overrideFields).length > 0) {
              try {
                await updateOverride(data.id, overrideFields);
                // Refresh overrides to ensure they're loaded before merging
                await refreshOverrides();
              } catch (overrideError: any) {
                // If override fails (e.g., description column doesn't exist), log but don't fail quest creation
                console.warn("Failed to create quest override (quest was still created):", overrideError);
              }
            }

          // Merge quest with overrides before adding to state
          // This ensures description, include_tasks, include_habits are included
          // After refreshOverrides, the overrides should be available in mergeQuestWithOverrides
          const mergedQuest = mergeQuestWithOverrides(data);
          setQuests((prev) => {
            const updated = [mergedQuest, ...prev];
            // Sort alphabetically by name
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
          
          // Also refresh the full quests list to ensure everything is properly merged
          // This is important for newly created quests to appear correctly
          await loadQuests();
        }
        return data;
      } catch (err: any) {
        console.error("Error creating quest:", err);
        setError(err.message || "Failed to create quest");
        throw err;
      }
    },
    [updateOverride, mergeQuestWithOverrides, refreshOverrides, loadQuests]
  );

  // Update a quest (user-created quests update base, seeded quests update overrides)
  const updateQuest = useCallback(
    async (id: string, updates: Partial<Quest>) => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        console.log(
          "[updateQuest] Starting update for quest:",
          id,
          "with updates:",
          JSON.stringify(updates, null, 2)
        );

        // GUARD: NEVER delete or modify logs - this function only updates quest metadata
        // GUARD: NEVER write lifecycle or rarity to quests table - they belong ONLY in user_quest_overrides
        // Separate quest fields (name, tags, reward, dollar_amount, reward_item_id) from override fields (description, status, reward_rarity, include_tasks, include_habits)
        // Note: reward_item_id goes to quests table for user-created quests, NOT to overrides (column doesn't exist there)
        const updatesAny = updates as any;
        const {
          completion_count, // derived, read-only - remove from updates
          status, // lifecycle - belongs ONLY in overrides
          reward_rarity, // per-user rarity - belongs ONLY in overrides
          reward_item_id, // reward item - goes to quests table for user-created quests (NOT in overrides - column doesn't exist)
          description, // description - store in overrides (quests table doesn't have this column)
          include_tasks, // include_tasks - store in overrides (quests table doesn't have this column)
          include_habits, // include_habits - store in overrides (quests table doesn't have this column)
          ...questFields // name, tags, reward, dollar_amount - can go in quests table for user-created quests
        } = updatesAny;
        
        // Add reward_item_id back to questFields so it gets saved to quests table for user-created quests
        if (reward_item_id !== undefined) {
          questFields.reward_item_id = reward_item_id;
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

        // Build override updates (lifecycle, rarity, description, include flags always go to overrides)
        // Note: reward_item_id column doesn't exist in user_quest_overrides, so we skip it
        // reward_item_id should be stored in the quests table for user-created quests
        const overrideUpdates: any = {};
        if (status !== undefined) overrideUpdates.status = status;
        if (reward_rarity !== undefined)
          overrideUpdates.reward_rarity = reward_rarity;
        // Skip reward_item_id - column doesn't exist in user_quest_overrides
        // if (reward_item_id !== undefined) overrideUpdates.reward_item_id = reward_item_id;
        if (description !== undefined)
          overrideUpdates.description = description;
        if (include_tasks !== undefined)
          overrideUpdates.include_tasks = include_tasks;
        if (include_habits !== undefined)
          overrideUpdates.include_habits = include_habits;
        // For seeded quests, also store name/tags/reward in overrides
        // For user-created quests, store them in quests table but ALSO allow overrides
        if (updates.name !== undefined) overrideUpdates.name = updates.name;
        if (updates.tags !== undefined) overrideUpdates.tags = updates.tags;
        if (updates.reward !== undefined)
          overrideUpdates.reward = updates.reward;
        if (updates.dollar_amount !== undefined)
          overrideUpdates.dollar_amount = updates.dollar_amount;

        console.log(
          "[updateQuest] Override updates to apply:",
          JSON.stringify(overrideUpdates, null, 2)
        );

        // If user created it, update the base quest (quests table) ONLY with questFields (no lifecycle/rarity)
        // Note: created_by can be null (seeded quests) or a different user's ID
        if (
          existingQuest.created_by === user.id &&
          Object.keys(questFields).length > 0
        ) {
          console.log(
            "[updateQuest] User-created quest: updating quests table with quest fields only"
          );
          const { data, error: updateError } = await supabase
            .from("quests")
            .update({
              ...questFields,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .maybeSingle();

          if (updateError) {
            console.error(
              "[updateQuest] Error updating quests table:",
              updateError
            );
            throw updateError;
          }
          if (!data) {
            console.error(
              "[updateQuest] Update returned 0 rows - RLS blocked or quest deleted"
            );
            throw new Error("Quest update was blocked or quest not found");
          }
          console.log("[updateQuest] Successfully updated quests table");
          setQuests((prev) => {
            const updated = prev.map((q) => (q.id === id ? data : q));
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
        }

        // Get fresh quest from database to ensure we have latest base data
        const { data: freshQuest, error: fetchError2 } = await supabase
          .from("quests")
          .select("*")
          .eq("id", id)
          .single();
        
        if (fetchError2) throw fetchError2;
        if (!freshQuest) throw new Error("Quest not found after update");

        // ALWAYS update override (for both user-created and seeded quests) if override fields exist
        let updatedOverride = null;
        if (Object.keys(overrideUpdates).length > 0) {
          console.log(
            "[updateQuest] Updating user_quest_overrides with override fields"
          );
          await updateOverride(id, overrideUpdates);
          console.log(
            "[updateQuest] Successfully updated user_quest_overrides"
          );
          
          // Fetch the updated override directly from database to use for merging
          // This ensures we have the latest data without relying on React state updates
          const {
            data: { user },
          } = await supabase.supabase.auth.getUser();
          if (user) {
            const { data: overrideData } = await supabase
              .from("user_quest_overrides")
              .select("*")
              .eq("user_id", user.id)
              .eq("quest_id", id)
              .maybeSingle();
            updatedOverride = overrideData;
          }
        }

        // Merge with overrides - use the fetched override if available, otherwise use mergeQuestWithOverrides
        // which will use the state (which should be updated by updateOverride)
        let merged: Quest;
        if (updatedOverride) {
          // Manual merge using the fetched override data
          merged = {
            ...freshQuest,
            name: updatedOverride.name || freshQuest.name,
            tags: updatedOverride.tags || freshQuest.tags,
            reward: updatedOverride.reward !== null && updatedOverride.reward !== undefined ? updatedOverride.reward : freshQuest.reward,
            dollar_amount: updatedOverride.dollar_amount !== null && updatedOverride.dollar_amount !== undefined ? updatedOverride.dollar_amount : freshQuest.dollar_amount,
            status: (updatedOverride.status || 'idle') as 'idle' | 'active' | 'completed',
            reward_item_id: freshQuest.reward_item_id, // Not stored in overrides
            reward_rarity: updatedOverride.reward_rarity !== undefined ? updatedOverride.reward_rarity : freshQuest.reward_rarity || null,
            description: (updatedOverride as any).description !== undefined ? (updatedOverride as any).description : (freshQuest as any).description,
            include_tasks: (updatedOverride as any).include_tasks !== undefined ? (updatedOverride as any).include_tasks : (freshQuest as any).include_tasks,
            include_habits: (updatedOverride as any).include_habits !== undefined ? (updatedOverride as any).include_habits : (freshQuest as any).include_habits,
          } as Quest;
        } else {
          // Fallback to mergeQuestWithOverrides if no override was updated
          merged = mergeQuestWithOverrides(freshQuest as Quest);
        }
        
        // Refresh overrides state for future operations
        await refreshOverrides();
        
        // Refresh quests state to update the list with merged data
        await loadQuests();
        
        console.log(
          "[updateQuest] Returning merged quest:",
          merged ? {
            id: merged.id,
            name: merged.name,
            reward: merged.reward,
            dollar_amount: merged.dollar_amount,
            reward_item_id: merged.reward_item_id,
            include_tasks: (merged as any).include_tasks,
            include_habits: (merged as any).include_habits
          } : null
        );
        return merged;
      } catch (err: any) {
        console.error("Error updating quest:", err);
        setError(err.message || "Failed to update quest");
        throw err;
      }
    },
    [updateOverride, mergeQuestWithOverrides, quests, loadQuests]
  );

  // Start a quest (set status to 'active' in user_quest_overrides)
  const startQuest = useCallback(
    async (questId: string): Promise<Quest | null> => {
      try {
        console.log("startQuest: called with questId:", questId);

        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Log the exact payload being sent to Supabase
        const payload = {
          user_id: user.id,
          quest_id: questId,
          status: "active",
          updated_at: new Date().toISOString(),
        };
        console.log(
          "startQuest: upsert payload:",
          JSON.stringify(payload, null, 2)
        );

        // Upsert into user_quest_overrides with status='active'
        const { data, error, count } = await supabase
          .from("user_quest_overrides")
          .upsert(payload, {
            onConflict: "user_id,quest_id",
          })
          .select()
          .single();

        // Log the Supabase response
        console.log("startQuest: Supabase response:", {
          data,
          error,
          count,
          hasData: !!data,
          errorDetails: error ? JSON.stringify(error, null, 2) : null,
        });

        if (error) {
          console.error("Error starting quest (override upsert):", error);
          console.error(
            "Supabase error details:",
            JSON.stringify(error, null, 2)
          );
          throw error;
        }

        if (!data) {
          console.error("startQuest: upsert returned no data");
          throw new Error("Failed to start quest: no data returned");
        }

        console.log("[startQuest] Successfully updated override", {
          questId,
          status: data.status,
          overrideId: data.id,
        });

        // Refresh quests to get updated merged state (this is the single source of truth)
        await loadQuests();
        console.log(
          "[startQuest] Refreshed quests - UI will re-render from quests list"
        );

        // Return null - component will refresh and get updated quest from state
        return null;
      } catch (err: any) {
        console.error("Error starting quest:", err);
        throw err;
      }
    },
    [loadQuests, refreshOverrides]
  );

  // Restart a quest (set status to 'active' in user_quest_overrides, clear completed_at)
  const restartQuest = useCallback(
    async (questId: string): Promise<Quest | null> => {
      try {
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Update user_quest_overrides
        const { data, error } = await supabase
          .from("user_quest_overrides")
          .upsert(
            {
              user_id: user.id,
              quest_id: questId,
              status: "active",
              completed_at: null, // Clear completion timestamp but keep history
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,quest_id",
            }
          )
          .select()
          .single();

        if (error) {
          console.error("Error restarting quest (override upsert):", error);
          console.error(
            "Supabase error details:",
            JSON.stringify(error, null, 2)
          );
          throw error;
        }

        if (!data) {
          console.error("restartQuest: upsert returned no data");
          throw new Error("Failed to restart quest: no data returned");
        }

        console.log("restartQuest: successfully updated override", {
          questId,
          status: data.status,
        });

        // Refresh quests to get updated merged state (single source of truth)
        await loadQuests();

        // Return the merged quest
        const baseQuest = quests.find((q) => q.id === questId);
        if (baseQuest) {
          return mergeQuestWithOverrides(baseQuest);
        }
        return null;
      } catch (err: any) {
        console.error("Error restarting quest:", err);
        throw err;
      }
    },
    [loadQuests, refreshOverrides, quests, mergeQuestWithOverrides]
  );

  // Complete a quest (adds to log with user_id and atomically updates wallet)
  const completeQuest = useCallback(
    async (questId: string, reward: number, dollarAmount: number = 0) => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Load current wallet to get current total
        const { data: walletData, error: walletFetchError } = await supabase
          .from("wallets")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (walletFetchError && walletFetchError.code !== "PGRST116") {
          throw walletFetchError;
        }

        // Calculate new wallet totals
        const currentTotal = walletData?.total ?? 0;
        const currentDollarTotal = walletData?.dollar_total ?? 0;
        const newTotal = currentTotal + reward;
        const newDollarTotal = Math.round(
          currentDollarTotal + Math.round(dollarAmount)
        );

        // Mutation guard: register pending wallet mutation to prevent double-application
        registerPendingWalletMutation(newTotal, newDollarTotal);

        // Atomically: insert log entry AND update wallet in sequence
        // First, insert log entry
        const completedAt = new Date().toISOString();
        const { error: logError } = await supabase.from("quest_logs").insert({
          quest_id: questId,
          user_id: user.id,
          completed_at: completedAt,
        });

        if (logError) {
          console.error("Quest log insert error:", logError);
          console.error("User ID:", user.id);
          console.error("Quest ID:", questId);
          throw new Error(
            `Failed to create quest log: ${
              logError.message || JSON.stringify(logError)
            }`
          );
        }

        console.log(
          "[completeQuest] Starting quest completion for quest:",
          questId,
          {
            reward,
            dollarAmount,
            userId: user.id,
          }
        );

        // Dual-write: Also insert into activity_logs for calendar/timeline
        // This is best-effort - if it fails, the primary action (quest_log + wallet update) still succeeds
        try {
          console.log("[completeQuest] Inserting into activity_logs:", {
            user_id: user.id,
            quest_id: questId,
            action_type: "quest_complete",
            sand_dollars_earned: reward,
            dollars_saved: dollarAmount > 0 ? dollarAmount : null,
            logged_at: completedAt,
          });

          // Ensure numeric values are properly formatted for NUMERIC columns
          const insertData = {
            user_id: user.id,
            quest_id: questId,
            action_type: "quest_complete" as const,
            sand_dollars_earned: Number(reward) || 0,
            dollars_saved: dollarAmount > 0 ? Number(dollarAmount) : null,
            logged_at: completedAt,
          };

          const { data: activityLogData, error: activityLogError } =
            await supabase
              .from("activity_logs")
              .insert(insertData)
              .select()
              .single();

          if (activityLogError) {
            console.error(
              "[completeQuest] activity_logs insert failed:",
              activityLogError
            );
            logDualWriteError(
              "quest_complete",
              "activity_logs",
              activityLogError,
              user.id,
              { questId, reward, dollarAmount, completedAt }
            );
            // Don't throw - activity logging is best effort, existing quest_logs still work
          } else {
            console.log(
              "[completeQuest] activity_logs insert succeeded:",
              activityLogData
            );
          }
        } catch (error) {
          console.error(
            "[completeQuest] activity_logs insert exception:",
            error
          );
          logDualWriteError("quest_complete", "activity_logs", error, user.id, {
            questId,
            reward,
            dollarAmount,
            completedAt,
          });
          // Don't throw - activity logging is best effort
        }

        // Then, update wallet atomically
        if (!walletData) {
          // Create wallet if it doesn't exist
          const { error: createError } = await supabase.from("wallets").insert({
            user_id: user.id,
            id: null,
            total: newTotal,
            dollar_total: newDollarTotal,
            updated_at: new Date().toISOString(),
          });
          if (createError) throw createError;
        } else {
          // Update existing wallet
          const { error: updateError } = await supabase
            .from("wallets")
            .update({
              total: newTotal,
              dollar_total: newDollarTotal,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id);
          if (updateError) throw updateError;
        }

        // Derive completion_count from quest_logs (count rows for this quest/user)
        const { data: questLogs, error: logsCountError } = await supabase
          .from("quest_logs")
          .select("id", { count: "exact", head: false })
          .eq("quest_id", questId)
          .eq("user_id", user.id);

        if (logsCountError) {
          console.error("Error counting quest logs:", logsCountError);
          // Fallback to 0 if count fails
        }

        const completionCount = questLogs?.length || 0;

        // Update user_quest_overrides: set status='completed', use derived completion_count, set completed_at
        const { data: updatedOverride, error: overrideUpdateError } =
          await supabase
            .from("user_quest_overrides")
            .upsert(
              {
                user_id: user.id,
                quest_id: questId,
                status: "completed",
                completion_count: completionCount,
                completed_at: completedAt,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: "user_id,quest_id",
              }
            )
            .select()
            .single();

        if (overrideUpdateError) {
          console.error(
            "Error updating quest override status to completed:",
            overrideUpdateError
          );
          console.error(
            "Supabase error details:",
            JSON.stringify(overrideUpdateError, null, 2)
          );
          // Don't throw, as the core completion (log + wallet) already happened
        } else {
          console.log("[completeQuest] Successfully updated override", {
            questId,
            status: updatedOverride?.status,
            completion_count: updatedOverride?.completion_count,
          });
        }

        // Immediately refresh overrides first, then quests
        await refreshOverrides();
        console.log("[completeQuest] Refreshed overrides");
        await loadQuests();
        console.log("[completeQuest] Refreshed quests - completion complete");
      } catch (err: any) {
        console.error("Error completing quest:", err);
        setError(err.message || "Failed to complete quest");
        throw err;
      }
    },
    [loadQuests, refreshOverrides]
  );

  // Get quest with logs for current user
  const getQuestWithLogs = useCallback(
    async (questId: string): Promise<QuestWithLogs | null> => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
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

  // Load quests immediately on mount - no dependencies to prevent blocking
  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  // Re-merge quests when overrides become available (non-blocking enrichment)
  // This effect only runs when override functions change (when overrides load)
  // It re-applies filtering and merging to existing quests without reloading from DB
  useEffect(() => {
    setQuests((prev) =>
      prev
        .filter((quest) => !isQuestHidden(quest.id))
        .map((quest) => mergeQuestWithOverrides(quest))
    );
  }, [mergeQuestWithOverrides, isQuestHidden]); // Only when override functions change (overrides loaded)

  // Subscribe to real-time changes - use state patches, not full reloads
  useEffect(() => {
    // Get current user for subscription filters
    const setupSubscriptions = async () => {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) return { user: null, all: null, hidden: null };

      // Handler for user-created quests - receives only user's quests via channel filter
      const handleUserQuestChange = (payload: any) => {
        if (payload.eventType === "INSERT") {
          // Only add if not already present and not hidden
          setQuests((prev) => {
            if (prev.some((q) => q.id === payload.new.id)) return prev;
            if (isQuestHidden(payload.new.id)) return prev;
            const merged = mergeQuestWithOverrides(payload.new);
            return [...prev, merged].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          });
        } else if (payload.eventType === "UPDATE") {
          // Patch the updated quest
          setQuests((prev) => {
            const existing = prev.find((q) => q.id === payload.new.id);
            if (!existing) return prev;
            const merged = mergeQuestWithOverrides(payload.new);
            return prev
              .map((q) => (q.id === payload.new.id ? merged : q))
              .sort((a, b) => a.name.localeCompare(b.name));
          });
        } else if (payload.eventType === "DELETE") {
          // Remove deleted quest
          setQuests((prev) => prev.filter((q) => q.id !== payload.old.id));
        }
      };

      // Handler for all quests - client-side filter for seeded items only
      const handleAllQuestChange = (payload: any) => {
        // Only process seeded quests (created_by === null), ignore others
        const quest = payload.new || payload.old;
        if (quest && quest.created_by !== null) {
          return; // Ignore non-seeded quests (user-created or other users)
        }

        if (payload.eventType === "INSERT") {
          // Only add if not already present and not hidden
          setQuests((prev) => {
            if (prev.some((q) => q.id === payload.new.id)) return prev;
            if (isQuestHidden(payload.new.id)) return prev;
            const merged = mergeQuestWithOverrides(payload.new);
            return [...prev, merged].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          });
        } else if (payload.eventType === "UPDATE") {
          // Patch the updated quest
          setQuests((prev) => {
            const existing = prev.find((q) => q.id === payload.new.id);
            if (!existing) return prev;
            const merged = mergeQuestWithOverrides(payload.new);
            return prev
              .map((q) => (q.id === payload.new.id ? merged : q))
              .sort((a, b) => a.name.localeCompare(b.name));
          });
        } else if (payload.eventType === "DELETE") {
          // Remove deleted quest
          setQuests((prev) => prev.filter((q) => q.id !== payload.old.id));
        }
      };

      // Subscribe to user's quests (created_by = user.id) - channel filter
      const userSubscription = supabase.subscribe(
        "quests",
        handleUserQuestChange,
        `created_by=eq.${user.id}`
      );

      // Subscribe to all quests - client-side filter for seeded items only
      const allQuestsSubscription = supabase.subscribe(
        "quests",
        handleAllQuestChange
      );

      // Patch state on hidden quests changes - only patch the changed ID
      const hiddenQuestsSubscription = supabase.subscribe(
        "user_hidden_quests",
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            // Quest was hidden - remove from state
            setQuests((prev) =>
              prev.filter((q) => q.id !== payload.new.quest_id)
            );
          } else if (payload.eventType === "DELETE") {
            // Quest was unhidden - need to reload it (can't know base data from payload)
            // But only reload this one quest, not the entire list
            const unhiddenQuestId = payload.old.quest_id;
            supabase
              .from("quests")
              .select("*")
              .eq("id", unhiddenQuestId)
              .single()
              .then(({ data, error }: { data: Quest | null; error: any }) => {
                if (!error && data) {
                  setQuests((prev) => {
                    if (prev.some((q) => q.id === data.id)) return prev;
                    const merged = mergeQuestWithOverrides(data);
                    return [...prev, merged].sort((a, b) =>
                      a.name.localeCompare(b.name)
                    );
                  });
                }
              });
          }
        }
      );

      return {
        user: userSubscription,
        all: allQuestsSubscription,
        hidden: hiddenQuestsSubscription,
      };
    };

    let subscriptions: { user: any; all: any; hidden: any } | null = null;
    setupSubscriptions().then((subs) => {
      subscriptions = subs;
    });

    return () => {
      if (subscriptions?.user) subscriptions.user.unsubscribe();
      if (subscriptions?.all) subscriptions.all.unsubscribe();
      if (subscriptions?.hidden) subscriptions.hidden.unsubscribe();
    };
  }, [mergeQuestWithOverrides, isQuestHidden]); // Subscriptions need current overrides functions

  // Delete a quest (user-created quests delete base, seeded quests hide for user)
  const deleteQuest = useCallback(
    async (id: string) => {
      try {
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
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
          // Seeded quest - hide it for this user and update state immediately
          await hideQuestForUser(id);
          setQuests((prev) => prev.filter((q) => q.id !== id));
        }
      } catch (err: any) {
        console.error("Error deleting quest:", err);
        setError(err.message || "Failed to delete quest");
        throw err;
      }
    },
    [hideQuestForUser]
  );

  // Load all quest logs for current user
  const loadAllQuestLogs = useCallback(async (): Promise<QuestLog[]> => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
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
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
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

      // Update local state - reset completion counts are reflected in logs, no reload needed
    } catch (err: any) {
      console.error("Error deleting all quest logs:", err);
      setError(err.message || "Failed to delete quest logs");
      throw err;
    }
  }, []);

  return {
    quests,
    loading,
    error,
    createQuest,
    updateQuest,
    startQuest,
    restartQuest,
    completeQuest,
    deleteQuest,
    getQuestWithLogs,
    loadAllQuestLogs,
    deleteAllQuestLogs,
    refresh: loadQuests,
  };
}
