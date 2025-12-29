-- Check RLS Policies for Quests and Shop Items
-- Run this to see what policies currently exist

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('quests', 'shop_items')
ORDER BY tablename, policyname;

