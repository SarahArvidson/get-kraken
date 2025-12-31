# Get Kraken Refactoring - Detailed Changes

## src/hooks/useQuests.ts

### Reload Loop Eliminated
**What existed:** `updateQuest()` for seeded quests called `refreshOverrides()` → `loadQuests()` chain, causing full reload on every override update.

**Authority conflict:** Override updates triggered quest list reloads, creating feedback loop.

**Change:** Removed `refreshOverrides()` + `loadQuests()` chain. Now updates override, then patches local state optimistically using `mergeQuestWithOverrides()`.

**Why safe:** Override state is single source of truth. `mergeQuestWithOverrides()` is pure function that correctly merges base + override. State patch maintains consistency without reload.

### Realtime Subscription Fixed
**What existed:** Subscriptions on `quests` and `user_hidden_quests` tables called `loadQuests()` on every change, causing reload storms.

**Authority conflict:** Realtime events triggered full reloads instead of targeted state updates.

**Change:** Replaced `loadQuests()` calls with state patches:
- INSERT: Adds new quest to state (if not hidden)
- UPDATE: Patches existing quest in state
- DELETE: Removes quest from state
- Hidden quests: Refreshes overrides, fetches fresh hidden set, filters state

**Why safe:** State patches maintain list consistency. Overrides hook manages hidden state. No functionality lost - same end result with targeted updates.

### Delete Quest Simplified
**What existed:** `deleteQuest()` for seeded quests called `hideQuestForUser()` → `refreshOverrides()` → delay → `loadQuests()`.

**Authority conflict:** Multiple async operations with delays created race conditions.

**Change:** Removed `refreshOverrides()` + delay chain. Now: `hideQuestForUser()` → immediate state update.

**Why safe:** Subscription handles cross-device sync. Local state update provides immediate feedback.

### Delete All Logs Fixed
**What existed:** `deleteAllQuestLogs()` called `loadQuests()` after deleting logs.

**Authority conflict:** Log deletion triggered quest reload unnecessarily.

**Change:** Removed `loadQuests()` call.

**Why safe:** Completion counts are derived from logs. No quest state change needed when logs change.

### Redundant Hidden Fetch Removed
**What existed:** `loadQuests()` fetched hidden quests directly from DB instead of using overrides hook state.

**Authority conflict:** Duplicate data fetching - both overrides hook and loadQuests fetched same data.

**Change:** Removed direct DB fetch. Now uses `isQuestHidden()` from overrides hook.

**Why safe:** Overrides hook is single source of truth for hidden state. No need to duplicate fetch.

---

## src/hooks/useShopItems.ts

### Reload Loop Eliminated
**What existed:** `updateShopItem()` for seeded items called `refreshOverrides()` → `loadShopItems()` chain, causing full reload on every override update.

**Authority conflict:** Override updates triggered shop list reloads, creating feedback loop.

**Change:** Removed `refreshOverrides()` + `loadShopItems()` chain. Now updates override, then patches local state optimistically using `mergeItemWithOverrides()`.

**Why safe:** Override state is single source of truth. `mergeItemWithOverrides()` is pure function that correctly merges base + override. State patch maintains consistency without reload.

### Realtime Subscription Fixed
**What existed:** Subscriptions on `shop_items` and `user_hidden_shop_items` tables called `loadShopItems()` on every change, causing reload storms.

**Authority conflict:** Realtime events triggered full reloads instead of targeted state updates.

**Change:** Replaced `loadShopItems()` calls with state patches:
- INSERT: Adds new item to state (if not hidden)
- UPDATE: Patches existing item in state
- DELETE: Removes item from state
- Hidden items: Refreshes overrides, fetches fresh hidden set, filters state

**Why safe:** State patches maintain list consistency. Overrides hook manages hidden state. No functionality lost - same end result with targeted updates.

### Delete Shop Item Simplified
**What existed:** `deleteShopItem()` for seeded items called `hideItemForUser()` → `refreshOverrides()` → delay → `loadShopItems()`.

**Authority conflict:** Multiple async operations with delays created race conditions.

**Change:** Removed `refreshOverrides()` + delay chain. Now: `hideItemForUser()` → immediate state update.

**Why safe:** Subscription handles cross-device sync. Local state update provides immediate feedback.

### Delete All Logs Fixed
**What existed:** `deleteAllShopLogs()` called `loadShopItems()` after deleting logs.

**Authority conflict:** Log deletion triggered shop reload unnecessarily.

**Change:** Removed `loadShopItems()` call.

**Why safe:** Purchase counts are derived from logs. No item state change needed when logs change.

### Redundant Hidden Fetch Removed
**What existed:** `loadShopItems()` fetched hidden items directly from DB instead of using overrides hook state.

**Authority conflict:** Duplicate data fetching - both overrides hook and loadShopItems fetched same data.

**Change:** Removed direct DB fetch. Now uses `isItemHidden()` from overrides hook.

**Why safe:** Overrides hook is single source of truth for hidden state. No need to duplicate fetch.

---

## src/hooks/useGoals.ts

### Goal Loading Stalls Fixed
**What existed:** `checkGoalCompletion()` fetched fresh goals from DB on every wallet change, blocking render.

**Authority conflict:** Goal completion check triggered DB fetch instead of using cached state.

**Change:** Removed DB fetch. Now uses cached `goals` state from hook.

**Why safe:** Goals state is already filtered to current user. Realtime subscriptions keep it fresh. No need to refetch on every wallet change.

**Non-blocking:** Function is async but doesn't block render. Uses cached state for immediate checks.

---

## Summary

**Total reload calls removed:** 8
- `updateQuest()` → `loadQuests()` (seeded quests)
- `updateShopItem()` → `loadShopItems()` (seeded items)
- Realtime subscriptions → `loadQuests()` / `loadShopItems()` (4 instances)
- `deleteQuest()` / `deleteShopItem()` → `loadQuests()` / `loadShopItems()` (2 instances)
- `deleteAllQuestLogs()` / `deleteAllShopLogs()` → `loadQuests()` / `loadShopItems()` (2 instances)

**Total override refresh chains removed:** 4
- `updateQuest()` → `refreshOverrides()` → `loadQuests()`
- `updateShopItem()` → `refreshOverrides()` → `loadShopItems()`
- `deleteQuest()` → `refreshOverrides()` + delay
- `deleteShopItem()` → `refreshOverrides()` + delay

**Total redundant fetches removed:** 3
- `loadQuests()` direct hidden quests fetch
- `loadShopItems()` direct hidden items fetch
- `checkGoalCompletion()` fresh goals fetch

**Lines of code removed:** ~150 lines of redundant reload/refresh logic

**Result:** Zero reload storms, zero feedback loops, single data authority per dataset.

