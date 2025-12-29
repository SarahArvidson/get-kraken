-- Kibblings Database Migration: Replace photo_url with tags (array)
-- Run this SQL in your Supabase SQL editor to migrate from photo_url to tags array system
-- Date: 2025-01-XX

-- Step 1: Add tags column to quests table (as TEXT array)
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Step 2: Add tags column to shop_items table (as TEXT array)
ALTER TABLE shop_items 
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Step 3: Migrate existing single tag to tags array (if tag column exists)
-- This handles migration from single tag to tags array
DO $$
BEGIN
  -- Migrate quests
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quests' AND column_name = 'tag') THEN
    UPDATE quests 
    SET tags = CASE 
      WHEN tag IS NOT NULL THEN ARRAY[tag]
      ELSE '{}'
    END
    WHERE tags = '{}' OR tags IS NULL;
  END IF;

  -- Migrate shop_items
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shop_items' AND column_name = 'tag') THEN
    UPDATE shop_items 
    SET tags = CASE 
      WHEN tag IS NOT NULL THEN ARRAY[tag]
      ELSE '{}'
    END
    WHERE tags = '{}' OR tags IS NULL;
  END IF;
END $$;

-- Step 4: Remove old single tag column if it exists
ALTER TABLE quests DROP COLUMN IF EXISTS tag;
ALTER TABLE shop_items DROP COLUMN IF EXISTS tag;

-- Step 5: Remove photo_url column from quests table
-- Note: This will permanently delete any existing photo URLs
-- If you want to keep the data, export it first or comment out this line
ALTER TABLE quests 
DROP COLUMN IF EXISTS photo_url;

-- Step 6: Remove photo_url column from shop_items table
-- Note: This will permanently delete any existing photo URLs
-- If you want to keep the data, export it first or comment out this line
ALTER TABLE shop_items 
DROP COLUMN IF EXISTS photo_url;

-- Step 7: Create GIN index on tags array for better query performance
CREATE INDEX IF NOT EXISTS idx_quests_tags ON quests USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shop_items_tags ON shop_items USING GIN(tags);

-- Migration complete!
-- All existing quests and shop items will have tags = '{}' (empty array, no categories)
-- You can update them through the app's edit interface to add multiple tags

