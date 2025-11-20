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

    const registrationData = await req.json();
    const { eventId, fullName, email, phone, ticketType, formData, imageUrl } = registrationData;

    console.log('Processing registration for event:', eventId);

    // Validate required fields
    if (!fullName || !email) {
      console.error('Missing required fields:', { fullName, email });
      return new Response(
        JSON.stringify({ error: 'Full name and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get event details and encryption key
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, is_published, encryption_key, start_date, venue')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!event.is_published) {
      return new Response(
        JSON.stringify({ error: 'Event is not published' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Encrypt sensitive data using event's encryption key
    const { data: encryptedName } = await supabase.rpc('encrypt_text', {
      data: fullName,
      encryption_key: event.encryption_key
    });

    const { data: encryptedEmail } = await supabase.rpc('encrypt_text', {
      data: email,
      encryption_key: event.encryption_key
    });

    const { data: encryptedPhone } = phone ? await supabase.rpc('encrypt_text', {
      data: phone,
      encryption_key: event.encryption_key
    }) : { data: null };

    // Insert registration with encrypted data
    const { data: registration, error: insertError } = await supabase
      .from('registrations')
      .insert({
        event_id: eventId,
        full_name: encryptedName,
        email: encryptedEmail,
        phone: encryptedPhone,
        ticket_type: ticketType,
        payment_status: 'completed',
        form_data: formData || {},
        image_url: imageUrl
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create registration:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create registration' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Registration created successfully:', registration.id);

    // Send confirmation email asynchronously (don't wait for it)
    supabase.functions.invoke('send-registration-email', {
      body: {
        email,
        fullName,
        eventName: event.name,
        ticketToken: registration.ticket_token,
        eventId,
        eventDate: event.start_date,
        eventVenue: event.venue
      }
    }).catch(err => console.error('Email sending failed:', err));

    return new Response(
      JSON.stringify({ 
        success: true, 
        registrationId: registration.id,
        ticketToken: registration.ticket_token
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in submit-registration:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
