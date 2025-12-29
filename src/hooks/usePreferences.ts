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
        setShowDollarAmounts(data.show_dollar_amounts);
        // Also store in localStorage as backup
        localStorage.setItem("showDollarAmounts", String(data.show_dollar_amounts));
      } else {
        // No preferences found, check localStorage
        const stored = localStorage.getItem("showDollarAmounts");
        setShowDollarAmounts(stored === "true");
      }
      setError(null);
    } catch (err: any) {
      console.error("Error loading preferences:", err);
      // Fallback to localStorage
      const stored = localStorage.getItem("showDollarAmounts");
      setShowDollarAmounts(stored === "true");
      setError(err.message || "Failed to load preferences");
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Save preferences
  const savePreferences = useCallback(
    async (showDollars: boolean) => {
      try {
        const userId = await getUserId();
        
        // Always update localStorage as backup
        localStorage.setItem("showDollarAmounts", String(showDollars));
        setShowDollarAmounts(showDollars);

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

        if (existing) {
          // Update existing
          const { error: updateError } = await supabase
            .from("user_preferences")
            .update({
              show_dollar_amounts: showDollars,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) throw updateError;
        } else {
          // Create new
          const { error: createError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: userId,
              show_dollar_amounts: showDollars,
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
    const newValue = !showDollarAmounts;
    await savePreferences(newValue);
  }, [showDollarAmounts, savePreferences]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    showDollarAmounts,
    loading,
    error,
    toggleDollarAmounts,
    setShowDollarAmounts: savePreferences,
  };
}

