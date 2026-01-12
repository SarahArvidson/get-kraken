/**
 * Get Kraken v2 - Profile Hook
 * 
 * Manages user profile information (username)
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useProfile() {
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user ID
  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.supabase.auth.getUser();
    return user?.id;
  }, []);

  // Load profile
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("username")
        .eq("user_id", userId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (data) {
        setUsername(data.username || "");
      }
      setError(null);
    } catch (err: any) {
      console.error("Error loading profile:", err);
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  // Update username
  const updateUsername = useCallback(
    async (newUsername: string) => {
      try {
        const userId = await getUserId();
        if (!userId) {
          throw new Error("User must be authenticated");
        }

        // Validate username
        if (newUsername.length > 50) {
          throw new Error("Username must be 50 characters or less");
        }
        if (newUsername && !/^[a-zA-Z0-9_-]+$/.test(newUsername)) {
          throw new Error("Username can only contain letters, numbers, underscores, and hyphens");
        }

        // Update or create preferences
        const { data: existing } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (existing) {
          const { error: updateError } = await supabase
            .from("user_preferences")
            .update({
              username: newUsername || null,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) throw updateError;
        } else {
          const { error: createError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: userId,
              username: newUsername || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createError) throw createError;
        }

        setUsername(newUsername);
        setError(null);
      } catch (err: any) {
        console.error("Error updating username:", err);
        setError(err.message || "Failed to update username");
        throw err;
      }
    },
    [getUserId]
  );

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    username,
    loading,
    error,
    updateUsername,
  };
}
