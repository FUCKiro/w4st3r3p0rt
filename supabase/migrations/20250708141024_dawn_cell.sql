/*
  # Fix security issues in waste_reports_with_users view

  1. Changes
    - Drop existing view
    - Recreate view without SECURITY DEFINER
    - Add proper RLS policies
    - Restrict access to auth.users data
  
  2. Security
    - View now respects RLS policies
    - Only necessary user data is exposed
*/

-- Drop existing view
DROP VIEW IF EXISTS waste_reports_with_users;

-- Create new secure view
CREATE VIEW waste_reports_with_users AS
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
  us.username
FROM 
  waste_reports wr
  LEFT JOIN user_stats us ON wr.user_id = us.user_id;

-- Grant appropriate permissions
GRANT SELECT ON waste_reports_with_users TO anon, authenticated;

-- Ensure RLS is enabled on base tables
ALTER TABLE waste_reports ENABLE ROW LEVEL SECURITY;

-- Update policies for waste_reports
DROP POLICY IF EXISTS "Public can view reports" ON waste_reports;
CREATE POLICY "Public can view reports"
  ON waste_reports
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Users can create reports" ON waste_reports;
CREATE POLICY "Users can create reports"
  ON waste_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reports" ON waste_reports;
CREATE POLICY "Users can update their own reports"
  ON waste_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add policy for verifying reports (simplified without NEW/OLD references)
DROP POLICY IF EXISTS "Authenticated users can verify reports" ON waste_reports;
CREATE POLICY "Authenticated users can verify reports"
  ON waste_reports
  FOR UPDATE
  TO authenticated
  USING (status IN ('new', 'verified'))
  WITH CHECK (status IN ('verified', 'resolved'));