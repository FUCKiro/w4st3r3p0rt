/*
  # Fix function search paths

  1. Changes
    - Add explicit search_path to sync_username function
    - Add explicit search_path to update_updated_at_column function
    - Add explicit search_path to calculate_level function
*/

-- Fix sync_username function
CREATE OR REPLACE FUNCTION sync_username()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE user_stats
  SET username = NEW.raw_user_meta_data->>'username'
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix calculate_level function
CREATE OR REPLACE FUNCTION calculate_level(xp integer)
RETURNS integer
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  RETURN (xp / 100) + 1;
END;
$$;