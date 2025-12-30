-- Fix Goals RLS Policies
-- Run this in Supabase SQL Editor to fix goals creation and deletion

-- Step 1: Add user_id column to goals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'goals' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE goals 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 2: Make user_id NOT NULL (but first handle any NULL values)
-- Delete any goals without user_id (orphaned goals)
DELETE FROM goals WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE goals ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Add index for user_id for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);

-- Step 4: Drop all existing policies on goals table to prevent conflicts
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN (SELECT policyname FROM pg_policies WHERE tablename = 'goals')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_name || '" ON goals;';
    END LOOP;
END
$$;

-- Step 5: Enable RLS on goals table
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Step 6: Create new RLS policies with proper user isolation
CREATE POLICY "Users can read their own goals" 
  ON goals FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals" 
  ON goals FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals" 
  ON goals FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals" 
  ON goals FOR DELETE 
  TO authenticated 
  USING (user_id = auth.uid());

-- Final status report
SELECT 'Goals RLS policies applied successfully for user isolation.' as status;

