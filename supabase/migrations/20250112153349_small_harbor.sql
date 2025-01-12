/*
  # Optimize RLS policies performance

  1. Changes
    - Optimize user_stats RLS policies using subqueries for auth functions
    - Optimize waste_reports RLS policies using subqueries for auth functions
    - Update view permissions
*/

-- Optimize user_stats policies
DROP POLICY IF EXISTS "Users can view their own stats" ON user_stats;
CREATE POLICY "Users can view their own stats"
  ON user_stats
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own stats" ON user_stats;
CREATE POLICY "Users can update their own stats"
  ON user_stats
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own stats" ON user_stats;
CREATE POLICY "Users can insert their own stats"
  ON user_stats
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Optimize waste_reports policies
DROP POLICY IF EXISTS "Users can create reports" ON waste_reports;
CREATE POLICY "Users can create reports"
  ON waste_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own reports" ON waste_reports;
CREATE POLICY "Users can update their own reports"
  ON waste_reports
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Keep the public view policies as they don't use auth functions
DROP POLICY IF EXISTS "Public can view usernames" ON user_stats;
CREATE POLICY "Public can view usernames"
  ON user_stats
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public can view reports" ON waste_reports;
CREATE POLICY "Public can view reports"
  ON waste_reports
  FOR SELECT
  TO public
  USING (true);

-- Update verify reports policy to use subquery
DROP POLICY IF EXISTS "Authenticated users can verify reports" ON waste_reports;
CREATE POLICY "Authenticated users can verify reports"
  ON waste_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid())
    AND status IN ('new', 'verified')
  )
  WITH CHECK (status IN ('verified', 'resolved'));