# React Null Error Fix

## Problem
Runtime error: "Cannot read properties of null (reading 'useRef')"
- React is null when SDK components try to use it
- Happens after deployment on Netlify

## Root Cause Analysis

The SDK externalizes React in its build configuration:
- SDK's `vite.config.ts` has `external: ["react", "react-dom"]`
- SDK expects React to be provided by the consuming app
- When Vite bundles the main app, React might not be properly resolved for SDK imports

## Solutions Applied

1. **React Deduplication**: `resolve.dedupe` ensures single React instance
2. **Manual Chunks**: React separated into vendor chunk that loads first
3. **Optimize Deps**: Force React optimization and include SDK
4. **CommonJS Options**: Handle mixed ES/CommonJS modules
5. **Pre-import React**: Import React before SDK in main.tsx

## Current Configuration

```typescript
resolve: {
  dedupe: ['react', 'react-dom'],
}
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('node_modules/react/')) {
          return 'react-vendor';
        }
      },
    },
  },
}
optimizeDeps: {
  include: ['react', 'react-dom', '@ffx/sdk'],
  force: true,
}
```

## If Issue Persists

The problem might be that the SDK's external React references aren't being resolved correctly at runtime. We may need to:

1. Check the built output to see how React is referenced
2. Ensure React vendor chunk loads before SDK code
3. Consider making React a true peerDependency in SDK
4. Verify the SDK's built files properly reference React from node_modules

## Testing

After deployment, check browser console for:
- React loading errors
- Module resolution errors
- Chunk loading order

