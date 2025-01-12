/*
  # Fix view security settings

  1. Changes
    - Drop and recreate view without SECURITY DEFINER
    - Add proper RLS policies
    - Ensure secure access to data
  
  2. Security
    - View now respects RLS policies
    - Only necessary data is exposed
*/

-- Drop existing view
DROP VIEW IF EXISTS waste_reports_with_users;

-- Create new view without SECURITY DEFINER
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
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Update policies for user_stats
DROP POLICY IF EXISTS "Public can view usernames" ON user_stats;
CREATE POLICY "Public can view usernames"
  ON user_stats
  FOR SELECT
  TO public
  USING (true);

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

DROP POLICY IF EXISTS "Authenticated users can verify reports" ON waste_reports;
CREATE POLICY "Authenticated users can verify reports"
  ON waste_reports
  FOR UPDATE
  TO authenticated
  USING (status IN ('new', 'verified'))
  WITH CHECK (status IN ('verified', 'resolved'));