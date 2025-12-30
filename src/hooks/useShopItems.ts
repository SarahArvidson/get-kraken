/**
 * Get Kraken - Shop Items Hook
 *
 * Manages shop items data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { ShopItem, ShopItemWithLogs, ShopLog } from "../types";
import { useShopItemOverrides } from "./useShopItemOverrides";

export function useShopItems() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { mergeItemWithOverrides, isItemHidden, updateOverride, hideItem: hideItemForUser, refresh: refreshOverrides } = useShopItemOverrides();

  // Load all shop items
  const loadShopItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("shop_items")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;
      
      // Merge with overrides and filter hidden items
      const mergedItems = (data || [])
        .filter((item: ShopItem) => !isItemHidden(item.id))
        .map((item: ShopItem) => mergeItemWithOverrides(item));
      
      setShopItems(mergedItems);
      setError(null);
    } catch (err: any) {
      console.error("Error loading shop items:", err);
      setError(err.message || "Failed to load shop items");
    } finally {
      setLoading(false);
    }
  }, []);

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
        const { data: { user } } = await supabase.supabase.auth.getUser();
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
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
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
        if (existingItem.created_by === user.id) {
          const { data, error: updateError } = await supabase
            .from("shop_items")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

          if (updateError) throw updateError;
          if (data) {
            setShopItems((prev) => {
              const updated = prev.map((item) => (item.id === id ? data : item));
              return updated.sort((a, b) => a.name.localeCompare(b.name));
            });
          }
          return data;
        } else {
          // Seeded item - update user override instead
          const overrideUpdates: any = {};
          if (updates.name !== undefined) overrideUpdates.name = updates.name;
          if (updates.tags !== undefined) overrideUpdates.tags = updates.tags;
          if (updates.price !== undefined) overrideUpdates.price = updates.price;
          if (updates.dollar_amount !== undefined) overrideUpdates.dollar_amount = updates.dollar_amount;

          await updateOverride(id, overrideUpdates);
          await refreshOverrides();
          // Reload shop items to get merged data
          await loadShopItems();
          // Return null - will be refreshed by loadShopItems
          return null;
        }
      } catch (err: any) {
        console.error("Error updating shop item:", err);
        setError(err.message || "Failed to update shop item");
        throw err;
      }
    },
    [updateOverride, refreshOverrides, loadShopItems, shopItems]
  );

  // Purchase a shop item (adds to log with user_id)
  const purchaseItem = useCallback(
    async (itemId: string, price: number) => {
      try {
        // Get current user
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // Create log entry with user_id
        const { error: logError } = await supabase.from("shop_logs").insert({
          shop_item_id: itemId,
          user_id: user.id,
          purchased_at: new Date().toISOString(),
        });

        if (logError) {
          console.error("Shop log insert error:", logError);
          console.error("User ID:", user.id);
          console.error("Item ID:", itemId);
          throw new Error(`Failed to create shop log: ${logError.message || JSON.stringify(logError)}`);
        }

        // Note: We don't update purchase_count anymore since it's shared
        // Per-user counts are calculated from logs

        return -price; // Return negative for wallet update
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
        const { data: { user } } = await supabase.supabase.auth.getUser();
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

  // Subscribe to real-time changes
  useEffect(() => {
    loadShopItems();

    const subscription = supabase.subscribe("shop_items", (payload: any) => {
      if (payload.eventType === "INSERT") {
        loadShopItems(); // Reload to merge with overrides
      } else if (payload.eventType === "UPDATE") {
        loadShopItems(); // Reload to merge with overrides
      } else if (payload.eventType === "DELETE") {
        loadShopItems(); // Reload to filter hidden items
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Delete a shop item (user-created items delete base, seeded items hide for user)
  const deleteShopItem = useCallback(async (id: string) => {
    try {
      const { data: { user } } = await supabase.supabase.auth.getUser();
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
        // Seeded item - hide it for this user
        await hideItemForUser(id);
        await refreshOverrides();
        // Reload shop items to filter out hidden item
        await loadShopItems();
      }
    } catch (err: any) {
      console.error("Error deleting shop item:", err);
      setError(err.message || "Failed to delete shop item");
      throw err;
    }
  }, [hideItemForUser, refreshOverrides, loadShopItems]);

  // Load all shop logs for current user
  const loadAllShopLogs = useCallback(async (): Promise<ShopLog[]> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
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
      const { data: { user } } = await supabase.supabase.auth.getUser();
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

      // Refresh shop items to reflect the reset counts
      await loadShopItems();
    } catch (err: any) {
      console.error("Error deleting all shop logs:", err);
      setError(err.message || "Failed to delete shop logs");
      throw err;
    }
  }, [loadShopItems]);

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
