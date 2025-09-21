import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Catalog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Product Catalog</h1>
        <p className="text-muted-foreground">
          Manage your product inventory and listings
        </p>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Catalog Coming Soon</h3>
          <p className="text-muted-foreground">
            This feature is under development. You'll be able to manage your complete product catalog here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}