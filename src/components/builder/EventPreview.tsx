import { Event, EventSite } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { themes } from "@/lib/themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  event: Event;
  site: EventSite;
  isPublicView?: boolean;
}

export const EventPreview = ({ event, site, isPublicView = false }: Props) => {
  const theme = themes.find(t => t.id === site.theme);
  const colors = theme?.colors || themes[0].colors;
  const [registrationForm, setRegistrationForm] = useState({
    full_name: "",
    email: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-registration', {
        body: {
          event_id: event.id,
          full_name: registrationForm.full_name,
          email: registrationForm.email,
          phone: registrationForm.phone,
          form_data: {}
        }
      });

      if (error) throw error;

      toast.success("Registration submitted successfully!");
      setRegistrationForm({ full_name: "", email: "", phone: "" });
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      toast.error("Failed to submit registration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="p-6 shadow-lg">
        <div className="space-y-8">
          {site.sections
            .filter(s => s.visible)
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="border-b pb-8 last:border-0">
                {section.type === "hero" && (
                  <div
                    className="relative rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center text-center p-12"
                    style={{
                      backgroundColor: colors.primary,
                      backgroundImage: section.content.backgroundImage
                        ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${section.content.backgroundImage})`
                        : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center"
                    }}
                  >
                    <div className="relative z-10 text-white">
                      <h1 className="text-5xl font-bold mb-4">
                        {section.content.heading || event.name}
                      </h1>
                      <p className="text-xl mb-6">
                        {section.content.subheading || "Join us for an amazing experience"}
                      </p>
                      <Button size="lg" style={{ backgroundColor: colors.accent }}>
                        {section.content.ctaText || "Register Now"}
                      </Button>
                    </div>
                  </div>
                )}

                {section.type === "about" && (
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-4" style={{ color: colors.primary }}>
                      {section.content.title || "About This Event"}
                    </h2>
                    <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                      {section.content.description || event.description || "Event description will appear here..."}
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="text-sm text-muted-foreground">Date</div>
                        <div className="font-medium">
                          {new Date(event.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      {event.venue && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Venue</div>
                          <div className="font-medium">{event.venue}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {section.type === "registration" && (
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: colors.primary }}>
                      {section.content.title || "Register for the Event"}
                    </h2>
                    <Card className="p-6">
                      {isPublicView ? (
                        <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Full Name *
                            </label>
                            <Input
                              required
                              value={registrationForm.full_name}
                              onChange={(e) => setRegistrationForm({ ...registrationForm, full_name: e.target.value })}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Email *
                            </label>
                            <Input
                              required
                              type="email"
                              value={registrationForm.email}
                              onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Phone
                            </label>
                            <Input
                              value={registrationForm.phone}
                              onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          {(section.content.fields || []).map((field: any, i: number) => (
                            <div key={i}>
                              <label className="block text-sm font-medium mb-2">
                                {field.label} {field.required && "*"}
                              </label>
                              {field.type === "textarea" ? (
                                <Textarea placeholder={field.placeholder || ""} />
                              ) : (
                                <Input type={field.type || "text"} placeholder={field.placeholder || ""} />
                              )}
                            </div>
                          ))}
                          <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Submitting..." : "Register Now"}
                          </Button>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          {(section.content.fields || []).map((field: any, i: number) => (
                            <div key={i}>
                              <label className="block text-sm font-medium mb-2">
                                {field.label} {field.required && "*"}
                              </label>
                              <input
                                type={field.type || "text"}
                                placeholder={field.placeholder || ""}
                                className="w-full px-3 py-2 border rounded-md"
                                disabled
                              />
                            </div>
                          ))}
                          <p className="text-center text-sm text-muted-foreground">
                            Registration form preview - functional on published site
                          </p>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};
