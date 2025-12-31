# Migrations Archive - Summary

## Files Moved to `migrations_archive/`

### FIX_*.sql Files (11 files)
1. `FIX_COMPLETE_USER_ISOLATION.sql`
2. `FIX_GOALS_RLS.sql`
3. `FIX_PER_USER_OVERRIDES.sql`
4. `FIX_QUEST_COMPLETION.sql`
5. `FIX_SEEDED_QUEST_EDITING.sql`
6. `FIX_SEEDING_COMPLETE.sql`
7. `FIX_SEEDING_NOW.sql`
8. `FIX_USER_ISOLATION_COMPLETE.sql`
9. `FIX_USER_ISOLATION.sql`
10. `FIX_WALLET_PER_USER.sql`
11. `FIX_WALLET_SCHEMA.sql`

### CHECK_*.sql Files (1 file)
1. `CHECK_QUEST_LOGS_SCHEMA.sql`

### DIAGNOSE_*.sql Files (2 files)
1. `DIAGNOSE_QUEST_ERROR.sql`
2. `DIAGNOSE_USER_ISOLATION.sql`

**Total: 14 files moved**

## Remaining SQL Files in Root

The following schema and policy SQL files remain in the root directory:

- `ADD_GOALS_DOLLAR_AMOUNT.sql` - Current schema migration
- `RE_ENABLE_RLS.sql` - Current RLS policy
- `SEED_WITH_RLS_DISABLED.sql` - Seeding utility
- `seed-data-direct.sql` - Seeding utility
- `SUPABASE_SETUP_COMPLETE.sql` - Current setup
- `supabase-allow-seeding.sql` - Current seeding policy
- `supabase-dollar-tracking-schema.sql` - Current schema
- `supabase-goals-schema.sql` - Current schema
- `supabase-migration-tags.sql` - Current schema
- `supabase-rls-policies.sql` - Current RLS policies
- `supabase-schema.sql` - Current schema
- `supabase-seed-policy.sql` - Current seeding policy
- `check-rls-policies-simple.sql` - Current utility
- `check-rls-policies.sql` - Current utility

## Confirmation

### SQL Contents Unchanged
✅ All files were moved using `move` command (filesystem operation only)
✅ No file contents were modified
✅ Files are intact in `migrations_archive/` directory

### Runtime Behavior Unaffected
✅ No imports or references to these files exist in the codebase
✅ No scripts reference these files
✅ These were historical patch/diagnostic files, not runtime dependencies
✅ Current schema and policy files remain in root and are unchanged

### Repository Clarity Restored
✅ Root directory now contains only current, intended schema and policy files
✅ Historical patch files are organized in `migrations_archive/` for reference
✅ Clear separation between current schema and historical patches

