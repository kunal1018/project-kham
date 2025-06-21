/*
  # Add Friends System and Real-time Features

  1. New Tables
    - `friendships`
      - `id` (uuid, primary key)
      - `requester_id` (uuid, references profiles)
      - `addressee_id` (uuid, references profiles)
      - `status` (text, 'pending', 'accepted', 'declined', 'blocked')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `duels`
      - `id` (uuid, primary key)
      - `challenger_id` (uuid, references profiles)
      - `opponent_id` (uuid, references profiles)
      - `status` (text, 'pending', 'active', 'completed', 'cancelled')
      - `winner_id` (uuid, references profiles, nullable)
      - `xp_reward` (integer)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz, nullable)

  2. Enhanced Tables
    - Add `display_tag` to profiles
    - Add `last_seen` to profiles for online status

  3. Security
    - Enable RLS on new tables
    - Add policies for friend management
    - Add policies for duel system

  4. Functions
    - Function to get user rank position
    - Function to get friends leaderboard
    - Function to handle friend requests
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_tag'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_tag text DEFAULT 'WLU';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;
END $$;

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create duels table
CREATE TABLE IF NOT EXISTS duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  opponent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  winner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  xp_reward integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;

-- Friendships policies
CREATE POLICY "Users can view their own friendships"
  ON friendships
  FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships
  FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update friendships they're involved in"
  ON friendships
  FOR UPDATE
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Duels policies
CREATE POLICY "Users can view their own duels"
  ON duels
  FOR SELECT
  TO authenticated
  USING (challenger_id = auth.uid() OR opponent_id = auth.uid());

CREATE POLICY "Users can create duels"
  ON duels
  FOR INSERT
  TO authenticated
  WITH CHECK (challenger_id = auth.uid());

CREATE POLICY "Users can update duels they're involved in"
  ON duels
  FOR UPDATE
  TO authenticated
  USING (challenger_id = auth.uid() OR opponent_id = auth.uid());

-- Function to get user's rank position
CREATE OR REPLACE FUNCTION get_user_rank_position(user_id_param uuid)
RETURNS integer AS $$
DECLARE
  user_rank integer;
BEGIN
  SELECT rank_position INTO user_rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY total_xp DESC) as rank_position
    FROM profiles
  ) ranked_users
  WHERE id = user_id_param;
  
  RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get friends list with their stats
CREATE OR REPLACE FUNCTION get_friends_with_stats(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  username text,
  total_xp integer,
  current_rank text,
  display_tag text,
  last_seen timestamptz,
  friendship_status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.total_xp,
    p.current_rank,
    p.display_tag,
    p.last_seen,
    f.status as friendship_status
  FROM profiles p
  JOIN friendships f ON (
    (f.requester_id = user_id_param AND f.addressee_id = p.id) OR
    (f.addressee_id = user_id_param AND f.requester_id = p.id)
  )
  WHERE f.status = 'accepted'
  ORDER BY p.total_xp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send friend request
CREATE OR REPLACE FUNCTION send_friend_request(requester_id_param uuid, addressee_username text)
RETURNS json AS $$
DECLARE
  addressee_id_found uuid;
  existing_friendship friendships%ROWTYPE;
  result json;
BEGIN
  -- Find the addressee by username
  SELECT id INTO addressee_id_found
  FROM profiles
  WHERE username = addressee_username;
  
  IF addressee_id_found IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'User not found');
  END IF;
  
  IF addressee_id_found = requester_id_param THEN
    RETURN json_build_object('success', false, 'message', 'Cannot send friend request to yourself');
  END IF;
  
  -- Check if friendship already exists
  SELECT * INTO existing_friendship
  FROM friendships
  WHERE (requester_id = requester_id_param AND addressee_id = addressee_id_found)
     OR (requester_id = addressee_id_found AND addressee_id = requester_id_param);
  
  IF existing_friendship.id IS NOT NULL THEN
    IF existing_friendship.status = 'accepted' THEN
      RETURN json_build_object('success', false, 'message', 'Already friends');
    ELSIF existing_friendship.status = 'pending' THEN
      RETURN json_build_object('success', false, 'message', 'Friend request already sent');
    ELSIF existing_friendship.status = 'blocked' THEN
      RETURN json_build_object('success', false, 'message', 'Cannot send friend request');
    END IF;
  END IF;
  
  -- Create new friend request
  INSERT INTO friendships (requester_id, addressee_id, status)
  VALUES (requester_id_param, addressee_id_found, 'pending');
  
  RETURN json_build_object('success', true, 'message', 'Friend request sent');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to respond to friend request
CREATE OR REPLACE FUNCTION respond_to_friend_request(user_id_param uuid, friendship_id_param uuid, response text)
RETURNS json AS $$
DECLARE
  friendship_record friendships%ROWTYPE;
BEGIN
  -- Get the friendship record
  SELECT * INTO friendship_record
  FROM friendships
  WHERE id = friendship_id_param
    AND addressee_id = user_id_param
    AND status = 'pending';
  
  IF friendship_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Friend request not found');
  END IF;
  
  -- Update the friendship status
  UPDATE friendships
  SET status = response, updated_at = now()
  WHERE id = friendship_id_param;
  
  RETURN json_build_object('success', true, 'message', 'Friend request ' || response);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a duel
CREATE OR REPLACE FUNCTION complete_duel(duel_id_param uuid, winner_id_param uuid, xp_reward_param integer)
RETURNS json AS $$
DECLARE
  duel_record duels%ROWTYPE;
  loser_id uuid;
  loser_xp integer;
BEGIN
  -- Get the duel record
  SELECT * INTO duel_record
  FROM duels
  WHERE id = duel_id_param AND status = 'active';
  
  IF duel_record.id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Duel not found or not active');
  END IF;
  
  -- Determine loser
  IF winner_id_param = duel_record.challenger_id THEN
    loser_id := duel_record.opponent_id;
  ELSE
    loser_id := duel_record.challenger_id;
  END IF;
  
  -- Update winner's XP
  UPDATE profiles
  SET total_xp = total_xp + xp_reward_param,
      last_activity = now()
  WHERE id = winner_id_param;
  
  -- Give consolation XP to loser (smaller amount)
  loser_xp := GREATEST(xp_reward_param / 3, 3);
  UPDATE profiles
  SET total_xp = total_xp + loser_xp,
      last_activity = now()
  WHERE id = loser_id;
  
  -- Update duel status
  UPDATE duels
  SET status = 'completed',
      winner_id = winner_id_param,
      xp_reward = xp_reward_param,
      completed_at = now()
  WHERE id = duel_id_param;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Duel completed',
    'winner_xp', xp_reward_param,
    'loser_xp', loser_xp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, total_xp, current_rank, daily_streak, display_tag)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
    0,
    'Bronze',
    0,
    'WLU'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;