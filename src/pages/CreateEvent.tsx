import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { defaultSections } from "@/lib/themes";
import { ImageUpload } from "@/components/ImageUpload";
import { CustomFieldBuilder, type CustomField } from "@/components/CustomFieldBuilder";
import { TicketTierBuilder } from "@/components/TicketTierBuilder";
import { TicketTier } from "@/types/event";
import { AppHeader } from "@/components/AppHeader";

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    start_date: "",
    end_date: "",
    venue: "",
    banner_url: "",
    capacity: undefined as number | undefined,
    waitlist_enabled: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate encryption key
      const encryptionKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Create event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert([{
          ...formData,
          user_id: user.id,
          is_published: false,
          custom_fields: customFields as any,
          encryption_key: encryptionKey,
          ticket_tiers: ticketTiers as any,
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Create default event site
      const { error: siteError } = await supabase
        .from("event_sites")
        .insert({
          event_id: event.id,
          theme: "modern",
          sections: defaultSections as any,
          styles: {},
          config: {}
        });

      if (siteError) throw siteError;

      toast.success("Event created successfully!");
      navigate(`/events/${event.id}/edit`);
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast.error(error.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader showBackButton title="Create New Event" />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-card animate-scale-in">
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Create New Event</CardTitle>
            <CardDescription className="text-base">
              Fill in the details to create your professional event website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                  required
                  placeholder="Tech Conference 2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  placeholder="tech-conference-2024"
                />
                <p className="text-xs text-muted-foreground">
                  Your event will be available at: yourdomain.com/{formData.slug || "your-event"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="City Convention Center"
                />
              </div>

              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold font-heading">Capacity & Ticketing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Event Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="0"
                      value={formData.capacity || ""}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || undefined })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="waitlist"
                        checked={formData.waitlist_enabled}
                        onCheckedChange={(checked) => setFormData({ ...formData, waitlist_enabled: checked as boolean })}
                      />
                      <Label htmlFor="waitlist" className="text-sm font-normal cursor-pointer">
                        Enable waitlist when full
                      </Label>
                    </div>
                  </div>
                </div>

                <TicketTierBuilder tiers={ticketTiers} onChange={setTicketTiers} />
              </div>

              <ImageUpload
                bucket="event-banners"
                folder="banners/"
                currentImage={formData.banner_url}
                onUploadComplete={(url) => setFormData({ ...formData, banner_url: url })}
                label="Event Banner Image"
              />

              <div className="border-t pt-6">
                <CustomFieldBuilder fields={customFields} onChange={setCustomFields} />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Event
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEvent;
