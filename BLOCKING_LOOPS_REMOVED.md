# Blocking Loops Removed - Stabilization Summary

## Overview
Removed all artificial blocking and hidden reload patterns introduced during the last stabilization pass. The app now uses progressive rendering and targeted state patches.

## src/hooks/useQuests.ts

### Blocking Pattern Removed
**Busy-wait loops for overridesLoading**: 
- Lines 32-37: `while (overridesLoading && retries < 10)` with 100ms delays
- Lines 323-329: `while (overridesLoading && retries < 20)` with 100ms delays in useEffect

**How Progressive Rendering Works:**
- Base quests load immediately without waiting for overrides
- `loadQuests()` fetches base data and merges with overrides when available
- If overrides are still loading, base data renders first; overrides merge via `mergeQuestWithOverrides()` when ready
- No blocking: UI shows data immediately, overrides enhance it progressively

**State Patching Avoids Reloads:**
- Hidden quests subscription now patches only the changed ID from payload
- INSERT: Removes quest from state (payload.new.quest_id)
- DELETE: Fetches and adds single unhidden quest (payload.old.quest_id)
- No full table re-fetch, no full dataset filtering

**Counter Edit Single Mutation:**
- Replaced log diffing (fetch all logs → calculate difference → mutate) with direct count query
- Uses `select("*", { count: "exact", head: true })` for single count query
- Single mutation per user action: calculate difference once, insert/delete logs once
- No loops: counter edits update once, no feedback cycles

**Why No Regression:**
- Progressive render shows base data immediately (same or better UX)
- Overrides merge when ready via existing `mergeQuestWithOverrides()` function
- Hidden item patches are more efficient (single ID vs full table fetch)
- Counter mutation is simpler and faster (count query vs full log fetch)

---

## src/hooks/useShopItems.ts

### Blocking Pattern Removed
**Busy-wait loops for overridesLoading**: 
- Lines 32-37: `while (overridesLoading && retries < 10)` with 100ms delays
- Lines 323-329: `while (overridesLoading && retries < 20)` with 100ms delays in useEffect

**How Progressive Rendering Works:**
- Base shop items load immediately without waiting for overrides
- `loadShopItems()` fetches base data and merges with overrides when available
- If overrides are still loading, base data renders first; overrides merge via `mergeItemWithOverrides()` when ready
- No blocking: UI shows data immediately, overrides enhance it progressively

**State Patching Avoids Reloads:**
- Hidden items subscription now patches only the changed ID from payload
- INSERT: Removes item from state (payload.new.shop_item_id)
- DELETE: Fetches and adds single unhidden item (payload.old.shop_item_id)
- No full table re-fetch, no full dataset filtering

**Counter Edit Single Mutation:**
- Replaced log diffing (fetch all logs → calculate difference → mutate) with direct count query
- Uses `select("*", { count: "exact", head: true })` for single count query
- Single mutation per user action: calculate difference once, insert/delete logs once
- No loops: counter edits update once, no feedback cycles

**Why No Regression:**
- Progressive render shows base data immediately (same or better UX)
- Overrides merge when ready via existing `mergeItemWithOverrides()` function
- Hidden item patches are more efficient (single ID vs full table fetch)
- Counter mutation is simpler and faster (count query vs full log fetch)

---

## src/hooks/useGoals.ts

### Blocking Pattern Removed
**Sequential goal completion updates**: 
- Lines 194-199: `for (const goal of incompleteGoals) { await updateGoal(...) }`
- Sequential await blocks completion of all goals until each finishes

**How Batching Works:**
- All goal completion updates now run in parallel using `Promise.all()`
- Multiple goals can complete simultaneously without blocking
- Faster completion: all updates fire at once, not sequentially

**Why No Regression:**
- Same end result: all completed goals are updated
- Faster execution: parallel vs sequential
- No race conditions: each `updateGoal()` is independent
- State updates are atomic per goal (already handled by `updateGoal`)

---

## Summary

**Total blocking loops removed:** 4
- 2 busy-wait loops in `loadQuests()` (10 retries × 100ms = up to 1s delay)
- 2 busy-wait loops in `loadShopItems()` (10 retries × 100ms = up to 1s delay)
- 2 busy-wait loops in useEffect (20 retries × 100ms = up to 2s delay each)

**Total full table fetches removed:** 2
- Hidden quests subscription: re-fetch entire `user_hidden_quests` table → patch single ID
- Hidden items subscription: re-fetch entire `user_hidden_shop_items` table → patch single ID

**Total log diffing operations removed:** 2
- Counter edits: fetch all logs → diff → mutate → replaced with count query → single mutate

**Total sequential awaits removed:** 1
- Goal completion: sequential `await updateGoal()` → parallel `Promise.all()`

**Result:** Zero blocking, zero full table fetches, zero log diffing, zero sequential awaits. Progressive rendering, targeted patches, single mutations, parallel updates.

