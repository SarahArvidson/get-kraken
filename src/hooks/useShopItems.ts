/**
 * Get Kraken - Shop Items Hook
 *
 * Manages shop items data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { ShopItem, ShopItemWithLogs, ShopLog } from "../types";

export function useShopItems() {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all shop items
  const loadShopItems = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("shop_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setShopItems(data || []);
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
          setShopItems((prev) => [data, ...prev]);
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

  // Update a shop item
  const updateShopItem = useCallback(
    async (id: string, updates: Partial<ShopItem>) => {
      try {
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
          setShopItems((prev) =>
            prev.map((item) => (item.id === id ? data : item))
          );
        }
        return data;
      } catch (err: any) {
        console.error("Error updating shop item:", err);
        setError(err.message || "Failed to update shop item");
        throw err;
      }
    },
    []
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

        if (logError) throw logError;

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
        setShopItems((prev) => [payload.new, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setShopItems((prev) =>
          prev.map((item) => (item.id === payload.new.id ? payload.new : item))
        );
      } else if (payload.eventType === "DELETE") {
        setShopItems((prev) =>
          prev.filter((item) => item.id !== payload.old.id)
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadShopItems]);

  // Delete a shop item (but keep logs)
  const deleteShopItem = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("shop_items")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      setShopItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error("Error deleting shop item:", err);
      setError(err.message || "Failed to delete shop item");
      throw err;
    }
  }, []);

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
    refresh: loadShopItems,
  };
}
