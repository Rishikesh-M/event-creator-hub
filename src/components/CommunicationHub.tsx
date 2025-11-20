import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send, Mail, Loader2, Calendar } from "lucide-react";
import { EventAnnouncement } from "@/types/event";

interface Props {
  eventId: string;
  eventName: string;
}

export const CommunicationHub = ({ eventId, eventName }: Props) => {
  const [announcements, setAnnouncements] = useState<EventAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ subject: "", message: "" });

  useEffect(() => {
    loadAnnouncements();
  }, [eventId]);

  const loadAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from("event_announcements")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendAnnouncement = async () => {
    if (!newAnnouncement.subject || !newAnnouncement.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      // Get all registrations for this event
      const { data: registrations, error: regError } = await supabase.rpc(
        "get_event_registrations_auto",
        { event_uuid: eventId }
      );

      if (regError) throw regError;

      if (!registrations || registrations.length === 0) {
        toast.error("No registrants to send to");
        setSending(false);
        return;
      }

      // Save announcement
      const { error: announcementError } = await supabase
        .from("event_announcements")
        .insert({
          event_id: eventId,
          subject: newAnnouncement.subject,
          message: newAnnouncement.message,
          sent_at: new Date().toISOString(),
          sent_to_count: registrations.length,
        });

      if (announcementError) throw announcementError;

      // Send emails via edge function
      const { error: emailError } = await supabase.functions.invoke("send-bulk-email", {
        body: {
          recipients: registrations.map((r: any) => ({ email: r.email, name: r.full_name })),
          subject: `[${eventName}] ${newAnnouncement.subject}`,
          message: newAnnouncement.message,
          eventName,
        },
      });

      if (emailError) throw emailError;

      toast.success(`Announcement sent to ${registrations.length} attendees!`);
      setDialogOpen(false);
      setNewAnnouncement({ subject: "", message: "" });
      loadAnnouncements();
    } catch (error: any) {
      console.error("Error sending announcement:", error);
      toast.error("Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-heading">Communication Center</h3>
          <p className="text-sm text-muted-foreground">
            Send announcements and updates to all attendees
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Send className="h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send Announcement</DialogTitle>
              <DialogDescription>
                This will be sent to all registered attendees via email
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newAnnouncement.subject}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, subject: e.target.value })}
                  placeholder="Important Update"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                  placeholder="Your announcement message..."
                  rows={8}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={sending}>
                Cancel
              </Button>
              <Button onClick={sendAnnouncement} disabled={sending}>
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send to All Attendees
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : announcements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No announcements sent yet. Create your first announcement to communicate with attendees.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-heading">{announcement.subject}</CardTitle>
                    <CardDescription className="mt-1 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {announcement.sent_at && new Date(announcement.sent_at).toLocaleDateString()}
                      <span className="text-xs">• Sent to {announcement.sent_to_count} attendees</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{announcement.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
