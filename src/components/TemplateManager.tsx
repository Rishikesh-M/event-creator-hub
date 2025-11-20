import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Plus, Trash2, Copy, Loader2 } from "lucide-react";
import { EventTemplate } from "@/types/event";

interface Props {
  onApplyTemplate?: (template: EventTemplate) => void;
}

export const TemplateManager = ({ onApplyTemplate }: Props) => {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", description: "" });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("event_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAsTemplate = async (eventData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("event_templates").insert({
        user_id: user.id,
        name: newTemplate.name,
        description: newTemplate.description,
        template_data: eventData,
      });

      if (error) throw error;

      toast.success("Template saved successfully!");
      setSaveDialogOpen(false);
      setNewTemplate({ name: "", description: "" });
      loadTemplates();
    } catch (error: any) {
      toast.error(error.message || "Failed to save template");
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase.from("event_templates").delete().eq("id", id);
      if (error) throw error;

      toast.success("Template deleted");
      loadTemplates();
    } catch (error: any) {
      toast.error("Failed to delete template");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-heading">Event Templates</h3>
          <p className="text-sm text-muted-foreground">
            Save and reuse event configurations
          </p>
        </div>
      </div>

      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              No templates saved yet. Create an event and save it as a template to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card key={template.id} className="shadow-card hover:shadow-glow transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-heading">{template.name}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1">{template.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2">
                {onApplyTemplate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyTemplate(template)}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
