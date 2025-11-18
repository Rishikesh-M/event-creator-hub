-- Add UPDATE and DELETE policies for registrations table
CREATE POLICY "Event owners can update registrations"
ON public.registrations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = registrations.event_id
    AND events.user_id = auth.uid()
  )
);

CREATE POLICY "Event owners can delete registrations"
ON public.registrations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM events
    WHERE events.id = registrations.event_id
    AND events.user_id = auth.uid()
  )
);