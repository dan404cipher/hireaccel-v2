import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  MousePointerClick,
  RefreshCw,
  Calendar,
  Download,
  Filter,
  LayoutGrid,
} from 'lucide-react';
import { apiClient } from '@/services/api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/hooks/use-toast';

interface AnalyticsSummary {
  totalEvents: number;
  totalSessions: number;
  uniqueSessions: number;
  uniqueUsers: number;
  signups: number;
  bounceRate: number;
  bouncedSessions: number;
  avgSessionDuration: {
    all: number;
    bounced: number;
    registered: number;
  };
  dailyActiveUsers: Array<{ date: string; count: number }>;
}

interface FunnelData {
  funnel: Array<{
    stage: string;
    count: number;
    dropoff: number;
  }>;
  conversionRate: number;
  dashboardReached: number;
}

interface SourceData {
  sourcePerformance: Array<{
    source: string;
    totalEvents: number;
    uniqueSessions: number;
    signups: number;
    conversions: number;
    conversionRate: number;
  }>;
  topReferrers: Array<{
    _id: string;
    count: number;
  }>;
  directSessions: number;
  referralSessions: number;
}

interface Event {
  _id: string;
  eventName: string;
  page: string;
  referrer?: string;
  userId?: any;
  sessionId: string;
  timestamp: string;
  eventData: Record<string, any>;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  duration?: number;
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelData | null>(null);
  const [sourceData, setSourceData] = useState<SourceData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotal, setEventsTotal] = useState(0);
  
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'charts' | 'grid'>('charts');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        ...(dateRange.start && { startDate: dateRange.start }),
        ...(dateRange.end && { endDate: dateRange.end }),
      };

      const [summaryRes, funnelRes, sourceRes, eventsRes] = await Promise.all([
        apiClient.getAnalyticsSummary(params),
        apiClient.getAnalyticsFunnels(params),
        apiClient.getAnalyticsSources(params),
        apiClient.getAnalyticsEvents({ page: 1, limit: 50, ...params }),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (funnelRes.success) {
        setFunnelData(funnelRes.data);
      }
      if (sourceRes.success) {
        setSourceData(sourceRes.data);
      }
      if (eventsRes.success) {
        setEvents(eventsRes.data);
        setEventsTotal(eventsRes.meta?.total || 0);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.detail || 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (start: Date | null, end: Date | null) => {
    setDateRange({
      start: start ? start.toISOString().split('T')[0] : undefined,
      end: end ? end.toISOString().split('T')[0] : undefined,
    });
  };

  // Funnel Chart
  const funnelChartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toString(),
    },
    xaxis: {
      categories: funnelData?.funnel.map(f => f.stage) || [],
    },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'],
    title: {
      text: 'Signup Funnel',
      align: 'left',
    },
  };

  const funnelChartSeries = [{
    name: 'Users',
    data: funnelData?.funnel.map(f => f.count) || [],
  }];

  // Bounce Rate Trend Chart
  const bounceRateOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    xaxis: {
      categories: summary?.dailyActiveUsers.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }) || [],
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}%`,
      },
    },
    colors: ['#ef4444'],
    title: {
      text: 'Bounce Rate Trend',
      align: 'left',
    },
  };

  // This would need daily bounce rate data - using a placeholder for now
  const bounceRateSeries = [{
    name: 'Bounce Rate',
    data: summary?.dailyActiveUsers.map(() => summary.bounceRate) || [],
  }];

  // Referral Source Pie Chart
  const sourcePieOptions: ApexOptions = {
    chart: {
      type: 'pie',
      toolbar: { show: false },
    },
    labels: sourceData?.sourcePerformance.map(s => s.source || 'Direct') || [],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    title: {
      text: 'Referral Source Performance',
      align: 'left',
    },
  };

  const sourcePieSeries = sourceData?.sourcePerformance.map(s => s.uniqueSessions) || [];

  // Session Duration Comparison Chart
  const durationOptions: ApexOptions = {
    chart: {
      type: 'bar',
      horizontal: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}s`,
    },
    xaxis: {
      title: {
        text: 'Duration (seconds)',
      },
    },
    yaxis: {
      categories: ['Bounced', 'Registered'],
    },
    colors: ['#ef4444', '#10b981'],
    title: {
      text: 'Session Duration Comparison',
      align: 'left',
    },
  };

  const durationSeries = [{
    name: 'Avg Duration',
    data: summary ? [
      summary.avgSessionDuration.bounced,
      summary.avgSessionDuration.registered,
    ] : [0, 0],
  }];

  // Daily Active Users Chart
  const dauOptions: ApexOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: summary?.dailyActiveUsers.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }) || [],
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
      },
    },
    colors: ['#3b82f6'],
    title: {
      text: 'Daily Active Users',
      align: 'left',
    },
  };

  const dauSeries = [{
    name: 'Active Sessions',
    data: summary?.dailyActiveUsers.map(d => d.count) || [],
  }];

  if (loading && !summary) {
    return (
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
              <div className="h-8 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track user behavior and conversion metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'charts' | 'grid')}>
            <ToggleGroupItem value="charts" aria-label="Charts view">
              <BarChart3 className="h-4 w-4 mr-2" />
              Charts
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Grid
            </ToggleGroupItem>
          </ToggleGroup>
          <Input
            type="date"
            placeholder="Start Date"
            value={dateRange.start || ''}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-40"
          />
          <Input
            type="date"
            placeholder="End Date"
            value={dateRange.end || ''}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-40"
          />
          <Button onClick={fetchData} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalEvents.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All tracked events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalSessions.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{summary?.uniqueSessions.toLocaleString() || 0} unique</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.bounceRate.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">{summary?.bouncedSessions || 0} bounced sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.signups.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{summary?.uniqueUsers.toLocaleString() || 0} unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="funnels">Funnels & Conversions</TabsTrigger>
          <TabsTrigger value="sources">Source Insights</TabsTrigger>
          <TabsTrigger value="events">Raw Events</TabsTrigger>
          <TabsTrigger value="heatmaps">Heatmaps & Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {viewMode === 'charts' ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Active Users</CardTitle>
                    <CardDescription>Active sessions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={dauOptions}
                      series={dauSeries}
                      type="area"
                      height={350}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Duration Comparison</CardTitle>
                    <CardDescription>Average duration by user type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={durationOptions}
                      series={durationSeries}
                      type="bar"
                      height={350}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bounce Rate Trend</CardTitle>
                    <CardDescription>Daily bounce rate percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={bounceRateOptions}
                      series={bounceRateSeries}
                      type="line"
                      height={350}
                    />
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Active Users</CardTitle>
                    <CardDescription>Active sessions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Active Sessions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary?.dailyActiveUsers.map((dau) => (
                          <TableRow key={dau.date}>
                            <TableCell>
                              {new Date(dau.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="font-medium">{dau.count.toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                        {(!summary?.dailyActiveUsers || summary.dailyActiveUsers.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              No data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Duration Comparison</CardTitle>
                    <CardDescription>Average duration by user type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User Type</TableHead>
                          <TableHead>Average Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Bounced</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {summary?.avgSessionDuration.bounced.toFixed(1) || 0}s
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Registered</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              {summary?.avgSessionDuration.registered.toFixed(1) || 0}s
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">All Users</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {summary?.avgSessionDuration.all.toFixed(1) || 0}s
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Bounce Rate Trend</CardTitle>
                    <CardDescription>Daily bounce rate percentage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Bounce Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {summary?.dailyActiveUsers.map((dau) => (
                          <TableRow key={dau.date}>
                            <TableCell>
                              {new Date(dau.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              <Badge variant={summary?.bounceRate > 50 ? 'destructive' : 'secondary'}>
                                {summary?.bounceRate.toFixed(1) || 0}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(!summary?.dailyActiveUsers || summary.dailyActiveUsers.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground">
                              No data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          {viewMode === 'charts' ? (
            <Card>
              <CardHeader>
                <CardTitle>Signup Funnel</CardTitle>
                <CardDescription>
                  Conversion rate: {funnelData?.conversionRate.toFixed(2) || 0}% | 
                  Dashboard reached: {funnelData?.dashboardReached || 0}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={funnelChartOptions}
                  series={funnelChartSeries}
                  type="bar"
                  height={400}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Funnel Drop-off Analysis</CardTitle>
              <CardDescription>
                {viewMode === 'charts' 
                  ? 'Detailed breakdown of funnel stages and drop-off rates'
                  : 'Complete funnel analysis with conversion metrics'}
                {funnelData && (
                  <> | Conversion rate: {funnelData.conversionRate.toFixed(2)}% | Dashboard reached: {funnelData.dashboardReached}</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stage</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Drop-off Rate</TableHead>
                    {viewMode === 'grid' && <TableHead>Conversion from Previous</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funnelData?.funnel.map((stage, index) => {
                    const previousCount = index > 0 ? funnelData.funnel[index - 1].count : stage.count;
                    const conversionFromPrevious = previousCount > 0 
                      ? ((stage.count / previousCount) * 100).toFixed(1) 
                      : '0.0';
                    
                    return (
                      <TableRow key={stage.stage}>
                        <TableCell className="font-medium">{stage.stage}</TableCell>
                        <TableCell>{stage.count.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={stage.dropoff > 50 ? 'destructive' : 'secondary'}>
                            {stage.dropoff.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        {viewMode === 'grid' && (
                          <TableCell>
                            {index > 0 ? (
                              <Badge variant={parseFloat(conversionFromPrevious) > 70 ? 'default' : 'outline'}>
                                {conversionFromPrevious}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                  {(!funnelData?.funnel || funnelData.funnel.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={viewMode === 'grid' ? 4 : 3} className="text-center text-muted-foreground">
                        No funnel data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {viewMode === 'charts' && (
              <Card>
                <CardHeader>
                  <CardTitle>Referral Source Performance</CardTitle>
                  <CardDescription>Distribution by source</CardDescription>
                </CardHeader>
                <CardContent>
                  {sourcePieSeries.length > 0 ? (
                    <ReactApexChart
                      options={sourcePieOptions}
                      series={sourcePieSeries}
                      type="pie"
                      height={350}
                    />
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                      No source data available
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className={viewMode === 'charts' ? '' : 'lg:col-span-2'}>
              <CardHeader>
                <CardTitle>Source Performance Metrics</CardTitle>
                <CardDescription>
                  {viewMode === 'charts' 
                    ? 'Detailed metrics by source'
                    : 'Complete source performance analysis with conversion rates'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Signups</TableHead>
                      <TableHead>Conv. Rate</TableHead>
                      {viewMode === 'grid' && (
                        <>
                          <TableHead>Total Events</TableHead>
                          <TableHead>Conversions</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sourceData?.sourcePerformance.map((source) => (
                      <TableRow key={source.source}>
                        <TableCell className="font-medium">{source.source || 'Direct'}</TableCell>
                        <TableCell>{source.uniqueSessions.toLocaleString()}</TableCell>
                        <TableCell>{source.signups.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={source.conversionRate > 10 ? 'default' : 'secondary'}>
                            {source.conversionRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        {viewMode === 'grid' && (
                          <>
                            <TableCell>{source.totalEvents.toLocaleString()}</TableCell>
                            <TableCell>{source.conversions.toLocaleString()}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                    {(!sourceData?.sourcePerformance || sourceData.sourcePerformance.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={viewMode === 'grid' ? 6 : 4} className="text-center text-muted-foreground">
                          No source data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referrer</TableHead>
                    <TableHead>Events</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourceData?.topReferrers.map((ref) => (
                    <TableRow key={ref._id}>
                      <TableCell className="font-medium">{ref._id}</TableCell>
                      <TableCell>{ref.count.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Raw Event Logs</CardTitle>
                  <CardDescription>All tracked events with filters</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="page_view">Page View</SelectItem>
                      <SelectItem value="signup_button_clicked">Signup Click</SelectItem>
                      <SelectItem value="signup_successful">Signup Success</SelectItem>
                      <SelectItem value="session_start">Session Start</SelectItem>
                      <SelectItem value="session_end">Session End</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Page</TableHead>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events
                    .filter(e => eventFilter === 'all' || e.eventName === eventFilter)
                    .map((event) => (
                      <TableRow key={event._id}>
                        <TableCell>
                          {new Date(event.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.eventName}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{event.page}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.sessionId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {event.utm?.source ? (
                            <Badge>{event.utm.source}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Direct</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmaps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Recordings & Heatmaps</CardTitle>
              <CardDescription>
                Powered by Microsoft Clarity. View heatmaps and session recordings directly in your Clarity dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {import.meta.env.VITE_CLARITY_ID ? (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Clarity is Active
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        Clarity is tracking user sessions, clicks, and scrolls. Data will appear in your Clarity dashboard.
                      </p>
                      <div className="mt-3 space-y-2">
                        <Button 
                          onClick={() => {
                            const diagnostics = [];
                            diagnostics.push('=== Clarity Diagnostics ===');
                            
                            // Check 1: Environment variable
                            const clarityId = import.meta.env.VITE_CLARITY_ID;
                            if (clarityId) {
                              diagnostics.push(`✅ Clarity ID found: ${clarityId}`);
                            } else {
                              diagnostics.push(`❌ Clarity ID NOT found in environment variables`);
                            }
                            
                            // Check 2: Clarity object
                            if (typeof window !== 'undefined' && (window as any).clarity) {
                              diagnostics.push(`✅ Clarity object exists in window.clarity`);
                              try {
                                const clarityObj = (window as any).clarity;
                                diagnostics.push(`   Clarity object type: ${typeof clarityObj}`);
                              } catch (e) {
                                diagnostics.push(`   Error accessing clarity: ${e}`);
                              }
                            } else {
                              diagnostics.push(`❌ Clarity object NOT found in window.clarity`);
                            }
                            
                            // Check 3: Network requests
                            diagnostics.push(`\n📊 To check if Clarity is sending data:`);
                            diagnostics.push(`1. Open Network tab (F12 → Network)`);
                            diagnostics.push(`2. Filter by "clarity"`);
                            diagnostics.push(`3. Refresh the page`);
                            diagnostics.push(`4. You should see requests to v.clarity.ms/collect`);
                            
                            // Check 4: Session tracking
                            const sessionId = localStorage.getItem('analytics_session_id');
                            if (sessionId) {
                              diagnostics.push(`✅ Analytics session ID found: ${sessionId.substring(0, 20)}...`);
                            } else {
                              diagnostics.push(`⚠️ No analytics session ID (this is OK if you just started)`);
                            }
                            
                            // Output all diagnostics
                            const diagnosticMessage = diagnostics.join('\n');
                            console.log(diagnosticMessage);
                            
                            // Show simplified alert
                            if (clarityId && (window as any).clarity) {
                              alert(`✅ Clarity is configured correctly!\n\nCheck console for full diagnostics.\n\nNext steps:\n1. Visit multiple pages on your site\n2. Wait 5-10 minutes\n3. Check Clarity dashboard`);
                            } else {
                              alert(`⚠️ Clarity setup issue detected!\n\nCheck browser console for detailed diagnostics.`);
                            }
                          }}
                          variant="outline"
                          className="mr-2"
                        >
                          🔍 Run Clarity Diagnostics
                        </Button>
                        <Button 
                          onClick={() => window.open('https://clarity.microsoft.com/dashboard', '_blank')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Open Clarity Dashboard →
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">📋 Step-by-Step Guide</h3>
                      <div className="text-sm text-purple-800 space-y-3">
                        <div>
                          <p className="font-medium mb-1">Step 1: Verify Setup</p>
                          <p>Open browser console (F12) and look for: <code className="bg-purple-100 px-1 rounded">✅ Microsoft Clarity initialized</code></p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Step 2: Generate Data</p>
                          <p>You need to <strong>actually visit your website</strong> to collect data:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Navigate through different pages</li>
                            <li>Click buttons and links</li>
                            <li>Scroll on pages</li>
                            <li>Stay on pages for at least 30 seconds</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Step 3: Wait for Processing</p>
                          <p>After visiting your site, wait <strong>5-10 minutes</strong> for Clarity to process the data.</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Step 4: Check Dashboard</p>
                          <p>Go to <a href="https://clarity.microsoft.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">clarity.microsoft.com/dashboard</a> and select your project. You should see:</p>
                          <ul className="list-disc list-inside ml-2 mt-1">
                            <li>Session recordings</li>
                            <li>Heatmaps</li>
                            <li>Click tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
                      <div className="space-y-2 text-sm text-blue-700">
                        <p><strong>Project ID:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{import.meta.env.VITE_CLARITY_ID}</code></p>
                        <div className="mt-3">
                          <p className="font-medium mb-2">Important Notes:</p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>It may take a few minutes for data to appear after first setup</li>
                            <li>Make sure you've navigated your site to generate session data</li>
                            <li>Visit <a href="https://clarity.microsoft.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">clarity.microsoft.com/dashboard</a> to view all data</li>
                            <li>Check browser console for any Clarity initialization errors</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h3 className="font-semibold text-amber-900 mb-2">Troubleshooting</h3>
                      <div className="text-sm text-amber-800 space-y-2">
                        <p><strong>Not seeing data?</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Verify your project ID is correct in Settings → Overview</li>
                          <li>Check that Clarity.init() was called (check browser console)</li>
                          <li>Wait 5-10 minutes for data to process after first visit</li>
                          <li>Clear browser cache and reload if issues persist</li>
                          <li>Make sure you're using the correct Microsoft account to view the dashboard</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Microsoft Clarity Integration</h3>
                      <p className="text-sm text-blue-800 mb-3">
                        Clarity provides free session replay, heatmaps, and click tracking. 
                        Set it up to start collecting user behavior data.
                      </p>
                      <div className="space-y-2 text-sm text-blue-700">
                        <p><strong>Setup Steps:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Sign up at <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">clarity.microsoft.com</a></li>
                          <li>Create a new project for your website</li>
                          <li>Copy your Project ID from Settings → Overview</li>
                          <li>Add to your <code className="bg-blue-100 px-1 rounded">.env</code> file: <code className="bg-blue-100 px-1 rounded">VITE_CLARITY_ID=your_project_id</code></li>
                          <li>Restart your development server</li>
                          <li>Visit your site to start collecting data</li>
                        </ol>
                      </div>
                    </div>

                    <div className="h-[300px] border rounded-lg flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MousePointerClick className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">Clarity not configured</p>
                        <p className="text-sm mt-2">
                          Add <code className="bg-gray-100 px-1 rounded">VITE_CLARITY_ID</code> to your .env file
                        </p>
                        <Button 
                          className="mt-4" 
                          onClick={() => window.open('https://clarity.microsoft.com', '_blank')}
                        >
                          Sign up for Clarity (Free)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

