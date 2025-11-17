import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Eye, Globe, Loader2 } from "lucide-react";
import { Event, EventSite } from "@/types/event";
import { SectionEditor } from "@/components/builder/SectionEditor";
import { ThemeSelector } from "@/components/builder/ThemeSelector";
import { EventPreview } from "@/components/builder/EventPreview";

const EventBuilder = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [site, setSite] = useState<EventSite | null>(null);
  const [activeTab, setActiveTab] = useState("sections");

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: siteData, error: siteError } = await supabase
        .from("event_sites")
        .select("*")
        .eq("event_id", eventId)
        .single();

      if (siteError) throw siteError;
      
      // Cast JSON to proper types
      const formattedSite: EventSite = {
        ...siteData,
        sections: (siteData.sections as any) || [],
        styles: (siteData.styles as any) || {},
        config: (siteData.config as any) || {}
      };
      
      setSite(formattedSite);
    } catch (error: any) {
      console.error("Error loading event:", error);
      toast.error("Failed to load event");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!site) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("event_sites")
        .update({
          theme: site.theme,
          sections: site.sections as any,
          styles: site.styles as any,
          config: site.config as any
        })
        .eq("id", site.id);

      if (error) throw error;
      toast.success("Changes saved successfully!");
    } catch (error: any) {
      console.error("Error saving:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!event) return;

    try {
      const { error } = await supabase
        .from("events")
        .update({ is_published: !event.is_published })
        .eq("id", event.id);

      if (error) throw error;

      setEvent({ ...event, is_published: !event.is_published });
      toast.success(event.is_published ? "Event unpublished" : "Event published!");
    } catch (error: any) {
      console.error("Error publishing:", error);
      toast.error("Failed to update publish status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!event || !site) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{event.name}</h1>
              <p className="text-sm text-muted-foreground">Event Builder</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setActiveTab("preview")}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button size="sm" onClick={handlePublish}>
              <Globe className="mr-2 h-4 w-4" />
              {event.is_published ? "Unpublish" : "Publish"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="sections">
            <SectionEditor site={site} setSite={setSite} event={event} />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeSelector site={site} setSite={setSite} />
          </TabsContent>

          <TabsContent value="preview">
            <EventPreview event={event} site={site} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EventBuilder;
