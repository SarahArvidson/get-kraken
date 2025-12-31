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
  const {
    mergeQuestWithOverrides,
    isQuestHidden,
    updateOverride,
    hideQuest: hideQuestForUser,
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
  }, [isQuestHidden, mergeQuestWithOverrides]);

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
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Handle completion_count - single mutation: set count directly via log adjustment
        if (updates.completion_count !== undefined) {
          const targetCount = updates.completion_count;

          // Get current count
          const { count: currentCount } = await supabase
            .from("quest_logs")
            .select("*", { count: "exact", head: true })
            .eq("quest_id", id)
            .eq("user_id", user.id);

          const difference = targetCount - (currentCount || 0);

          if (difference > 0) {
            // Add log entries
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
            // Remove oldest log entries
            const { data: logsToDelete } = await supabase
              .from("quest_logs")
              .select("id")
              .eq("quest_id", id)
              .eq("user_id", user.id)
              .order("completed_at", { ascending: true })
              .limit(Math.abs(difference));

            if (logsToDelete && logsToDelete.length > 0) {
              const idsToDelete = logsToDelete.map(
                (log: { id: string }) => log.id
              );
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
          // Seeded quest - update user override and patch local state
          const overrideUpdates: any = {};
          if (updates.name !== undefined) overrideUpdates.name = updates.name;
          if (updates.tags !== undefined) overrideUpdates.tags = updates.tags;
          if (updates.reward !== undefined)
            overrideUpdates.reward = updates.reward;
          if (updates.dollar_amount !== undefined)
            overrideUpdates.dollar_amount = updates.dollar_amount;

          await updateOverride(id, overrideUpdates);
          // Update local state optimistically - merge override with base quest
          setQuests((prev) => {
            const existing = prev.find((q) => q.id === id);
            if (!existing) return prev;
            const merged = mergeQuestWithOverrides({ ...existing, ...updates });
            return prev
              .map((q) => (q.id === id ? merged : q))
              .sort((a, b) => a.name.localeCompare(b.name));
          });
          // Return the updated quest from state
          const updated = quests.find((q) => q.id === id);
          return updated
            ? mergeQuestWithOverrides({ ...updated, ...updates })
            : null;
        }
      } catch (err: any) {
        console.error("Error updating quest:", err);
        setError(err.message || "Failed to update quest");
        throw err;
      }
    },
    [updateOverride, mergeQuestWithOverrides, quests]
  );

  // Complete a quest (adds to log with user_id)
  const completeQuest = useCallback(async (questId: string, reward: number) => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
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
        throw new Error(
          `Failed to create quest log: ${
            logError.message || JSON.stringify(logError)
          }`
        );
      }

      // Note: We don't update completion_count anymore since it's shared
      // Per-user counts are calculated from logs

      return reward;
    } catch (err: any) {
      console.error("Error completing quest:", err);
      setError(err.message || "Failed to complete quest");
      throw err;
    }
  }, []);

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

  // Subscribe to real-time changes - use state patches, not full reloads
  useEffect(() => {
    // Load immediately - progressive render (overrides merge when ready)
    loadQuests();

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
  }, [loadQuests, mergeQuestWithOverrides, isQuestHidden]); // Full dependency array - no stale closures

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
    completeQuest,
    deleteQuest,
    getQuestWithLogs,
    loadAllQuestLogs,
    deleteAllQuestLogs,
    refresh: loadQuests,
  };
}
