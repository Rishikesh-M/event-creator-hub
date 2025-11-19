-- Fix the security definer view issue
DROP VIEW IF EXISTS public.public_events;

-- Create a regular view (SECURITY INVOKER is the default)
CREATE VIEW public.public_events 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  slug,
  description,
  start_date,
  end_date,
  venue,
  banner_url,
  is_published,
  created_at,
  updated_at
FROM public.events
WHERE is_published = true;

-- Grant access to the view
GRANT SELECT ON public.public_events TO anon, authenticated;