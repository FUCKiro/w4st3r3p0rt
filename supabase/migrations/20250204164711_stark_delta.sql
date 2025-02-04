/*
  # Fix Security Definer View Issue

  1. Changes
    - Drops and recreates waste_reports_with_users view without SECURITY DEFINER
    - Updates permissions and policies to ensure proper access control
    
  2. Security
    - Removes SECURITY DEFINER property from view
    - Maintains RLS policies
    - Ensures proper access control through standard policies
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

-- Update policies to ensure proper access control
DROP POLICY IF EXISTS "Public can view reports" ON waste_reports;
CREATE POLICY "Public can view reports"
  ON waste_reports
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public can view usernames" ON user_stats;
CREATE POLICY "Public can view usernames"
  ON user_stats
  FOR SELECT
  TO public
  USING (true);