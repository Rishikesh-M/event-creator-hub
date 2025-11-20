import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Globe, Zap, BarChart3, CheckCircle, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "No-Code Builder",
      description: "Create beautiful event websites with our intuitive drag-and-drop builder"
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Instant Publishing",
      description: "Go live in seconds with your custom event URL"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics Dashboard",
      description: "Track registrations and manage participants effortlessly"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Build Event Sites in Minutes</span>
            </div>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-primary-foreground sm:text-6xl lg:text-7xl">
              Create Stunning Event Websites
              <span className="block mt-2 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Without Code
              </span>
            </h1>
            <p className="mb-8 text-lg text-primary-foreground/90 sm:text-xl max-w-2xl mx-auto">
              EventPress empowers anyone to build professional event registration websites with our powerful no-code platform. Design, publish, and manage—all from one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/auth")}
                className="shadow-glow hover:shadow-glow/50 transition-all"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
              >
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl font-bold mb-4 sm:text-4xl">
              Everything You Need for Event Success
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features that make event management simple and effective
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="shadow-card hover:shadow-glow transition-all duration-300 animate-fade-up border-border/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h2 className="text-3xl font-bold mb-6 sm:text-4xl">
                  Why Choose EventSiteCMS?
                </h2>
                <div className="space-y-4">
                  {[
                    "Pre-built themes and templates",
                    "Dynamic section-based editing",
                    "Built-in registration system",
                    "Real-time analytics tracking",
                    "Mobile-responsive designs",
                    "Instant deployment"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Card className="shadow-glow border-primary/20 animate-scale-in">
                <CardHeader>
                  <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
                  <CardDescription className="text-base">
                    Join thousands of event organizers using EventSiteCMS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-3xl font-bold text-primary">10k+</div>
                      <div className="text-sm text-muted-foreground">Events Created</div>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-3xl font-bold text-primary">50k+</div>
                      <div className="text-sm text-muted-foreground">Registrations</div>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="w-full"
                    onClick={() => navigate("/auth")}
                  >
                    Start Building Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 EventSiteCMS. Built with Lovable.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
