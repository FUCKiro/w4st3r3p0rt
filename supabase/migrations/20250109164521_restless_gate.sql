/*
  # Add user stats table for gamification

  1. New Tables
    - `user_stats`
      - `user_id` (uuid, primary key, references auth.users)
      - `xp` (integer, default 0)
      - `level` (integer, default 1)
      - `reports_submitted` (integer, default 0)
      - `reports_verified` (integer, default 0)
      - `badges` (text array, default empty array)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `user_stats` table
    - Add policies for users to:
      - Read their own stats
      - Update their own stats
*/

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  reports_submitted integer DEFAULT 0,
  reports_verified integer DEFAULT 0,
  badges text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add update trigger for updated_at
CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();