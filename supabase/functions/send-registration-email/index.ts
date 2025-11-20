import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  email: string;
  fullName: string;
  eventName: string;
  ticketToken: string;
  eventId: string;
  eventDate?: string;
  eventVenue?: string;
}

// Generate iCalendar (.ics) content
const generateICS = (eventName: string, eventDate: string, eventVenue: string) => {
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const startDate = new Date(eventDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endDate = new Date(new Date(eventDate).getTime() + 2 * 60 * 60 * 1000)
    .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EventSite CMS//Event Registration//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${crypto.randomUUID()}@eventsitecms.com
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${eventName}
LOCATION:${eventVenue || 'TBD'}
DESCRIPTION:You are registered for ${eventName}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, eventName, ticketToken, eventDate, eventVenue }: RegistrationEmailRequest = await req.json();

    console.log(`Sending registration email to ${email} for event: ${eventName}`);

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${ticketToken}`;

    // Prepare attachments
    const attachments: any[] = [];
    
    // Add calendar invite if event date is provided
    if (eventDate) {
      const icsContent = generateICS(eventName, eventDate, eventVenue || '');
      const encoder = new TextEncoder();
      const data = encoder.encode(icsContent);
      const base64 = btoa(String.fromCharCode(...data));
      attachments.push({
        filename: 'event-invite.ics',
        content: base64,
      });
    }

    const emailResponse = await resend.emails.send({
      from: "EventSiteCMS <onboarding@resend.dev>",
      to: [email],
      subject: `Registration Confirmed - ${eventName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .event-details {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
              }
              .detail-row {
                margin: 10px 0;
              }
              .label {
                font-weight: 600;
                color: #667eea;
              }
              .footer {
                text-align: center;
                color: #888;
                font-size: 12px;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ Registration Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${name}</strong>,</p>
              <p>Thank you for registering for <strong>${eventName}</strong>! We're excited to have you join us.</p>
              
              <div class="event-details">
                <h3>Event Details</h3>
                <div class="detail-row">
                  <span class="label">Event:</span> ${eventName}
                </div>
                <div class="detail-row">
                  <span class="label">Date:</span> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                ${eventVenue ? `
                <div class="detail-row">
                  <span class="label">Venue:</span> ${eventVenue}
                </div>
                ` : ''}
              </div>

              <p>Please keep this email for your records. We look forward to seeing you at the event!</p>
              
              <p>If you have any questions, please don't hesitate to reach out to the event organizer.</p>
              
              <p>Best regards,<br><strong>EventSiteCMS Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated confirmation email. Please do not reply to this message.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailResponse.error) {
      console.error("Error sending email:", emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-registration-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
