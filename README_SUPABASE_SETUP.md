# Supabase Setup Guide

This guide will walk you through setting up Supabase for the People Search App.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: people-search-app (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient to start

## Step 2: Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **Publishable API Key** (also called "anon/public key" - this is safe to use in client-side code)

## Step 3: Set Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
   ```
   
   **Note**: The publishable key is safe to use in client-side applications. It's also referred to as the "anon" or "public" key in some documentation.

## Step 4: Run the Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql`
4. Paste and run the query (click "Run" or press Ctrl+Enter)
5. Verify tables were created by checking **Table Editor** in the sidebar

## Step 5: (Optional) Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Enable "Email" provider
3. Configure email templates if needed (under **Authentication** → **Email Templates**)

## Step 6: Test the Connection

1. Start your development server:
   ```bash
   npm start
   ```

2. Try registering a new user
3. Check **Authentication** → **Users** in Supabase dashboard to see the new user

## Step 7: Seed Sample Data (Optional)

To test the app with sample data, you can:

1. Go to **Table Editor** → **people**
2. Insert sample records manually, or
3. Create a seed script in `supabase/seed.sql` and run it

## Database Structure

The database includes:

- **user_profiles**: Extended user information (linked to Supabase auth)
- **people**: People profiles being searched
- **experience**: Work experience records
- **education**: Education records
- **social_profiles**: Social media links
- **search_history**: User search queries and results
- **export_requests**: Data export tracking
- **connections**: User-person connections (future feature)

## Row Level Security (RLS)

RLS policies are enabled to ensure:
- Users can only see their own data (search history, exports)
- Public data (people profiles) is viewable by all authenticated users
- Users can only modify their own profiles

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env` file exists and has correct values
- Restart the dev server after changing `.env`

### Authentication not working
- Check that Email provider is enabled in Supabase
- Verify RLS policies are active
- Check browser console for errors

### Database connection errors
- Verify your Project URL is correct
- Check that publishable API key has proper permissions
- Ensure you've run the schema.sql script

## Next Steps

- Set up storage buckets for avatar uploads (if needed)
- Configure email templates for auth emails
- Add more RLS policies based on subscription plans
- Set up database functions for complex queries

For more information, visit [Supabase Documentation](https://supabase.com/docs)

