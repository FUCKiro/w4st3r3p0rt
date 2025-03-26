/*
  # Remove rapid responder and photo reporter badges
  
  1. Changes
    - Remove rapid_responder and photo_reporter badges from existing user stats
    - Update BADGES constant in code
*/

-- Remove badges from existing user stats
UPDATE user_stats
SET badges = array_remove(badges, 'rapid_responder');

UPDATE user_stats
SET badges = array_remove(badges, 'photo_reporter');