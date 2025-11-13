import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingCard } from "@/components/ui/loading-spinner";
import { ApiErrorAlert } from "@/components/ui/error-boundary";
import { 
  Users, 
  Briefcase, 
  UserCheck, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  UserPlus,
  PieChart
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAgentDashboard, useMyAgentAssignment, useMyAgentAssignments, useMyAgentInterviewStats } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow, format, subDays } from 'date-fns';
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { useMemo } from "react";

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API hooks for agent-specific data
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = useAgentDashboard();
  const { data: agentAssignment, loading: assignmentLoading, error: assignmentError } = useMyAgentAssignment();
  const { data: assignmentsResponse, loading: assignmentsLoading, error: assignmentsError } = useMyAgentAssignments({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { data: interviewStats, loading: interviewStatsLoading, error: interviewStatsError } = useMyAgentInterviewStats();

  if (dashboardError || assignmentError || assignmentsError || interviewStatsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <ApiErrorAlert 
          error={dashboardError || assignmentError || assignmentsError || interviewStatsError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Process data
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : (assignmentsResponse as any)?.data || [];
  const dashboard = dashboardData || {
    assignedHRs: 0,
    assignedCandidates: 0,
    availableJobs: 0,
    activeAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
  };

  // Calculate success rate
  const totalAssignments = dashboard.activeAssignments + dashboard.completedAssignments + dashboard.pendingAssignments;
  const successRate = totalAssignments > 0 ? Math.round((dashboard.completedAssignments / totalAssignments) * 100) : 0;

  // Recent assignments (limit to 10, show 3 at a time via scroll)
  const recentAssignments = assignments.slice(0, 10);

  const assignmentDateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assignments.forEach((assignment: any) => {
      const dateValue = assignment.assignedAt || assignment.createdAt;
      if (!dateValue) return;
      const key = format(new Date(dateValue), 'yyyy-MM-dd');
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [assignments]);

  const last7Days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => subDays(today, 6 - index));
  }, [assignments]);

  const assignmentsTrendSeriesData = last7Days.map((day) => {
    const key = format(day, 'yyyy-MM-dd');
    return assignmentDateCounts[key] || 0;
  });

  const assignmentsTrendSeries = [
    {
      name: 'Assignments',
      data: assignmentsTrendSeriesData,
    },
  ];

  const assignmentsTrendOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 280,
      toolbar: { show: false },
      sparkline: { enabled: false },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    colors: ['#2563eb'],
    xaxis: {
      categories: last7Days.map((day) => format(day, 'MMM d')),
      labels: {
        style: {
          colors: '#94a3b8',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8',
        },
      },
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} assignments`,
      },
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 4,
    },
  };

  const statusCounts = useMemo(() => {
    return assignments.reduce((acc: Record<string, number>, assignment: any) => {
      const key = (assignment.status || 'pending').toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [assignments]);

  const statusOrder = ['active', 'completed', 'pending', 'rejected', 'withdrawn'];
  const statusLabels = ['Active', 'Completed', 'Pending', 'Rejected', 'Withdrawn'];
  const statusColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#64748b'];
  const statusSeriesData = statusOrder.map((key) => statusCounts[key] || 0);
  const statusTotal = statusSeriesData.reduce((total, value) => total + value, 0);

  const assignmentStatusOptions: ApexOptions = {
    chart: {
      type: 'donut',
      height: 280,
    },
    labels: statusLabels,
    colors: statusColors,
    legend: {
      position: 'bottom',
      fontSize: '12px',
    },
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: {
        fontSize: '12px',
        fontWeight: '500',
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => `${statusTotal}`,
            },
          },
        },
      },
    },
  };

  const statusIconMap = {
    completed: { icon: CheckCircle, color: "text-success" },
    active: { icon: UserCheck, color: "text-primary" },
    rejected: { icon: AlertCircle, color: "text-destructive" },
    pending: { icon: Clock, color: "text-warning" },
    withdrawn: { icon: Clock, color: "text-muted-foreground" },
  };

  const isLoading = dashboardLoading || assignmentLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-64 animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              </div>
              <div className="h-8 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>

        {/* Charts and Recent Assignments Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Skeleton */}
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>

          {/* Recent Assignments Skeleton */}
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                  <div className="h-5 w-16 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">Manage your candidate assignments and track your performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/dashboard/assignment-management')}>
            <UserCheck className="h-4 w-4 mr-2" />
            Manage Assignments
          </Button>
          <Button onClick={() => navigate('/dashboard/shared-candidates')} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Track Progress
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Assigned HRs"
          value={dashboard.assignedHRs}
          icon={<Users className="h-6 w-6 text-white" />}
          description="HR managers collaborating with you"
          color="blue"
          onClick={() => navigate('/dashboard/assignment-management')}
        />
        <MetricCard
          title="Available Jobs"
          value={dashboard.availableJobs}
          icon={<Briefcase className="h-6 w-6 text-white" />}
          description="Open roles from your HR partners"
          color="emerald"
          onClick={() => {
            localStorage.setItem('agentAssignmentActiveTab', 'jobs');
            navigate('/dashboard/assignment-management');
          }}
        />
        <MetricCard
          title="Active Assignments"
          value={dashboard.activeAssignments}
          icon={<UserCheck className="h-6 w-6 text-white" />}
          description="Candidates you are actively supporting"
          color="purple"
          onClick={() => navigate('/dashboard/shared-candidates')}
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={<Award className="h-6 w-6 text-white" />}
          description="Completed assignments out of total"
          color="amber"
          onClick={() => navigate('/dashboard/shared-candidates')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment: any) => {
                  const key = assignment._id || assignment.id;
                  const statusKey = assignment.status?.toLowerCase?.() || "pending";
                  const statusMeta = statusIconMap[statusKey as keyof typeof statusIconMap] || statusIconMap.pending;
                  const StatusIcon = statusMeta.icon;
                  const firstName = assignment.candidateId?.userId?.firstName || "";
                  const lastName = assignment.candidateId?.userId?.lastName || "";
                  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Candidate";
                  const companyName = assignment.jobId?.companyId?.name || "Unknown Company";
                  const jobTitle = assignment.jobId?.title || "Job Opportunity";
                  const assignedAt = assignment.assignedAt || assignment.createdAt;
                  const statusLabel = assignment.status
                    ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)
                    : "Pending";
                  const candidateCustomId = assignment.candidateId?.userId?.customId;

                  const handleNavigate = () => {
                    if (candidateCustomId) {
                      navigate(`/dashboard/candidates/${candidateCustomId}`);
                    }
                  };

                  return (
                    <div
                      key={key}
                      className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 transition-colors hover:bg-accent cursor-pointer"
                      onClick={handleNavigate}
                      role={candidateCustomId ? "button" : undefined}
                      tabIndex={candidateCustomId ? 0 : -1}
                      onKeyDown={(event) => {
                        if (candidateCustomId && (event.key === "Enter" || event.key === " ")) {
                          event.preventDefault();
                          handleNavigate();
                        }
                      }}
                    >
                      <div className="relative">
                        <AssignmentCandidateAvatar
                          profilePhotoFileId={assignment.candidateId?.userId?.profilePhotoFileId}
                          firstName={firstName}
                          lastName={lastName}
                        />
                        <StatusIcon className={`absolute -bottom-1 -right-1 h-4 w-4 ${statusMeta.color} drop-shadow`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {fullName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {jobTitle} at {companyName}
                        </p>
                        {assignedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(assignedAt), { addSuffix: true })}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="flex-shrink-0 capitalize">
                        {statusLabel}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No assignments yet</p>
                  <p className="text-sm">Start by managing your assignments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>Your assignment performance and key metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{dashboard.completedAssignments}</div>
                <p className="text-sm text-muted-foreground">Successful Placements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-info">{dashboard.assignedCandidates}</div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">{successRate}%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Assignment Trend
            </CardTitle>
            <CardDescription>Assignments created over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentsTrendSeriesData.some((value) => value > 0) ? (
              <ReactApexChart
                options={assignmentsTrendOptions}
                series={assignmentsTrendSeries}
                type="area"
                height={280}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mb-3 opacity-60" />
                <p className="text-sm">Not enough assignment activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Status Distribution
            </CardTitle>
            <CardDescription>Breakdown of current assignment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusTotal > 0 ? (
              <ReactApexChart
                options={assignmentStatusOptions}
                series={statusSeriesData}
                type="donut"
                height={280}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <PieChart className="w-8 h-8 mb-3 opacity-60" />
                <p className="text-sm">No assignments to visualize yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/dashboard/assignment-management')} 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <UserCheck className="h-6 w-6" />
              <span>Manage Assignments</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/shared-candidates')} 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Track Progress</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/assignment-management')} 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <UserPlus className="h-6 w-6" />
              <span>Assign Candidates</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({ 
  title, 
  value, 
  icon, 
  description, 
  color = "blue", 
  onClick,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color?: "blue" | "emerald" | "purple" | "amber";
  onClick?: () => void;
}) {
  const gradientMap: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    amber: "from-amber-500 to-amber-600",
  };

  const gradientClasses = gradientMap[color] || gradientMap.blue;

  return (
    <Card
      className={`bg-gradient-to-br ${gradientClasses} text-white shadow-lg hover:shadow-xl transition-all duration-300 ${onClick ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-3xl font-bold mt-2">{typeof value === "number" ? value.toLocaleString() : value}</p>
            <p className="text-xs text-white/70 mt-1">{description}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssignmentCandidateAvatar({
  profilePhotoFileId,
  firstName,
  lastName,
}: {
  profilePhotoFileId?: string;
  firstName?: string;
  lastName?: string;
}) {
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || "http://localhost:3002"}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  const initials = `${(firstName?.[0] || "").toUpperCase()}${(lastName?.[0] || "").toUpperCase()}` || "NA";
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Candidate";

  return (
    <Avatar className="h-10 w-10 border border-border">
      <AvatarImage src={authenticatedImageUrl || undefined} alt={fullName} />
      <AvatarFallback className="text-xs font-medium uppercase">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
