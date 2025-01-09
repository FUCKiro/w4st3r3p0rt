/*
  # Update RLS policies to allow public viewing

  1. Changes
    - Drop existing select policy
    - Create new policy for public viewing of reports
    - Keep existing insert policy unchanged

  2. Security
    - Allow anyone to view reports
    - Keep write operations restricted to authenticated users
*/

-- Drop the existing select policy
DROP POLICY IF EXISTS "Everyone can view reports" ON waste_reports;

-- Create new policy for public viewing
CREATE POLICY "Public can view reports"
  ON waste_reports
  FOR SELECT
  TO public
  USING (true);