import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft, Sparkles } from "lucide-react";
import { signOut } from "@/lib/supabase";
import { toast } from "sonner";

interface Props {
  showBackButton?: boolean;
  backTo?: string;
  showSignOut?: boolean;
  title?: string;
}

export const AppHeader = ({ showBackButton, backTo = "/dashboard", showSignOut, title }: Props) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" onClick={() => navigate(backTo)} size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-heading">
              {title || "EventPress"}
            </h1>
          </div>
        </div>
        {showSignOut && (
          <Button variant="outline" onClick={handleSignOut} size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </header>
  );
};
