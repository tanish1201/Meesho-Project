import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProductMeta {
  productId: string;
  category: string;
  allowWear: boolean;
}

interface ProductMetaFormProps {
  onMetaChange: (meta: ProductMeta) => void;
  className?: string;
}

const categories = [
  { value: "apparel_top", label: "Apparel Top" },
  { value: "apparel_bottom", label: "Apparel Bottom" },
  { value: "saree", label: "Saree" },
  { value: "kurti", label: "Kurti" },
  { value: "dress", label: "Dress" },
  { value: "shoes", label: "Shoes" },
  { value: "handbag", label: "Handbag" },
  { value: "electronics", label: "Electronics" },
  { value: "home_kitchen", label: "Home & Kitchen" },
  { value: "other", label: "Other" },
];

export function ProductMetaForm({ onMetaChange, className }: ProductMetaFormProps) {
  const [meta, setMeta] = useState<ProductMeta>({
    productId: "",
    category: "",
    allowWear: true,
  });

  const updateMeta = (updates: Partial<ProductMeta>) => {
    const newMeta = { ...meta, ...updates };
    setMeta(newMeta);
    onMetaChange(newMeta);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Product Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Product ID */}
        <div className="space-y-2">
          <Label htmlFor="productId" className="text-sm font-medium">
            Product ID
          </Label>
          <Input
            id="productId"
            placeholder="e.g. P123456"
            value={meta.productId}
            onChange={(e) => updateMeta({ productId: e.target.value })}
            className="bg-background"
          />
          <p className="text-xs text-muted-foreground">
            Unique identifier for your product
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select value={meta.category} onValueChange={(value) => updateMeta({ category: value })}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Select product category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose the most appropriate category for your product
          </p>
        </div>

        {/* Allow Wear Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowWear" className="text-sm font-medium">
                Allow On-Model Images
              </Label>
              <p className="text-xs text-muted-foreground">
                Enable AI to generate images with models wearing your product
              </p>
            </div>
            <Switch
              id="allowWear"
              checked={meta.allowWear}
              onCheckedChange={(checked) => updateMeta({ allowWear: checked })}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-muted rounded-lg border">
          <h4 className="text-sm font-medium mb-2">Configuration Summary</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Product ID: {meta.productId || "Not set"}</div>
            <div>Category: {categories.find(c => c.value === meta.category)?.label || "Not selected"}</div>
            <div>On-Model: {meta.allowWear ? "Enabled" : "Disabled"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}