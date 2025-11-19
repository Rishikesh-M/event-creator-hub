-- Ensure RLS is enabled on registrations table
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Event owners can view registrations" ON public.registrations;

-- Recreate SELECT policy with explicit restriction
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