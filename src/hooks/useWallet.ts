/**
 * Get Kraken - Wallet Hook
 *
 * Manages per-user wallet state and syncs with Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Wallet } from "../types";
import { isEchoOfLastWalletMutation } from "../utils/mutationGuard";

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wallet from Supabase for current user
  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) {
        setWallet(null);
        setLoading(false);
        return;
      }

      // Try to load user's wallet
      const { data, error: fetchError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        // If wallet doesn't exist (PGRST116 = no rows), create it
        if (
          fetchError.code === "PGRST116" ||
          fetchError.message?.includes("No rows")
        ) {
          const { data: newWallet, error: createError } = await supabase
            .from("wallets")
            .insert({
              user_id: user.id,
              id: null, // id is nullable, user_id is the primary key
              total: 0,
              dollar_total: 0,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            // If duplicate key error, wallet might have been created by another request - try to fetch it
            if (createError.code === '23505') {
              const { data: existingWallet } = await supabase
                .from("wallets")
                .select("*")
                .eq("user_id", user.id)
                .single();
              if (existingWallet) {
                setWallet(existingWallet);
                return;
              }
            }
            throw createError;
          }
          if (newWallet) {
            setWallet(newWallet);
          }
        } else {
          throw fetchError;
        }
      } else if (data) {
        setWallet(data);
      } else {
        // No data and no error - create wallet
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            id: null, // id is nullable, user_id is the primary key
            total: 0,
            dollar_total: 0,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
          // If duplicate key error, wallet might have been created by another request - try to fetch it
          if (createError.code === '23505') {
            const { data: existingWallet } = await supabase
              .from("wallets")
              .select("*")
              .eq("user_id", user.id)
              .single();
            if (existingWallet) {
              setWallet(existingWallet);
              return;
            }
          }
          throw createError;
        }
        if (newWallet) {
          setWallet(newWallet);
        }
      }
      setError(null);
    } catch (err: any) {
      console.error("Error loading wallet:", err);
      setError(err.message || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  // Update wallet total (sea dollars and optionally dollar total)
  const updateWallet = useCallback(
    async (amount: number, dollarAmount: number = 0) => {
      try {
        // Get current user to ensure we're updating the right wallet
        const { data: { user } } = await supabase.supabase.auth.getUser();
        if (!user) {
          throw new Error("User must be authenticated");
        }

        // If wallet not loaded yet, load it first
        if (!wallet) {
          await loadWallet();
          // Wait a bit for state to update, then try again
          // Actually, let's just fetch it directly here
          const { data: walletData, error: fetchError } = await supabase
            .from("wallets")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          if (fetchError && fetchError.code !== "PGRST116") {
            throw fetchError;
          }

          // If no wallet exists, create it
          if (!walletData) {
            const { data: newWallet, error: createError } = await supabase
              .from("wallets")
              .insert({
                user_id: user.id,
                id: null, // id is nullable now, user_id is the primary key
                total: amount,
                dollar_total: Math.round(dollarAmount),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single();

            if (createError) {
              // If it's a unique constraint error, the wallet might have been created by another request
              // Try to fetch it and update it instead
              if (createError.code === '23505') {
                const { data: existingWallet } = await supabase
                  .from("wallets")
                  .select("*")
                  .eq("user_id", user.id)
                  .single();
                if (existingWallet) {
                  const newTotal = existingWallet.total + amount;
                  const newDollarTotal = Math.round((existingWallet.dollar_total || 0) + Math.round(dollarAmount));
                  const { data: updatedWallet, error: updateError } = await supabase
                    .from("wallets")
                    .update({
                      total: newTotal,
                      dollar_total: newDollarTotal,
                      updated_at: new Date().toISOString(),
                    })
                    .eq("user_id", user.id)
                    .select()
                    .single();
                  if (updateError) throw updateError;
                  if (updatedWallet) {
                    setWallet(updatedWallet);
                    return;
                  }
                }
              }
              throw createError;
            }
            if (newWallet) {
              setWallet(newWallet);
              return;
            }
          } else {
            // Wallet exists, update it
            const newTotal = walletData.total + amount;
            const newDollarTotal = Math.round((walletData.dollar_total || 0) + Math.round(dollarAmount));
            const { data, error: updateError } = await supabase
              .from("wallets")
              .update({
                total: newTotal,
                dollar_total: newDollarTotal,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id)
              .select()
              .single();

            if (updateError) throw updateError;
            if (data) {
              setWallet(data);
            }
            return;
          }
        }

        // Wallet exists, update it
        if (!wallet) {
          // This shouldn't happen, but TypeScript needs this check
          throw new Error("Wallet not loaded");
        }

        const newTotal = wallet.total + amount;
        const newDollarTotal = Math.round((wallet.dollar_total || 0) + Math.round(dollarAmount));
        const { data, error: updateError } = await supabase
          .from("wallets")
          .update({
            total: newTotal,
            dollar_total: newDollarTotal,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        if (data) {
          setWallet(data);
        }
      } catch (err: any) {
        console.error("Error updating wallet:", err);
        setError(err.message || "Failed to update wallet");
        throw err;
      }
    },
    [wallet, loadWallet]
  );

  // Subscribe to real-time changes
  useEffect(() => {
    loadWallet();

    let subscription: any = null;

    // Get current user for subscription filter
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) return;

      subscription = supabase.subscribe(
        "wallets",
        (payload: any) => {
          if (payload.new?.user_id === user.id) {
            // Mutation guard: ignore realtime echoes of our own mutations
            const newTotal = payload.new.total ?? 0;
            const newDollarTotal = payload.new.dollar_total ?? 0;
            
            if (isEchoOfLastWalletMutation(newTotal, newDollarTotal)) {
              // This is an echo of our own mutation - ignore it
              console.log("[useWallet] Ignoring realtime echo of local mutation");
              return;
            }
            
            // This is a genuine update (from another device or external source) - apply it
            setWallet(payload.new);
          }
        },
        `user_id=eq.${user.id}`
      );
    };

    setupSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [loadWallet]);

  // Reset wallet to zero (both sea dollars and dollar total)
  const resetWallet = useCallback(async () => {
    if (!wallet) return;
    try {
      // Get current user
      const { data: { user } } = await supabase.supabase.auth.getUser();
      if (!user) {
        throw new Error("User must be authenticated");
      }

      const { data, error: updateError } = await supabase
        .from("wallets")
        .update({
          total: 0,
          dollar_total: 0,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setWallet(data);
      }
    } catch (err: any) {
      console.error("Error resetting wallet:", err);
      throw err;
    }
  }, [wallet]);

  return {
    wallet,
    loading,
    error,
    updateWallet,
    resetWallet,
    refresh: loadWallet,
  };
}
