import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadDropzone } from "@/components/assistant/upload-dropzone";
import { ProductMetaForm, ProductMeta } from "@/components/assistant/product-meta-form";
import { Play, Download, Eye, RotateCcw, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { runAnalysis, fileToBase64 } from "@/lib/api";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface AnalysisResult {
  run_id: string;
  product_id: string;
  route: 'A' | 'B' | 'C';
  best: {
    generated: boolean;
    path: string;
    source_hash: string;
    final_score: number;
  };
  iterations: number;
  candidates: Array<{
    path: string;
    mode: 'edit' | 'generate';
    iter: number;
  }>;
  feedback: {
    why: string[];
    required_changes: string[];
  };
}

const steps = [
  { id: 1, name: "Upload", description: "Select product images" },
  { id: 2, name: "Approval", description: "AI relevance check" },
  { id: 3, name: "Edit/Generate", description: "Image enhancement" },
  { id: 4, name: "Re-Approval", description: "Quality validation" },
  { id: 5, name: "Final", description: "Best image selected" },
];

export default function Assistant() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [meta, setMeta] = useState<ProductMeta>({ productId: "", category: "", allowWear: true });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const canProcess = images.length > 0 && meta.productId && meta.category;

  const handleProcessing = async () => {
    if (!canProcess) {
      toast({
        title: "Missing Information",
        description: "Please upload images and fill in product details.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setProgress(0);

    try {
      // Convert images to base64
      setCurrentStep(2);
      setProgress(20);
      
      const imagePromises = images.map(img => fileToBase64(img.file));
      const base64Images = await Promise.all(imagePromises);
      
      setCurrentStep(3);
      setProgress(40);

      // Prepare payload
      const payload = {
        product_id: meta.productId,
        category: meta.category.toLowerCase().replace(' ', '_'),
        images: base64Images.map(b64 => ({ b64 })),
        meta: { allow_wear: meta.allowWear }
      };

      setCurrentStep(4);
      setProgress(60);

      // Call Python analysis
      const result = await runAnalysis(payload);
      
      setCurrentStep(5);
      setProgress(100);

      setResult(result);
      toast({
        title: "Analysis Complete!",
        description: `Route ${result.route} - Final score: ${(result.best.final_score * 100).toFixed(0)}%`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setCurrentStep(1);
    setProgress(0);
  };

  if (result) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground">Product ID: {result.product_id}</p>
          </div>
          <Button onClick={resetAnalysis} variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {/* Route Banner */}
        {result.route !== 'A' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="font-medium">AI Assisted Presentation</span>
                <Badge variant="outline">Route {result.route}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Your image has been enhanced using AI technology
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="final" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="final">Final Result</TabsTrigger>
            <TabsTrigger value="analysis">All Images</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="json">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="final" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Final Selected Image
                  <div className="flex items-center gap-2">
                    <Badge variant="approved">APPROVED</Badge>
                    {result.best.generated && <Badge variant="ai_generated">AI GENERATED</Badge>}
                    <Badge variant="high_relevance">HIGH RELEVANCE</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-primary/20">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Final optimized image
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Download Final Image
                    </Button>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">Final Score</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Quality</span>
                          <span className="font-medium">{(result.best.final_score * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={result.best.final_score * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold">Score Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Relevance (70%)</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-1" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Reality (20%)</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-1" />
                        
                        <div className="flex justify-between text-sm">
                          <span>Quality (10%)</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-1" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Processing Summary</h3>
                      <div className="text-sm space-y-1">
                        <div>Route: <Badge variant="outline">Route {result.route}</Badge></div>
                        <div>Iterations: {result.iterations}</div>
                        <div>Candidates: {result.candidates.length}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>All Images Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-square bg-muted">
                        <img 
                          src={image.preview} 
                          alt={`Original ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Image #{index + 1}</span>
                          <Badge variant={index === 0 ? "approved" : "outline"}>
                            {index === 0 ? "SELECTED" : "ANALYZED"}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Relevance:</span>
                            <span className="font-medium">92%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Reality:</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quality:</span>
                            <span className="font-medium">78%</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="on_model" className="text-xs">ON_MODEL</Badge>
                          <Badge variant="outline" className="text-xs">GOOD_LIGHTING</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Generated Candidates</CardTitle>
              </CardHeader>
              <CardContent>
                {result.candidates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>No additional candidates were generated for this analysis.</p>
                    <p className="text-sm">The original image met quality standards.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Placeholder for candidates */}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardHeader>
                <CardTitle>Raw Analysis Data</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Image Assistant</h1>
        <p className="text-muted-foreground">
          Upload your product images and let AI optimize them for maximum impact
        </p>
      </div>

      {/* Processing Steps */}
      {isProcessing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Processing Images</h3>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm">
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`text-center ${
                      step.id <= currentStep ? 'text-primary font-medium' : 'text-muted-foreground'
                    }`}
                  >
                    <div>{step.name}</div>
                    {step.id === currentStep && (
                      <div className="text-xs mt-1">{step.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Upload Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadDropzone onImagesChange={setImages} />
            </CardContent>
          </Card>
        </div>

        {/* Meta Information */}
        <div className="space-y-6">
          <ProductMetaForm onMetaChange={setMeta} />

          {/* Action Button */}
          <Card>
            <CardContent className="p-6">
              <Button 
                onClick={handleProcessing}
                disabled={!canProcess || isProcessing}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Run Analysis
                  </>
                )}
              </Button>
              
              {!canProcess && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Upload images and complete product info to continue
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}