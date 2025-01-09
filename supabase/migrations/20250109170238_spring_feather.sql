/*
  # Add delete policy and delete reports
  
  1. Changes
    - Add policy to allow deletion of reports
  2. Security
    - Only authenticated users can delete reports
*/

-- Add delete policy for waste_reports
CREATE POLICY "Users can delete reports"
  ON waste_reports
  FOR DELETE
  TO authenticated
  USING (true);  -- Allowing all authenticated users to delete reports for testing purposes

-- Delete all reports
DELETE FROM waste_reports;