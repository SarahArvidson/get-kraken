/**
 * Get Kraken v2 - Reward Metadata Cache Hook
 * 
 * Loads reward/shop item metadata (id, name) once per session and caches in memory
 * Used for hydrating activity logs without SQL joins
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export interface RewardMetadata {
  id: string;
  name: string;
}

export function useRewardMetadata() {
  const [metadata, setMetadata] = useState<Record<string, RewardMetadata>>({});
  const [loading, setLoading] = useState(true);

  // Load reward metadata once per session
  const loadMetadata = useCallback(async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.supabase.auth.getUser();
      if (!user) {
        setMetadata({});
        setLoading(false);
        return;
      }

      // Load only id and name from shop_items
      const { data, error } = await supabase
        .from("shop_items")
        .select("id, name")
        .or(`created_by.is.null,created_by.eq.${user.id}`);

      if (error) {
        console.error("[useRewardMetadata] Error fetching reward metadata:", error);
        throw error;
      }

      // Build metadata map keyed by reward id
      const metadataMap: Record<string, RewardMetadata> = {};
      (data || []).forEach((item: { id: string; name: string }) => {
        metadataMap[item.id] = {
          id: item.id,
          name: item.name,
        };
      });

      setMetadata(metadataMap);
    } catch (err: any) {
      console.error("Error loading reward metadata:", err);
      setMetadata({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadMetadata();
  }, [loadMetadata]);

  return {
    metadata,
    loading,
    refresh: loadMetadata,
  };
}
