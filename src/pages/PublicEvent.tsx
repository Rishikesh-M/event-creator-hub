import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Event, EventSite } from "@/types/event";
import { EventPreview } from "@/components/builder/EventPreview";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const PublicEvent = () => {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [site, setSite] = useState<EventSite | null>(null);

  useEffect(() => {
    loadPublicEvent();
  }, [slug]);

  const loadPublicEvent = async () => {
    try {
      // Fetch published event by slug
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (eventError) throw eventError;
      
      if (!eventData) {
        toast.error("Event not found or not published");
        setLoading(false);
        return;
      }

      setEvent(eventData);

      // Fetch event site
      const { data: siteData, error: siteError } = await supabase
        .from("event_sites")
        .select("*")
        .eq("event_id", eventData.id)
        .single();

      if (siteError) throw siteError;

      const formattedSite: EventSite = {
        ...siteData,
        sections: (siteData.sections as any) || [],
        styles: (siteData.styles as any) || {},
        config: (siteData.config as any) || {}
      };

      setSite(formattedSite);
    } catch (error: any) {
      console.error("Error loading public event:", error);
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">This event doesn't exist or is not published.</p>
        </div>
      </div>
    );
  }

  return <EventPreview event={event} site={site} isPublicView />;
};

export default PublicEvent;
