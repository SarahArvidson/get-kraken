-- Get Kraken v2 - Add Quest Status Column
-- Adds status column to quests table to replace quest_runs abstraction

-- Add status column with default 'idle'
ALTER TABLE quests
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'idle';

-- Add check constraint to ensure valid status values
ALTER TABLE quests
ADD CONSTRAINT quest_status_check CHECK (status IN ('idle', 'active', 'completed'));

-- Backfill existing quests based on quest_runs
-- If a quest has an active quest_run, set status to 'active'
-- If a quest has completed quest_runs but no active one, set status to 'completed'
-- Otherwise, set to 'idle'
UPDATE quests
SET status = CASE
  WHEN EXISTS (
    SELECT 1 FROM quest_runs
    WHERE quest_runs.quest_id = quests.id
    AND quest_runs.completed_at IS NULL
  ) THEN 'active'
  WHEN EXISTS (
    SELECT 1 FROM quest_runs
    WHERE quest_runs.quest_id = quests.id
    AND quest_runs.completed_at IS NOT NULL
  ) THEN 'completed'
  ELSE 'idle'
END;

-- Create index for efficient filtering by status
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
