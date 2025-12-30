/**
 * Get Kraken - Current User Hook
 *
 * Gets the current authenticated user ID
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.supabase.auth.getUser();
      setUserId(user?.id || null);
    } catch (err) {
      console.error("Error loading user:", err);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUser]);

  return { userId, loading };
}

