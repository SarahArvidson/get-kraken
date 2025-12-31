# Mutation Guard Implementation

## Overview

The mutation guard prevents double-application of optimistic mutations by tracking local mutations and ignoring realtime echoes that match our own actions.

## Problem

When a user completes a quest or purchases an item:
1. The action updates the wallet in the database atomically
2. The wallet realtime subscription receives the update
3. The update is applied to the UI state
4. **Issue**: If there's also an optimistic update or the realtime event is an echo of our own action, the wallet total can be incremented/decremented twice

## Solution

### Architecture

1. **Shared Mutation Guard Module** (`src/utils/mutationGuard.ts`)
   - Module-level state stores the last pending mutation
   - Tracks: mutation ID, expected wallet totals, timestamp
   - Provides functions to register and check mutations

2. **Mutation Registration** (in `completeQuest` and `purchaseItem`)
   - Before updating the wallet in the database, register the expected result
   - This "tags" the mutation with expected values

3. **Echo Detection** (in `useWallet` realtime handler)
   - When a realtime event arrives, check if it matches our last mutation
   - If it matches (same values, recent timestamp), ignore it as an echo
   - If it doesn't match, apply it (it's from another device or external source)

## Implementation Details

### Where the Mutation Guard is Implemented

1. **`src/utils/mutationGuard.ts`** - Core mutation guard logic
   - `registerPendingWalletMutation()` - Registers a pending mutation before DB update
   - `isEchoOfLastWalletMutation()` - Checks if a realtime update is an echo
   - Module-level state ensures consistency across hooks

2. **`src/hooks/useWallet.ts`** - Wallet hook with echo detection
   - Realtime subscription handler calls `isEchoOfLastWalletMutation()`
   - Ignores updates that match our last mutation
   - Applies genuine updates from other devices

3. **`src/hooks/useQuests.ts`** - Quest completion with mutation registration
   - `completeQuest()` calls `registerPendingWalletMutation()` before updating wallet
   - Registers expected wallet totals after the mutation

4. **`src/hooks/useShopItems.ts`** - Shop purchase with mutation registration
   - `purchaseItem()` calls `registerPendingWalletMutation()` before updating wallet
   - Registers expected wallet totals after the mutation

### How the Realtime Handler Ignores Local Echoes

```typescript
// In useWallet.ts realtime subscription handler
subscription = supabase.subscribe(
  "wallets",
  (payload: any) => {
    if (payload.new?.user_id === user.id) {
      const newTotal = payload.new.total ?? 0;
      const newDollarTotal = payload.new.dollar_total ?? 0;
      
      // Check if this is an echo of our own mutation
      if (isEchoOfLastWalletMutation(newTotal, newDollarTotal)) {
        console.log("[useWallet] Ignoring realtime echo of local mutation");
        return; // Ignore this update
      }
      
      // This is a genuine update - apply it
      setWallet(payload.new);
    }
  },
  `user_id=eq.${user.id}`
);
```

The `isEchoOfLastWalletMutation()` function:
1. Checks if there's a recent pending mutation (within 5 seconds)
2. Compares the incoming values with expected values (allowing for rounding)
3. If they match, returns `true` (this is an echo - ignore it)
4. If they don't match, returns `false` (this is genuine - apply it)

### Why This Prevents Duplicate Application Without Breaking Cross-Device Sync

**Prevents Duplicate Application:**
- When we perform a mutation, we register the expected result
- When the realtime echo arrives, we detect it matches our expectation
- We ignore the echo, preventing double-application

**Preserves Cross-Device Sync:**
- Updates from other devices have different values (different wallet totals)
- These don't match our last mutation, so they're applied normally
- The 5-second time window ensures we only ignore recent echoes
- After 5 seconds, any update is treated as genuine (handles edge cases)

**Example Flow:**

**Same Device (Echo Prevention):**
1. User completes quest → `completeQuest()` called
2. `registerPendingWalletMutation(100, 50)` - expects wallet to be 100/50
3. Database updated → wallet is now 100/50
4. Realtime event arrives → `isEchoOfLastWalletMutation(100, 50)` returns `true`
5. Update ignored → no double-application ✅

**Different Device (Cross-Device Sync):**
1. User completes quest on Device A → wallet becomes 100/50
2. Realtime event sent to Device B
3. Device B receives update → `isEchoOfLastWalletMutation(100, 50)` 
4. Device B has no pending mutation → returns `false`
5. Update applied → Device B wallet syncs to 100/50 ✅

**Concurrent Updates:**
1. Device A: completes quest → wallet becomes 100/50 (registered)
2. Device B: purchases item → wallet becomes 90/45 (different values)
3. Device A receives Device B's update → `isEchoOfLastWalletMutation(90, 45)`
4. Values don't match (90 ≠ 100) → returns `false`
5. Update applied → Device A wallet syncs to 90/45 ✅

## Testing

To verify the implementation works correctly:

1. **Same Device Test:**
   - Complete a quest or purchase an item
   - Verify wallet total updates exactly once (not twice)
   - Check console for "[useWallet] Ignoring realtime echo" message

2. **Multi-Device Test:**
   - Open app on two devices with same account
   - Complete quest on Device A
   - Verify Device B receives the update and wallet syncs correctly
   - Verify Device A doesn't double-apply the update

3. **Concurrent Updates Test:**
   - Have two devices perform different actions simultaneously
   - Verify both devices receive each other's updates correctly
   - Verify no updates are incorrectly ignored

## Files Modified

- `src/utils/mutationGuard.ts` (new file)
- `src/hooks/useWallet.ts` (added echo detection in realtime handler)
- `src/hooks/useQuests.ts` (added mutation registration in `completeQuest`)
- `src/hooks/useShopItems.ts` (added mutation registration in `purchaseItem`)

