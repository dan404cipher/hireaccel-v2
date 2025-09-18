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
  FileText,
  Calendar,
  Target,
  Award,
  UserPlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAgentDashboard, useMyAgentAssignment, useMyAgentAssignments, useMyAgentInterviewStats } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';

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

  // Recent assignments
  const recentAssignments = assignments.slice(0, 5);

  // Assignment status breakdown
  const assignmentStats = [
    { label: 'Active', value: dashboard.activeAssignments, color: 'text-primary' },
    { label: 'Completed', value: dashboard.completedAssignments, color: 'text-success' },
    { label: 'Pending', value: dashboard.pendingAssignments, color: 'text-warning' },
  ];

  const isLoading = dashboardLoading || assignmentLoading || assignmentsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
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
          icon={<Users className="h-4 w-4" />}
          description="HR managers assigned to you"
          color="text-primary"
        />
        <MetricCard
          title="Available Jobs"
          value={dashboard.availableJobs}
          icon={<Briefcase className="h-4 w-4" />}
          description="Jobs from assigned HRs"
          color="text-info"
        />
        <MetricCard
          title="Active Assignments"
          value={dashboard.activeAssignments}
          icon={<UserCheck className="h-4 w-4" />}
          description="Currently working on"
          color="text-warning"
        />
        <MetricCard
          title="Success Rate"
          value={`${successRate}%`}
          icon={<Award className="h-4 w-4" />}
          description="Completed assignments"
          color="text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Assignment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignmentStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stat.color.replace('text-', 'bg-')}`} />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{stat.value}</span>
                    <Progress 
                      value={totalAssignments > 0 ? (stat.value / totalAssignments) * 100 : 0} 
                      className="w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="flex-shrink-0 mt-1">
                      {assignment.status === "completed" && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      {assignment.status === "active" && (
                        <UserCheck className="w-4 h-4 text-primary" />
                      )}
                      {assignment.status === "rejected" && (
                        <AlertCircle className="w-4 h-4 text-destructive" />
                      )}
                      {assignment.status === "pending" && (
                        <Clock className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {assignment.candidateId?.userId?.firstName} {assignment.candidateId?.userId?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.jobId?.title} at {assignment.jobId?.companyId?.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {assignment.status}
                    </Badge>
                  </div>
                ))
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
      </div>

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
  color = "text-foreground" 
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={color}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
