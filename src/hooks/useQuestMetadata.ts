/**
 * Get Kraken v2 - Quest Metadata Cache Hook
 * 
 * Loads quest metadata (id, name, tags) once per session and caches in memory
 * Used for hydrating activity logs without SQL joins
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Tag } from "../types";

export interface QuestMetadata {
  id: string;
  name: string;
  tags: Tag[];
}

export function useQuestMetadata() {
  const [metadata, setMetadata] = useState<Record<string, QuestMetadata>>({});
  const [loading, setLoading] = useState(true);

  // Load quest metadata once per session
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

      // Load only id, name, and tags from quests
      const { data, error } = await supabase
        .from("quests")
        .select("id, name, tags")
        .or(`created_by.is.null,created_by.eq.${user.id}`);

      if (error) {
        console.error("[useQuestMetadata] Error fetching quest metadata:", error);
        throw error;
      }

      // Build metadata map keyed by quest id
      const metadataMap: Record<string, QuestMetadata> = {};
      (data || []).forEach((quest: { id: string; name: string; tags: Tag[] }) => {
        metadataMap[quest.id] = {
          id: quest.id,
          name: quest.name,
          tags: quest.tags || [],
        };
      });

      setMetadata(metadataMap);
    } catch (err: any) {
      console.error("Error loading quest metadata:", err);
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
