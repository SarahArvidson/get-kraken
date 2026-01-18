-- Add description, include_tasks, and include_habits columns to user_quest_overrides table
-- This allows users to add descriptions to quests and control task/habit visibility
-- (both seeded and user-created quests)

ALTER TABLE user_quest_overrides
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS include_tasks BOOLEAN,
ADD COLUMN IF NOT EXISTS include_habits BOOLEAN;

-- Force PostgREST schema cache refresh
NOTIFY pgrst, 'reload schema';
