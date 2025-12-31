-- Check if quest_logs table has user_id column
-- Run this to verify the schema

-- Check if user_id column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quest_logs'
ORDER BY ordinal_position;

-- Check if shop_logs table has user_id column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'shop_logs'
ORDER BY ordinal_position;

-- Check RLS policies on quest_logs
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'quest_logs';

-- Check RLS policies on shop_logs
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'shop_logs';

