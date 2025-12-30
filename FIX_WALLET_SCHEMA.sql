-- Fix Wallet Schema for Per-User Wallets
-- Run this in Supabase SQL Editor to fix the duplicate key error

-- Step 1: Check current wallet table structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'wallets'
ORDER BY ordinal_position;

-- Step 2: Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wallets' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE wallets 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 3: Delete the old shared wallet (we're moving to per-user wallets)
DELETE FROM wallets WHERE id = 'shared-wallet';

-- Step 4: Drop the old primary key constraint
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_pkey;

-- Step 5: Make id nullable (it was TEXT with default 'shared-wallet')
ALTER TABLE wallets ALTER COLUMN id DROP NOT NULL;
ALTER TABLE wallets ALTER COLUMN id DROP DEFAULT;

-- Step 6: Make user_id NOT NULL (but first handle any NULL values)
-- Delete any wallets without user_id (shouldn't be any after step 3)
DELETE FROM wallets WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE wallets ALTER COLUMN user_id SET NOT NULL;

-- Step 7: Create a new primary key on user_id (one wallet per user)
ALTER TABLE wallets ADD CONSTRAINT wallets_pkey PRIMARY KEY (user_id);

-- Step 8: Verify the structure
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'wallets'
ORDER BY ordinal_position;

-- Step 9: Verify the primary key
SELECT 
  constraint_name, 
  constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'wallets' AND constraint_type = 'PRIMARY KEY';
