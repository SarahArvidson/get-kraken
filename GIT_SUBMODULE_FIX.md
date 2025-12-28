# Git Submodule Fix for Netlify

## Problem
Netlify was failing with:
```
Error checking out submodules: fatal: No url found for submodule path 'ffs-sdk' in .gitmodules
```

The `ffs-sdk` directory was registered as a git submodule but should be regular tracked files.

## Solution Applied

1. **Removed submodule entry**: `git rm --cached ffs-sdk`
2. **Removed nested .git repository**: Deleted `ffs-sdk/.git` folder
3. **Added as regular files**: `git add ffs-sdk/`
4. **Updated .gitignore**: Added `ffs-sdk/dist` and `ffs-sdk/node_modules` to ignore build artifacts
5. **Created .gitattributes**: Ensures `ffs-sdk` is treated as regular files

## Next Steps

You need to commit these changes:

```bash
git add .
git commit -m "Convert ffs-sdk from submodule to regular directory for Netlify deployment"
git push
```

After pushing, Netlify will be able to clone the repository normally without trying to fetch a submodule.

## What Changed

- `ffs-sdk` is now tracked as regular files (not a submodule)
- SDK's `.git` folder was removed (it's now part of the main repo)
- Build artifacts (`ffs-sdk/dist`, `ffs-sdk/node_modules`) are gitignored
- The SDK will be built during Netlify's build process via the `prebuild` script

## Verification

After pushing, Netlify should:
1. ✅ Clone the repository successfully
2. ✅ Run `npm ci` to install dependencies
3. ✅ Run `npm run build` which triggers `prebuild` → `build:sdk`
4. ✅ Build the SDK, then build the app
5. ✅ Deploy successfully

