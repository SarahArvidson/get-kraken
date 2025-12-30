/**
 * Get Kraken - Shop Item Overrides Hook
 *
 * Manages per-user shop item overrides (name, tags, price, dollar_amount)
 * and hidden shop items
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserShopItemOverride, ShopItem, ShopTag } from "../types";

export function useShopItemOverrides() {
  const [overrides, setOverrides] = useState<Record<string, UserShopItemOverride>>({});
  const [hiddenItemIds, setHiddenItemIds] = useState<Set<string>>(new Set());
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
        .from("user_shop_item_overrides")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const overridesMap: Record<string, UserShopItemOverride> = {};
      (data || []).forEach((override: UserShopItemOverride) => {
        overridesMap[override.shop_item_id] = override;
      });
      setOverrides(overridesMap);

      // Load hidden shop items
      const { data: hiddenData, error: hiddenError } = await supabase
        .from("user_hidden_shop_items")
        .select("shop_item_id")
        .eq("user_id", userId);

      if (hiddenError) throw hiddenError;
      setHiddenItemIds(new Set((hiddenData || []).map((h: { shop_item_id: string }) => h.shop_item_id)));
    } catch (err) {
      console.error("Error loading shop item overrides:", err);
      setOverrides({});
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Get effective price for a shop item (override or base)
  const getEffectivePrice = useCallback(
    (itemId: string, basePrice: number): number => {
      const override = overrides[itemId];
      return override?.price !== null && override?.price !== undefined
        ? override.price
        : basePrice;
    },
    [overrides]
  );

  // Get effective dollar amount for a shop item (override or base)
  const getEffectiveDollarAmount = useCallback(
    (itemId: string, baseDollarAmount: number): number => {
      const override = overrides[itemId];
      return override?.dollar_amount !== null && override?.dollar_amount !== undefined
        ? override.dollar_amount
        : baseDollarAmount;
    },
    [overrides]
  );

  // Get effective name for a shop item (override or base)
  const getEffectiveName = useCallback(
    (itemId: string, baseName: string): string => {
      const override = overrides[itemId];
      return override?.name || baseName;
    },
    [overrides]
  );

  // Get effective tags for a shop item (override or base)
  const getEffectiveTags = useCallback(
    (itemId: string, baseTags: ShopTag[]): ShopTag[] => {
      const override = overrides[itemId];
      return override?.tags || baseTags;
    },
    [overrides]
  );

  // Check if a shop item is hidden for the current user
  const isItemHidden = useCallback(
    (itemId: string): boolean => {
      return hiddenItemIds.has(itemId);
    },
    [hiddenItemIds]
  );

  // Update or create override (supports name, tags, price, dollar_amount)
  const updateOverride = useCallback(
    async (itemId: string, updates: { name?: string; tags?: ShopTag[]; price?: number; dollar_amount?: number }) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        // Check if override exists
        const existing = overrides[itemId];

        if (existing) {
          // Update existing override
          const updateData: any = { updated_at: new Date().toISOString() };
          if (updates.name !== undefined) updateData.name = updates.name;
          if (updates.tags !== undefined) updateData.tags = updates.tags;
          if (updates.price !== undefined) updateData.price = updates.price;
          if (updates.dollar_amount !== undefined) updateData.dollar_amount = updates.dollar_amount;

          const { data, error } = await supabase
            .from("user_shop_item_overrides")
            .update(updateData)
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setOverrides((prev) => ({ ...prev, [itemId]: data }));
          }
        } else {
          // Create new override
          const { data, error } = await supabase
            .from("user_shop_item_overrides")
            .insert({
              user_id: userId,
              shop_item_id: itemId,
              name: updates.name ?? null,
              tags: updates.tags ?? null,
              price: updates.price ?? null,
              dollar_amount: updates.dollar_amount ?? null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;
          if (data) {
            setOverrides((prev) => ({ ...prev, [itemId]: data }));
          }
        }
      } catch (err) {
        console.error("Error updating shop item override:", err);
        throw err;
      }
    },
    [getUserId, overrides]
  );

  // Hide a shop item for the current user
  const hideItem = useCallback(
    async (itemId: string) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        const { error } = await supabase
          .from("user_hidden_shop_items")
          .insert({
            user_id: userId,
            shop_item_id: itemId,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
        setHiddenItemIds((prev) => new Set([...prev, itemId]));
      } catch (err) {
        console.error("Error hiding shop item:", err);
        throw err;
      }
    },
    [getUserId]
  );

  // Unhide a shop item for the current user
  const unhideItem = useCallback(
    async (itemId: string) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        const { error } = await supabase
          .from("user_hidden_shop_items")
          .delete()
          .eq("user_id", userId)
          .eq("shop_item_id", itemId);

        if (error) throw error;
        setHiddenItemIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } catch (err) {
        console.error("Error unhiding shop item:", err);
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

  // Merge base shop item with user overrides
  const mergeItemWithOverrides = useCallback(
    (baseItem: ShopItem): ShopItem => {
      const override = overrides[baseItem.id];
      if (!override) return baseItem;

      return {
        ...baseItem,
        name: override.name || baseItem.name,
        tags: override.tags || baseItem.tags,
        price: override.price !== null && override.price !== undefined ? override.price : baseItem.price,
        dollar_amount: override.dollar_amount !== null && override.dollar_amount !== undefined ? override.dollar_amount : baseItem.dollar_amount,
      };
    },
    [overrides]
  );

  return {
    overrides,
    hiddenItemIds,
    loading,
    getEffectivePrice,
    getEffectiveDollarAmount,
    getEffectiveName,
    getEffectiveTags,
    isItemHidden,
    updateOverride,
    hideItem,
    unhideItem,
    mergeItemWithOverrides,
    refresh: loadOverrides,
  };
}

