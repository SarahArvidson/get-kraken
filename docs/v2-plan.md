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

**End of Phase 0 Plan Document**
