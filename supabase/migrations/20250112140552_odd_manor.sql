/*
  # Add username column to user_stats

  1. Changes
    - Add username column to user_stats table
    - Add unique constraint on username
    - Add index for faster username lookups
*/

-- Add username column
ALTER TABLE user_stats
ADD COLUMN username text;

-- Add unique constraint
ALTER TABLE user_stats
ADD CONSTRAINT user_stats_username_key UNIQUE (username);

-- Add index for faster lookups
CREATE INDEX user_stats_username_idx ON user_stats (username);

-- Update existing records with username from auth.users metadata
DO $$
BEGIN
  UPDATE user_stats us
  SET username = (
    SELECT raw_user_meta_data->>'username'
    FROM auth.users au
    WHERE au.id = us.user_id
  );
END $$;