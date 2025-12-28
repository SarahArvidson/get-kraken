# White Screen / React Null Error Fix

## Current Status
✅ Build succeeds locally
❌ Runtime error: "Cannot read properties of null (reading 'useRef')"

## Problem
The SDK externalizes React, expecting it to be provided by the consuming app. At runtime, React is null when SDK components try to use it.

## Root Cause
The SDK's built files have React as an external dependency. When Vite bundles the app, React might not be properly resolved for the SDK's imports, or there's a module resolution/timing issue.

## Solutions Applied

1. **React Deduplication**: `resolve.dedupe` ensures single React instance
2. **Manual Chunks**: React separated into vendor chunk
3. **CommonJS Options**: Handle mixed module formats
4. **Pre-import React**: Import React before SDK in main.tsx
5. **Optimize Deps**: Force React optimization

## Next Steps to Try

If the issue persists after deployment, we may need to:

### Option 1: Check Built Output
Inspect the built `dist/assets/react-vendor-*.js` to ensure React is properly bundled and available.

### Option 2: Ensure React Loads First
The React vendor chunk should load before SDK code. Check the HTML output to verify chunk order.

### Option 3: SDK Package.json
The SDK might need React as a peerDependency instead of dependency to ensure proper resolution.

### Option 4: Preload React
Add React preload in index.html:
```html
<link rel="modulepreload" href="/assets/react-vendor-*.js" />
```

## Files Changed
- `vite.config.ts` - React bundling configuration
- `src/main.tsx` - Pre-import React
- `ffs-sdk/package.json` - Reverted to dependencies (not peerDependencies)

## Testing
After deployment, check:
1. Browser console for React errors
2. Network tab for chunk loading order
3. React vendor chunk loads before SDK code

