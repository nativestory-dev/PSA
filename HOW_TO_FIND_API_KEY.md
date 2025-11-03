# How to Find Your Supabase Publishable API Key

## Quick Steps

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**: Click on your project (bzhpzcsspztecvnpogfh)
3. **Go to Settings**: Click "Settings" in the left sidebar (gear icon)
4. **Go to API**: Click "API" in the settings menu
5. **Find the key**: Look for one of these labels:
   - **"Publishable API Key"** (newer dashboard)
   - **"anon public"** key (older dashboard)
   - **"Project API keys"** → "anon" or "public" key

## What the Key Looks Like

A valid Supabase publishable key:
- ✅ Is a **JWT token** (starts with `eyJ`)
- ✅ Is **very long** (usually 200+ characters)
- ✅ Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...` (much longer)

**Example format:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6aHB6Y3NzcHp0ZWN2bnBvZ2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## What You Currently Have

Your current key: `sb_publishable_DQlj5n9ayKzcSoEHZXItLg_5BlCKCdy`

This doesn't look like a valid Supabase key. It might be:
- ❌ A placeholder from documentation
- ❌ An old/different format
- ❌ Not copied correctly

## Fix Your .env File

Once you have the correct key from the Supabase dashboard, update your `.env` file:

```env
REACT_APP_SUPABASE_URL=https://bzhpzcsspztecvnpogfh.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key here)
```

**Important:**
- ✅ Variable name must be exactly: `REACT_APP_SUPABASE_PUBLISHABLE_KEY`
- ✅ No spaces around the `=`
- ✅ No quotes around the values
- ✅ Restart your dev server after changing `.env`

## Visual Guide

In Supabase Dashboard → Settings → API, you'll see:

```
Project URL
https://bzhpzcsspztecvnpogfh.supabase.co

Project API keys
┌─────────────────────────────────────────┐
│ anon public                              │
│ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │  ← Copy this one
│ [Copy]                                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ service_role [secret]                    │  ← DON'T copy this one
│ (This is for server-side only)          │
└─────────────────────────────────────────┘
```

## After Updating

1. Save your `.env` file
2. **Restart your dev server** (stop with Ctrl+C, then run `npm start` again)
3. The error should be resolved!

## Still Having Issues?

- Make sure you copied the **entire** key (it's very long)
- Check there are no extra spaces or line breaks
- Verify the key starts with `eyJ`
- Try regenerating the key in Supabase if needed (Settings → API → Regenerate)

