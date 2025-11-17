import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, signOut } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusCircle, Globe, Users, BarChart3, LogOut } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        navigate("/auth");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            EventSiteCMS
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user?.user_metadata?.full_name || "User"}!
          </h2>
          <p className="text-muted-foreground">
            Create and manage your event websites from one dashboard
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-up">
          <Card className="shadow-card hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">No sites created yet</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Events</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Published sites</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
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
                onClick={() => toast.info("Event creation coming soon!")}
              >
                Create Event Site
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card animate-fade-up">
          <CardHeader>
            <CardTitle>Your Event Websites</CardTitle>
            <CardDescription>
              Manage all your event sites from one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No event sites yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Get started by creating your first event website. It only takes a few minutes!
              </p>
              <Button 
                size="lg"
                onClick={() => toast.info("Event creation coming soon!")}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Your First Event Site
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
