-- Add event templates table
CREATE TABLE IF NOT EXISTS public.event_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_templates
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_templates
CREATE POLICY "Users can view own templates" 
ON public.event_templates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own templates" 
ON public.event_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" 
ON public.event_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" 
ON public.event_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add advanced ticketing fields to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS capacity INTEGER,
ADD COLUMN IF NOT EXISTS waitlist_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ticket_tiers JSONB DEFAULT '[]'::jsonb;

-- Add communication/announcements table
CREATE TABLE IF NOT EXISTS public.event_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_to_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on event_announcements
ALTER TABLE public.event_announcements ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_announcements
CREATE POLICY "Event owners can view announcements" 
ON public.event_announcements 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_announcements.event_id 
  AND events.user_id = auth.uid()
));

CREATE POLICY "Event owners can create announcements" 
ON public.event_announcements 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM events 
  WHERE events.id = event_announcements.event_id 
  AND events.user_id = auth.uid()
));

-- Add ticket_tier to registrations
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS ticket_tier_id TEXT,
ADD COLUMN IF NOT EXISTS ticket_price NUMERIC(10,2) DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_templates_user_id ON public.event_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_event_announcements_event_id ON public.event_announcements(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket_tier ON public.registrations(ticket_tier_id);

-- Add trigger for event_templates updated_at
CREATE TRIGGER update_event_templates_updated_at
BEFORE UPDATE ON public.event_templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();