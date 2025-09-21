import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ImageIcon, 
  CheckCircle, 
  Clock, 
  Zap,
  BarChart3,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalImages: 1247,
    processedToday: 23,
    successRate: 94.2,
    avgProcessingTime: 2.3,
    totalRuns: 89,
    thisWeek: 156,
    lastWeek: 142,
    topCategory: "apparel_top",
    routeDistribution: {
      A: 45,
      B: 38,
      C: 17
    }
  };

  const recentActivity = [
    { id: 1, productId: "P12345", route: "B", score: 92, time: "2 min ago", status: "completed" },
    { id: 2, productId: "P12346", route: "A", score: 88, time: "5 min ago", status: "completed" },
    { id: 3, productId: "P12347", route: "C", score: 95, time: "8 min ago", status: "completed" },
    { id: 4, productId: "P12348", route: "B", score: 87, time: "12 min ago", status: "completed" },
    { id: 5, productId: "P12349", route: "A", score: 91, time: "15 min ago", status: "completed" },
  ];

  const performanceMetrics = [
    { label: "Relevance Score", value: 92, target: 90, trend: "up" },
    { label: "Reality Score", value: 87, target: 85, trend: "up" },
    { label: "Quality Score", value: 89, target: 88, trend: "up" },
    { label: "Processing Speed", value: 94, target: 90, trend: "up" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your image processing performance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/assistant">
              <ImageIcon className="w-4 h-4 mr-2" />
              New Analysis
            </Link>
          </Button>
          <Button asChild>
            <Link to="/history">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Images</p>
                <p className="text-2xl font-bold">{stats.totalImages.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-success mr-1" />
              <span className="text-sm text-success font-medium">+12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-success mr-1" />
              <span className="text-sm text-success font-medium">+2.1% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Processing Time</p>
                <p className="text-2xl font-bold">{stats.avgProcessingTime}s</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowDownRight className="w-4 h-4 text-destructive mr-1" />
              <span className="text-sm text-destructive font-medium">-0.3s faster</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              <ArrowUpRight className="w-4 h-4 text-success mr-1" />
              <span className="text-sm text-success font-medium">+{stats.thisWeek - stats.lastWeek} vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{metric.value}%</span>
                      {metric.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {metric.target}%</span>
                    <span>{metric.value >= metric.target ? "✓ Exceeded" : "⚠ Below target"}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Route Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Route Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="approved">Route A</Badge>
                    <span className="text-sm">Original Selection</span>
                  </div>
                  <span className="font-medium">{stats.routeDistribution.A}%</span>
                </div>
                <Progress value={stats.routeDistribution.A} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">Route B</Badge>
                    <span className="text-sm">AI Enhancement</span>
                  </div>
                  <span className="font-medium">{stats.routeDistribution.B}%</span>
                </div>
                <Progress value={stats.routeDistribution.B} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="ai_generated">Route C</Badge>
                    <span className="text-sm">AI Generation</span>
                  </div>
                  <span className="font-medium">{stats.routeDistribution.C}%</span>
                </div>
                <Progress value={stats.routeDistribution.C} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.productId}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={activity.route === 'A' ? 'approved' : activity.route === 'B' ? 'warning' : 'ai_generated'}>
                        Route {activity.route}
                      </Badge>
                      <p className="text-sm font-medium mt-1">{activity.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link to="/history">View All Activity</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full justify-start">
                <Link to="/assistant">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Start New Analysis
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/catalog">
                  <Package className="w-4 h-4 mr-2" />
                  Manage Products
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
