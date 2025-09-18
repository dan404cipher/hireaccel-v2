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
  DollarSign,
  Phone,
  Video
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs, useApplications, useInterviews, useCompanies } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from 'date-fns';
import { DashboardBanner } from "@/components/dashboard/Banner";

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
  const totalApplications = jobs.reduce((total: number, job: any) => total + (job.applications || 0), 0);
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

  // Top performing jobs (by application count from candidate assignments)
  const topJobs = jobs
    .map((job: any) => ({
      title: job.title,
      applications: job.applications || 0, // Use the applications count from the job (calculated from candidate assignments)
      status: job.status,
      company: job.companyId?.name || 'Unknown Company'
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 5);

  const isLoading = jobsLoading || applicationsLoading || interviewsLoading || companiesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-foreground">Loading HR Dashboard</h2>
          <p className="text-muted-foreground mt-2">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
          <DashboardBanner category="hr" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">HR Dashboard</h1>
          <p className="text-muted-foreground">Manage your recruitment pipeline and job postings</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate('/dashboard/jobs')} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Manage Jobs
          </Button>
          <Button 
            onClick={() => navigate('/dashboard/interviews')} 
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
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
          icon={<Briefcase className="h-5 w-5" />}
          description="Currently open positions"
          gradient="from-blue-500 to-blue-600"
          iconColor="text-blue-100"
        />
        <MetricCard
          title="Total Applications"
          value={totalApplications}
          icon={<FileText className="h-5 w-5" />}
          description="All applications received"
          gradient="from-emerald-500 to-emerald-600"
          iconColor="text-emerald-100"
        />
        <MetricCard
          title="Pending Reviews"
          value={pendingApplications}
          icon={<Clock className="h-5 w-5" />}
          description="Applications to review"
          gradient="from-amber-500 to-amber-600"
          iconColor="text-amber-100"
        />
        <MetricCard
          title="Interviews Today"
          value={interviewsToday}
          icon={<Calendar className="h-5 w-5" />}
          description="Scheduled for today"
          gradient="from-purple-500 to-purple-600"
          iconColor="text-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interviews.filter((interview: any) => {
                const today = new Date();
                const interviewDate = new Date(interview.scheduledAt);
                return interviewDate.toDateString() === today.toDateString();
              }).length > 0 ? (
                interviews
                  .filter((interview: any) => {
                    const today = new Date();
                    const interviewDate = new Date(interview.scheduledAt);
                    return interviewDate.toDateString() === today.toDateString();
                  })
                  .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
                  .map((interview: any) => (
                    <div key={interview._id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/50">
                      <div className="flex-shrink-0 mt-1">
                        {interview.type === "video" && <Video className="w-4 h-4 text-primary" />}
                        {interview.type === "phone" && <Phone className="w-4 h-4 text-info" />}
                        {interview.type === "in-person" && <MapPin className="w-4 h-4 text-success" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {new Date(interview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {interview.applicationId?.candidateId?.userId?.firstName} {interview.applicationId?.candidateId?.userId?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {interview.round} - {interview.type} interview
                        </p>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {interview.status}
                      </Badge>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No interviews scheduled for today</p>
                  <Button 
                    onClick={() => navigate('/dashboard/interviews')} 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    Schedule Interview
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
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
          <CardTitle className="text-purple-700">Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your recruitment process</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => navigate('/dashboard/jobs')} 
              className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Briefcase className="h-6 w-6" />
              <span>Post New Job</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/interviews')} 
              className="h-20 flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Calendar className="h-6 w-6" />
              <span>Schedule Interview</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/companies')} 
              className="h-20 flex-col gap-2 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Building2 className="h-6 w-6" />
              <span>Manage Companies</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/hr-profile')} 
              className="h-20 flex-col gap-2 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Users className="h-6 w-6" />
              <span>My Profile</span>
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
  gradient = "from-gray-500 to-gray-600",
  iconColor = "text-gray-100"
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  gradient?: string;
  iconColor?: string;
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/90">
          {title}
        </CardTitle>
        <div className={`${iconColor} bg-white/20 p-2 rounded-lg backdrop-blur-sm`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-white/80 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
