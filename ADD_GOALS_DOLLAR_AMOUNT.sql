-- Add dollar_amount column to goals table
-- Run this in your Supabase SQL editor to enable dollar amount tracking for goals

ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS dollar_amount DECIMAL(10, 2) DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN goals.dollar_amount IS 'Optional dollar amount target for the goal';

