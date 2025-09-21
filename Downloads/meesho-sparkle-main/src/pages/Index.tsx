import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, TrendingUp, Zap, Star, ArrowRight, Users, CheckCircle, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <Badge variant="outline" className="px-4 py-2">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Image Optimization
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Meesho Seller Support System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your product images with AI. Upload, analyze, and get marketplace-ready images that drive sales.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/dashboard">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-8">
            <Link to="/assistant">
              <ImageIcon className="w-5 h-5 mr-2" />
              Start Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">92%</h3>
            <p className="text-muted-foreground">Average Quality Score</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-2xl font-bold mb-2">95%</h3>
            <p className="text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <h3 className="text-2xl font-bold mb-2">1000+</h3>
            <p className="text-muted-foreground">Images Processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Smart Image Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our AI evaluates relevance, reality, and quality to ensure your images meet marketplace standards.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Relevance Check</span>
                <span className="font-medium">95%</span>
              </div>
              <Progress value={95} className="h-2" />
              
              <div className="flex justify-between text-sm">
                <span>Quality Enhancement</span>
                <span className="font-medium">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/assistant">Try Analysis</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-success rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <CardTitle>Automated Routes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Three intelligent processing routes ensure optimal results for every product type.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge variant="success">Route A</Badge>
                <span className="text-sm">Original Selection</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="warning">Route B</Badge>
                <span className="text-sm">AI Enhancement</span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="default">Route C</Badge>
                <span className="text-sm">AI Generation</span>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link to="/history">View Results</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to optimize your product images?</h2>
          <p className="text-muted-foreground mb-6">
            Upload up to 6 images and let our AI find the perfect presentation for your products.
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/assistant">
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
