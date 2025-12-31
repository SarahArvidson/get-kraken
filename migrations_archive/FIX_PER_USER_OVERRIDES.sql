-- Per-User Overrides for Quests and Shop Items
-- This allows each user to customize reward/price/dollar_amount for themselves
-- Run this in Supabase SQL Editor

-- Step 1: Create user_quest_overrides table
CREATE TABLE IF NOT EXISTS user_quest_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  reward INTEGER,
  dollar_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Step 2: Create user_shop_item_overrides table
CREATE TABLE IF NOT EXISTS user_shop_item_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  price INTEGER,
  dollar_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shop_item_id)
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_quest_overrides_user_id ON user_quest_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quest_overrides_quest_id ON user_quest_overrides(quest_id);
CREATE INDEX IF NOT EXISTS idx_user_shop_item_overrides_user_id ON user_shop_item_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_shop_item_overrides_item_id ON user_shop_item_overrides(shop_item_id);

-- Step 4: Enable RLS
ALTER TABLE user_quest_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shop_item_overrides ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for user_quest_overrides
CREATE POLICY "Users can read their own quest overrides"
  ON user_quest_overrides FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own quest overrides"
  ON user_quest_overrides FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quest overrides"
  ON user_quest_overrides FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own quest overrides"
  ON user_quest_overrides FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 6: Create RLS policies for user_shop_item_overrides
CREATE POLICY "Users can read their own shop item overrides"
  ON user_shop_item_overrides FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shop item overrides"
  ON user_shop_item_overrides FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own shop item overrides"
  ON user_shop_item_overrides FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own shop item overrides"
  ON user_shop_item_overrides FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 7: Update quests RLS to allow all users to read (but not update base values)
-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Users can update only their own quests" ON quests;

-- Create a policy that allows reading but prevents updating base quest values
-- (Users will update their overrides instead)
CREATE POLICY "Users can read all quests"
  ON quests FOR SELECT
  TO authenticated
  USING (true);

-- Step 8: Update shop_items RLS to allow all users to read (but not update base values)
-- Drop the restrictive update policy
DROP POLICY IF EXISTS "Users can update only their own shop items" ON shop_items;

-- Create a policy that allows reading but prevents updating base shop item values
-- (Users will update their overrides instead)
CREATE POLICY "Users can read all shop items"
  ON shop_items FOR SELECT
  TO authenticated
  USING (true);

SELECT 'Per-user overrides tables created successfully!' as status;

