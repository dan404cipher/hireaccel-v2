import { useState, useMemo, useEffect } from "react";
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
import { useMyCandidateAssignments, useCandidateProfile, useInterviews } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DashboardBanner } from "@/components/dashboard/Banner";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // API calls for real data
  const { data: profileData } = useCandidateProfile();
  const { data: assignmentsData, loading: assignmentsLoading } = useMyCandidateAssignments({
    page: 1,
    limit: 10,
    sortBy: 'assignedAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
  }, [profileData, assignmentsData]);

  // Calculate profile completion
  const calculateProfileCompletion = (profileData: any) => {
    if (!profileData?.profile) return 0;
    
    const profile = profileData.profile;
    
    const sections = {
      basicInfo: {
        fields: ['summary', 'location', 'phoneNumber'],
        weight: 0.2
      },
      skills: {
        fields: ['skills'],
        weight: 0.2
      },
      experience: {
        fields: ['experience'],
        weight: 0.25
      },
      education: {
        fields: ['education'],
        weight: 0.2
      },
      preferences: {
        fields: ['preferredSalaryRange', 'availability'],
        weight: 0.15
      }
    };

    let totalCompletion = 0;
    let sectionResults = {};
    
    for (const [key, section] of Object.entries(sections)) {
      const sectionFields = section.fields.map(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], profile);
        let isComplete = false;
        
        if (Array.isArray(value)) {
          isComplete = value.length > 0;
        } else if (field === 'preferredSalaryRange') {
          isComplete = value?.min && value?.max && value?.currency;
        } else if (field === 'availability') {
          isComplete = value?.startDate && value?.notice;
        } else {
          isComplete = !!value;
        }
        
        return isComplete;
      });

      const sectionComplete = sectionFields.every(Boolean);
      sectionResults[key] = { complete: sectionComplete, fields: sectionFields };
      
      if (sectionComplete) {
        totalCompletion += section.weight;
      }
    }
    
    return Math.round(totalCompletion * 100);
  };

  const profileCompletion = calculateProfileCompletion(profileData);

  // Process assignments data
  
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : [];
  const recentAssignments = assignments.slice(0, 5);
  

  // Calculate assignment stats
  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const activeCount = assignments.filter((app: any) => 
      app.status === 'active' || 
      app.status === 'in_progress' || 
      app.status === 'interviewing'
    ).length;
    const completedCount = assignments.filter((app: any) => 
      app.status === 'completed' || 
      app.status === 'hired'
    ).length;
    const rejectedCount = assignments.filter((app: any) => 
      app.status === 'rejected' || 
      app.status === 'withdrawn'
    ).length;
    const responseRate = total > 0 ? Math.round(((activeCount + completedCount) / total) * 100) : 0;
    
    return { total, activeCount, completedCount, rejectedCount, responseRate };
  }, [assignments]);

  // Get upcoming interviews
  // Create stable date parameter
  const dateFrom = useMemo(() => new Date().toISOString(), []);

  // Create stable API parameters
  const interviewsParams = useMemo(() => ({
    page: 1,
    limit: 3,
    status: 'scheduled',
    dateFrom,
  }), [dateFrom]);

  const { data: interviewsData } = useInterviews(interviewsParams);

  const upcomingInterviews = Array.isArray(interviewsData) ? interviewsData : ((interviewsData as any)?.data || []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "in_progress":
      case "interviewing":
        return "bg-blue-100 text-blue-800";
      case "screening":
      case "phone_interview":
      case "technical_interview":
      case "hr_interview":
      case "final_interview":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
      case "withdrawn":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <DashboardBanner category="candidate" />
      
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
            <Button 
              variant="outline"
              onClick={() => navigate(`/dashboard/candidate-profile/${user?.customId}`)}
            >
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
          title="Assignments"
          value={assignmentStats.total}
          icon={<FileText className="h-4 w-4" />}
          description="Total assigned"
        />
        <StatCard
          title="Active Assignments"
          value={assignmentStats.activeCount}
          icon={<Clock className="h-4 w-4" />}
          description="In progress"
        />
        <StatCard
          title="Completed"
          value={assignmentStats.completedCount}
          icon={<CheckCircle className="h-4 w-4" />}
          description="Successfully completed"
        />
        <StatCard
          title="Success Rate"
          value={`${assignmentStats.responseRate}%`}
          icon={<Star className="h-4 w-4" />}
          description="Completion rate"
        />
      </div>

      {/* Assignments Timeline & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Timeline</CardTitle>
            <CardDescription>Track your job assignments from agents</CardDescription>
          </CardHeader>
          <CardContent>
            {assignmentsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : recentAssignments.length > 0 ? (
              <div className="space-y-4">
                {recentAssignments.map((assignment: any) => (
                  <div key={assignment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{assignment.jobId?.title || 'Unknown Position'}</h4>
                        <p className="text-sm text-muted-foreground">{assignment.jobId?.companyId?.name || 'Unknown Company'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(assignment.status)}>
                          {formatStatus(assignment.status)}
                        </Badge>
                        {assignment.candidateStatus && (
                          <Badge className={getStatusColor(assignment.candidateStatus)}>
                            {formatStatus(assignment.candidateStatus)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Assigned {formatDistanceToNow(new Date(assignment.assignedAt))} ago
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {`Agent: ${assignment.assignedBy?.firstName} ${assignment.assignedBy?.lastName}`}
                        </span>
                      </div>
                    </div>
                    {assignment.feedback && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>HR Feedback:</strong> {assignment.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No job assignments yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  You haven't been assigned to any jobs by agents yet. When an agent matches you with a job, it will appear here.
                </p>
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
                        <h4 className="font-medium">{interview.applicationId?.jobId?.title || 'Interview'}</h4>
                        <p className="text-sm text-muted-foreground">{interview.applicationId?.jobId?.companyId?.name || 'Company'}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge className={getStatusColor(interview.status)}>
                          {formatStatus(interview.status)}
                        </Badge>
                        <div className="text-xs text-muted-foreground capitalize">
                          {interview.round} Round
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(interview.scheduledAt), 'MMM dd, yyyy')} at {format(new Date(interview.scheduledAt), 'h:mm a')}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {interview.location || interview.meetingLink || 'Location TBD'}
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate('/dashboard/candidate-interviews')}
                      >
                        View Details
                      </Button>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate(`/dashboard/candidate-profile/${user?.customId}`)}
            >
              <Upload className="h-6 w-6 mb-2" />
              Upload Resume
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate(`/dashboard/candidate-profile/${user?.customId}`)}
            >
              <User className="h-6 w-6 mb-2" />
              Update Profile
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => navigate('/dashboard/candidate-applications')}
            >
              <Star className="h-6 w-6 mb-2" />
              View Assignments
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
