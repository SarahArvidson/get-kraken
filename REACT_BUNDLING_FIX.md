# React Bundling Issue Fix

## Problem
"Cannot read properties of null (reading 'useRef')" - React is null when SDK components try to use it.

## Root Cause
The SDK externalizes React in its build, expecting it to be provided by the consuming app. However, Vite's bundling might be creating multiple React instances or React isn't available when SDK code runs.

## Solution Attempted
1. Added `dedupe` to ensure single React instance
2. Added `manualChunks` to separate React into vendor chunk
3. Added `optimizeDeps` to force React optimization

## Next Steps to Try

If the issue persists, we may need to:
1. Ensure React loads before SDK code (preload in index.html)
2. Check if SDK needs React as peerDependency vs dependency
3. Verify SDK's built files properly reference React
4. Consider pre-bundling React separately

## Current Configuration

- `resolve.dedupe`: Ensures single React instance
- `build.rollupOptions.output.manualChunks`: Separates React into vendor chunk
- `optimizeDeps.force`: Forces re-optimization

