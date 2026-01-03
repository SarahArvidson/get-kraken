/**
 * Get Kraken - Shop Items Hook
 *
 * Manages shop items data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { ShopItem, ShopItemWithLogs, ShopLog } from "../types";
import { useShopItemOverrides } from "./useShopItemOverrides";
import { registerPendingWalletMutation } from "../utils/mutationGuard";

export function useShopItems() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    mergeItemWithOverrides,
    isItemHidden,
    updateOverride,
    hideItem: hideItemForUser,
  } = useShopItemOverrides();

  // Load all shop items
  const loadShopItems = useCallback(async () => {
    try {
      setLoading(true);
      // Get current user to filter shop items
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

      // Load base shop items immediately - progressive render
      let { data, error: fetchError } = await supabase
        .from("shop_items")
        .select("*")
        .or(`created_by.is.null,created_by.eq.${user.id}`)
        .order("name", { ascending: true });

      if (fetchError) {
        console.error("[useShopItems] Error fetching shop items:", fetchError);
        throw fetchError;
      }

      // Verify all returned items are either seeded or owned by current user
      const invalidItems = data?.filter(
        (item: ShopItem) =>
          item.created_by !== null && item.created_by !== user.id
      );
      if (invalidItems && invalidItems.length > 0) {
        console.error(
          `[useShopItems] SECURITY WARNING: Found ${invalidItems.length} items from other users!`,
          invalidItems
        );
        // Filter them out as a safeguard
        data = data.filter(
          (item: ShopItem) =>
            item.created_by === null || item.created_by === user.id
        );
      }

      // Progressive render: merge with overrides when ready, filter hidden
      // If overrides still loading, show base data; overrides will merge via effect
      // Note: isItemHidden and mergeItemWithOverrides are used but not dependencies
      // to allow immediate shop items loading without waiting for overrides to resolve
      const mergedItems = (data || [])
        .filter((item: ShopItem) => !isItemHidden(item.id))
        .map((item: ShopItem) => mergeItemWithOverrides(item))
        .sort((a: ShopItem, b: ShopItem) => a.name.localeCompare(b.name));

      setShopItems(mergedItems);
      setError(null);
    } catch (err: any) {
      console.error("Error loading shop items:", err);
      setError(err.message || "Failed to load shop items");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // No dependencies - load immediately, overrides merge when ready

  // Create a new shop item
  const createShopItem = useCallback(
    async (
      item: Omit<
        ShopItem,
        "id" | "created_at" | "updated_at" | "purchase_count"
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
          .from("shop_items")
          .insert({
            ...item,
            created_by: user.id,
            purchase_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        if (data) {
          setShopItems((prev) => {
            const updated = [data, ...prev];
            // Sort alphabetically by name
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
        }
        return data;
      } catch (err: any) {
        console.error("Error creating shop item:", err);
        setError(err.message || "Failed to create shop item");
        throw err;
      }
    },
    []
  );

  // Update a shop item (user-created items update base, seeded items update overrides)
  const updateShopItem = useCallback(
    async (id: string, updates: Partial<ShopItem>) => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Handle purchase_count - single mutation: set count directly via log adjustment
        if (updates.purchase_count !== undefined) {
          const targetCount = updates.purchase_count;

          // Get current count
          const { count: currentCount } = await supabase
            .from("shop_logs")
            .select("*", { count: "exact", head: true })
            .eq("shop_item_id", id)
            .eq("user_id", user.id);

          const difference = targetCount - (currentCount || 0);

          if (difference > 0) {
            // Add log entries
            const newLogs = Array.from({ length: difference }, () => ({
              shop_item_id: id,
              user_id: user.id,
              purchased_at: new Date().toISOString(),
            }));
            const { error: logError } = await supabase
              .from("shop_logs")
              .insert(newLogs);
            if (logError) throw logError;
          } else if (difference < 0) {
            // Remove oldest log entries
            const { data: logsToDelete } = await supabase
              .from("shop_logs")
              .select("id")
              .eq("shop_item_id", id)
              .eq("user_id", user.id)
              .order("purchased_at", { ascending: true })
              .limit(Math.abs(difference));

            if (logsToDelete && logsToDelete.length > 0) {
              const idsToDelete = logsToDelete.map(
                (log: { id: string }) => log.id
              );
              const { error: deleteError } = await supabase
                .from("shop_logs")
                .delete()
                .in("id", idsToDelete);
              if (deleteError) throw deleteError;
            }
          }
          // Remove purchase_count from updates since we handled it via logs
          const { purchase_count, ...restUpdates } = updates;
          updates = restUpdates;
        }

        // First, check if the shop item exists and if the user created it
        const { data: existingItem, error: fetchError } = await supabase
          .from("shop_items")
          .select("created_by")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!existingItem) {
          throw new Error("Shop item not found");
        }

        // If user created it, update the base item
        // Note: created_by can be null (seeded items) or a different user's ID
        if (existingItem.created_by === user.id) {
          const { data, error: updateError } = await supabase
            .from("shop_items")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .maybeSingle();

          if (updateError) throw updateError;
          if (!data) {
            // Update returned 0 rows - likely RLS blocked it or item was deleted
            throw new Error("Shop item update was blocked or item not found");
          }
          setShopItems((prev) => {
            const updated = prev.map((item) => (item.id === id ? data : item));
            return updated.sort((a, b) => a.name.localeCompare(b.name));
          });
          return data;
        } else {
          // Seeded item - update user override and patch local state
          const overrideUpdates: any = {};
          if (updates.name !== undefined) overrideUpdates.name = updates.name;
          if (updates.tags !== undefined) overrideUpdates.tags = updates.tags;
          if (updates.price !== undefined)
            overrideUpdates.price = updates.price;
          if (updates.dollar_amount !== undefined)
            overrideUpdates.dollar_amount = updates.dollar_amount;

          await updateOverride(id, overrideUpdates);
          // Update local state optimistically - merge override with base item
          setShopItems((prev) => {
            const existing = prev.find((i) => i.id === id);
            if (!existing) return prev;
            const merged = mergeItemWithOverrides({ ...existing, ...updates });
            return prev
              .map((i) => (i.id === id ? merged : i))
              .sort((a, b) => a.name.localeCompare(b.name));
          });
          // Return the updated item from state
          const updated = shopItems.find((i) => i.id === id);
          return updated
            ? mergeItemWithOverrides({ ...updated, ...updates })
            : null;
        }
      } catch (err: any) {
        console.error("Error updating shop item:", err);
        setError(err.message || "Failed to update shop item");
        throw err;
      }
    },
    [updateOverride, mergeItemWithOverrides, shopItems]
  );

  // Purchase a shop item (adds to log with user_id and atomically updates wallet)
  const purchaseItem = useCallback(
    async (itemId: string, price: number, dollarAmount: number = 0) => {
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
        const newTotal = currentTotal - price;
        const newDollarTotal = Math.round(
          currentDollarTotal - Math.round(dollarAmount)
        );

        // Mutation guard: register pending wallet mutation to prevent double-application
        registerPendingWalletMutation(newTotal, newDollarTotal);

        // Atomically: insert log entry AND update wallet in sequence
        // First, insert log entry
        const { error: logError } = await supabase.from("shop_logs").insert({
          shop_item_id: itemId,
          user_id: user.id,
          purchased_at: new Date().toISOString(),
        });

        if (logError) {
          console.error("Shop log insert error:", logError);
          console.error("User ID:", user.id);
          console.error("Item ID:", itemId);
          throw new Error(
            `Failed to create shop log: ${
              logError.message || JSON.stringify(logError)
            }`
          );
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

        // Note: We don't update purchase_count anymore since it's shared
        // Per-user counts are calculated from logs

        return -price; // Return negative for consistency
      } catch (err: any) {
        console.error("Error purchasing item:", err);
        setError(err.message || "Failed to purchase item");
        throw err;
      }
    },
    []
  );

  // Get shop item with logs for current user
  const getShopItemWithLogs = useCallback(
    async (itemId: string): Promise<ShopItemWithLogs | null> => {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) {
          return null;
        }

        const { data: item, error: itemError } = await supabase
          .from("shop_items")
          .select("*")
          .eq("id", itemId)
          .single();

        if (itemError) throw itemError;

        const { data: logs, error: logsError } = await supabase
          .from("shop_logs")
          .select("*")
          .eq("shop_item_id", itemId)
          .eq("user_id", user.id)
          .order("purchased_at", { ascending: false });

        if (logsError) throw logsError;

        return {
          ...item,
          logs: logs || [],
        };
      } catch (err: any) {
        console.error("Error loading shop item with logs:", err);
        return null;
      }
    },
    []
  );

  // Load shop items immediately on mount - no dependencies to prevent blocking
  useEffect(() => {
    loadShopItems();
  }, [loadShopItems]);

  // Re-merge shop items when overrides become available (non-blocking enrichment)
  // This effect only runs when override functions change (when overrides load)
  // It re-applies filtering and merging to existing items without reloading from DB
  useEffect(() => {
    setShopItems((prev) =>
      prev
        .filter((item) => !isItemHidden(item.id))
        .map((item) => mergeItemWithOverrides(item))
    );
  }, [mergeItemWithOverrides, isItemHidden]); // Only when override functions change (overrides loaded)

  // Subscribe to real-time changes - use state patches, not full reloads
  useEffect(() => {
    // Get current user for subscription filters
    const setupSubscriptions = async () => {
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) return { user: null, all: null, hidden: null };

      // Handler for user-created shop items - receives only user's items via channel filter
      const handleUserShopItemChange = (payload: any) => {
        if (payload.eventType === "INSERT") {
          // Only add if not already present and not hidden
          setShopItems((prev) => {
            if (prev.some((i) => i.id === payload.new.id)) return prev;
            if (isItemHidden(payload.new.id)) return prev;
            const merged = mergeItemWithOverrides(payload.new);
            return [...prev, merged].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          });
        } else if (payload.eventType === "UPDATE") {
          // Patch the updated item
          setShopItems((prev) => {
            const existing = prev.find((i) => i.id === payload.new.id);
            if (!existing) return prev;
            const merged = mergeItemWithOverrides(payload.new);
            return prev
              .map((i) => (i.id === payload.new.id ? merged : i))
              .sort((a, b) => a.name.localeCompare(b.name));
          });
        } else if (payload.eventType === "DELETE") {
          // Remove deleted item
          setShopItems((prev) => prev.filter((i) => i.id !== payload.old.id));
        }
      };

      // Handler for all shop items - client-side filter for seeded items only
      const handleAllShopItemChange = (payload: any) => {
        // Only process seeded items (created_by === null), ignore others
        const item = payload.new || payload.old;
        if (item && item.created_by !== null) {
          return; // Ignore non-seeded items (user-created or other users)
        }

        if (payload.eventType === "INSERT") {
          // Only add if not already present and not hidden
          setShopItems((prev) => {
            if (prev.some((i) => i.id === payload.new.id)) return prev;
            if (isItemHidden(payload.new.id)) return prev;
            const merged = mergeItemWithOverrides(payload.new);
            return [...prev, merged].sort((a, b) =>
              a.name.localeCompare(b.name)
            );
          });
        } else if (payload.eventType === "UPDATE") {
          // Patch the updated item
          setShopItems((prev) => {
            const existing = prev.find((i) => i.id === payload.new.id);
            if (!existing) return prev;
            const merged = mergeItemWithOverrides(payload.new);
            return prev
              .map((i) => (i.id === payload.new.id ? merged : i))
              .sort((a, b) => a.name.localeCompare(b.name));
          });
        } else if (payload.eventType === "DELETE") {
          // Remove deleted item
          setShopItems((prev) => prev.filter((i) => i.id !== payload.old.id));
        }
      };

      // Subscribe to user's shop items (created_by = user.id) - channel filter
      const userSubscription = supabase.subscribe(
        "shop_items",
        handleUserShopItemChange,
        `created_by=eq.${user.id}`
      );

      // Subscribe to all shop items - client-side filter for seeded items only
      const allItemsSubscription = supabase.subscribe(
        "shop_items",
        handleAllShopItemChange
      );

      // Patch state on hidden items changes - only patch the changed ID
      const hiddenItemsSubscription = supabase.subscribe(
        "user_hidden_shop_items",
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            // Item was hidden - remove from state
            setShopItems((prev) =>
              prev.filter((i) => i.id !== payload.new.shop_item_id)
            );
          } else if (payload.eventType === "DELETE") {
            // Item was unhidden - need to reload it (can't know base data from payload)
            // But only reload this one item, not the entire list
            const unhiddenItemId = payload.old.shop_item_id;
            supabase
              .from("shop_items")
              .select("*")
              .eq("id", unhiddenItemId)
              .single()
              .then(
                ({ data, error }: { data: ShopItem | null; error: any }) => {
                  if (!error && data) {
                    setShopItems((prev) => {
                      if (prev.some((i) => i.id === data.id)) return prev;
                      const merged = mergeItemWithOverrides(data);
                      return [...prev, merged].sort((a, b) =>
                        a.name.localeCompare(b.name)
                      );
                    });
                  }
                }
              );
          }
        },
        `user_id=eq.${user.id}`
      );

      return {
        user: userSubscription,
        all: allItemsSubscription,
        hidden: hiddenItemsSubscription,
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
  }, [mergeItemWithOverrides, isItemHidden]); // Subscriptions need current overrides functions

  // Delete a shop item (user-created items delete base, seeded items hide for user)
  const deleteShopItem = useCallback(
    async (id: string) => {
      try {
        const {
          data: { user },
        } = await supabase.supabase.auth.getUser();
        if (!user) throw new Error("User must be authenticated");

        // Fetch the existing item to check ownership
        const { data: existingItem, error: fetchError } = await supabase
          .from("shop_items")
          .select("created_by")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;
        if (!existingItem) throw new Error("Shop item not found.");

        // If user created it, delete the base item
        if (existingItem.created_by === user.id) {
          const { error: deleteError } = await supabase
            .from("shop_items")
            .delete()
            .eq("id", id);

          if (deleteError) throw deleteError;
          setShopItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          // Seeded item - hide it for this user and update state immediately
          await hideItemForUser(id);
          setShopItems((prev) => prev.filter((item) => item.id !== id));
        }
      } catch (err: any) {
        console.error("Error deleting shop item:", err);
        setError(err.message || "Failed to delete shop item");
        throw err;
      }
    },
    [hideItemForUser]
  );

  // Load all shop logs for current user
  const loadAllShopLogs = useCallback(async (): Promise<ShopLog[]> => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        return [];
      }

      const { data, error: fetchError } = await supabase
        .from("shop_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err: any) {
      console.error("Error loading shop logs:", err);
      return [];
    }
  }, []);

  // Delete all shop logs for current user and reset purchase counts
  const deleteAllShopLogs = useCallback(async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      // Delete all shop logs for this user
      const { error: deleteError } = await supabase
        .from("shop_logs")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Reset all shop item purchase_count to 0
      const { error: updateError } = await supabase
        .from("shop_items")
        .update({ purchase_count: 0 })
        .not("id", "is", null); // Update all shop items

      if (updateError) throw updateError;

      // Update local state - reset purchase counts are reflected in logs, no reload needed
    } catch (err: any) {
      console.error("Error deleting all shop logs:", err);
      setError(err.message || "Failed to delete shop logs");
      throw err;
    }
  }, []);

  return {
    shopItems,
    loading,
    error,
    createShopItem,
    updateShopItem,
    purchaseItem,
    deleteShopItem,
    getShopItemWithLogs,
    loadAllShopLogs,
    deleteAllShopLogs,
    refresh: loadShopItems,
  };
}
