-- Fix Wallet to be Per-User
-- Run this AFTER running FIX_USER_ISOLATION.sql

-- Step 1: Add user_id to wallets table
ALTER TABLE wallets 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Make user_id required (but allow NULL for migration)
-- We'll handle existing shared wallet separately

-- Step 3: Drop old wallet policies
DROP POLICY IF EXISTS "Everyone can read shared wallet" ON wallets;
DROP POLICY IF EXISTS "Everyone can update shared wallet" ON wallets;
DROP POLICY IF EXISTS "Allow all for authenticated users on wallets" ON wallets;

-- Step 4: Create new per-user wallet policies
CREATE POLICY "Users can read their own wallet" 
  ON wallets FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wallet" 
  ON wallets FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own wallet" 
  ON wallets FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own wallet" 
  ON wallets FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Step 6: Note about existing data
-- The old "shared-wallet" will remain but won't be accessible to users
-- Each user will get their own wallet created automatically when they first use the app

