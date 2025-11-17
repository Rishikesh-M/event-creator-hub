import { Event, EventSite } from "@/types/event";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { themes } from "@/lib/themes";

interface Props {
  event: Event;
  site: EventSite;
}

export const EventPreview = ({ event, site }: Props) => {
  const theme = themes.find(t => t.id === site.theme);
  const colors = theme?.colors || themes[0].colors;

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
                      <div className="space-y-4">
                        {(section.content.fields || []).map((field: any, i: number) => (
                          <div key={i}>
                            <label className="block text-sm font-medium mb-2">
                              {field.label} {field.required && "*"}
                            </label>
                            <input
                              type={field.type}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder={field.label}
                              disabled
                            />
                          </div>
                        ))}
                        <Button className="w-full" style={{ backgroundColor: colors.primary }}>
                          Submit Registration
                        </Button>
                      </div>
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
