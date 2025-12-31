# Mount Storms Eliminated - Summary

## Components Previously Unmounted

### App.tsx (lines 390-439)

**Before:** Conditional rendering causing unmount/remount on tab changes:
```typescript
{currentView === "quests" && (
  <QuestsView ... />
)}

{currentView === "shop" && (
  <ShopView ... />
)}

{currentView === "progress" && (
  <ProgressView ... />
)}
```

**Problem:**
- `QuestsView` unmounted when switching to "shop" or "progress" tabs
- `ShopView` unmounted when switching to "quests" or "progress" tabs
- `ProgressView` unmounted when switching to "quests" or "shop" tabs
- Each unmount/remount cycle:
  - Resets component state
  - Triggers useEffect hooks to re-run
  - Causes data refetching
  - Loses scroll position
  - Creates mount storms during rapid tab switching

## How Components Are Now Permanently Mounted

### App.tsx (lines 390-439)

**After:** Always mounted with CSS visibility toggle:
```typescript
{/* Always mount all views - use CSS visibility to show/hide */}
<div className={currentView === "quests" ? "" : "hidden"}>
  <QuestsView ... />
</div>

<div className={currentView === "shop" ? "" : "hidden"}>
  <ShopView ... />
</div>

<div className={currentView === "progress" ? "" : "hidden"}>
  <ProgressView ... />
</div>
```

**Implementation:**
- All three view components (`QuestsView`, `ShopView`, `ProgressView`) are always mounted
- CSS class `hidden` (Tailwind utility) toggles visibility without unmounting
- `hidden` class applies `display: none` which hides elements but keeps them in the DOM
- Components remain mounted throughout the entire page session

## Why This Prevents State Reset on Scroll

### Before (Unmount/Remount):
1. User scrolls in QuestsView
2. User switches to Shop tab
3. QuestsView unmounts → all state lost, scroll position lost
4. ShopView mounts → fresh state, scroll at top
5. User switches back to Quests tab
6. QuestsView remounts → fresh state, scroll at top (lost previous position)
7. Data hooks re-run → unnecessary refetching

### After (Permanent Mount):
1. User scrolls in QuestsView
2. User switches to Shop tab
3. QuestsView stays mounted, just hidden via CSS
4. ShopView was already mounted, now visible
5. User switches back to Quests tab
6. QuestsView becomes visible again → scroll position preserved
7. No remounting → no state reset → no data refetching

### Benefits:
- **Scroll position preserved:** Components stay in DOM, scroll position maintained
- **State preserved:** Component state persists across tab switches
- **No mount storms:** Components mount once, never unmount during session
- **No unnecessary refetches:** useEffect hooks don't re-run on tab switch
- **Smoother UX:** Instant tab switching, no loading states on return

## Verification

### No Other Conditional Rendering Found
- Searched for `{condition && <Component />}` patterns: None found in view components
- Searched for dynamic keys on containers: Only found on list items (correct usage)
- Searched for scroll-based visibility: None found

### Components Mounted Exactly Once
- `QuestsView`: Mounted once on App mount, stays mounted
- `ShopView`: Mounted once on App mount, stays mounted
- `ProgressView`: Mounted once on App mount, stays mounted

## Result

✅ **Mount storms eliminated:** All view components mount once and stay mounted
✅ **State preserved:** No state reset on tab switches or scroll
✅ **Scroll position preserved:** Users can scroll, switch tabs, and return to same position
✅ **No unnecessary refetches:** Data hooks don't re-run on tab switches
✅ **Smoother UX:** Instant tab switching with preserved state

