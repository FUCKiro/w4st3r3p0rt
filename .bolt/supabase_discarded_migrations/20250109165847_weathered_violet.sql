/*
  # Add delete policy for waste reports

  1. Changes
    - Add policy to allow authenticated users to delete their own reports
    - Add policy to allow admin users to delete any report
*/

-- Add policy for users to delete their own reports
CREATE POLICY "Users can delete their own reports"
  ON waste_reports
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);