/**
 * Get Kraken - Supabase Configuration
 * 
 * Initialize Supabase integration from @ffx/sdk
 */

import { SupabaseIntegration } from "@ffx/sdk/services";

// TODO: Replace with your Supabase project credentials
// These should be set via environment variables in production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    "⚠️ Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables."
  );
}

export const supabase = new SupabaseIntegration({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Enable auth for user login
    },
  },
});

