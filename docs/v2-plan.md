# Get Kraken v2.0 Build Plan

**Branch:** v2  
**Date:** 2024  
**Status:** Phase 0 - Planning Complete

## Executive Summary

This document outlines the plan for upgrading Get Kraken from v1 to v2, focusing on a calm, uncluttered, mobile-first UI with expanded features while preserving production stability and existing user data.

---

## Phase 0: Forensic Audit Results

### Current Architecture Summary

#### UI Structure (v1)
- **Navigation Model:** Tab-based navigation with three views:
  - `quests` - Quest library with search, filters, and cards
  - `shop` - Rewards/shop items library
  - `progress` - Gamification panel with streaks, weekly recap, milestones, goals
- **Header:** Logo, title, subtitle, dollar toggle, logout button
- **Wallet Display:** Prominent treasure chest card showing sand dollars (and optionally dollars)
- **View Switching:** Uses `localStorage` to persist current view, CSS `hidden` class to show/hide views
- **No Routing:** Single-page app with view state management

#### Component Tree
```
App.tsx
├── BubbleBackground (fixed, z-0)
├── Header (sticky, z-20)
│   ├── Logo (kraken-icon.png)
│   ├── Title + Subtitle
│   └── Dollar Toggle + Logout
├── WalletDisplay (treasure chest card)
├── NavigationTabs (quests/shop/progress tabs)
├── View Components (conditionally rendered via hidden class)
│   ├── QuestsView
│   ├── ShopView
│   └── ProgressView (wraps GamificationPanel)
├── Modals/Overlays
│   ├── LogView (quest/shop logs)
│   ├── EditQuestCard
│   ├── EditShopItemCard
│   └── PopupModal (feature updates, about)
└── Footer
```

#### State Management
- **Hooks-based:** Custom hooks for data fetching and state
  - `useQuests()` - Quest CRUD, logs, real-time subscriptions
  - `useShopItems()` - Shop item CRUD, logs, real-time subscriptions
  - `useWallet()` - Wallet state, real-time sync, mutation guards
  - `usePreferences()` - User preferences (dollar amounts toggle)
  - `useQuestOverrides()` - Per-user quest customization
  - `useShopItemOverrides()` - Per-user shop item customization
  - `useGamification()` - Streaks, weekly recap, milestones
  - `useGoals()` - Custom user goals
- **Real-time:** Supabase subscriptions for wallets, quests, shop items
- **Mutation Guards:** Prevents echo loops from real-time updates

#### Supabase Client Usage
- Uses `@ffx/sdk` SupabaseIntegration wrapper
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Auth: Supabase Auth with session persistence

#### Existing Supabase Tables

**Core Tables:**
1. **wallets**
   - `user_id` (UUID, PRIMARY KEY, references auth.users)
   - `id` (TEXT, nullable)
   - `total` (INTEGER) - sand dollars
   - `dollar_total` (DECIMAL(10,2)) - real dollars
   - `updated_at` (TIMESTAMPTZ)

2. **quests**
   - `id` (UUID, PRIMARY KEY)
   - `name` (TEXT)
   - `tags` (TEXT[])
   - `reward` (INTEGER) - sand dollars per completion
   - `dollar_amount` (DECIMAL(10,2)) - real dollars saved
   - `completion_count` (INTEGER)
   - `created_by` (UUID, nullable, references auth.users) - NULL for seeded quests
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

3. **quest_logs**
   - `id` (UUID, PRIMARY KEY)
   - `quest_id` (UUID, references quests)
   - `user_id` (UUID, references auth.users)
   - `completed_at` (TIMESTAMPTZ)

4. **shop_items**
   - `id` (UUID, PRIMARY KEY)
   - `name` (TEXT)
   - `tags` (TEXT[])
   - `price` (INTEGER) - sand dollars cost
   - `dollar_amount` (DECIMAL(10,2)) - real dollars spent
   - `purchase_count` (INTEGER)
   - `created_by` (UUID, nullable, references auth.users) - NULL for seeded items
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

5. **shop_logs**
   - `id` (UUID, PRIMARY KEY)
   - `shop_item_id` (UUID, references shop_items)
   - `user_id` (UUID, references auth.users)
   - `purchased_at` (TIMESTAMPTZ)

6. **goals**
   - `id` (UUID, PRIMARY KEY)
   - `user_id` (UUID, references auth.users)
   - `name` (TEXT)
   - `target_amount` (INTEGER)
   - `dollar_amount` (DECIMAL(10,2), nullable)
   - `is_completed` (BOOLEAN)
   - `completed_at` (TIMESTAMPTZ, nullable)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

**User Preference Tables:**
7. **user_preferences**
   - `id` (UUID, PRIMARY KEY)
   - `user_id` (UUID, UNIQUE, references auth.users)
   - `show_dollar_amounts` (BOOLEAN, default false)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

8. **user_quest_overrides** (per-user quest customization)
9. **user_shop_item_overrides** (per-user shop item customization)
10. **user_hidden_quests** (user-specific quest visibility)
11. **user_hidden_shop_items** (user-specific shop item visibility)

**RLS Policies:** All tables have RLS enabled with strict user isolation. Users can:
- Read seeded quests/items (created_by IS NULL) and their own
- Only modify their own data (quests, items, logs, wallet, goals, preferences)

#### Theme & Styling
- **Framework:** Tailwind CSS v4.1.18
- **Dark Mode:** Class-based (`dark:` prefix)
- **Bubble Background:** CSS animations in `index.css`, 10 bubbles with varying sizes/durations
- **Color Palette:**
  - Light mode: Blues (blue-50, blue-100, blue-200), amber for treasure chest
  - Dark mode: Grays (gray-800, gray-900), amber accents
  - Custom header text color: `oklch(0.79 0.11 264.93)` in dark mode
- **Icons:**
  - Kraken icon: `/kraken-icon.png`
  - Sea dollar icon: `/sea-dollar.svg`
- **Contrast:** Custom CSS ensures adequate contrast in both modes
- **Mobile-First:** Extensive responsive styles in `index.css` for screens ≤375px

#### Netlify Deployment
- **Config:** `netlify.toml`
- **Build Command:** `npm install && npm run build`
- **Publish:** `dist/`
- **Node Version:** 20
- **No Routing:** Single-page app, no redirect rules needed

---

## Proposed Routes and Navigation Model

### Decision: Add Lightweight Routing

**Rationale:** While v1 uses view state, v2 needs:
- Direct links to Quests, Rewards, Calendar, Settings
- Browser back/forward support
- Shareable URLs
- Cleaner separation of concerns

**Routing Library:** React Router (or similar lightweight option). Since we're already using React 19, we'll add `react-router-dom`.

### Proposed Routes

```
/ (Home)
  ├── /quests (Quests Library)
  │   └── /quests/:id (Quest Detail - overlay/drawer)
  ├── /rewards (Rewards Library)
  │   └── /rewards/:id (Reward Detail - overlay/drawer)
  ├── /calendar (Full Calendar View)
  │   └── /calendar/:date? (Day/Week/Month/Year view)
  ├── /settings (Settings Page)
  └── /how-to-use (How to Use - content page)
```

### Navigation Model

**Mobile:**
- Hamburger menu (drawer or full-screen overlay)
- Menu items: Home, Quests, Rewards, Calendar, Settings, How to use
- Smooth transitions, no jarring page loads

**Desktop:**
- Same hamburger menu (or convert to sidebar if space allows)
- Maintain calm, uncluttered feel

**Home Page Layout (Vertical, Top to Bottom):**
1. Header row (icon, title/subtitle, hamburger)
2. Treasure chest card (full width, clickable → wallet drilldown)
3. Two large cards row (Quests 50%, Rewards 50%)
4. Tide Chart section (full width, progress summary)
5. Calendar preview section (full width, clickable → full calendar)

---

## Proposed Data Model Changes

### New Tables

#### 1. `activity_logs` (Unified Timeline for Calendar)
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'quest_completion', 'habit_log', 'shop_purchase', 'quest_start', 'quest_abandon'
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  shop_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL, -- for future habit tracking
  quest_run_id UUID REFERENCES quest_runs(id) ON DELETE SET NULL, -- for quest runs
  metadata JSONB, -- flexible storage for activity-specific data
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_activity_logs_user_occurred (user_id, occurred_at DESC),
  INDEX idx_activity_logs_type (activity_type)
);
```

**Purpose:** Unified timeline for calendar view, supports all activity types.

#### 2. `quest_runs` (Quest Instance Tracking for Repeatability)
```sql
CREATE TABLE quest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  target_completion_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_quest_runs_user_quest (user_id, quest_id),
  INDEX idx_quest_runs_status (user_id, status)
);
```

**Purpose:** Track individual quest instances, enabling users to repeat completed quests while preserving history.

#### 3. `habits` (Habit Definitions Linked to Quests)
```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL, -- optional link to quest
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_habits_user (user_id),
  INDEX idx_habits_quest (quest_id)
);
```

**Purpose:** Track habits that can be linked to quests, with logging flow (difficulty, dollars saved).

#### 4. `habit_logs` (Habit Logging with Difficulty and Dollars)
```sql
CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  quest_run_id UUID REFERENCES quest_runs(id) ON DELETE SET NULL, -- link to quest run if applicable
  difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 10),
  saved_money BOOLEAN NOT NULL DEFAULT false,
  dollars_saved DECIMAL(10,2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_habit_logs_user_habit (user_id, habit_id),
  INDEX idx_habit_logs_logged_at (user_id, logged_at DESC)
);
```

**Purpose:** Store habit logs with difficulty rating and optional dollar tracking.

#### 5. `quest_tasks` (Non-Habit Tasks for Quests)
```sql
CREATE TABLE quest_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- user who created/owns this task
  name TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_quest_tasks_quest (quest_id, user_id),
  INDEX idx_quest_tasks_user (user_id)
);
```

**Purpose:** Track non-habit tasks within quests (checklist items).

#### 6. Social Tables (Soft Launch, Beta Only)

**6a. `friendships`**
```sql
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id),
  INDEX idx_friendships_user (user_id, status),
  INDEX idx_friendships_friend (friend_id, status)
);
```

**6b. `shared_quests` (Buddy-Up Quests)**
```sql
CREATE TABLE shared_quests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_completion_date TIMESTAMPTZ,
  rarity TEXT, -- 'common', 'rare', 'epic', 'legendary'
  associated_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_shared_quests_created_by (created_by),
  INDEX idx_shared_quests_status (status)
);
```

**6c. `shared_quest_members` (Multi-User Participation)**
```sql
CREATE TABLE shared_quest_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_quest_id UUID NOT NULL REFERENCES shared_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(shared_quest_id, user_id),
  INDEX idx_shared_quest_members_quest (shared_quest_id),
  INDEX idx_shared_quest_members_user (user_id)
);
```

**6d. `shared_quest_logs` (Multi-User Logs with Attribution)**
```sql
CREATE TABLE shared_quest_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shared_quest_id UUID NOT NULL REFERENCES shared_quests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  saved_money BOOLEAN,
  dollars_saved DECIMAL(10,2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_shared_quest_logs_quest (shared_quest_id, logged_at DESC),
  INDEX idx_shared_quest_logs_user (user_id)
);
```

**6e. `encouragement_messages` (Social Encouragement)**
```sql
CREATE TABLE encouragement_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_quest_id UUID REFERENCES shared_quests(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_encouragement_to_user (to_user_id, created_at DESC),
  INDEX idx_encouragement_from_user (from_user_id)
);
```

### New Columns on Existing Tables

#### `quests` table additions:
```sql
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS target_completion_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  ADD COLUMN IF NOT EXISTS associated_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_repeatable BOOLEAN NOT NULL DEFAULT true;
```

#### `shop_items` table additions:
```sql
ALTER TABLE shop_items
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT false;
```

#### `user_preferences` table additions:
```sql
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS show_sand_dollars BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  ADD COLUMN IF NOT EXISTS enable_social_features BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS username TEXT, -- visible to friends
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
```

#### `quest_logs` table additions:
```sql
ALTER TABLE quest_logs
  ADD COLUMN IF NOT EXISTS quest_run_id UUID REFERENCES quest_runs(id) ON DELETE SET NULL;
```

#### `shop_logs` table additions:
```sql
-- No new columns needed for v2, but ensure timezone handling in queries
```

### RLS Policies for New Tables

All new tables must have RLS enabled with user isolation:
- Users can only see/modify their own records
- Shared quests: members can see the shared quest and all member logs
- Friendships: bidirectional visibility (user can see if they're friend or if friend_id matches)
- Activity logs: user-isolated

---

## Migration Approach

### Migration Files Location
Create `/migrations` directory at repo root (parallel to `src/`).

### Migration Strategy

**Principle:** All migrations must be:
1. **Additive only** - no dropping columns/tables that might have data
2. **Backward compatible** - v1 code should continue working during transition
3. **Idempotent** - safe to run multiple times (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`)
4. **User-isolated** - all new tables have proper RLS from the start

### Migration Files

#### `migrations/001_add_quest_v2_fields.sql`
- Add new columns to `quests` table (description, target_completion_date, rarity, associated_item_id, is_starred, is_repeatable)
- All columns nullable or have defaults to preserve existing data

#### `migrations/002_add_shop_item_v2_fields.sql`
- Add new columns to `shop_items` table (description, rarity, is_starred)

#### `migrations/003_add_user_preferences_v2_fields.sql`
- Add new columns to `user_preferences` table (show_sand_dollars, theme, enable_social_features, username, timezone)

#### `migrations/004_create_activity_logs.sql`
- Create `activity_logs` table with RLS
- Create indexes
- Backfill: Create activity_logs from existing quest_logs and shop_logs (optional, can be done incrementally)

#### `migrations/005_create_quest_runs.sql`
- Create `quest_runs` table with RLS
- Add `quest_run_id` to `quest_logs`
- Backfill: Create initial quest_run for each user's existing quest completions (optional)

#### `migrations/006_create_habits_and_logs.sql`
- Create `habits` and `habit_logs` tables with RLS
- Create indexes

#### `migrations/007_create_quest_tasks.sql`
- Create `quest_tasks` table with RLS
- Create indexes

#### `migrations/008_create_social_tables.sql`
- Create all social tables (friendships, shared_quests, shared_quest_members, shared_quest_logs, encouragement_messages)
- Create RLS policies
- Create indexes
- **Note:** These tables exist but are only accessible when `enable_social_features = true` in user preferences

#### `migrations/009_add_quest_run_id_to_quest_logs.sql`
- Add `quest_run_id` column to `quest_logs` (if not already in 005)

### Migration Execution

**For Development:**
1. Run migrations manually in Supabase SQL Editor
2. Or create a migration runner script (optional)

**For Production:**
1. Document migration order in README
2. Provide SQL files for manual execution
3. Test migrations on staging first

**Validation:**
- After each migration, verify:
  - Tables created with correct schema
  - RLS policies active
  - Existing data intact
  - v1 app still functions

---

## Rollout Plan with Checkpoints

### Phase 1: Navigation and Layout Foundation ✅ (Next)

**Goal:** Implement new Home page layout and hamburger menu navigation.

**Tasks:**
1. Install routing library (react-router-dom)
2. Create new Home page component with vertical layout:
   - Header row (icon, title/subtitle, hamburger)
   - Treasure chest card (clickable → wallet drilldown)
   - Two large cards (Quests, Rewards)
   - Tide Chart section
   - Calendar preview section
3. Implement hamburger menu (drawer/overlay)
4. Create placeholder pages: Quests, Rewards, Calendar, Settings, How to Use
5. Update App.tsx to use routing
6. Ensure mobile-first responsive design
7. Preserve existing functionality (wallet, quests, shop, progress)

**Checkpoint 1.1:** Home page renders with new layout, hamburger menu works
**Checkpoint 1.2:** Routing works, all placeholder pages accessible
**Checkpoint 1.3:** Mobile-first design verified on small screens
**Checkpoint 1.4:** Typecheck and build pass
**Checkpoint 1.5:** Existing v1 features still work (wallet, quest completion, shop purchase)

**Commit:** `feat(v2): Phase 1 - Navigation and layout foundation`

---

### Phase 2: Quests Library and Quest Detail

**Goal:** Build full quests library page and quest detail view with new features.

**Tasks:**
1. Create Quests library page with:
   - Search bar
   - Filters (tag, recently completed, recently logged, shared, created this week, rarity, starred)
   - Alphabetical organization cue
   - Create quest button
   - Edit quest flow
   - Quick log progress for active quests
2. Create quest create/edit form with:
   - Name, star toggle (⭐)
   - Description (optional)
   - Tasks list (non-habit tasks)
   - Linked habits list
   - Habit logging flow (difficulty 1-10, saved money yes/no, amount)
   - Autofill previous answers per habit per user
   - Target completion date
   - Rarity selection
   - Associated item selection
3. Create quest detail view with:
   - Tasks and habits display
   - Rewards section (prominent)
   - "End Quest and Claim Rewards" button
   - "Abandon and delete" option with prompts
   - Repeat quest functionality ("Start again")
4. Implement quest runs for repeatability
5. Apply migrations 001, 004, 005, 006, 007

**Checkpoint 2.1:** Quests library page functional with search and filters
**Checkpoint 2.2:** Quest create/edit form works with all new fields
**Checkpoint 2.3:** Quest detail view shows rewards and actions
**Checkpoint 2.4:** Quest runs work for repeating quests
**Checkpoint 2.5:** Typecheck and build pass
**Checkpoint 2.6:** Existing quest data preserved and visible

**Commit:** `feat(v2): Phase 2 - Quests library and quest detail`

---

### Phase 3: Rewards Library and Shop Behavior

**Goal:** Build rewards library page with similar UX to quests.

**Tasks:**
1. Create Rewards library page with:
   - Search bar
   - Filters (tag, rarity, starred, recently purchased)
   - Alphabetical organization cue
   - Create reward button
   - Edit reward flow
   - Recent purchases highlight area (optional, calm)
2. Link quest-associated items to rewards shop
3. Allow users to dissociate items and change item type
4. Apply migration 002

**Checkpoint 3.1:** Rewards library page functional
**Checkpoint 3.2:** Quest-associated items appear in shop
**Checkpoint 3.3:** Typecheck and build pass

**Commit:** `feat(v2): Phase 3 - Rewards library and shop behavior`

---

### Phase 4: Calendar and Activity Logging

**Goal:** Build full calendar experience with activity logging.

**Tasks:**
1. Create calendar summary on Home (minimal at rest)
2. Create full calendar page with:
   - Day view (list of entries, edit capability)
   - Week view (list cues, edit capability)
   - Month view (activity markers)
   - Year heatmap view
3. Implement activity logging:
   - Every habit log and quest completion creates activity_logs entry
   - Calendar shows colored squares for days with activity
   - Detail view shows quests and habit logs
   - Edit past entries
4. For buddy quests: show attribution per log entry
5. Apply migration 004 (activity_logs)

**Checkpoint 4.1:** Calendar summary on Home works
**Checkpoint 4.2:** Full calendar page with all views functional
**Checkpoint 4.3:** Activity logging creates entries correctly
**Checkpoint 4.4:** Editing past entries works
**Checkpoint 4.5:** Typecheck and build pass

**Commit:** `feat(v2): Phase 4 - Calendar and activity logging`

---

### Phase 5: Settings, Toggles, Export, Danger Zone

**Goal:** Build comprehensive settings page with all toggles and actions.

**Tasks:**
1. Create Settings page with:
   - Friends management (only if social beta enabled)
   - Export data to CSV
   - Toggle dollars on/off (preserve existing behavior)
   - Toggle sand dollars on/off (new)
   - Toggle light/dark mode
   - Change username (visible to friends)
   - Detailed stats about progress
   - Social beta toggle (default off)
2. Create Danger Zone section:
   - Reset wallet to zero (with confirmation)
   - Reset all progress (with confirmation)
3. Apply migration 003 (user_preferences v2 fields)

**Checkpoint 5.1:** Settings page functional with all toggles
**Checkpoint 5.2:** Dollars toggle fully hides dollars when off
**Checkpoint 5.3:** Export to CSV works
**Checkpoint 5.4:** Danger zone actions work with confirmations
**Checkpoint 5.5:** Typecheck and build pass

**Commit:** `feat(v2): Phase 5 - Settings, toggles, export, danger zone`

---

### Phase 6: Social System Soft Launch

**Goal:** Implement social features behind beta toggle.

**Tasks:**
1. Implement friends management:
   - Send friend request
   - Accept/decline requests
   - View friends list
   - Remove friend
2. Implement shared quests (buddy-up):
   - Create shared quest from existing quest
   - Invite friend to shared quest
   - Multi-user logging on shared quest
   - Attribution per log entry
   - Calendar shows shared quest logs with attribution
3. Implement quest copying:
   - Copy quest creates separate quest (no progress copied)
4. Implement encouragement messages (optional, can be Phase 7)
5. Apply migration 008 (social tables)
6. Ensure social features are fully hidden when `enable_social_features = false`

**Checkpoint 6.1:** Friends management works
**Checkpoint 6.2:** Shared quests work with multi-user logging
**Checkpoint 6.3:** Quest copying works correctly
**Checkpoint 6.4:** Social features hidden when toggle off
**Checkpoint 6.5:** Typecheck and build pass

**Commit:** `feat(v2): Phase 6 - Social system soft launch`

---

## Quality Gates and Acceptance Criteria

### No Regressions
- ✅ Login and auth work
- ✅ Existing users see their existing data
- ✅ Quest completion updates wallet
- ✅ Shop purchase updates wallet
- ✅ Progress view shows correct data
- ✅ Real-time subscriptions work

### UI/UX Quality
- ✅ Excellent contrast ratios in light and dark mode (WCAG AA minimum)
- ✅ Home is calm and uncluttered at rest
- ✅ Cards reveal detail only after click
- ✅ Mobile-first is excellent on very small screens (≤375px)
- ✅ Desktop layout feels intentionally designed (not just stretched mobile)

### Feature Completeness
- ✅ Dollars toggle fully hides dollars in UI when off (no deletion of data)
- ✅ Sand dollars toggle works
- ✅ Social system fully hidden unless social beta enabled
- ✅ Calendar supports editing past entries
- ✅ Buddy quests show attribution per log
- ✅ Copied quests do not include prior progress

### Technical Quality
- ✅ Typecheck passes (`tsc -b`)
- ✅ Build succeeds (`npm run build`)
- ✅ No console errors in production build
- ✅ All migrations are additive and safe
- ✅ RLS policies enforce user isolation

---

## Validation Without Breaking Existing Users

### Testing Strategy

1. **Local Development:**
   - Test with existing Supabase data (staging/development project)
   - Verify all v1 features still work
   - Test new features incrementally

2. **Staging Deployment:**
   - Deploy v2 to a staging Netlify site
   - Test with real user accounts (if available)
   - Verify migrations don't break existing data

3. **Production Rollout:**
   - Deploy to production branch (v2)
   - Monitor for errors
   - Rollback plan: revert to v1 if critical issues

### Data Validation Queries

After each migration, run:
```sql
-- Verify user isolation
SELECT COUNT(*) FROM quests WHERE created_by IS NOT NULL;
SELECT COUNT(*) FROM quest_logs WHERE user_id IS NOT NULL;

-- Verify new columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'quests' AND column_name IN ('description', 'rarity', 'is_starred');

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN ('quests', 'activity_logs', 'quest_runs');
```

---

## Decision Log

### Routing Decision
**Option A:** Keep view state (no routing)  
**Option B:** Add lightweight routing (react-router-dom)  
**Decision:** **Option B** - Routing provides better UX for v2 features (direct links, browser navigation, shareable URLs). The calm UI requirement is met through smooth transitions, not by avoiding routing.

### Quest Repeatability Model
**Option A:** Reuse same quest, track runs in logs  
**Option B:** Create quest_run table for instances  
**Decision:** **Option B** - Cleaner data model, preserves history, enables "Start again" flow without confusion.

### Social System Architecture
**Option A:** Fully integrated from start  
**Option B:** Soft launch behind toggle  
**Decision:** **Option B** - Matches requirements, allows gradual rollout, reduces risk.

### Calendar Activity Model
**Option A:** Query quest_logs and shop_logs directly  
**Option B:** Unified activity_logs table  
**Decision:** **Option B** - Better for calendar queries, supports future activity types, cleaner architecture.

---

## Next Steps

1. ✅ Complete Phase 0 (this document)
2. Begin Phase 1: Navigation and Layout Foundation
3. After Phase 1, review and adjust plan if needed
4. Continue with Phases 2-6 incrementally

---

## Notes

- All timestamps stored in UTC, rendered in user's local timezone
- Timezone handling: Use `user_preferences.timezone` or browser timezone
- Existing quest_logs and shop_logs remain; activity_logs is additive
- Quest runs are optional - existing quests without runs still work
- Social features are opt-in only (default off)

---

---

## Phase 2: Data Mapping (v1 Quest Data Structure)

### Current Supabase Tables Used by v1

#### `quests` table
- **id** (UUID, PRIMARY KEY)
- **name** (TEXT, NOT NULL)
- **tags** (TEXT[], DEFAULT '{}')
- **reward** (INTEGER, NOT NULL, DEFAULT 10) - sand dollars per completion
- **dollar_amount** (DECIMAL(10,2), DEFAULT 0) - real dollars saved per completion
- **completion_count** (INTEGER, NOT NULL, DEFAULT 0) - shared count (deprecated, per-user counts from logs)
- **created_by** (UUID, nullable) - NULL for seeded quests, user_id for user-created quests
- **created_at** (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- **updated_at** (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Query Pattern:**
```sql
SELECT * FROM quests 
WHERE (created_by IS NULL OR created_by = :user_id)
ORDER BY name ASC
```

#### `quest_logs` table
- **id** (UUID, PRIMARY KEY)
- **quest_id** (UUID, REFERENCES quests(id) ON DELETE CASCADE)
- **user_id** (UUID, REFERENCES auth.users(id) ON DELETE CASCADE)
- **completed_at** (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Query Pattern:**
```sql
SELECT * FROM quest_logs 
WHERE quest_id = :quest_id AND user_id = :user_id
ORDER BY completed_at DESC
```

#### `user_quest_overrides` table (per-user customization)
- **id** (UUID, PRIMARY KEY)
- **user_id** (UUID, REFERENCES auth.users(id))
- **quest_id** (UUID, REFERENCES quests(id))
- **name** (TEXT, nullable)
- **tags** (TEXT[], nullable)
- **reward** (INTEGER, nullable)
- **dollar_amount** (DECIMAL(10,2), nullable)
- **created_at** (TIMESTAMPTZ)
- **updated_at** (TIMESTAMPTZ)

**Purpose:** Allows users to customize seeded quests without modifying the base quest.

#### `user_hidden_quests` table
- **id** (UUID, PRIMARY KEY)
- **user_id** (UUID, REFERENCES auth.users(id))
- **quest_id** (UUID, REFERENCES quests(id))

**Purpose:** Tracks which seeded quests a user has hidden.

### Current Quest Data Flow (v1)

1. **Load Quests:**
   - Query `quests` table for seeded (created_by IS NULL) or user-created (created_by = user_id)
   - Merge with `user_quest_overrides` to get per-user customizations
   - Filter out quests in `user_hidden_quests`
   - Sort alphabetically by name

2. **Complete Quest:**
   - Insert into `quest_logs` with quest_id, user_id, completed_at
   - Atomically update `wallets` table (add reward to total, dollar_amount to dollar_total)

3. **Progress Tracking:**
   - Per-user completion count = COUNT(*) from `quest_logs` WHERE quest_id = X AND user_id = Y
   - No separate "progress" table - logs are the source of truth

### Missing Fields for v2 (Not in Current Schema)

The following fields are planned for v2 but do not exist yet:
- `description` (TEXT) - optional quest description
- `target_completion_date` (TIMESTAMPTZ) - optional target date
- `rarity` (TEXT) - enum: 'common', 'rare', 'epic', 'legendary'
- `associated_item_id` (UUID) - link to shop_items
- `is_starred` (BOOLEAN) - user's starred status
- `is_repeatable` (BOOLEAN) - whether quest can be repeated

**Note:** These will be added in future migrations. For Phase 2, we'll use UI-only state or local storage as temporary storage.

### Missing Tables for v2 (Not in Current Schema)

- `habits` - habit definitions
- `habit_logs` - habit logging with difficulty and dollars saved
- `quest_tasks` - non-habit tasks/checklist items
- `quest_runs` - quest instance tracking for repeatability
- `activity_logs` - unified timeline for calendar

**Note:** These will be created in future migrations. For Phase 2, we'll use temporary local storage or UI-only state.

### TypeScript Types for Phase 2

#### QuestSummary (List View)
```typescript
export interface QuestSummary {
  id: string;
  name: string;
  tags: Tag[];
  reward: number;
  dollar_amount: number;
  created_by: string | null;
  created_at: string;
  // Derived/computed fields
  userCompletionCount: number; // from quest_logs count
  isStarred: boolean; // from local storage or future is_starred column
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; // future field, optional for now
}
```

#### QuestDetail (Detail View)
```typescript
export interface QuestDetail extends QuestSummary {
  description?: string; // future field, optional for now
  target_completion_date?: string; // future field, optional for now
  associated_item_id?: string; // future field, optional for now
  is_repeatable: boolean; // future field, default true for now
  // Logs
  logs: QuestLog[]; // from quest_logs table
  // Placeholder fields (UI-only for Phase 2)
  habits?: HabitSummary[]; // temporary, local storage or UI-only
  tasks?: TaskSummary[]; // temporary, local storage or UI-only
  currentRun?: QuestRunSummary; // placeholder for future quest_runs
  pastRuns?: QuestRunSummary[]; // placeholder for future quest_runs
}

export interface HabitSummary {
  id: string; // temporary ID
  name: string;
  description?: string;
  // Recent log for autofill
  lastLog?: {
    difficulty: number;
    saved_money: boolean;
    dollars_saved?: number;
  };
}

export interface TaskSummary {
  id: string; // temporary ID
  name: string;
  description?: string;
  is_completed: boolean;
  order_index: number;
}

export interface QuestRunSummary {
  id: string; // placeholder
  started_at: string;
  completed_at?: string;
  abandoned_at?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}
```

### Data Derivation Strategy

1. **QuestSummary from Quest:**
   - Direct mapping from `quests` table
   - `userCompletionCount` = COUNT from `quest_logs` WHERE quest_id = id AND user_id = current_user
   - `isStarred` = read from localStorage key `quest_starred_${quest_id}` (temporary, until schema migration)
   - `rarity` = undefined for now (will be added in migration)

2. **QuestDetail from QuestSummary:**
   - Extend QuestSummary
   - Load `logs` from `quest_logs` table
   - Load `habits` from localStorage key `quest_habits_${quest_id}` (temporary)
   - Load `tasks` from localStorage key `quest_tasks_${quest_id}` (temporary)
   - `currentRun` and `pastRuns` = placeholder empty arrays for now

3. **Habit Logging Autofill:**
   - Read from localStorage key `habit_last_log_${habit_id}` (temporary)
   - Future: read from `habit_logs` table WHERE habit_id = X AND user_id = Y ORDER BY logged_at DESC LIMIT 1

### Gaps and Temporary Solutions

| Feature | Current State | Phase 2 Solution | Future Solution |
|---------|--------------|------------------|-----------------|
| Description | Not in schema | Optional field, UI-only | Add `description` column |
| Target date | Not in schema | Optional field, UI-only | Add `target_completion_date` column |
| Rarity | Not in schema | Optional field, UI-only | Add `rarity` column |
| Starred | Not in schema | localStorage | Add `is_starred` column or user_quest_overrides |
| Habits | No table | localStorage array | Create `habits` and `habit_logs` tables |
| Tasks | No table | localStorage array | Create `quest_tasks` table |
| Quest runs | No table | Placeholder UI | Create `quest_runs` table |
| Habit autofill | No table | localStorage | Query `habit_logs` table |

---

## Repeatable Quest Model Proposal

### Overview

The repeatable quest system allows users to complete the same quest multiple times while preserving history. This requires separating quest templates from quest instances (runs).

### Data Model

#### 1. `quest_templates` (Optional - Alternative Approach)

**Option A: Use existing `quests` table as templates**
- Keep `quests` table as-is (it already represents quest templates)
- Add `is_repeatable` boolean column (default true)
- When a quest is repeatable, users can start multiple runs

**Option B: Separate templates table**
- Create new `quest_templates` table
- Migrate existing quests to templates
- Keep `quests` for backward compatibility during transition

**Decision: Option A** - Simpler, no migration needed. Existing quests become templates automatically.

#### 2. `quest_runs` (Quest Instance Tracking)

```sql
CREATE TABLE quest_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  target_completion_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_quest_runs_user_quest (user_id, quest_id),
  INDEX idx_quest_runs_status (user_id, status),
  INDEX idx_quest_runs_started_at (user_id, started_at DESC)
);
```

**Purpose:**
- Track individual quest instances per user
- Support multiple concurrent or sequential runs of the same quest
- Preserve history of all attempts

**Relationships:**
- One quest template can have many quest_runs (one per user per attempt)
- Each quest_run belongs to one user and one quest template
- quest_logs can optionally link to quest_run_id (future migration)

#### 3. `activity_logs` (Unified Timeline)

```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'quest_completion',
    'habit_log',
    'shop_purchase',
    'quest_start',
    'quest_abandon'
  )),
  quest_id UUID REFERENCES quests(id) ON DELETE SET NULL,
  quest_run_id UUID REFERENCES quest_runs(id) ON DELETE SET NULL,
  shop_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL,
  habit_id UUID REFERENCES habits(id) ON DELETE SET NULL,
  metadata JSONB, -- flexible storage for activity-specific data
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  INDEX idx_activity_logs_user_occurred (user_id, occurred_at DESC),
  INDEX idx_activity_logs_type (activity_type),
  INDEX idx_activity_logs_quest_run (quest_run_id)
);
```

**Purpose:**
- Unified timeline for calendar view
- Supports all activity types (quest completions, habit logs, purchases)
- Enables calendar heatmap and activity tracking
- Links to quest_runs for repeatable quest history

**Metadata JSONB Examples:**
```json
// For habit_log activity_type
{
  "difficulty": 7,
  "saved_money": true,
  "dollars_saved": 5.50
}

// For quest_completion activity_type
{
  "reward": 10,
  "dollar_amount": 0
}
```

### User Flow for Repeatable Quests

1. **Start Quest:**
   - User clicks "Start Quest" on a quest template
   - System creates a new `quest_run` with status 'in_progress'
   - Creates `activity_log` entry with activity_type 'quest_start'

2. **Log Progress:**
   - User logs habits, completes tasks
   - Each log can optionally link to `quest_run_id`
   - Creates `activity_log` entries for each action

3. **Complete Quest:**
   - User clicks "End Quest and Claim Rewards"
   - System updates `quest_run` status to 'completed', sets `completed_at`
   - Creates `activity_log` entry with activity_type 'quest_completion'
   - Updates wallet atomically
   - Quest template remains unchanged

4. **Repeat Quest:**
   - User can click "Start Again" on completed quest
   - System creates a new `quest_run` (new instance)
   - Previous run remains in history (pastRuns)

5. **Abandon Quest:**
   - User clicks "Abandon and Delete"
   - System updates `quest_run` status to 'abandoned', sets `abandoned_at`
   - Creates `activity_log` entry with activity_type 'quest_abandon'
   - Optionally deletes quest_run or keeps for history

### Migration Strategy

**Phase 2 (Current):**
- No schema changes
- UI placeholders for "Current run" and "Past runs"
- Document model in plan

**Future Migration:**
1. Add `is_repeatable` column to `quests` table (default true)
2. Create `quest_runs` table
3. Create `activity_logs` table
4. Add `quest_run_id` column to `quest_logs` (nullable, for backward compatibility)
5. Backfill: Create initial quest_run for each user's existing quest completions (optional)

### UI Placeholders (Phase 2)

In QuestDetailPage:
- **Current Run Section:** Shows placeholder text "Repeatable quest support coming soon"
- **Past Runs Section:** Shows placeholder text "Quest history and repeatability features coming soon"
- Both sections only appear when relevant (e.g., past runs only if userCompletionCount > 0)

### Benefits of This Model

1. **Clean History:** Each quest run is a separate instance with clear start/end
2. **Flexible:** Supports concurrent runs (user starts quest, abandons, starts again)
3. **Calendar Integration:** activity_logs provides unified timeline
4. **Backward Compatible:** Existing quest_logs continue to work
5. **Scalable:** Can add more activity types without schema changes

---

## Phase 3: Data Mapping (v1 Rewards/Shop Data Structure)

### Current Supabase Tables Used by v1

#### `shop_items` table
- **id** (UUID, PRIMARY KEY)
- **name** (TEXT, NOT NULL)
- **tags** (TEXT[], DEFAULT '{}')
- **price** (INTEGER, NOT NULL, DEFAULT 20) - sand dollars cost
- **dollar_amount** (DECIMAL(10,2), DEFAULT 0) - real dollars spent per purchase
- **purchase_count** (INTEGER, NOT NULL, DEFAULT 0) - shared count (deprecated, per-user counts from logs)
- **created_by** (UUID, nullable) - NULL for seeded items, user_id for user-created items
- **created_at** (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- **updated_at** (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Query Pattern:**
```sql
SELECT * FROM shop_items 
WHERE (created_by IS NULL OR created_by = :user_id)
ORDER BY name ASC
```

#### `shop_logs` table
- **id** (UUID, PRIMARY KEY)
- **shop_item_id** (UUID, REFERENCES shop_items(id) ON DELETE CASCADE)
- **user_id** (UUID, REFERENCES auth.users(id) ON DELETE CASCADE)
- **purchased_at** (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Query Pattern:**
```sql
SELECT * FROM shop_logs 
WHERE shop_item_id = :shop_item_id AND user_id = :user_id
ORDER BY purchased_at DESC
```

#### `user_shop_item_overrides` table (per-user customization)
- **id** (UUID, PRIMARY KEY)
- **user_id** (UUID, REFERENCES auth.users(id))
- **shop_item_id** (UUID, REFERENCES shop_items(id))
- **name** (TEXT, nullable)
- **tags** (TEXT[], nullable)
- **price** (INTEGER, nullable)
- **dollar_amount** (DECIMAL(10,2), nullable)
- **created_at** (TIMESTAMPTZ)
- **updated_at** (TIMESTAMPTZ)

**Purpose:** Allows users to customize seeded shop items without modifying the base item.

#### `user_hidden_shop_items` table
- **id** (UUID, PRIMARY KEY)
- **user_id** (UUID, REFERENCES auth.users(id))
- **shop_item_id** (UUID, REFERENCES shop_items(id))

**Purpose:** Tracks which seeded shop items a user has hidden.

### Current Shop Data Flow (v1)

1. **Load Shop Items:**
   - Query `shop_items` table for seeded (created_by IS NULL) or user-created (created_by = user_id)
   - Merge with `user_shop_item_overrides` to get per-user customizations
   - Filter out items in `user_hidden_shop_items`
   - Sort alphabetically by name

2. **Purchase Item:**
   - Insert into `shop_logs` with shop_item_id, user_id, purchased_at
   - Atomically update `wallets` table (subtract price from total, dollar_amount from dollar_total)

3. **Progress Tracking:**
   - Per-user purchase count = COUNT(*) from `shop_logs` WHERE shop_item_id = X AND user_id = Y
   - No separate "progress" table - logs are the source of truth

### Missing Fields for v2 (Not in Current Schema)

The following fields are planned for v2 but do not exist yet:
- `description` (TEXT) - optional item description
- `rarity` (TEXT) - enum: 'common', 'rare', 'epic', 'legendary'
- `is_starred` (BOOLEAN) - user's starred status
- `linked_quest_id` (UUID) - link to quests table for quest-associated items

**Note:** These will be added in future migrations. For Phase 3, we'll use UI-only state or local storage as temporary storage.

### TypeScript Types for Phase 3

#### RewardSummary (List View)
```typescript
export interface RewardSummary {
  id: string;
  name: string;
  tags: ShopTag[];
  price: number;
  dollar_amount: number;
  created_by: string | null;
  created_at: string;
  // Derived/computed fields
  userPurchaseCount: number; // from shop_logs count
  isStarred: boolean; // from local storage or future is_starred column
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'; // future field, optional for now
  linkedQuestId?: string; // future field, optional for now
}
```

#### RewardDetail (Detail View)
```typescript
export interface RewardDetail extends RewardSummary {
  description?: string; // future field, optional for now
  // Logs
  logs: ShopLog[]; // from shop_logs table
  // Linked quest info (if linked)
  linkedQuest?: {
    id: string;
    name: string;
  };
}
```

### Data Derivation Strategy

1. **RewardSummary from ShopItem:**
   - Direct mapping from `shop_items` table
   - `userPurchaseCount` = COUNT from `shop_logs` WHERE shop_item_id = id AND user_id = current_user
   - `isStarred` = read from localStorage key `reward_starred_${item_id}` (temporary, until schema migration)
   - `rarity` = undefined for now (will be added in migration)
   - `linkedQuestId` = read from localStorage key `reward_linked_quest_${item_id}` (temporary)

2. **RewardDetail from RewardSummary:**
   - Extend RewardSummary
   - Load `logs` from `shop_logs` table
   - Load `linkedQuest` info if `linkedQuestId` exists

### Quest-Associated Items Proposal

**Current State:**
- Quests can have `associated_item_id` (future field) that links to a shop item
- This creates a one-way link: quest → item

**Proposed Model:**
- When a quest defines an `associated_item_id`, that item should appear in the rewards shop
- The item can be:
  - **Auto-created:** System creates a shop item when quest is created with associated_item_id
  - **Pre-existing:** User selects an existing shop item to link
  - **Manual:** User creates item separately, then links it to quest

**Data Flow:**
1. Quest has `associated_item_id` → Item appears in shop with "Linked to quest" indicator
2. Item has `linked_quest_id` → Shows which quest it's associated with
3. Bidirectional relationship: quest.associated_item_id ↔ shop_item.linked_quest_id

**Migration Strategy:**
- Add `linked_quest_id` column to `shop_items` table (nullable)
- Add `associated_item_id` column to `quests` table (nullable)
- Backfill: For any existing quest-item links, populate both columns

**Phase 3 Implementation:**
- UI-only indicators showing "Linked to quest" or "Linked to reward"
- No automatic creation or syncing yet
- Document proposal in plan for future implementation

### Quest-Associated Items Data Model Proposal

#### Current State (Phase 3)
- Quests can have `associated_item_id` (future field, currently UI-only/localStorage)
- Shop items can have `linked_quest_id` (future field, currently localStorage)
- Both stored temporarily in localStorage:
  - Quest → Item: `quest_associated_item_${questId}` = itemId
  - Item → Quest: `reward_linked_quest_${itemId}` = questId

#### Proposed Future Schema

**Option A: Bidirectional with both columns (Recommended)**
```sql
-- Add to quests table
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS associated_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

-- Add to shop_items table
ALTER TABLE shop_items
  ADD COLUMN IF NOT EXISTS linked_quest_id UUID REFERENCES quests(id) ON DELETE SET NULL;

-- Optional: Add constraint to ensure bidirectional consistency
-- (Can be enforced via trigger or application logic)
```

**Benefits:**
- Fast queries from either direction
- Clear bidirectional relationship
- Can enforce referential integrity
- Easy to find all items linked to a quest, or find quest for an item

**Migration:**
1. Add both columns (nullable)
2. Backfill: For any localStorage links, populate both columns
3. Add constraint or trigger: Ensure both columns point to each other (or use application logic)

**Option B: Single source of truth (quests.associated_item_id only)**
```sql
-- Add to quests table only
ALTER TABLE quests
  ADD COLUMN IF NOT EXISTS associated_item_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;
```

**Benefits:**
- Simpler schema
- Quest is the source of truth
- Less duplication

**Trade-off:**
- Need to query quests to find items linked to a quest (slower reverse lookup)
- Can add index on shop_items for reverse lookup if needed

**Decision: Option A** - Bidirectional columns provide better query performance and clearer data model.

#### Auto-Creation Strategy (Future)

When a quest is created with `associated_item_id`:
1. **If item exists:** Link it (update `shop_items.linked_quest_id`)
2. **If item doesn't exist:** Create new shop item with:
   - Name from quest's associated_item text
   - Price = 0 (or quest reward amount, configurable)
   - `linked_quest_id` = quest.id
   - Auto-populate other fields from quest if applicable
   - Track via `auto_created_from_quest` flag (optional)

When a quest is deleted:
- Option 1: Keep item, set `linked_quest_id` to NULL
- Option 2: Delete item if it was auto-created (track via flag)

**Phase 3:** No auto-creation yet, manual linking only via UI.

#### UI Indicators (Phase 3)

- **In QuestDetailPage:** Show "Associated Reward" section if `associated_item_id` exists
- **In RewardDetailPage:** Show "Linked to quest" badge/indicator if `linked_quest_id` exists
- **In RewardsPage:** Show 🔗 icon next to items that have `linked_quest_id`
- **In QuestsPage:** Optional indicator for quests with associated items

---

## Phase 4: Calendar and Unified Activity Timeline

### Activity Logs Table Migration

**File:** `supabase/migrations/20240101000000_create_activity_logs.sql`

**Purpose:** Create a unified `activity_logs` table to track all user activities (habit logs, quest completions, reward purchases) for calendar views and activity timelines.

**Table Structure:**
```sql
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  quest_id UUID REFERENCES quests(id),
  habit_id UUID REFERENCES habits(id), -- Future: when habits table exists
  reward_id UUID REFERENCES shop_items(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('habit_log', 'quest_complete', 'reward_purchase')),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  dollars_saved NUMERIC(10, 2),
  sand_dollars_earned NUMERIC(10, 2),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_user_id UUID REFERENCES auth.users(id), -- For buddy attribution
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes:**
- `idx_activity_logs_user_logged_at` - Fast queries by user and date
- `idx_activity_logs_action_type` - Filter by activity type
- Indexes on quest_id, habit_id, reward_id (partial, WHERE NOT NULL)

**RLS Policies:**
- Users can view/insert/update/delete their own logs
- Buddy attribution visibility handled in application logic (future: shared quests)

**Migration Strategy:**
- Additive only - no changes to existing `quest_logs` or `shop_logs` tables
- Dual-write pattern: continue writing to existing tables, also write to `activity_logs`
- Existing v1 functionality remains unaffected

### Dual-Write Pattern

**Habit Logging:**
- Continue writing to `quest_logs` (backward compatibility)
- Also insert into `activity_logs` with `action_type = 'habit_log'`

**Quest Completion:**
- Continue writing to `quest_logs` (backward compatibility)
- Also insert into `activity_logs` with `action_type = 'quest_complete'`

**Reward Purchase:**
- Continue writing to `shop_logs` (backward compatibility)
- Also insert into `activity_logs` with `action_type = 'reward_purchase'`

### Calendar Views

**Home Preview:**
- Simple activity grid for last 30 days
- Colored squares for days with any activity
- Calm at-a-glance design

**Full Calendar:**
- Day view: List of activities for selected day with edit capability
- Week view: List of activities for selected week
- Month view: Grid calendar with activity indicators
- Year heatmap: Full year view with activity intensity

**Edit Capability:**
- Click activity to open edit modal
- Can edit: difficulty, dollars_saved, logged_at
- Updates saved to `activity_logs` table

**Buddy Attribution:**
- If `source_user_id` exists and is not current user, show who logged it
- Display format: "Logged by [username]" or "Logged by buddy"

---

**End of Phase 0 Plan Document**
