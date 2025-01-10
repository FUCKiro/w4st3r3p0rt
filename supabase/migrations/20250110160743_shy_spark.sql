/*
  # Fix foreign key relationship for waste_reports table

  1. Changes
    - Update foreign key reference to properly point to auth.users table
    - Add proper schema reference for the foreign key constraint

  2. Security
    - Maintains existing RLS policies
*/

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS waste_reports 
  DROP CONSTRAINT IF EXISTS waste_reports_user_id_fkey;

-- Add correct foreign key reference with schema
ALTER TABLE waste_reports
  ADD CONSTRAINT waste_reports_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Ensure RLS is still enabled
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;