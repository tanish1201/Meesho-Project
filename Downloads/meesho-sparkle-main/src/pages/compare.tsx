import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ImageIcon, 
  BarChart3, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Download,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";

interface ComparisonResult {
  productA: {
    id: string;
    name: string;
    image: string;
    scores: {
      relevance: number;
      reality: number;
      quality: number;
      overall: number;
    };
    route: string;
    generated: boolean;
  };
  productB: {
    id: string;
    name: string;
    image: string;
    scores: {
      relevance: number;
      reality: number;
      quality: number;
      overall: number;
    };
    route: string;
    generated: boolean;
  };
  winner: 'A' | 'B' | 'tie';
  insights: string[];
}

const Compare = () => {
  const [isComparing, setIsComparing] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  // Mock comparison result
  const mockComparison = (): ComparisonResult => ({
    productA: {
      id: "P12345",
      name: "Blue Cotton T-Shirt",
      image: "/placeholder.svg",
      scores: {
        relevance: 92,
        reality: 88,
        quality: 85,
        overall: 89
      },
      route: "B",
      generated: true
    },
    productB: {
      id: "P12346", 
      name: "Blue Cotton T-Shirt (Original)",
      image: "/placeholder.svg",
      scores: {
        relevance: 87,
        reality: 91,
        quality: 82,
        overall: 86
      },
      route: "A",
      generated: false
    },
    winner: 'A',
    insights: [
      "Product A has higher relevance score due to better lighting and composition",
      "Product B shows better reality score with more natural appearance",
      "AI enhancement (Route B) improved overall appeal by 3.5%",
      "Both products meet marketplace standards but A performs better for conversion"
    ]
  });

  const handleCompare = async () => {
    setIsComparing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResult(mockComparison());
    setIsComparing(false);
  };

  const resetComparison = () => {
    setResult(null);
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Product Comparison Results</h1>
              <p className="text-muted-foreground">Detailed analysis of your product variants</p>
            </div>
          </div>
          <Button onClick={resetComparison} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Comparison
          </Button>
        </div>

        {/* Winner Banner */}
        <Card className={`border-2 ${
          result.winner === 'A' ? 'border-success bg-success/5' : 
          result.winner === 'B' ? 'border-warning bg-warning/5' : 
          'border-primary bg-primary/5'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              {result.winner === 'tie' ? (
                <AlertCircle className="w-6 h-6 text-primary" />
              ) : (
                <CheckCircle className="w-6 h-6 text-success" />
              )}
              <div>
                <h3 className="font-semibold text-lg">
                  {result.winner === 'A' ? 'Product A Wins!' : 
                   result.winner === 'B' ? 'Product B Wins!' : 
                   'Tie - Both Products Perform Well'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {result.winner === 'A' ? 'AI-enhanced version shows better performance' :
                   result.winner === 'B' ? 'Original version maintains quality standards' :
                   'Both variants meet marketplace requirements'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Product A */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Product A
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={result.winner === 'A' ? 'approved' : 'outline'}>
                    {result.winner === 'A' ? 'WINNER' : 'VARIANT'}
                  </Badge>
                  <Badge variant={result.productA.route === 'A' ? 'approved' : 
                                 result.productA.route === 'B' ? 'warning' : 'ai_generated'}>
                    Route {result.productA.route}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {result.productA.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-3">
                <h4 className="font-semibold">Performance Scores</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Relevance</span>
                    <span className="font-medium">{result.productA.scores.relevance}%</span>
                  </div>
                  <Progress value={result.productA.scores.relevance} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Reality</span>
                    <span className="font-medium">{result.productA.scores.reality}%</span>
                  </div>
                  <Progress value={result.productA.scores.reality} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Quality</span>
                    <span className="font-medium">{result.productA.scores.quality}%</span>
                  </div>
                  <Progress value={result.productA.scores.quality} className="h-2" />
                  
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Overall</span>
                    <span>{result.productA.scores.overall}%</span>
                  </div>
                  <Progress value={result.productA.scores.overall} className="h-2" />
                </div>
              </div>

              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </CardContent>
          </Card>

          {/* Product B */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Product B
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={result.winner === 'B' ? 'approved' : 'outline'}>
                    {result.winner === 'B' ? 'WINNER' : 'VARIANT'}
                  </Badge>
                  <Badge variant={result.productB.route === 'A' ? 'approved' : 
                                 result.productB.route === 'B' ? 'warning' : 'ai_generated'}>
                    Route {result.productB.route}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image */}
              <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {result.productB.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="space-y-3">
                <h4 className="font-semibold">Performance Scores</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Relevance</span>
                    <span className="font-medium">{result.productB.scores.relevance}%</span>
                  </div>
                  <Progress value={result.productB.scores.relevance} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Reality</span>
                    <span className="font-medium">{result.productB.scores.reality}%</span>
                  </div>
                  <Progress value={result.productB.scores.reality} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Quality</span>
                    <span className="font-medium">{result.productB.scores.quality}%</span>
                  </div>
                  <Progress value={result.productB.scores.quality} className="h-2" />
                  
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Overall</span>
                    <span>{result.productB.scores.overall}%</span>
                  </div>
                  <Progress value={result.productB.scores.overall} className="h-2" />
                </div>
              </div>

              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Product Comparison</h1>
          <p className="text-muted-foreground">
            Compare different versions of your product images to find the best performing variant
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      {/* Comparison Setup */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Product A</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload or select product image</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Choose from History
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Product B</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Upload or select product image</p>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              Choose from History
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Compare Button */}
      <Card>
        <CardContent className="p-6 text-center">
          <Button 
            onClick={handleCompare}
            disabled={isComparing}
            size="lg"
            className="h-12 px-8"
          >
            {isComparing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Comparing Products...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5 mr-2" />
                Start Comparison
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            AI will analyze both products and provide detailed comparison insights
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compare;
