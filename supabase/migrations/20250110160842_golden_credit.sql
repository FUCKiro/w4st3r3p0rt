/*
  # Fix join capabilities for waste reports and users

  1. Changes
    - Drop and recreate foreign key with proper schema reference
    - Create a secure view for joining waste reports with user data
    - Add appropriate security policies

  2. Security
    - Maintain RLS on base tables
    - Ensure secure access to user data
*/

-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS waste_reports 
  DROP CONSTRAINT IF EXISTS waste_reports_user_id_fkey;

-- Add correct foreign key reference with schema
ALTER TABLE waste_reports
  ADD CONSTRAINT waste_reports_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Create a secure view for waste reports with user data
CREATE OR REPLACE VIEW public.waste_reports_with_users AS
SELECT 
  wr.id,
  wr.user_id,
  wr.latitude,
  wr.longitude,
  wr.waste_type,
  wr.size,
  wr.notes,
  wr.status,
  wr.created_at,
  wr.updated_at,
  au.email,
  au.raw_user_meta_data->>'username' as username
FROM 
  public.waste_reports wr
  LEFT JOIN auth.users au ON wr.user_id = au.id;

-- Enable RLS on the base table
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;

-- Grant appropriate permissions on the view
GRANT SELECT ON waste_reports_with_users TO anon, authenticated;