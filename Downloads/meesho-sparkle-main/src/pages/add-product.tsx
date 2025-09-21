import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function AddProduct() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          Create new product listings with optimized images
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Plus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Add Product Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature is under development. You'll be able to create and manage product listings here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}