# Supabase Email Confirmation Setup

## Problem

By default, Supabase requires users to confirm their email address before they can log in. This causes the "Account created but login failed" error.

## Solution Options

You have two options:

### Option 1: Disable Email Confirmation (Recommended for Simple Apps)

This allows users to log in immediately after signup without email confirmation.

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Settings** (or **Auth** → **URL Configuration**)
4. Find **"Enable email confirmations"** or **"Confirm email"**
5. **Disable** email confirmation
6. Save changes

After this, users will be able to log in immediately after signup.

### Option 2: Keep Email Confirmation (More Secure)

If you want to keep email confirmation enabled:

1. Users will receive a confirmation email after signup
2. They need to click the confirmation link in the email
3. After confirming, they can log in normally
4. The app will show a message: "Please check your email to confirm your account"

## Current Behavior

The app now:
- ✅ Shows a clear message when email confirmation is required
- ✅ Automatically logs in users if email confirmation is disabled
- ✅ Handles both scenarios gracefully

## Testing

After disabling email confirmation:
1. Try creating a new account
2. You should be logged in immediately
3. No confirmation email will be sent

## Security Note

For a simple habit tracker, disabling email confirmation is usually fine. For production apps handling sensitive data, consider keeping it enabled.

