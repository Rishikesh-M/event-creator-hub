import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Ticket } from "lucide-react";
import { TicketTier } from "@/types/event";

interface Props {
  tiers: TicketTier[];
  onChange: (tiers: TicketTier[]) => void;
}

export const TicketTierBuilder = ({ tiers, onChange }: Props) => {
  const addTier = () => {
    const newTier: TicketTier = {
      id: `tier-${Date.now()}`,
      name: "",
      price: 0,
      description: "",
      quantity: undefined,
      sold: 0,
    };
    onChange([...tiers, newTier]);
  };

  const updateTier = (index: number, updates: Partial<TicketTier>) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold font-heading">Ticket Tiers</h3>
          <p className="text-sm text-muted-foreground">
            Create multiple ticket options with different pricing
          </p>
        </div>
        <Button onClick={addTier} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Tier
        </Button>
      </div>

      {tiers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No ticket tiers yet. Add your first tier to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tiers.map((tier, index) => (
            <Card key={tier.id} className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Tier {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTier(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tier-name-${index}`}>Tier Name *</Label>
                    <Input
                      id={`tier-name-${index}`}
                      value={tier.name}
                      onChange={(e) => updateTier(index, { name: e.target.value })}
                      placeholder="e.g., Early Bird, VIP, Regular"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tier-price-${index}`}>Price ($) *</Label>
                    <Input
                      id={`tier-price-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) => updateTier(index, { price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`tier-description-${index}`}>Description</Label>
                  <Textarea
                    id={`tier-description-${index}`}
                    value={tier.description || ""}
                    onChange={(e) => updateTier(index, { description: e.target.value })}
                    placeholder="Describe what's included in this tier"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tier-quantity-${index}`}>Available Tickets</Label>
                    <Input
                      id={`tier-quantity-${index}`}
                      type="number"
                      min="0"
                      value={tier.quantity || ""}
                      onChange={(e) => updateTier(index, { quantity: parseInt(e.target.value) || undefined })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tier-sold-${index}`}>Sold (Read-only)</Label>
                    <Input
                      id={`tier-sold-${index}`}
                      type="number"
                      value={tier.sold || 0}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`tier-from-${index}`}>Available From</Label>
                    <Input
                      id={`tier-from-${index}`}
                      type="datetime-local"
                      value={tier.available_from || ""}
                      onChange={(e) => updateTier(index, { available_from: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`tier-until-${index}`}>Available Until</Label>
                    <Input
                      id={`tier-until-${index}`}
                      type="datetime-local"
                      value={tier.available_until || ""}
                      onChange={(e) => updateTier(index, { available_until: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
