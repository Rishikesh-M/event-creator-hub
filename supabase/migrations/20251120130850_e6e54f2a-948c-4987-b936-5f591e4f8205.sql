-- Drop and recreate the get_event_registrations_auto function with properly qualified columns
DROP FUNCTION IF EXISTS public.get_event_registrations_auto(uuid);

CREATE OR REPLACE FUNCTION public.get_event_registrations_auto(event_uuid uuid)
RETURNS TABLE(
  registration_id uuid,
  event_id uuid,
  full_name text,
  email text,
  phone text,
  ticket_type text,
  payment_status text,
  payment_id text,
  form_data jsonb,
  created_at timestamp with time zone,
  ticket_token text,
  check_in_status boolean,
  check_in_time timestamp with time zone,
  image_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  event_key text;
BEGIN
  -- Check if the user owns this event
  IF NOT EXISTS (
    SELECT 1 FROM events e
    WHERE e.id = event_uuid 
    AND e.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not own this event';
  END IF;

  -- Get the encryption key for this event
  SELECT e.encryption_key INTO event_key
  FROM events e
  WHERE e.id = event_uuid;

  -- Return decrypted registrations with fully qualified columns
  RETURN QUERY
  SELECT 
    r.id as registration_id,
    r.event_id,
    public.decrypt_text(r.full_name, event_key) as full_name,
    public.decrypt_text(r.email, event_key) as email,
    public.decrypt_text(r.phone, event_key) as phone,
    r.ticket_type,
    r.payment_status,
    r.payment_id,
    r.form_data,
    r.created_at,
    r.ticket_token,
    r.check_in_status,
    r.check_in_time,
    r.image_url
  FROM public.registrations r
  WHERE r.event_id = event_uuid;
END;
$$;