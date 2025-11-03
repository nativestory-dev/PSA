-- ============================================
-- FIX RLS POLICIES FOR USER PROFILES
-- ============================================
-- This script fixes the RLS policy issue during user registration
-- Run this in Supabase SQL Editor after running schema.sql

-- Drop existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create improved policies that work with registration flow

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow profile creation during registration
-- This policy allows inserting if the id matches the authenticated user's id
-- During registration, Supabase auth creates the user first, then we create the profile
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- ALTERNATIVE: Use a database trigger to auto-create profiles
-- ============================================
-- This is the recommended approach - automatically create profile when user signs up

-- Function to handle new user signup
-- This runs with SECURITY DEFINER so it bypasses RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, subscription_plan, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'user',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(NEW.email, user_profiles.email),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now we can modify the insert policy to be more permissive OR remove it since trigger handles it
-- Option 1: Keep the policy (it will work now because trigger creates it)
-- Option 2: Make policy more permissive for registration flow

-- Update the insert policy to allow service role or authenticated users
-- Actually, with the trigger, we don't need client-side inserts anymore
-- But keep the policy for manual inserts if needed

-- ============================================
-- UPDATE YOUR CODE
-- ============================================
-- After running this SQL, update your AuthContext.tsx register function:
-- Remove the manual profile creation code since the trigger handles it automatically
-- Just call transformSupabaseUser after signup

