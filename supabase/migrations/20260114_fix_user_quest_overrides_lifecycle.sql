-- Fix user_quest_overrides lifecycle schema
-- Add missing lifecycle columns that were referenced but not created
-- This migration ensures the schema matches what the frontend expects

-- Add columns if they don't exist (idempotent)
alter table public.user_quest_overrides
  add column if not exists status text,
  add column if not exists completion_count integer,
  add column if not exists completed_at timestamptz,
  add column if not exists reward_rarity text;

-- Set defaults for existing NULL values
update public.user_quest_overrides
set status = 'idle'
where status is null;

update public.user_quest_overrides
set completion_count = 0
where completion_count is null;

update public.user_quest_overrides
set reward_rarity = 'common'
where reward_rarity is null;

-- Now set column defaults for future inserts
alter table public.user_quest_overrides
  alter column status set default 'idle',
  alter column completion_count set default 0,
  alter column reward_rarity set default 'common';

-- Add check constraints (drop first to avoid conflicts)
alter table public.user_quest_overrides
  drop constraint if exists user_quest_overrides_status_check;

alter table public.user_quest_overrides
  add constraint user_quest_overrides_status_check
  check (status in ('idle', 'active', 'completed'));

alter table public.user_quest_overrides
  drop constraint if exists user_quest_overrides_reward_rarity_check;

alter table public.user_quest_overrides
  add constraint user_quest_overrides_reward_rarity_check
  check (reward_rarity in ('common', 'rare', 'epic', 'legendary'));

-- Force PostgREST schema cache refresh
notify pgrst, 'reload schema';
