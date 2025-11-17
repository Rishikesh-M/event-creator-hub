import { EventSite } from "@/types/event";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { themes } from "@/lib/themes";
import { Check } from "lucide-react";

interface Props {
  site: EventSite;
  setSite: (site: EventSite) => void;
}

export const ThemeSelector = ({ site, setSite }: Props) => {
  const selectTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    setSite({
      ...site,
      theme: themeId,
      styles: { ...site.styles, colors: theme.colors }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Choose a Theme</CardTitle>
          <CardDescription>
            Select a pre-designed theme for your event website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme.id)}
                className="group relative"
              >
                <div
                  className={`${theme.preview} rounded-lg aspect-video shadow-md transition-all ${
                    site.theme === theme.id
                      ? "ring-4 ring-primary scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  {site.theme === theme.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-2">
                        <Check className="h-6 w-6" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="font-medium">{theme.name}</h3>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {Object.values(theme.colors).slice(0, 3).map((color, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full border-2 border-background"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
