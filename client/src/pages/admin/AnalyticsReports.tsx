import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Briefcase, 
  Calendar,
  FileText,
  Download,
  Filter,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";

// Mock data - In real app, this would come from API
const mockData = {
  overview: {
    totalUsers: 1247,
    totalJobs: 89,
    totalApplications: 2156,
    totalInterviews: 432,
    userGrowth: 12.3,
    jobGrowth: 8.7,
    applicationGrowth: 23.1,
    interviewGrowth: 15.2
  },
  userMetrics: {
    activeUsers: 892,
    newSignups: 43,
    candidateCount: 967,
    hrCount: 234,
    agentCount: 46
  },
  jobMetrics: {
    activeJobs: 67,
    filledPositions: 22,
    avgTimeToFill: 18,
    topSkills: ['React', 'Node.js', 'Python', 'AWS', 'TypeScript']
  },
  applicationMetrics: {
    totalApplications: 2156,
    reviewedApplications: 1834,
    shortlistedCandidates: 567,
    rejectedApplications: 1267,
    pendingReview: 322
  },
  performanceData: [
    { month: 'Jan', applications: 156, interviews: 45, hires: 12 },
    { month: 'Feb', applications: 178, interviews: 52, hires: 15 },
    { month: 'Mar', applications: 192, interviews: 58, hires: 18 },
    { month: 'Apr', applications: 234, interviews: 67, hires: 22 },
    { month: 'May', applications: 289, interviews: 78, hires: 28 },
    { month: 'Jun', applications: 312, interviews: 89, hires: 31 }
  ]
};

export default function AnalyticsReports() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [reportType, setReportType] = useState("overview");
  const [loading, setLoading] = useState(false);

  const exportReport = async (format: 'csv' | 'pdf') => {
    setLoading(true);
    // Simulate export
    setTimeout(() => {
      setLoading(false);
      alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
    }, 1000);
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }: {
    title: string;
    value: string | number;
    change: number;
    icon: any;
    trend: 'up' | 'down';
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive insights and reporting for recruitment operations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Report</SelectItem>
              <SelectItem value="users">User Analytics</SelectItem>
              <SelectItem value="jobs">Job Performance</SelectItem>
              <SelectItem value="applications">Application Metrics</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('csv')} disabled={loading}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => exportReport('pdf')} disabled={loading}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={mockData.overview.totalUsers.toLocaleString()}
          change={mockData.overview.userGrowth}
          icon={Users}
          trend="up"
        />
        <MetricCard
          title="Active Jobs"
          value={mockData.overview.totalJobs}
          change={mockData.overview.jobGrowth}
          icon={Briefcase}
          trend="up"
        />
        <MetricCard
          title="Applications"
          value={mockData.overview.totalApplications.toLocaleString()}
          change={mockData.overview.applicationGrowth}
          icon={FileText}
          trend="up"
        />
        <MetricCard
          title="Interviews"
          value={mockData.overview.totalInterviews}
          change={mockData.overview.interviewGrowth}
          icon={Calendar}
          trend="up"
        />
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Monthly Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-end justify-between gap-2 px-4">
                  {mockData.performanceData.map((data, index) => (
                    <div key={data.month} className="flex flex-col items-center gap-2 flex-1">
                      <div className="text-xs text-muted-foreground">{data.applications}</div>
                      <div 
                        className="bg-blue-500 w-full rounded-t"
                        style={{ height: `${(data.applications / 350) * 200}px` }}
                      />
                      <div className="text-xs font-medium">{data.month}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm">Applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm">Interviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-sm">Hires</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Candidates</span>
                  <Badge variant="outline">{mockData.userMetrics.candidateCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">HR Users</span>
                  <Badge variant="outline">{mockData.userMetrics.hrCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Agents</span>
                  <Badge variant="outline">{mockData.userMetrics.agentCount}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Users</span>
                  <Badge className="bg-green-100 text-green-800">{mockData.userMetrics.activeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Signups (30d)</span>
                  <Badge className="bg-blue-100 text-blue-800">{mockData.userMetrics.newSignups}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-center">71.5%</div>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Daily active users
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Jobs</span>
                  <Badge className="bg-green-100 text-green-800">{mockData.jobMetrics.activeJobs}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Filled Positions</span>
                  <Badge className="bg-blue-100 text-blue-800">{mockData.jobMetrics.filledPositions}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Avg. Time to Fill</span>
                  <Badge variant="outline">{mockData.jobMetrics.avgTimeToFill} days</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Skills in Demand
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockData.jobMetrics.topSkills.map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${90 - index * 15}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{90 - index * 15}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{mockData.applicationMetrics.totalApplications.toLocaleString()}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                    <p className="text-2xl font-bold">{mockData.applicationMetrics.reviewedApplications.toLocaleString()}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Shortlisted</p>
                    <p className="text-2xl font-bold">{mockData.applicationMetrics.shortlistedCandidates}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">{mockData.applicationMetrics.pendingReview}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Reviewed
                    </TableCell>
                    <TableCell>{mockData.applicationMetrics.reviewedApplications}</TableCell>
                    <TableCell>85.1%</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">+5.2%</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      Shortlisted
                    </TableCell>
                    <TableCell>{mockData.applicationMetrics.shortlistedCandidates}</TableCell>
                    <TableCell>26.3%</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">+2.1%</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      Pending
                    </TableCell>
                    <TableCell>{mockData.applicationMetrics.pendingReview}</TableCell>
                    <TableCell>14.9%</TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800">-1.3%</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Rejected
                    </TableCell>
                    <TableCell>{mockData.applicationMetrics.rejectedApplications}</TableCell>
                    <TableCell>58.8%</TableCell>
                    <TableCell>
                      <Badge className="bg-red-100 text-red-800">+3.4%</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
