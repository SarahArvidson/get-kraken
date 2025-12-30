/**
 * Get Kraken - Shop Item Overrides Hook
 *
 * Manages per-user shop item overrides (price, dollar_amount)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { UserShopItemOverride } from "../types";

export function useShopItemOverrides() {
  const [overrides, setOverrides] = useState<Record<string, UserShopItemOverride>>({});
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

  // Update or create override
  const updateOverride = useCallback(
    async (itemId: string, updates: { price?: number; dollar_amount?: number }) => {
      try {
        const userId = await getUserId();
        if (!userId) throw new Error("User must be authenticated");

        // Check if override exists
        const existing = overrides[itemId];

        if (existing) {
          // Update existing override
          const updateData: any = { updated_at: new Date().toISOString() };
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
    getEffectivePrice,
    getEffectiveDollarAmount,
    updateOverride,
    refresh: loadOverrides,
  };
}

