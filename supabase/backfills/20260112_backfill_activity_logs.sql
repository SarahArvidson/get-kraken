-- Get Kraken v2 - Backfill activity_logs from historical quest_logs and shop_logs
-- 
-- This script backfills activity_logs table with historical data from quest_logs and shop_logs
-- It includes guards to prevent duplicate rows
-- 
-- Run this once to populate activity_logs with existing historical data
-- Safe to run multiple times - will not create duplicates

-- Backfill quest completions from quest_logs
INSERT INTO activity_logs (
  user_id,
  quest_id,
  action_type,
  logged_at,
  created_at
)
SELECT DISTINCT
  ql.user_id,
  ql.quest_id,
  'quest_complete'::text,
  ql.completed_at,
  ql.completed_at
FROM quest_logs ql
WHERE NOT EXISTS (
  -- Guard: Only insert if this quest completion doesn't already exist in activity_logs
  SELECT 1
  FROM activity_logs al
  WHERE al.user_id = ql.user_id
    AND al.quest_id = ql.quest_id
    AND al.action_type = 'quest_complete'
    AND al.logged_at = ql.completed_at
)
AND ql.user_id IS NOT NULL
AND ql.quest_id IS NOT NULL;

-- Backfill reward purchases from shop_logs
INSERT INTO activity_logs (
  user_id,
  reward_id,
  action_type,
  logged_at,
  created_at
)
SELECT DISTINCT
  sl.user_id,
  sl.shop_item_id,
  'reward_purchase'::text,
  sl.purchased_at,
  sl.purchased_at
FROM shop_logs sl
WHERE NOT EXISTS (
  -- Guard: Only insert if this purchase doesn't already exist in activity_logs
  SELECT 1
  FROM activity_logs al
  WHERE al.user_id = sl.user_id
    AND al.reward_id = sl.shop_item_id
    AND al.action_type = 'reward_purchase'
    AND al.logged_at = sl.purchased_at
)
AND sl.user_id IS NOT NULL
AND sl.shop_item_id IS NOT NULL;

-- Optional: Enrich quest completions with sand_dollars_earned from quests table
UPDATE activity_logs al
SET sand_dollars_earned = q.reward
FROM quests q
WHERE al.quest_id = q.id
  AND al.action_type = 'quest_complete'
  AND al.sand_dollars_earned IS NULL;
