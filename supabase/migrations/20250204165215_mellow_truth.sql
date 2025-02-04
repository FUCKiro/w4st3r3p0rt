/*
  # Final Fix for Security Definer View Issue

  1. Changes
    - Drops and recreates waste_reports_with_users view explicitly without SECURITY DEFINER
    - Ensures proper schema usage and permissions
    - Sets up correct RLS policies
    
  2. Security
    - Uses explicit schema references
    - Sets proper search path
    - Maintains RLS enforcement
*/

-- Set proper search path
SET search_path TO public;

-- Drop existing view
DROP VIEW IF EXISTS waste_reports_with_users;

-- Create new view explicitly without SECURITY DEFINER and with schema qualification
CREATE VIEW public.waste_reports_with_users AS
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
  public.waste_reports wr
  LEFT JOIN public.user_stats us ON wr.user_id = us.user_id;

-- Revoke all existing permissions
REVOKE ALL ON public.waste_reports_with_users FROM PUBLIC;

-- Grant minimal required permissions
GRANT SELECT ON public.waste_reports_with_users TO authenticated;
GRANT SELECT ON public.waste_reports_with_users TO anon;

-- Ensure RLS is enabled
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Recreate policies with explicit schema references
DROP POLICY IF EXISTS "Public can view reports" ON public.waste_reports;
CREATE POLICY "Public can view reports"
  ON public.waste_reports
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Public can view usernames" ON public.user_stats;
CREATE POLICY "Public can view usernames"
  ON public.user_stats
  FOR SELECT
  TO public
  USING (true);