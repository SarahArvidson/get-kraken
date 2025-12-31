-- Allow Users to Edit and Delete Seeded Quests (Per-User)
-- Run this in Supabase SQL Editor

-- Step 1: Extend user_quest_overrides to include name and tags
ALTER TABLE user_quest_overrides
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Step 2: Create user_hidden_quests table to track which quests users have hidden
CREATE TABLE IF NOT EXISTS user_hidden_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, quest_id)
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_hidden_quests_user_id ON user_hidden_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hidden_quests_quest_id ON user_hidden_quests(quest_id);

-- Step 4: Enable RLS on user_hidden_quests
ALTER TABLE user_hidden_quests ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies for user_hidden_quests (drop if exists first)
DROP POLICY IF EXISTS "Users can read their own hidden quests" ON user_hidden_quests;
DROP POLICY IF EXISTS "Users can create their own hidden quests" ON user_hidden_quests;
DROP POLICY IF EXISTS "Users can delete their own hidden quests" ON user_hidden_quests;

CREATE POLICY "Users can read their own hidden quests"
  ON user_hidden_quests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own hidden quests"
  ON user_hidden_quests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own hidden quests"
  ON user_hidden_quests FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Step 6: Do the same for shop items
ALTER TABLE user_shop_item_overrides
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE TABLE IF NOT EXISTS user_hidden_shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, shop_item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_hidden_shop_items_user_id ON user_hidden_shop_items(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hidden_shop_items_item_id ON user_hidden_shop_items(shop_item_id);

ALTER TABLE user_hidden_shop_items ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Users can read their own hidden shop items" ON user_hidden_shop_items;
DROP POLICY IF EXISTS "Users can create their own hidden shop items" ON user_hidden_shop_items;
DROP POLICY IF EXISTS "Users can delete their own hidden shop items" ON user_hidden_shop_items;

CREATE POLICY "Users can read their own hidden shop items"
  ON user_hidden_shop_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own hidden shop items"
  ON user_hidden_shop_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own hidden shop items"
  ON user_hidden_shop_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

SELECT 'Seeded quest editing tables created successfully!' as status;

