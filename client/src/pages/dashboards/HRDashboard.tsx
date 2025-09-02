import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingCard } from "@/components/ui/loading-spinner";
import { ApiErrorAlert } from "@/components/ui/error-boundary";
import { 
  Briefcase, 
  Calendar, 
  Building2, 
  TrendingUp, 
  Users,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs, useApplications, useInterviews, useCompanies } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';

export default function HRDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API hooks for HR-specific data
  const { data: jobsResponse, loading: jobsLoading, error: jobsError } = useJobs({
    createdBy: user?.id,
    limit: 100
  });
  
  const { data: applicationsResponse, loading: applicationsLoading, error: applicationsError } = useApplications({
    limit: 100
  });
  
  const { data: interviewsResponse, loading: interviewsLoading, error: interviewsError } = useInterviews({
    limit: 100
  });
  
  const { data: companiesResponse, loading: companiesLoading, error: companiesError } = useCompanies({
    limit: 100
  });

  if (jobsError || applicationsError || interviewsError || companiesError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <ApiErrorAlert 
          error={jobsError || applicationsError || interviewsError || companiesError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Process data
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse as any)?.data || [];
  const applications = Array.isArray(applicationsResponse) ? applicationsResponse : (applicationsResponse as any)?.data || [];
  const interviews = Array.isArray(interviewsResponse) ? interviewsResponse : (interviewsResponse as any)?.data || [];
  const companies = Array.isArray(companiesResponse) ? companiesResponse : (companiesResponse as any)?.data || [];

  // Calculate HR-specific metrics
  const activeJobs = jobs.filter((job: any) => job.status === 'open').length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app: any) => 
    ['applied', 'under_review', 'shortlisted'].includes(app.status)
  ).length;
  const interviewsToday = interviews.filter((interview: any) => {
    const today = new Date();
    const interviewDate = new Date(interview.scheduledAt);
    return interviewDate.toDateString() === today.toDateString();
  }).length;
  const upcomingInterviews = interviews.filter((interview: any) => {
    const now = new Date();
    const interviewDate = new Date(interview.scheduledAt);
    return interviewDate > now;
  }).length;

  // Recent activity for HR
  const recentActivity = [
    ...applications.slice(0, 3).map((app: any) => ({
      id: `app-${app.id}`,
      type: "application",
      title: "New application received",
      description: `${app.candidate?.firstName} ${app.candidate?.lastName} applied for ${app.job?.title}`,
      time: formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true }),
      status: app.status
    })),
    ...interviews.slice(0, 2).map((interview: any) => ({
      id: `interview-${interview.id}`,
      type: "interview",
      title: "Interview scheduled",
      description: `${interview.candidate?.firstName} ${interview.candidate?.lastName} - ${interview.job?.title}`,
      time: formatDistanceToNow(new Date(interview.scheduledAt), { addSuffix: true }),
      status: interview.status
    }))
  ];

  // Top performing jobs (by application count)
  const topJobs = jobs
    .map((job: any) => ({
      title: job.title,
      applications: applications.filter((app: any) => app.job?.id === job.id).length,
      status: job.status,
      company: job.company?.name || 'Unknown Company'
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 5);

  const isLoading = jobsLoading || applicationsLoading || interviewsLoading || companiesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
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
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Manage your recruitment pipeline and job postings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/jobs')}>
            <Briefcase className="h-4 w-4 mr-2" />
            Manage Jobs
          </Button>
          <Button onClick={() => navigate('/interviews')} variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Interviews
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Jobs"
          value={activeJobs}
          icon={<Briefcase className="h-4 w-4" />}
          description="Currently open positions"
          color="text-primary"
        />
        <MetricCard
          title="Total Applications"
          value={totalApplications}
          icon={<FileText className="h-4 w-4" />}
          description="All applications received"
          color="text-info"
        />
        <MetricCard
          title="Pending Reviews"
          value={pendingApplications}
          icon={<Clock className="h-4 w-4" />}
          description="Applications to review"
          color="text-warning"
        />
        <MetricCard
          title="Interviews Today"
          value={interviewsToday}
          icon={<Calendar className="h-4 w-4" />}
          description="Scheduled for today"
          color="text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                    <div className="flex-shrink-0 mt-1">
                      {activity.status === "completed" && (
                        <CheckCircle className="w-4 h-4 text-success" />
                      )}
                      {activity.status === "scheduled" && (
                        <Calendar className="w-4 h-4 text-warning" />
                      )}
                      {activity.status === "applied" && (
                        <FileText className="w-4 h-4 text-info" />
                      )}
                      {activity.status === "under_review" && (
                        <Clock className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {activity.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Performing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topJobs.length > 0 ? (
                topJobs.map((job, index) => (
                  <div key={job.title} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{job.title}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary">{job.applications}</p>
                      <p className="text-xs text-muted-foreground">applications</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No jobs posted yet</p>
                  <Button 
                    onClick={() => navigate('/jobs')} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Post Your First Job
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your recruitment process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/jobs')} 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <Briefcase className="h-6 w-6" />
              <span>Post New Job</span>
            </Button>
            <Button 
              onClick={() => navigate('/interviews')} 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Interview</span>
            </Button>
            <Button 
              onClick={() => navigate('/shared-candidates')} 
              variant="outline" 
              className="h-20 flex-col gap-2"
            >
              <UserPlus className="h-6 w-6" />
              <span>View Candidates</span>
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
