import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Download, Loader2, Users, Calendar, TrendingUp } from "lucide-react";
import { Event } from "@/types/event";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  form_data: any;
  ticket_token: string;
  check_in_status: boolean;
  check_in_time: string | null;
  image_url: string | null;
}

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function Registrations() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Load registrations using auto function (no encryption key needed)
      const { data: regsData, error: regsError } = await supabase.rpc('get_event_registrations_auto', {
        event_uuid: eventId
      });

      if (regsError) throw regsError;
      setRegistrations(regsData || []);
      toast.success(`Loaded ${regsData?.length || 0} registrations`);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (registrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Registration Date"];
    const rows = registrations.map(reg => [
      reg.full_name,
      reg.email,
      reg.phone || "N/A",
      new Date(reg.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.slug}-registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Registrations exported successfully!");
  };

  // Analytics Data
  const dailyRegistrations = registrations.reduce((acc: any, reg) => {
    const date = new Date(reg.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(dailyRegistrations).map(([date, count]) => ({
    date,
    registrations: count
  }));

  const stats = [
    {
      title: "Total Registrations",
      value: registrations.length,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Today",
      value: registrations.filter(r => 
        new Date(r.created_at).toDateString() === new Date().toDateString()
      ).length,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "This Week",
      value: registrations.filter(r => {
        const date = new Date(r.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      }).length,
      icon: TrendingUp,
      color: "text-purple-600"
    }
  ];

  if (loading && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Registrations</h1>
              <p className="text-sm text-muted-foreground">{event.name}</p>
            </div>
          </div>
          <Button onClick={exportToCSV} disabled={registrations.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showKeyInput ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Enter Encryption Key</CardTitle>
              <CardDescription>
                Enter your encryption key to decrypt and view registration data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="password"
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                placeholder="Enter encryption key"
                className="w-full px-3 py-2 border rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && loadRegistrations()}
              />
              <Button onClick={loadRegistrations} className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Load Registrations
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="registrations" 
                          stroke="#667eea" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Registrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="registrations" fill="#764ba2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Registrations Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Registrations ({registrations.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No registrations yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Registration Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registrations.map((reg) => (
                          <TableRow key={reg.id}>
                            <TableCell className="font-medium">{reg.full_name}</TableCell>
                            <TableCell>{reg.email}</TableCell>
                            <TableCell>{reg.phone || "N/A"}</TableCell>
                            <TableCell>
                              {new Date(reg.created_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
