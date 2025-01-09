/*
  # Update XP and Level System
  
  1. Changes
    - Modify XP values for reports and verifications
    - Update level calculation
  
  2. Details
    - Reports now give 10 XP (was 50)
    - Verifications now give 2 XP (was 25)
    - Level is calculated as XP/100 + 1
*/

-- Update existing user stats to recalculate XP and levels
UPDATE user_stats
SET 
  xp = (reports_submitted * 10) + (reports_verified * 2),
  level = ((reports_submitted * 10) + (reports_verified * 2)) / 100 + 1;

-- Create function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp integer) RETURNS integer AS $$
BEGIN
  RETURN (xp / 100) + 1;
END;
$$ LANGUAGE plpgsql;