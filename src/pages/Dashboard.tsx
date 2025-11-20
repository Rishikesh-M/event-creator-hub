import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PlusCircle, Globe, Users, BarChart3, LogOut, Edit, Eye, Trash2 } from "lucide-react";
import { Event } from "@/types/event";
import { TemplateManager } from "@/components/TemplateManager";
import { AppHeader } from "@/components/AppHeader";
import { StatsCard } from "@/components/StatsCard";



const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, registrations: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/auth");
        return;
      }
      setUser(currentUser);
      await loadEvents(currentUser.id);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const loadEvents = async (userId: string) => {
    try {
      const { data: eventsData, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(eventsData || []);

      const { data: registrations } = await supabase
        .from("registrations")
        .select("id, event_id")
        .in("event_id", (eventsData || []).map(e => e.id));

      setStats({
        total: eventsData?.length || 0,
        active: eventsData?.filter(e => e.is_published).length || 0,
        registrations: registrations?.length || 0
      });
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);
      if (error) throw error;
      toast.success("Event deleted");
      loadEvents(user.id);
    } catch (error: any) {
      toast.error("Failed to delete event");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <AppHeader showSignOut />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-4xl font-bold mb-2 font-heading">
            Welcome back, {user?.user_metadata?.full_name || "User"}!
          </h2>
          <p className="text-muted-foreground text-lg">
            Create and manage your event websites from one powerful dashboard
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-up">
          <StatsCard title="Total Events" value={stats.total} description={stats.total === 1 ? "event created" : "events created"} icon={Globe} />
          <StatsCard title="Active Events" value={stats.active} description="Published sites" icon={BarChart3} />
          <StatsCard title="Total Registrations" value={stats.registrations} description="Across all events" icon={Users} />
          <Card className="shadow-card hover:shadow-glow transition-all duration-300 bg-gradient-primary text-primary-foreground cursor-pointer" onClick={() => navigate("/events/create")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground">Quick Action</CardTitle>
              <PlusCircle className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading text-primary-foreground">Create Event</div>
              <p className="text-xs mt-1 text-primary-foreground/80">Start building now</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-up">
          <Card className="shadow-card hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total === 1 ? "site created" : "sites created"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Published sites</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.registrations}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-shadow bg-gradient-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <PlusCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Button 
                variant="secondary" 
                className="w-full mt-2"
                onClick={() => navigate("/events/create")}
              >
                Create Event Site
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="space-y-6 animate-fade-up">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="events">My Events</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Event Websites</CardTitle>
                <CardDescription>
                  Manage all your event sites from one place
                </CardDescription>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Globe className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No event sites yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Get started by creating your first event website. It only takes a few minutes!
                    </p>
                    <Button size="lg" onClick={() => navigate("/events/create")}>
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create Your First Event Site
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{event.name}</h3>
                                {event.is_published && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                    Published
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                {event.description || "No description"}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>📅 {new Date(event.start_date).toLocaleDateString()}</span>
                                {event.venue && <span>📍 {event.venue}</span>}
                                <span>🔗 /{event.slug}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/registrations/${event.id}`)}
                              >
                                <Users className="h-4 w-4 mr-2" />
                                Registrations
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/events/${event.id}/edit`)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/event/${event.slug}`, "_blank")}
                                disabled={!event.is_published}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(event.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <TemplateManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
