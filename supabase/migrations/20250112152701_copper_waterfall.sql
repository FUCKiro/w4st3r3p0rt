/*
  # Fix username display

  1. Changes
    - Update existing user_stats records with username from auth.users metadata
    - Add NOT NULL constraint to username column
    - Add trigger to sync username between auth.users and user_stats
*/

-- Update existing records with username from auth metadata
UPDATE user_stats us
SET username = (
  SELECT raw_user_meta_data->>'username'
  FROM auth.users au
  WHERE au.id = us.user_id
)
WHERE username IS NULL;

-- Add NOT NULL constraint to username
ALTER TABLE user_stats
ALTER COLUMN username SET NOT NULL;

-- Create function to sync username
CREATE OR REPLACE FUNCTION sync_username()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats
  SET username = NEW.raw_user_meta_data->>'username'
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync username on auth.users update
DROP TRIGGER IF EXISTS sync_username_trigger ON auth.users;
CREATE TRIGGER sync_username_trigger
  AFTER UPDATE OF raw_user_meta_data
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_username();