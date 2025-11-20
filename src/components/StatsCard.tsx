import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatsCard = ({ title, value, description, icon: Icon, gradient }: Props) => {
  return (
    <Card className={`shadow-card hover:shadow-glow transition-all duration-300 ${gradient ? 'bg-gradient-primary text-primary-foreground' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${gradient ? 'text-primary-foreground' : ''}`}>
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold font-heading ${gradient ? 'text-primary-foreground' : ''}`}>
          {value}
        </div>
        {description && (
          <p className={`text-xs mt-1 ${gradient ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
