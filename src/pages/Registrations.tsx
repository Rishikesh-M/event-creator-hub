import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Download, Search, QrCode, CheckCircle2, Circle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  ticket_type: string | null;
  payment_status: string | null;
  created_at: string;
  form_data: any;
  ticket_token: string;
  check_in_status: boolean;
  check_in_time: string | null;
}

const Registrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventName, setEventName] = useState("");
  const [selectedQR, setSelectedQR] = useState<string | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, [eventId]);

  useEffect(() => {
    filterRegistrations();
  }, [searchQuery, registrations]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);

      // Load event details
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEventName(event.name);

      // Load registrations using the auto-decrypt function
      const { data, error } = await supabase.rpc("get_event_registrations_auto", {
        event_uuid: eventId,
      });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      console.error("Error loading registrations:", error);
      toast.error(error.message || "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    if (!searchQuery.trim()) {
      setFilteredRegistrations(registrations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = registrations.filter(
      (reg) =>
        reg.full_name.toLowerCase().includes(query) ||
        reg.email.toLowerCase().includes(query) ||
        (reg.phone && reg.phone.toLowerCase().includes(query))
    );
    setFilteredRegistrations(filtered);
  };

  const handleCheckIn = async (registrationId: string, ticketToken: string) => {
    try {
      const { error } = await supabase.rpc("check_in_registrant", {
        event_uuid: eventId!,
        ticket_token_input: ticketToken,
      });

      if (error) throw error;
      
      toast.success("Attendee checked in successfully!");
      loadRegistrations();
    } catch (error: any) {
      console.error("Error checking in:", error);
      toast.error(error.message || "Failed to check in attendee");
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Ticket Type", "Payment Status", "Check-in Status", "Registration Date"];
    const rows = filteredRegistrations.map((reg) => [
      reg.full_name,
      reg.email,
      reg.phone || "",
      reg.ticket_type || "",
      reg.payment_status || "",
      reg.check_in_status ? "Checked In" : "Not Checked In",
      new Date(reg.created_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventName}-registrations.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const checkedInCount = registrations.filter((r) => r.check_in_status).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{eventName}</h1>
            <p className="text-muted-foreground">Manage registrations and check-ins</p>
          </div>
          <Button onClick={exportToCSV} disabled={filteredRegistrations.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checkedInCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Check-in</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registrations.length - checkedInCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registrations</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading registrations...</div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? "No registrations match your search" : "No registrations yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>{reg.phone || "-"}</TableCell>
                        <TableCell>
                          {reg.check_in_status ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Checked In
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Circle className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedQR(reg.ticket_token)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell>
                          {!reg.check_in_status && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCheckIn(reg.id, reg.ticket_token)}
                            >
                              Check In
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {selectedQR && (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedQR}`}
                alt="Ticket QR Code"
                className="border rounded"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Registrations;
