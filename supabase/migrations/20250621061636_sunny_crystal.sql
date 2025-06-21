/*
  # Initial ChamCode Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `total_xp` (integer, default 0)
      - `current_rank` (text, default 'Bronze')
      - `daily_streak` (integer, default 0)
      - `last_activity` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `lessons`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `type` (text)
      - `difficulty` (text)
      - `xp_reward` (integer)
      - `icon` (text)
      - `color` (text)
      - `order_index` (integer)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
    
    - `user_lessons`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `lesson_id` (uuid, references lessons)
      - `completed_at` (timestamptz)
      - `score` (integer)
      - `attempts` (integer, default 1)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading lesson data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  total_xp integer DEFAULT 0,
  current_rank text DEFAULT 'Bronze',
  daily_streak integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  difficulty text NOT NULL,
  xp_reward integer NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  order_index integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_lessons table
CREATE TABLE IF NOT EXISTS user_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  score integer DEFAULT 100,
  attempts integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all profiles for leaderboard"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Lessons policies
CREATE POLICY "Anyone can read active lessons"
  ON lessons
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User lessons policies
CREATE POLICY "Users can read own lesson progress"
  ON user_lessons
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own lesson progress"
  ON user_lessons
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own lesson progress"
  ON user_lessons
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Insert initial lessons data
INSERT INTO lessons (title, description, type, difficulty, xp_reward, icon, color, order_index) VALUES
  ('Python Variables', 'Learn about variable types and declarations', 'Multiple Choice', 'Beginner', 25, '📝', '#4CAF50', 1),
  ('Function Returns', 'Master function return statements', 'Fill in the Blank', 'Medium', 35, '✏️', '#2196F3', 2),
  ('For Loops', 'Practice loop syntax and iteration', 'Syntax Practice', 'Hard', 45, '🔄', '#FF9800', 3),
  ('Conditional Statements', 'Master if-else logic', 'Multiple Choice', 'Beginner', 30, '🤔', '#9C27B0', 4),
  ('Data Structures', 'Learn about lists and dictionaries', 'Fill in the Blank', 'Medium', 40, '📚', '#E91E63', 5),
  ('Object-Oriented Programming', 'Introduction to classes and objects', 'Syntax Practice', 'Hard', 50, '🏗️', '#FF5722', 6);

-- Function to update user rank based on XP
CREATE OR REPLACE FUNCTION update_user_rank()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_xp >= 2500 THEN
    NEW.current_rank = 'Gold';
  ELSIF NEW.total_xp >= 1000 THEN
    NEW.current_rank = 'Silver';
  ELSE
    NEW.current_rank = 'Bronze';
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update rank when XP changes
CREATE TRIGGER update_rank_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.total_xp IS DISTINCT FROM NEW.total_xp)
  EXECUTE FUNCTION update_user_rank();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, total_xp, current_rank, daily_streak)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    0,
    'Bronze',
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();