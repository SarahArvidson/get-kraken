# Netlify Deployment Setup Guide

## One-Time Setup (Required)

Netlify needs to be connected to your GitHub repository to enable automatic deployments. Follow these steps:

### Step 1: Connect Repository to Netlify

1. **Go to [Netlify Dashboard](https://app.netlify.com/)**

   - Sign up or log in with your GitHub account

2. **Add a New Site**

   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"
   - Authorize Netlify to access your GitHub repositories
   - Select your `get-kraken` repository

3. **Configure Build Settings**

   - Netlify should auto-detect settings from `netlify.toml`, but verify:
     - **Build command:** `npm ci && npm run build`
     - **Publish directory:** `dist`
     - **Node version:** `20` (should be set automatically)

4. **Set Environment Variables**

   - Go to Site settings → Environment variables
   - Add the following:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key
   - ⚠️ **Important:** These must be set in Netlify, not just locally!

5. **Deploy**
   - Click "Deploy site"
   - Netlify will run the build and deploy your app

### Step 2: Configure Automatic Deployments

After the initial setup, Netlify will automatically:

- ✅ **Deploy on every push** to your main/master branch
- ✅ **Create preview deployments** for pull requests
- ✅ **Rebuild** when you push changes

### Step 3: Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Follow Netlify's DNS configuration instructions

## After Setup

Once connected, **every push to GitHub will automatically trigger a new deployment**. You'll see:

- Build status in the Netlify dashboard
- Deploy previews for each commit
- Automatic HTTPS certificate
- Your app live at `https://your-site-name.netlify.app`

## Troubleshooting

### Build Fails

1. **Check build logs** in Netlify dashboard
2. **Verify environment variables** are set correctly
3. **Check Node version** matches (should be 20)
4. **Ensure SDK builds** - The `prebuild` script should build the SDK automatically

### Environment Variables Not Working

- Make sure variables are set in **Netlify dashboard**, not just `.env` file
- Variable names must start with `VITE_` to be accessible in the app
- Redeploy after adding/changing environment variables

### SDK Build Issues

- The `postinstall` script should build the SDK automatically
- If it fails, check that `../ffs-sdk` exists and has a valid `package.json`

## Quick Checklist

- [ ] Repository connected to Netlify
- [ ] Build settings configured (auto-detected from netlify.toml)
- [ ] Environment variables set in Netlify dashboard:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Initial deployment successful
- [ ] Test automatic deployment by pushing a small change

## Current Configuration

Your `netlify.toml` is already configured with:

- ✅ Build command: `npm ci && npm run build`
- ✅ Publish directory: `dist`
- ✅ Node version: `20`
- ✅ SDK auto-build via `prebuild` script

You just need to connect the repository and set environment variables!
