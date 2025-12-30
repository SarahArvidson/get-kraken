/**
 * Get Kraken - Filter State Hook
 *
 * Manages per-user filter and search state
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Tag, ShopTag } from "../types";

interface FilterState {
  questSearchQuery: string;
  shopSearchQuery: string;
  selectedQuestTag: Tag | null;
  selectedShopTag: ShopTag | null;
}

const DEFAULT_FILTER_STATE: FilterState = {
  questSearchQuery: "",
  shopSearchQuery: "",
  selectedQuestTag: null,
  selectedShopTag: null,
};

export function useFilterState() {
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [loading, setLoading] = useState(true);

  // Get current user ID
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.supabase.auth.getUser();
    return user?.id;
  }, []);

  // Load filter state from localStorage (per-user)
  const loadFilterState = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      
      // Use user-specific localStorage keys
      const storageKey = userId 
        ? `filterState_${userId}` 
        : "filterState_anonymous";
      
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setFilterState({ ...DEFAULT_FILTER_STATE, ...parsed });
        } catch {
          // Invalid JSON, use defaults
          setFilterState(DEFAULT_FILTER_STATE);
        }
      } else {
        setFilterState(DEFAULT_FILTER_STATE);
      }
    } catch (err) {
      console.error("Error loading filter state:", err);
      setFilterState(DEFAULT_FILTER_STATE);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Save filter state to localStorage (per-user)
  const saveFilterState = useCallback(async (newState: FilterState) => {
    try {
      const userId = await getUserId();
      const storageKey = userId 
        ? `filterState_${userId}` 
        : "filterState_anonymous";
      
      localStorage.setItem(storageKey, JSON.stringify(newState));
      setFilterState(newState);
    } catch (err) {
      console.error("Error saving filter state:", err);
    }
  }, [getUserId]);

  // Update individual filter values
  const setQuestSearchQuery = useCallback(
    (query: string) => {
      const newState = { ...filterState, questSearchQuery: query };
      saveFilterState(newState);
    },
    [filterState, saveFilterState]
  );

  const setShopSearchQuery = useCallback(
    (query: string) => {
      const newState = { ...filterState, shopSearchQuery: query };
      saveFilterState(newState);
    },
    [filterState, saveFilterState]
  );

  const setSelectedQuestTag = useCallback(
    (tag: Tag | null) => {
      const newState = { ...filterState, selectedQuestTag: tag };
      saveFilterState(newState);
    },
    [filterState, saveFilterState]
  );

  const setSelectedShopTag = useCallback(
    (tag: ShopTag | null) => {
      const newState = { ...filterState, selectedShopTag: tag };
      saveFilterState(newState);
    },
    [filterState, saveFilterState]
  );

  // Load on mount
  useEffect(() => {
    loadFilterState();
  }, [loadFilterState]);

  // Reload when user changes (auth state change)
  useEffect(() => {
    const { data: { subscription } } = supabase.supabase.auth.onAuthStateChange(() => {
      loadFilterState();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadFilterState]);

  return {
    questSearchQuery: filterState.questSearchQuery,
    shopSearchQuery: filterState.shopSearchQuery,
    selectedQuestTag: filterState.selectedQuestTag,
    selectedShopTag: filterState.selectedShopTag,
    setQuestSearchQuery,
    setShopSearchQuery,
    setSelectedQuestTag,
    setSelectedShopTag,
    loading,
  };
}

