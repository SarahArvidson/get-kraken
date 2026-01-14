-- Get Kraken v2 - Extend Goals Model
-- Adds description, sand_dollars, dollars, reward_item_id, and share_mode to goals table

-- Rename target_amount to sand_dollars if it exists, otherwise add it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'target_amount') THEN
    ALTER TABLE goals RENAME COLUMN target_amount TO sand_dollars;
  ELSE
    ALTER TABLE goals ADD COLUMN sand_dollars INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add description column
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS description TEXT;

-- Rename dollar_amount to dollars if it exists, otherwise add it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'dollar_amount') THEN
    ALTER TABLE goals RENAME COLUMN dollar_amount TO dollars;
  ELSE
    ALTER TABLE goals ADD COLUMN dollars DECIMAL(10, 2) DEFAULT NULL;
  END IF;
END $$;

-- Add reward_item_id column (references shop_items)
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS reward_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Add share_mode column (private, copyable, co-op)
ALTER TABLE goals
ADD COLUMN IF NOT EXISTS share_mode TEXT NOT NULL DEFAULT 'private' CHECK (share_mode IN ('private', 'copyable', 'co-op'));

-- Create index for reward_item_id
CREATE INDEX IF NOT EXISTS idx_goals_reward_item_id ON goals(reward_item_id) WHERE reward_item_id IS NOT NULL;
