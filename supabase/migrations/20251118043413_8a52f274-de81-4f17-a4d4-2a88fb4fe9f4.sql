-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a function to encrypt sensitive data using AES-256
CREATE OR REPLACE FUNCTION public.encrypt_text(data text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF data IS NULL OR data = '' THEN
    RETURN NULL;
  END IF;
  RETURN encode(encrypt(data::bytea, encryption_key::bytea, 'aes'), 'base64');
END;
$$;

-- Create a function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_text(encrypted_data text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF encrypted_data IS NULL OR encrypted_data = '' THEN
    RETURN NULL;
  END IF;
  RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), encryption_key::bytea, 'aes'), 'utf8');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Create a function to get decrypted registrations for an event (event owners only)
CREATE OR REPLACE FUNCTION public.get_event_registrations(event_uuid uuid, encryption_key text)
RETURNS TABLE (
  id uuid,
  event_id uuid,
  full_name text,
  email text,
  phone text,
  ticket_type text,
  payment_status text,
  payment_id text,
  form_data jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the user owns this event
  IF NOT EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_uuid 
    AND events.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: You do not own this event';
  END IF;

  -- Return decrypted registrations
  RETURN QUERY
  SELECT 
    r.id,
    r.event_id,
    public.decrypt_text(r.full_name, encryption_key) as full_name,
    public.decrypt_text(r.email, encryption_key) as email,
    public.decrypt_text(r.phone, encryption_key) as phone,
    r.ticket_type,
    r.payment_status,
    r.payment_id,
    r.form_data,
    r.created_at
  FROM public.registrations r
  WHERE r.event_id = event_uuid;
END;
$$;