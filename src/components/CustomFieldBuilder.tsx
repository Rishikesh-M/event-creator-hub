import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";

export interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[]; // For select, radio
  placeholder?: string;
}

interface Props {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
}

export const CustomFieldBuilder = ({ fields, onChange }: Props) => {
  const [editingField, setEditingField] = useState<Partial<CustomField>>({
    type: 'text',
    required: false
  });

  const addField = () => {
    if (!editingField.label) return;
    
    const newField: CustomField = {
      id: `field_${Date.now()}`,
      label: editingField.label,
      type: editingField.type || 'text',
      required: editingField.required || false,
      options: editingField.options,
      placeholder: editingField.placeholder
    };
    
    onChange([...fields, newField]);
    setEditingField({ type: 'text', required: false });
  };

  const removeField = (id: string) => {
    onChange(fields.filter(f => f.id !== id));
  };

  const needsOptions = editingField.type === 'select' || editingField.type === 'radio';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Registration Field</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field Label *</Label>
              <Input
                value={editingField.label || ''}
                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                placeholder="e.g., Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Field Type</Label>
              <Select
                value={editingField.type}
                onValueChange={(value: any) => setEditingField({ ...editingField, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text Input</SelectItem>
                  <SelectItem value="textarea">Text Area</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="radio">Radio Buttons</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!needsOptions && (
            <div className="space-y-2">
              <Label>Placeholder (optional)</Label>
              <Input
                value={editingField.placeholder || ''}
                onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                placeholder="e.g., Enter your company name"
              />
            </div>
          )}

          {needsOptions && (
            <div className="space-y-2">
              <Label>Options (comma-separated) *</Label>
              <Input
                value={editingField.options?.join(', ') || ''}
                onChange={(e) => setEditingField({
                  ...editingField,
                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Option 1, Option 2, Option 3"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="required"
              checked={editingField.required}
              onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="required" className="cursor-pointer">Required field</Label>
          </div>

          <Button onClick={addField} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Field
          </Button>
        </CardContent>
      </Card>

      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Fields ({fields.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {fields.map((field) => (
              <div
                key={field.id}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{field.type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(field.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};