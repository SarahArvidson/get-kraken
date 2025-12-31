-- Diagnostic script to check why quest completion is failing
-- Run this in Supabase SQL Editor

-- 1. Check if user_id column exists in quest_logs
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quest_logs' AND column_name = 'user_id'
    ) THEN '✅ user_id column exists'
    ELSE '❌ user_id column MISSING - Run FIX_USER_ISOLATION.sql'
  END as quest_logs_user_id_status;

-- 2. Check if user_id column exists in shop_logs
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'shop_logs' AND column_name = 'user_id'
    ) THEN '✅ user_id column exists'
    ELSE '❌ user_id column MISSING - Run FIX_USER_ISOLATION.sql'
  END as shop_logs_user_id_status;

-- 3. Check RLS policies
SELECT 
  tablename,
  policyname,
  cmd as operation,
  roles
FROM pg_policies
WHERE tablename IN ('quest_logs', 'shop_logs')
ORDER BY tablename, policyname;

-- 4. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('quest_logs', 'shop_logs');

