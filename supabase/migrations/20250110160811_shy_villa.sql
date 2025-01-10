/*
  # Fix join capabilities for waste reports and users

  1. Changes
    - Drop and recreate foreign key with proper schema reference
    - Add view for joining waste reports with user data
    - Update RLS policies to allow access to the view

  2. Security
    - Maintain RLS on base tables
    - Add appropriate policies for the view
*/

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS waste_reports 
  DROP CONSTRAINT IF EXISTS waste_reports_user_id_fkey;

-- Add correct foreign key reference with schema
ALTER TABLE waste_reports
  ADD CONSTRAINT waste_reports_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Create a view that joins waste_reports with user data
CREATE OR REPLACE VIEW public.waste_reports_with_users AS
SELECT 
  wr.*,
  au.email,
  au.raw_user_meta_data->>'username' as username
FROM 
  public.waste_reports wr
  LEFT JOIN auth.users au ON wr.user_id = au.id;

-- Enable RLS on the view
ALTER VIEW waste_reports_with_users SET (security_invoker = true);

-- Create policy for the view
CREATE POLICY "Anyone can view waste reports with user data"
  ON waste_reports_with_users
  FOR SELECT
  TO public
  USING (true);

-- Ensure RLS is still enabled on base table
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;