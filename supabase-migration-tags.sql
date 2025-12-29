-- Kibblings Database Migration: Replace photo_url with tag
-- Run this SQL in your Supabase SQL editor to migrate from photo_url to tag system
-- Date: 2025-01-XX

-- Step 1: Add tag column to quests table
ALTER TABLE quests 
ADD COLUMN IF NOT EXISTS tag TEXT CHECK (tag IN ('work', 'finance', 'home', 'health', 'relationship') OR tag IS NULL);

-- Step 2: Add tag column to shop_items table
ALTER TABLE shop_items 
ADD COLUMN IF NOT EXISTS tag TEXT CHECK (tag IN ('work', 'finance', 'home', 'health', 'relationship') OR tag IS NULL);

-- Step 3: Remove photo_url column from quests table
-- Note: This will permanently delete any existing photo URLs
-- If you want to keep the data, export it first or comment out this line
ALTER TABLE quests 
DROP COLUMN IF EXISTS photo_url;

-- Step 4: Remove photo_url column from shop_items table
-- Note: This will permanently delete any existing photo URLs
-- If you want to keep the data, export it first or comment out this line
ALTER TABLE shop_items 
DROP COLUMN IF EXISTS photo_url;

-- Step 5: Create index on tag for better query performance
CREATE INDEX IF NOT EXISTS idx_quests_tag ON quests(tag);
CREATE INDEX IF NOT EXISTS idx_shop_items_tag ON shop_items(tag);

-- Migration complete!
-- All existing quests and shop items will have tag = NULL (no category)
-- You can update them through the app's edit interface

