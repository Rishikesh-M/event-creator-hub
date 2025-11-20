-- Add QR code and check-in fields to registrations
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS ticket_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
ADD COLUMN IF NOT EXISTS check_in_status BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMP WITH TIME ZONE;

-- Add custom fields configuration to events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS encryption_key TEXT;

-- Update existing events with a generated encryption key
UPDATE public.events 
SET encryption_key = encode(gen_random_bytes(32), 'hex')
WHERE encryption_key IS NULL;

-- Make encryption_key NOT NULL after populating
ALTER TABLE public.events
ALTER COLUMN encryption_key SET NOT NULL;

-- Create improved function to get registrations without user providing key
CREATE OR REPLACE FUNCTION public.get_event_registrations_auto(event_uuid uuid)
RETURNS TABLE(
  id uuid,
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
SET search_path = public
AS $$
DECLARE
  event_key text;
BEGIN
  -- Check if the user owns this event
  IF NOT EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_uuid 
    AND events.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not own this event';
  END IF;

  -- Get the encryption key for this event
  SELECT encryption_key INTO event_key
  FROM events
  WHERE id = event_uuid;

  -- Return decrypted registrations
  RETURN QUERY
  SELECT 
    r.id,
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

-- Create function to check in a registrant
CREATE OR REPLACE FUNCTION public.check_in_registrant(
  event_uuid uuid,
  ticket_token_input text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  registration_record record;
  event_key text;
BEGIN
  -- Check if the user owns this event
  IF NOT EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_uuid 
    AND events.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not own this event';
  END IF;

  -- Get the encryption key
  SELECT encryption_key INTO event_key
  FROM events
  WHERE id = event_uuid;

  -- Find and update the registration
  UPDATE public.registrations
  SET 
    check_in_status = TRUE,
    check_in_time = NOW()
  WHERE event_id = event_uuid 
    AND ticket_token = ticket_token_input
    AND check_in_status = FALSE
  RETURNING * INTO registration_record;

  IF registration_record IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid ticket or already checked in'
    );
  END IF;

  -- Return success with decrypted attendee info
  RETURN jsonb_build_object(
    'success', true,
    'attendee', jsonb_build_object(
      'name', public.decrypt_text(registration_record.full_name, event_key),
      'email', public.decrypt_text(registration_record.email, event_key),
      'checked_in_at', registration_record.check_in_time
    )
  );
END;
$$;