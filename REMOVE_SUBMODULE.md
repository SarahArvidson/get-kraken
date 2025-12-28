# Remove Git Submodule - Instructions

The `ffs-sdk` directory needs to be converted from a submodule to regular files.

## Steps to Complete

1. **Commit the changes** (submodule removal + file addition):
   ```bash
   git add .
   git commit -m "Convert ffs-sdk from submodule to regular directory"
   ```

2. **Push to repository**:
   ```bash
   git push
   ```

## What Changed

- `ffs-sdk` submodule entry removed from git index
- `ffs-sdk` files added as regular tracked files
- This allows Netlify to clone the repository without submodule errors

## Verification

After pushing, verify on GitHub that:
- `ffs-sdk` appears as a regular directory (not a submodule link)
- All `ffs-sdk` files are visible in the repository

Then Netlify should be able to clone and build successfully.

