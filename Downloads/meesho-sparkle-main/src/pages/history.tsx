import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Download, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface HistoryRecord {
  run_id: string;
  product_id: string;
  route: 'A' | 'B' | 'C';
  final_score: number;
  created_at: string;
  status: 'completed' | 'failed';
  iterations: number;
}

const mockHistory: HistoryRecord[] = [
  {
    run_id: "run_20250101_001",
    product_id: "P123456",
    route: "A",
    final_score: 0.92,
    created_at: "2025-01-01T10:30:00Z",
    status: "completed",
    iterations: 1
  },
  {
    run_id: "run_20250101_002", 
    product_id: "P123457",
    route: "B",
    final_score: 0.87,
    created_at: "2025-01-01T11:15:00Z",
    status: "completed",
    iterations: 2
  },
  {
    run_id: "run_20250101_003",
    product_id: "P123458", 
    route: "C",
    final_score: 0.85,
    created_at: "2025-01-01T12:00:00Z",
    status: "completed",
    iterations: 2
  },
  {
    run_id: "run_20250101_004",
    product_id: "P123459",
    route: "A",
    final_score: 0.95,
    created_at: "2025-01-01T14:30:00Z", 
    status: "completed",
    iterations: 1
  },
  {
    run_id: "run_20250101_005",
    product_id: "P123460",
    route: "B",
    final_score: 0.0,
    created_at: "2025-01-01T15:45:00Z",
    status: "failed",
    iterations: 0
  }
];

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [history] = useState<HistoryRecord[]>(mockHistory);

  const filteredHistory = history.filter(record => 
    record.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.run_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRouteDescription = (route: string) => {
    switch(route) {
      case 'A': return 'Original Selected';
      case 'B': return 'AI Enhanced';
      case 'C': return 'AI Generated';
      default: return 'Unknown';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Stats
  const completedRuns = history.filter(r => r.status === 'completed').length;
  const avgScore = history
    .filter(r => r.status === 'completed')
    .reduce((acc, r) => acc + r.final_score, 0) / completedRuns || 0;
  const routeDistribution = history.reduce((acc, r) => {
    if (r.status === 'completed') {
      acc[r.route] = (acc[r.route] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analysis History</h1>
        <p className="text-muted-foreground">
          View and manage your past image analysis runs
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{history.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">
                  {((completedRuns / history.length) * 100).toFixed(0)}%
                </p>
              </div>
              <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                <span className="text-success font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">{(avgScore * 100).toFixed(0)}%</p>
              </div>
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Route A</p>
                <p className="text-2xl font-bold">{routeDistribution.A || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Product ID or Run ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.run_id}>
                  <TableCell className="font-mono text-sm">
                    {record.run_id}
                  </TableCell>
                  <TableCell className="font-medium">
                    {record.product_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={record.route === 'A' ? 'success' : record.route === 'B' ? 'warning' : 'default'}
                      >
                        Route {record.route}
                      </Badge>
                      <span className="text-xs text-muted-foreground hidden md:block">
                        {getRouteDescription(record.route)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${getScoreColor(record.final_score)}`}>
                      {record.status === 'completed' 
                        ? `${(record.final_score * 100).toFixed(0)}%`
                        : '—'
                      }
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(record.created_at), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={record.status === 'completed' ? 'success' : 'destructive'}
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {record.status === 'completed' && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2" />
              <p>No analysis history found</p>
              <p className="text-sm">Try adjusting your search terms</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}