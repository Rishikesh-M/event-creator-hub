import { Event, EventSite, Section } from "@/types/event";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GripVertical, Plus, Trash2 } from "lucide-react";

interface Props {
  site: EventSite;
  setSite: (site: EventSite) => void;
  event: Event;
}

export const SectionEditor = ({ site, setSite, event }: Props) => {
  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSite({
      ...site,
      sections: site.sections.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      )
    });
  };

  const toggleSection = (sectionId: string) => {
    updateSection(sectionId, {
      visible: !site.sections.find(s => s.id === sectionId)?.visible
    });
  };

  const updateContent = (sectionId: string, field: string, value: any) => {
    const section = site.sections.find(s => s.id === sectionId);
    if (!section) return;

    updateSection(sectionId, {
      content: { ...section.content, [field]: value }
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Accordion type="single" collapsible className="space-y-4">
          {site.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{section.title}</span>
                    <Switch
                      checked={section.visible}
                      onCheckedChange={() => toggleSection(section.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-4">
                    {section.type === "hero" && (
                      <>
                        <div className="space-y-2">
                          <Label>Heading</Label>
                          <Input
                            value={section.content.heading || ""}
                            onChange={(e) => updateContent(section.id, "heading", e.target.value)}
                            placeholder="Welcome to Our Event"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subheading</Label>
                          <Input
                            value={section.content.subheading || ""}
                            onChange={(e) => updateContent(section.id, "subheading", e.target.value)}
                            placeholder="Join us for an amazing experience"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CTA Button Text</Label>
                          <Input
                            value={section.content.ctaText || ""}
                            onChange={(e) => updateContent(section.id, "ctaText", e.target.value)}
                            placeholder="Register Now"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Background Image URL</Label>
                          <Input
                            value={section.content.backgroundImage || event.banner_url || ""}
                            onChange={(e) => updateContent(section.id, "backgroundImage", e.target.value)}
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                      </>
                    )}

                    {section.type === "about" && (
                      <>
                        <div className="space-y-2">
                          <Label>Title</Label>
                          <Input
                            value={section.content.title || ""}
                            onChange={(e) => updateContent(section.id, "title", e.target.value)}
                            placeholder="About This Event"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={section.content.description || event.description || ""}
                            onChange={(e) => updateContent(section.id, "description", e.target.value)}
                            placeholder="Event description..."
                            rows={6}
                          />
                        </div>
                      </>
                    )}

                    {section.type === "registration" && (
                      <div className="space-y-2">
                        <Label>Form Title</Label>
                        <Input
                          value={section.content.title || ""}
                          onChange={(e) => updateContent(section.id, "title", e.target.value)}
                          placeholder="Register for the Event"
                        />
                        <p className="text-sm text-muted-foreground">
                          Default fields: Name, Email, Phone
                        </p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>

      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">Section Guide</CardTitle>
            <CardDescription>Toggle sections on/off and customize content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Available Sections:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Hero - Main banner with CTA</li>
                <li>• About - Event description</li>
                <li>• Speakers - Speaker profiles</li>
                <li>• Agenda - Event schedule</li>
                <li>• FAQ - Common questions</li>
                <li>• Registration - Sign-up form</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
