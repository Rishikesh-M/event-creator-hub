import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event_id, full_name, email, phone, form_data } = await req.json();
    const encryptionKey = Deno.env.get('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error('Encryption key not configured');
    }

    // Validate that the event exists and is published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('is_published')
      .eq('id', event_id)
      .single();

    if (eventError || !event?.is_published) {
      return new Response(
        JSON.stringify({ error: 'Event not found or not published' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Encrypt sensitive fields using the database function
    const { data: encryptedData, error: encryptError } = await supabase.rpc('encrypt_text', {
      data: JSON.stringify({ full_name, email, phone }),
      encryption_key: encryptionKey
    });

    if (encryptError) {
      console.error('Encryption error:', encryptError);
      throw new Error('Failed to encrypt data');
    }

    const encrypted = JSON.parse(
      await supabase.rpc('decrypt_text', { 
        encrypted_data: encryptedData, 
        encryption_key: encryptionKey 
      }).then(r => r.data)
    );

    // For encryption, we need to call the function for each field
    const { data: encryptedName } = await supabase.rpc('encrypt_text', {
      data: full_name,
      encryption_key: encryptionKey
    });

    const { data: encryptedEmail } = await supabase.rpc('encrypt_text', {
      data: email,
      encryption_key: encryptionKey
    });

    const { data: encryptedPhone } = await supabase.rpc('encrypt_text', {
      data: phone || '',
      encryption_key: encryptionKey
    });

    // Insert encrypted registration
    const { error: insertError } = await supabase
      .from('registrations')
      .insert({
        event_id,
        full_name: encryptedName,
        email: encryptedEmail,
        phone: encryptedPhone,
        payment_status: 'pending',
        form_data: form_data || {}
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Registration submitted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in submit-registration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
