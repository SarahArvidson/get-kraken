-- Diagnostic Query to Check User Isolation
-- Run this in Supabase SQL Editor to see which users can see which quests

-- Check all quests and their creators
SELECT 
  id,
  name,
  created_by,
  CASE 
    WHEN created_by IS NULL THEN 'Seeded (visible to all)'
    ELSE 'User-created'
  END as quest_type,
  created_at
FROM quests
ORDER BY created_by NULLS FIRST, name;

-- Check which users exist
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- Test: Check what a specific user should see
-- Replace 'USER_ID_HERE' with an actual user ID from above
-- SELECT 
--   id,
--   name,
--   created_by,
--   CASE 
--     WHEN created_by IS NULL THEN 'Seeded - Should be visible'
--     WHEN created_by = 'USER_ID_HERE' THEN 'Own quest - Should be visible'
--     ELSE 'Other user quest - Should NOT be visible'
--   END as visibility_status
-- FROM quests
-- WHERE created_by IS NULL OR created_by = 'USER_ID_HERE'
-- ORDER BY name;

-- Check current RLS policies on quests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'quests'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'quests';

