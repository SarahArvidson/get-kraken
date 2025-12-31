-- Convert all dollar_amount and dollar_total fields from numeric to integer
-- This prevents decimal values and eliminates frontend dollar-precision bugs
-- Run this in Supabase SQL Editor

-- Convert goals.dollar_amount
ALTER TABLE goals
ALTER COLUMN dollar_amount TYPE integer
USING floor(COALESCE(dollar_amount, 0));

-- Convert quests.dollar_amount
ALTER TABLE quests
ALTER COLUMN dollar_amount TYPE integer
USING floor(COALESCE(dollar_amount, 0));

-- Convert shop_items.dollar_amount
ALTER TABLE shop_items
ALTER COLUMN dollar_amount TYPE integer
USING floor(COALESCE(dollar_amount, 0));

-- Convert user_quest_overrides.dollar_amount
ALTER TABLE user_quest_overrides
ALTER COLUMN dollar_amount TYPE integer
USING floor(COALESCE(dollar_amount, 0));

-- Convert user_shop_item_overrides.dollar_amount
ALTER TABLE user_shop_item_overrides
ALTER COLUMN dollar_amount TYPE integer
USING floor(COALESCE(dollar_amount, 0));

-- Convert wallets.dollar_total
ALTER TABLE wallets
ALTER COLUMN dollar_total TYPE integer
USING floor(COALESCE(dollar_total, 0));

-- Verify the changes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE column_name IN ('dollar_amount', 'dollar_total')
  AND table_schema = 'public'
ORDER BY table_name, column_name;

