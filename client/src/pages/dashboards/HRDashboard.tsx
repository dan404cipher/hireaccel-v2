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
  Video,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs, useApplications, useInterviews, useCompanies, useCandidateAssignments } from "@/hooks/useApi";
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
  
  const { data: candidateAssignmentsResponse, loading: assignmentsLoading, error: assignmentsError } = useCandidateAssignments({
    assignedTo: user?.id,
    limit: 100
  });

  if (jobsError || applicationsError || interviewsError || companiesError || assignmentsError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <ApiErrorAlert 
          error={jobsError || applicationsError || interviewsError || companiesError || assignmentsError}
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
  const candidateAssignments = Array.isArray(candidateAssignmentsResponse) ? candidateAssignmentsResponse : (candidateAssignmentsResponse as any)?.data || [];

  // Calculate HR-specific metrics
  const activeJobs = jobs.filter((job: any) => job.status === 'open').length;
  const totalApplications = jobs.reduce((total: number, job: any) => total + (job.applications || 0), 0);
  const newApplications = candidateAssignments.filter((assignment: any) => 
    assignment.candidateStatus === 'new' && assignment.status === 'active'
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

  // All HR jobs for continuous scrolling
  const myJobs = jobs
    .map((job: any) => ({
      title: job.title,
      applications: job.applications || 0, // Use the applications count from the job (calculated from candidate assignments)
      status: job.status,
      company: job.companyId?.name || 'Unknown Company'
    }))
    .sort((a, b) => b.applications - a.applications); // Sort by applications but show all jobs

  const isLoading = jobsLoading || applicationsLoading || interviewsLoading || companiesLoading || assignmentsLoading;

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
          onClick={() => navigate('/dashboard/jobs?status=open')}
        />
        <MetricCard
          title="Total Applications"
          value={totalApplications}
          icon={<FileText className="h-5 w-5" />}
          description="All applications received"
          gradient="from-emerald-500 to-emerald-600"
          iconColor="text-emerald-100"
          onClick={() => navigate('/dashboard/shared-candidates')}
        />
        <MetricCard
          title="New Applications"
          value={newApplications}
          icon={<UserPlus className="h-5 w-5" />}
          description="New candidates assigned"
          gradient="from-amber-500 to-amber-600"
          iconColor="text-amber-100"
          onClick={() => navigate('/dashboard/shared-candidates?candidateStatus=new')}
        />
        <MetricCard
          title="Interviews Today"
          value={interviewsToday}
          icon={<Calendar className="h-5 w-5" />}
          description="Scheduled for today"
          gradient="from-purple-500 to-purple-600"
          iconColor="text-purple-100"
          onClick={() => navigate('/dashboard/interviews?date=today')}
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
              My Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-hidden relative">
              {myJobs.length > 0 ? (
                <div className="animate-scroll-vertical space-y-3">
                  {/* Duplicate the jobs list for seamless scrolling */}
                  {[...myJobs, ...myJobs].map((job, index) => (
                    <div key={`${job.title}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {(index % myJobs.length) + 1}
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
                  ))}
                </div>
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
              onClick={() => navigate('/dashboard/companies?action=add')} 
              className="h-20 flex-col gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-6 w-6" />
              <span>Add Company</span>
            </Button>
            <Button 
              onClick={() => navigate('/dashboard/interviews?action=schedule')} 
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
  iconColor = "text-gray-100",
  onClick
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description: string;
  gradient?: string;
  iconColor?: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
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
