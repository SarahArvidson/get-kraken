/**
 * Get Kraken - User Preferences Hook
 *
 * Manages user preferences including dollar display toggle
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

// UserPreferences type is defined inline where needed

export function usePreferences() {
  const [showDollarAmounts, setShowDollarAmounts] = useState(false);
  const [showSandDollars, setShowSandDollars] = useState(true); // Default: show sand dollars
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.supabase.auth.getUser();
    return user?.id;
  }, []);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        // No user logged in, use localStorage as fallback
        const stored = localStorage.getItem("showDollarAmounts");
        setShowDollarAmounts(stored === "true");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" - that's okay, we'll create one
        throw fetchError;
      }

      if (data) {
        setShowDollarAmounts(data.show_dollar_amounts ?? false);
        setShowSandDollars(data.show_sand_dollars ?? true);
        // Also store in localStorage as backup
        localStorage.setItem("showDollarAmounts", String(data.show_dollar_amounts ?? false));
        localStorage.setItem("showSandDollars", String(data.show_sand_dollars ?? true));
      } else {
        // No preferences found, check localStorage
        const storedDollars = localStorage.getItem("showDollarAmounts");
        const storedSand = localStorage.getItem("showSandDollars");
        setShowDollarAmounts(storedDollars === "true");
        setShowSandDollars(storedSand !== "false"); // Default true if not set
      }
      setError(null);
    } catch (err: any) {
      console.error("Error loading preferences:", err);
      // Fallback to localStorage
      const storedDollars = localStorage.getItem("showDollarAmounts");
      const storedSand = localStorage.getItem("showSandDollars");
      setShowDollarAmounts(storedDollars === "true");
      setShowSandDollars(storedSand !== "false");
      setError(err.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Save preferences
  const savePreferences = useCallback(
    async (updates: { showDollars?: boolean; showSandDollars?: boolean }) => {
      try {
        const userId = await getUserId();
        
        // Update local state
        if (updates.showDollars !== undefined) {
          setShowDollarAmounts(updates.showDollars);
          localStorage.setItem("showDollarAmounts", String(updates.showDollars));
        }
        if (updates.showSandDollars !== undefined) {
          setShowSandDollars(updates.showSandDollars);
          localStorage.setItem("showSandDollars", String(updates.showSandDollars));
        }

        if (!userId) {
          // No user logged in, just use localStorage
          return;
        }

        // Try to update existing preferences
        const { data: existing } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };
        if (updates.showDollars !== undefined) {
          updateData.show_dollar_amounts = updates.showDollars;
        }
        if (updates.showSandDollars !== undefined) {
          updateData.show_sand_dollars = updates.showSandDollars;
        }

        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from("user_preferences")
            .update(updateData)
            .eq("user_id", userId);

          if (updateError) throw updateError;
        } else {
          // Create new
          const { error: createError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: userId,
              show_dollar_amounts: updates.showDollars ?? false,
              show_sand_dollars: updates.showSandDollars ?? true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createError) throw createError;
        }

        setError(null);
      } catch (err: any) {
        console.error("Error saving preferences:", err);
        setError(err.message || "Failed to save preferences");
        // Still update state and localStorage even if DB save fails
      }
    },
    [getUserId]
  );

  // Toggle dollar amounts display
  const toggleDollarAmounts = useCallback(async () => {
    await savePreferences({ showDollars: !showDollarAmounts });
  }, [showDollarAmounts, savePreferences]);

  // Toggle sand dollars display
  const toggleSandDollars = useCallback(async () => {
    await savePreferences({ showSandDollars: !showSandDollars });
  }, [showSandDollars, savePreferences]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    showDollarAmounts,
    showSandDollars,
    loading,
    error,
    toggleDollarAmounts,
    toggleSandDollars,
    setShowDollarAmounts: (value: boolean) => savePreferences({ showDollars: value }),
    setShowSandDollars: (value: boolean) => savePreferences({ showSandDollars: value }),
  };
}

