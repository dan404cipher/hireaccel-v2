import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Upload,
  User,
  Briefcase,
  Star
} from "lucide-react";
import { useApplications, useJobs } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function CandidateDashboard() {
  const [profileCompletion] = useState(75);
  const { user } = useAuth();
  const navigate = useNavigate();

  // API calls for real data
  const { data: applicationsData, loading: applicationsLoading } = useApplications({
    userId: user?.id,
    limit: 10,
    sortBy: 'appliedAt',
    sortOrder: 'desc'
  });

  const { data: jobsData, loading: jobsLoading } = useJobs({
    status: 'open',
    limit: 3,
    sortBy: 'postedAt',
    sortOrder: 'desc'
  });

  // Process real data
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData as any)?.data || [];
  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData as any)?.data || [];

  // Get recent applications (last 5)
  const recentApplications = applications.slice(0, 5);

  // Calculate application stats
  const applicationStats = useMemo(() => {
    const total = applications.length;
    const activeCount = applications.filter((app: any) => app.status === 'active').length;
    const hiredCount = applications.filter((app: any) => app.status === 'hired').length;
    const rejectedCount = applications.filter((app: any) => app.status === 'rejected').length;
    const responseRate = total > 0 ? Math.round(((activeCount + hiredCount) / total) * 100) : 0;
    
    return { total, activeCount, hiredCount, rejectedCount, responseRate };
  }, [applications]);

  // Get upcoming interviews (mock for now as we don't have interview data in applications)
  const upcomingInterviews = applications.filter((app: any) => 
    app.stage === 'phone_interview' || 
    app.stage === 'technical_interview' || 
    app.stage === 'final_interview'
  ).slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interview": return "bg-blue-100 text-blue-800";
      case "under_review": return "bg-yellow-100 text-yellow-800";
      case "applied": return "bg-gray-100 text-gray-800";
      case "offered": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'Candidate'}!</h1>
          <p className="text-muted-foreground">Track your applications and manage your job search</p>
        </div>
      </div>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Complete your profile to attract more recruiters</CardDescription>
            </div>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Profile completion</span>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <ProfileItem
                title="Resume"
                completed={true}
                description="CV uploaded"
                icon={<FileText className="h-4 w-4" />}
              />
              <ProfileItem
                title="Skills"
                completed={true}
                description="5 skills added"
                icon={<Star className="h-4 w-4" />}
              />
              <ProfileItem
                title="Portfolio"
                completed={false}
                description="Add portfolio"
                icon={<Briefcase className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Applications"
          value={applicationStats.total}
          icon={<FileText className="h-4 w-4" />}
          description="Total submitted"
        />
        <StatCard
          title="Active Applications"
          value={applicationStats.activeCount}
          icon={<Clock className="h-4 w-4" />}
          description="In progress"
        />
        <StatCard
          title="Hired"
          value={applicationStats.hiredCount}
          icon={<CheckCircle className="h-4 w-4" />}
          description="Successful"
        />
        <StatCard
          title="Response Rate"
          value={`${applicationStats.responseRate}%`}
          icon={<Star className="h-4 w-4" />}
          description="Success rate"
        />
      </div>

      {/* Applications Timeline & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Application Timeline</CardTitle>
            <CardDescription>Track your job application progress</CardDescription>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app: any) => (
                  <div key={app._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{app.jobId?.title || 'Unknown Position'}</h4>
                        <p className="text-sm text-muted-foreground">{app.jobId?.companyId?.name || 'Unknown Company'}</p>
                      </div>
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Applied {formatDistanceToNow(new Date(app.appliedAt))} ago
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {app.stage?.replace('_', ' ') || 'Applied'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm">{app.notes || 'Application submitted and under review'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No applications yet</p>
                <Button 
                  className="mt-2" 
                  size="sm"
                  onClick={() => navigate('/candidate-jobs')}
                >
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Prepare for your scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length > 0 ? (
              <div className="space-y-4">
                {upcomingInterviews.map((interview: any) => (
                  <div key={interview._id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{interview.jobId?.title || 'Interview'}</h4>
                        <p className="text-sm text-muted-foreground">{interview.jobId?.companyId?.name || 'Company'}</p>
                      </div>
                      <Badge variant="outline">{interview.stage?.replace('_', ' ') || 'Interview'}</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(interview.lastUpdated), 'MMM dd, yyyy')} (Estimated)
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {interview.jobId?.location || 'Location TBD'}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      <Button size="sm" variant="outline">Contact HR</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming interviews</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Jobs</CardTitle>
          <CardDescription>Jobs matching your profile and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job: any) => (
                <div key={job._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.companyId?.name}</p>
                    </div>
                    <Badge variant="outline">{job.type?.replace('_', ' ')}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Posted {formatDistanceToNow(new Date(job.postedAt))} ago
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">Apply Now</Button>
                    <Button size="sm" variant="outline">Save</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No job recommendations available</p>
              <Button 
                className="mt-2" 
                size="sm"
                onClick={() => navigate('/candidate-jobs')}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse All Jobs
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-6 w-6 mb-2" />
              Upload Resume
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/candidate-jobs')}
            >
              <Briefcase className="h-6 w-6 mb-2" />
              Browse Jobs
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <User className="h-6 w-6 mb-2" />
              Update Profile
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/candidate-applications')}
            >
              <Star className="h-6 w-6 mb-2" />
              View Applications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({ 
  title, 
  value, 
  icon, 
  description 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ReactNode; 
  description: string;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </div>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ProfileItem({ 
  title, 
  completed, 
  description, 
  icon 
}: { 
  title: string; 
  completed: boolean; 
  description: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <div className={`p-2 rounded-md ${completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {completed ? <CheckCircle className="h-4 w-4" /> : icon}
      </div>
      <div>
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
