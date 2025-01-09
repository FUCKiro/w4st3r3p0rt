/*
  # Reset all application data
  
  1. Changes
    - Delete all waste reports
    - Delete all user statistics
  2. Security
    - Maintains existing security policies
*/

-- Delete all waste reports
DELETE FROM waste_reports;

-- Delete all user statistics
DELETE FROM user_stats;