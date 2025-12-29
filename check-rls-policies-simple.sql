-- Simple check for RLS policies
-- Copy and paste this entire block into Supabase SQL Editor

SELECT tablename, policyname, cmd, roles
FROM pg_policies 
WHERE tablename IN ('quests', 'shop_items');

