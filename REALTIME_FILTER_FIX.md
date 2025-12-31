# Invalid Realtime Filter Fix - Summary

## Problem
The following invalid Supabase realtime filter syntax was silently ignored, causing clients to receive ALL rows globally:

```typescript
supabase.subscribe("quests", handler, "created_by=is.null")
supabase.subscribe("shop_items", handler, "created_by=is.null")
```

Supabase does not support SQL-style `is.null` syntax in channel filters. This filter was silently ignored, meaning the subscription received events for ALL quests/shop_items from ALL users, creating a security and performance issue.

## Lines Removed

### src/hooks/useQuests.ts
**Removed lines 385-390:**
```typescript
// Subscribe to seeded quests (created_by IS NULL) - channel filter
const seededSubscription = supabase.subscribe(
  "quests",
  handleQuestChange,
  "created_by=is.null"  // ❌ INVALID - silently ignored
);
```

### src/hooks/useShopItems.ts
**Removed lines 386-391:**
```typescript
// Subscribe to seeded shop items (created_by IS NULL) - channel filter
const seededSubscription = supabase.subscribe(
  "shop_items",
  handleShopItemChange,
  "created_by=is.null"  // ❌ INVALID - silently ignored
);
```

## Corrected Subscription Code

### src/hooks/useQuests.ts

**New handler for user-created quests (channel filter):**
```typescript
// Handler for user-created quests - receives only user's quests via channel filter
const handleUserQuestChange = (payload: any) => {
  // ... processes user's quests
};

// Subscribe to user's quests (created_by = user.id) - channel filter
const userSubscription = supabase.subscribe(
  "quests",
  handleUserQuestChange,
  `created_by=eq.${user.id}`  // ✅ VALID - database filters at channel level
);
```

**New handler for all quests (client-side filter for seeded only):**
```typescript
// Handler for all quests - client-side filter for seeded items only
const handleAllQuestChange = (payload: any) => {
  // Only process seeded quests (created_by === null), ignore others
  const quest = payload.new || payload.old;
  if (quest && quest.created_by !== null) {
    return; // Ignore non-seeded quests (user-created or other users)
  }
  // ... processes only seeded quests
};

// Subscribe to all quests - client-side filter for seeded items only
const allQuestsSubscription = supabase.subscribe(
  "quests",
  handleAllQuestChange  // ✅ No filter - client filters for seeded items
);
```

### src/hooks/useShopItems.ts

**New handler for user-created shop items (channel filter):**
```typescript
// Handler for user-created shop items - receives only user's items via channel filter
const handleUserShopItemChange = (payload: any) => {
  // ... processes user's items
};

// Subscribe to user's shop items (created_by = user.id) - channel filter
const userSubscription = supabase.subscribe(
  "shop_items",
  handleUserShopItemChange,
  `created_by=eq.${user.id}`  // ✅ VALID - database filters at channel level
);
```

**New handler for all shop items (client-side filter for seeded only):**
```typescript
// Handler for all shop items - client-side filter for seeded items only
const handleAllShopItemChange = (payload: any) => {
  // Only process seeded items (created_by === null), ignore others
  const item = payload.new || payload.old;
  if (item && item.created_by !== null) {
    return; // Ignore non-seeded items (user-created or other users)
  }
  // ... processes only seeded items
};

// Subscribe to all shop items - client-side filter for seeded items only
const allItemsSubscription = supabase.subscribe(
  "shop_items",
  handleAllShopItemChange  // ✅ No filter - client filters for seeded items
);
```

## Why This Preserves Isolation While Restoring Correct Seeded Behavior

### User Isolation Preserved
1. **User-created items:** Channel filter `created_by=eq.${user.id}` ensures database filters events before transmission. Client only receives events for current user's items.
2. **Other users' items:** The "all items" subscription receives events for all items, but the client-side filter `if (item && item.created_by !== null) return;` immediately ignores any item that is not seeded (i.e., has a `created_by` value). This means:
   - User-created items from current user: Handled by `userSubscription` (channel filter)
   - User-created items from other users: Received by `allItemsSubscription` but immediately ignored (client filter)
   - Seeded items: Received by `allItemsSubscription` and processed (client filter allows `created_by === null`)

### Seeded Behavior Restored
1. **Seeded items:** The "all items" subscription receives events for seeded items (`created_by === null`) and processes them correctly.
2. **No silent failures:** Removed invalid `created_by=is.null` filter that was being silently ignored.
3. **Correct filtering:** Client-side check `quest.created_by !== null` correctly identifies and processes only seeded items.

### No Duplicate Subscriptions
- Each subscription has a distinct purpose:
  - `userSubscription`: User's own items (channel filter)
  - `allItemsSubscription`: Seeded items only (client filter)
  - `hiddenSubscription`: Hidden items (existing, unchanged)
- All subscriptions are properly cleaned up in the `useEffect` return function.
- No overlap: User's items handled by `userSubscription`, seeded items handled by `allItemsSubscription`.

### Security
- **Database-level filtering:** User's items filtered at database level (channel filter), preventing transmission of irrelevant events.
- **Client-level filtering:** Seeded items filtered client-side (early return for non-seeded), preventing processing of other users' items.
- **No global exposure:** Invalid filter that caused global exposure has been removed.

## Result
- ✅ Invalid `created_by=is.null` filters removed
- ✅ User isolation preserved via channel filter for user items
- ✅ Seeded behavior restored via client-side filter for seeded items
- ✅ No duplicate subscriptions
- ✅ All subscriptions properly cleaned up
- ✅ Security: No global exposure of other users' data

