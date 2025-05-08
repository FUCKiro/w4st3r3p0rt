/*
  # Remove potentially conflicting badges
  
  1. Changes
    - Remove rapid_responder, quick_response, and photo_reporter badges
    - Remove weekend_warrior and streak_week badges
    - Remove seasonal_guardian badge
    - Remove documentation_master badge
    - Remove distance_walker badge
    
  2. Security
    - Maintains existing RLS policies
*/

-- Remove badges from existing user stats
UPDATE user_stats
SET badges = array_remove(badges, 'rapid_responder');

UPDATE user_stats
SET badges = array_remove(badges, 'quick_response');

UPDATE user_stats
SET badges = array_remove(badges, 'photo_reporter');

UPDATE user_stats
SET badges = array_remove(badges, 'weekend_warrior');

UPDATE user_stats
SET badges = array_remove(badges, 'streak_week');

UPDATE user_stats
SET badges = array_remove(badges, 'seasonal_guardian');

UPDATE user_stats
SET badges = array_remove(badges, 'documentation_master');

UPDATE user_stats
SET badges = array_remove(badges, 'distance_walker');