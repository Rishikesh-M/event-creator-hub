-- Fix Critical Security Issues

-- 1. Drop any overly permissive policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- 2. Ensure profiles can only be viewed by the owner
-- (The existing policy should be sufficient, but let's make sure)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
  END IF;
END $$;

-- 3. Create a secure view for public events that doesn't expose user_id
CREATE OR REPLACE VIEW public.public_events AS
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

-- 4. Grant access to the public view
GRANT SELECT ON public.public_events TO anon, authenticated;

-- 5. Ensure registrations table has proper RLS
-- Drop any public access policies
DROP POLICY IF EXISTS "Anyone can view registrations" ON public.registrations;
DROP POLICY IF EXISTS "Public can view registrations" ON public.registrations;

-- Verify the correct policy exists for event owners only
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'registrations' 
    AND policyname = 'Event owners can view registrations'
  ) THEN
    CREATE POLICY "Event owners can view registrations"
    ON public.registrations
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = registrations.event_id
        AND events.user_id = auth.uid()
      )
    );
  END IF;
END $$;