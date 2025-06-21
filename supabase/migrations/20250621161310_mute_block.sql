/*
  # Fix Authentication Database Triggers

  1. Database Functions
    - Create `handle_new_user()` function to automatically create user profiles
    - Create `uid()` helper function for RLS policies

  2. Triggers
    - Add trigger to automatically create profile when user signs up
    - Ensure proper user data handling from auth metadata

  3. Security
    - Maintain existing RLS policies
    - Ensure proper data flow from auth.users to profiles table
*/

-- Create helper function to get current user ID (if not exists)
CREATE OR REPLACE FUNCTION uid() 
RETURNS uuid 
LANGUAGE sql 
STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    total_xp,
    current_rank,
    daily_streak,
    display_tag,
    created_at,
    updated_at,
    last_activity,
    last_seen
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0,
    'Bronze',
    0,
    'WLU',
    NOW(),
    NOW(),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update user rank based on XP (if not exists)
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update rank based on total XP
  IF NEW.total_xp >= 10000 THEN
    NEW.current_rank = 'Diamond';
  ELSIF NEW.total_xp >= 5000 THEN
    NEW.current_rank = 'Platinum';
  ELSIF NEW.total_xp >= 2500 THEN
    NEW.current_rank = 'Gold';
  ELSIF NEW.total_xp >= 1000 THEN
    NEW.current_rank = 'Silver';
  ELSE
    NEW.current_rank = 'Bronze';
  END IF;
  
  -- Update timestamps
  NEW.updated_at = NOW();
  NEW.last_activity = NOW();
  
  RETURN NEW;
END;
$$;

-- Ensure the rank update trigger exists
DROP TRIGGER IF EXISTS update_rank_trigger ON public.profiles;
CREATE TRIGGER update_rank_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
  EXECUTE FUNCTION update_user_rank();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.lessons TO anon, authenticated;
GRANT ALL ON public.user_lessons TO anon, authenticated;
GRANT ALL ON public.friendships TO anon, authenticated;
GRANT ALL ON public.duels TO anon, authenticated;