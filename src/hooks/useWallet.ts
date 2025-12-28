/**
 * Kibblings - Wallet Hook
 *
 * Manages the shared kibbling wallet state and syncs with Supabase
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Wallet } from "../types";

const WALLET_ID = "shared-wallet"; // Single shared wallet

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load wallet from Supabase
  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", WALLET_ID)
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
              id: WALLET_ID,
              total: 0,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
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
            id: WALLET_ID,
            total: 0,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) {
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

  // Update wallet total
  const updateWallet = useCallback(
    async (amount: number) => {
      if (!wallet) return;

      try {
        const newTotal = wallet.total + amount;
        const { data, error: updateError } = await supabase
          .from("wallets")
          .update({
            total: newTotal,
            updated_at: new Date().toISOString(),
          })
          .eq("id", WALLET_ID)
          .select()
          .single();

        if (updateError) throw updateError;
        setWallet(data);
      } catch (err: any) {
        console.error("Error updating wallet:", err);
        setError(err.message || "Failed to update wallet");
        throw err;
      }
    },
    [wallet]
  );

  // Subscribe to real-time changes
  useEffect(() => {
    loadWallet();

    const subscription = supabase.subscribe(
      "wallets",
      (payload: any) => {
        if (payload.new?.id === WALLET_ID) {
          setWallet(payload.new);
        }
      },
      `id=eq.${WALLET_ID}`
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadWallet]);

  // Reset wallet to zero
  const resetWallet = useCallback(async () => {
    if (!wallet) return;
    try {
      await updateWallet(-wallet.total);
    } catch (err: any) {
      console.error("Error resetting wallet:", err);
      throw err;
    }
  }, [wallet, updateWallet]);

  return {
    wallet,
    loading,
    error,
    updateWallet,
    resetWallet,
    refresh: loadWallet,
  };
}
