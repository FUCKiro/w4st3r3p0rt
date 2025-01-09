/*
  # Reset Application Data
  
  1. Changes
    - Delete all waste reports
    - Delete all user statistics
    - Reset user XP and levels
  
  2. Security
    - Maintains existing RLS policies
    - Only affects data, not structure
*/

-- Delete all waste reports
DELETE FROM waste_reports;

-- Delete all user statistics
DELETE FROM user_stats;

-- Reset user stats for existing users
INSERT INTO user_stats (user_id, xp, level, reports_submitted, reports_verified, badges)
SELECT 
  id as user_id,
  0 as xp,
  1 as level,
  0 as reports_submitted,
  0 as reports_verified,
  ARRAY['{}']::text[] as badges
FROM auth.users
ON CONFLICT (user_id) 
DO UPDATE SET
  xp = 0,
  level = 1,
  reports_submitted = 0,
  reports_verified = 0,
  badges = ARRAY['{}']::text[];