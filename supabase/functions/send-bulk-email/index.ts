import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, subject, message, eventName } = await req.json();

    console.log(`Sending bulk email to ${recipients.length} recipients`);

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failCount = 0;

    for (const batch of batches) {
      const promises = batch.map(async (recipient: { email: string; name: string }) => {
        try {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #4F46E5 0%, #9333EA 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                  .message { white-space: pre-wrap; margin: 20px 0; }
                  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">${eventName}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">${subject}</p>
                  </div>
                  <div class="content">
                    <p>Hello ${recipient.name},</p>
                    <div class="message">${message}</div>
                    <p>Best regards,<br>The ${eventName} Team</p>
                  </div>
                  <div class="footer">
                    <p>You're receiving this because you're registered for ${eventName}</p>
                    <p>Powered by EventPress</p>
                  </div>
                </div>
              </body>
            </html>
          `;

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'EventPress <onboarding@resend.dev>',
              to: [recipient.email],
              subject: subject,
              html: emailHtml,
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            console.error(`Failed to send to ${recipient.email}:`, error);
            failCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error sending to ${recipient.email}:`, error);
          failCount++;
        }
      });

      await Promise.all(promises);
      
      // Small delay between batches
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`Bulk email completed: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successCount,
        failed: failCount,
        total: recipients.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-bulk-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
