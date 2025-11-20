import { Event, EventSite } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { themes } from "@/lib/themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";

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
    phone: "",
    image_url: ""
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('submit-registration', {
        body: {
          eventId: event.id,
          fullName: registrationForm.full_name,
          email: registrationForm.email,
          phone: registrationForm.phone,
          imageUrl: registrationForm.image_url,
          formData: customFieldValues
        }
      });

      if (error) throw error;

      toast.success("Registration submitted successfully! Check your email for your ticket.");
      setRegistrationForm({ full_name: "", email: "", phone: "", image_url: "" });
      setCustomFieldValues({});
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
            .filter((s, idx, arr) => s.type !== "registration" || arr.findIndex(x => x.type === "registration") === idx)
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
                          <ImageUpload
                            bucket="registration-uploads"
                            folder={`${event.id}/`}
                            currentImage={registrationForm.image_url}
                            onUploadComplete={(url) => setRegistrationForm({ ...registrationForm, image_url: url })}
                            label="Upload Photo/Document (Optional)"
                            accept="image/*,application/pdf"
                          />
                          
                          {/* Render custom fields */}
                          {event.custom_fields && Array.isArray(event.custom_fields) && event.custom_fields.map((field: any) => (
                            <div key={field.id}>
                              <label className="block text-sm font-medium mb-2">
                                {field.label} {field.required && '*'}
                              </label>
                              {field.type === 'text' && (
                                <Input
                                  required={field.required}
                                  value={customFieldValues[field.id] || ''}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                                  placeholder={field.placeholder}
                                />
                              )}
                              {field.type === 'textarea' && (
                                <Textarea
                                  required={field.required}
                                  value={customFieldValues[field.id] || ''}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                                  placeholder={field.placeholder}
                                />
                              )}
                              {field.type === 'select' && (
                                <select
                                  required={field.required}
                                  value={customFieldValues[field.id] || ''}
                                  onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.value })}
                                  className="w-full p-2 border rounded-md"
                                >
                                  <option value="">Select an option</option>
                                  {field.options?.map((opt: string) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              )}
                              {field.type === 'checkbox' && (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    required={field.required}
                                    checked={customFieldValues[field.id] || false}
                                    onChange={(e) => setCustomFieldValues({ ...customFieldValues, [field.id]: e.target.checked })}
                                  />
                                  <span className="text-sm">{field.placeholder}</span>
                                </div>
                              )}
                              {field.type === 'radio' && (
                                <div className="space-y-2">
                                  {field.options?.map((opt: string) => (
                                    <div key={opt} className="flex items-center gap-2">
                                      <input
                                        type="radio"
                                        name={field.id}
                                        required={field.required}
                                        checked={customFieldValues[field.id] === opt}
                                        onChange={() => setCustomFieldValues({ ...customFieldValues, [field.id]: opt })}
                                      />
                                      <span className="text-sm">{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          <Button type="submit" className="w-full" disabled={submitting}>
                            {submitting ? "Submitting..." : "Register Now"}
                          </Button>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Full Name *</label>
                            <Input disabled placeholder="Enter your full name" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Email *</label>
                            <Input disabled type="email" placeholder="Enter your email" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Phone</label>
                            <Input disabled placeholder="Enter your phone number" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Upload Photo/Document (Optional)</label>
                            <Input disabled type="file" />
                          </div>
                          <Button disabled className="w-full">Register Now</Button>
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
