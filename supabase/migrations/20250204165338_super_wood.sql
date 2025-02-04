/*
  # Final Fix for Security Definer View Issue

  1. Changes
    - Explicitly removes SECURITY DEFINER from view
    - Recreates view with proper schema and permissions
    - Ensures view inherits caller security context
    
  2. Security
    - Uses explicit schema references
    - Enforces proper RLS inheritance
    - Sets minimal required permissions
*/

-- Drop existing view completely
DROP VIEW IF EXISTS public.waste_reports_with_users;

-- Create new view with SECURITY INVOKER explicitly
CREATE VIEW public.waste_reports_with_users
    WITH (security_barrier = true, security_invoker = true)
AS
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

-- Reset permissions
REVOKE ALL ON public.waste_reports_with_users FROM PUBLIC;
GRANT SELECT ON public.waste_reports_with_users TO authenticated, anon;

-- Ensure RLS is enabled on base tables
ALTER TABLE public.waste_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Recreate base policies
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