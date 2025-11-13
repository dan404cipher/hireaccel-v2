import { useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle,
  Upload,
  User,
  Briefcase,
  Star,
  ArrowUpRight
} from "lucide-react";
import { useMyCandidateAssignments, useCandidateProfile, useInterviews } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DashboardBanner } from "@/components/dashboard/Banner";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";

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
  const assignments = Array.isArray(assignmentsData) 
    ? assignmentsData 
    : ((assignmentsData as any)?.data || []);
  const recentAssignments = assignments.slice(0, 10);
  

  // Calculate assignment stats
  const assignmentStats = useMemo(() => {
    const total = assignments.length;

    const hiredCount = assignments.filter(
      (app: any) => app.candidateStatus === 'hired'
    ).length;

    const rejectedCount = assignments.filter(
      (app: any) => app.candidateStatus === 'rejected'
    ).length;

    const activeCount = assignments.filter((app: any) => {
      const activeStatuses = [
        'new',
        'reviewed',
        'shortlisted',
        'interview_scheduled',
        'interviewed',
        'offer_sent',
      ];
      return (
        activeStatuses.includes(app.candidateStatus) &&
        app.status !== 'withdrawn'
      );
    }).length;

    const interviewsTodayCount = assignments.filter((app: any) => {
      if (!Array.isArray(app.interviews)) return false;
      return app.interviews.some((interview: any) => {
        if (!interview?.scheduledAt) return false;
        const interviewDate = new Date(interview.scheduledAt);
        const today = new Date();
        return (
          interviewDate.getFullYear() === today.getFullYear() &&
          interviewDate.getMonth() === today.getMonth() &&
          interviewDate.getDate() === today.getDate()
        );
      });
    }).length;

    return { total, activeCount, hiredCount, rejectedCount, interviewsTodayCount };
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

  if (assignmentsLoading) {
    return (
      <div className="space-y-6">
        {/* Banner Skeleton */}
        <div className="h-32 bg-gray-300 rounded-lg animate-pulse"></div>

        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-80 animate-pulse"></div>
          </div>
        </div>

        {/* Profile Completion Card Skeleton */}
        <div className="bg-white rounded-lg border p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-40"></div>
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            </div>
            <div className="h-10 w-32 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-2 bg-gray-300 rounded w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications Skeleton */}
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 w-40 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Interviews Skeleton */}
          <div className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
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
      {/* Banner */}
      <DashboardBanner category="candidate" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.firstName || 'Candidate'}!</h1>
          <p className="text-muted-foreground">Track your applications and manage your job search</p>
        </div>
      </div>

      {/* Profile Completion */}
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => navigate(`/dashboard/candidate-profile/${user?.customId}`)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>Complete your profile to attract more recruiters</CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/dashboard/candidate-profile/${user?.customId}`);
              }}
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
                completed={!!profileData?.resumeFileId}
                description={profileData?.resumeFileId ? "CV uploaded" : "Upload CV"}
                icon={<FileText className="h-4 w-4" />}
              />
              <ProfileItem
                title="Skills"
                completed={(profileData?.profile?.skills?.length || 0) > 0}
                description={
                  (profileData?.profile?.skills?.length || 0) > 0
                    ? `${profileData.profile.skills.length} skill${profileData.profile.skills.length !== 1 ? 's' : ''} added`
                    : "Add skills"
                }
                icon={<Star className="h-4 w-4" />}
              />
              <ProfileItem
                title="Portfolio"
                completed={!!profileData?.profile?.portfolioUrl}
                description={profileData?.profile?.portfolioUrl ? "Portfolio added" : "Add portfolio"}
                icon={<Briefcase className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Assignments"
          value={assignmentStats.total}
          description="Total assigned"
          icon={<FileText className="h-5 w-5" />}
          color="blue"
          onClick={() => navigate('/dashboard/candidate-applications')}
        />
        <MetricCard
          title="Active Assignments"
          value={assignmentStats.activeCount}
          description="In progress"
          icon={<Clock className="h-5 w-5" />}
          color="emerald"
          onClick={() => navigate('/dashboard/candidate-applications?status=in_progress')}
        />
        <MetricCard
          title="Hired"
          value={assignmentStats.hiredCount}
          description="Successfully hired"
          icon={<CheckCircle className="h-5 w-5" />}
          color="purple"
          onClick={() => navigate('/dashboard/candidate-applications?status=hired')}
        />
        <MetricCard
          title="Interviews Today"
          value={assignmentStats.interviewsTodayCount}
          description="Scheduled for today"
          icon={<Calendar className="h-5 w-5" />}
          color="amber"
          onClick={() => navigate('/dashboard/candidate-interviews')}
        />
      </div>

      {/* Assignments Timeline & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/dashboard/candidate-applications')}
        >
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
              <ScrollArea className="max-h-[420px] pr-2">
                <div className="space-y-4">
                {recentAssignments.map((assignment: any) => {
                  const companyName = assignment.jobId?.companyId?.name || 'Unknown Company';
                  const companyLogoFileId = assignment.jobId?.companyId?.logoFileId;
                  const agentFirstName = assignment.assignedBy?.firstName || '';
                  const agentLastName = assignment.assignedBy?.lastName || '';
                  const agentInitials = getInitials(`${agentFirstName} ${agentLastName}`) || 'A';

                  return (
                  <div key={assignment._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3">
                        <CompanyAvatar logoFileId={companyLogoFileId} companyName={companyName} />
                        <div>
                          <h4 className="font-medium">{assignment.jobId?.title || 'Unknown Position'}</h4>
                          <p className="text-sm text-muted-foreground">{companyName}</p>
                        </div>
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
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Assigned {formatDistanceToNow(new Date(assignment.assignedAt))} ago
                        </span>
                        <span className="flex items-center gap-2">
                          <AgentAvatar
                            profilePhotoFileId={assignment.assignedBy?.profilePhotoFileId}
                            firstName={agentFirstName}
                            lastName={agentLastName}
                            initials={agentInitials}
                          />
                          <span className="text-sm text-foreground font-medium">
                            <span className="text-muted-foreground font-normal mr-1">Agent:</span>
                            {`${agentFirstName} ${agentLastName}`.trim() || 'Assigned Agent'}
                          </span>
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
                )})}
                </div>
              </ScrollArea>
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

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/dashboard/candidate-interviews')}
        >
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Prepare for your scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingInterviews.length > 0 ? (
              <ScrollArea className="max-h-[420px] pr-2">
                <div className="space-y-4">
                {upcomingInterviews.slice(0, 10).map((interview: any) => (
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
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate('/dashboard/candidate-interviews');
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </ScrollArea>
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
function MetricCard({ 
  title, 
  value, 
  description, 
  icon, 
  color,
  onClick
}: { 
  title: string; 
  value: number | string; 
  description: string; 
  icon: React.ReactNode; 
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  }[color];

  return (
    <Card
      className={`bg-gradient-to-br ${colorClasses} text-white shadow-lg hover:shadow-xl transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-white/80">{title}</div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            {icon}
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            <div className="text-xs text-white/80 mt-1">{description}</div>
          </div>
          <ArrowUpRight className="h-5 w-5 text-white/70" />
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyAvatar({ logoFileId, companyName }: { logoFileId?: string | { _id?: string; toString?: () => string }; companyName: string }) {
  const fileId = logoFileId 
    ? (typeof logoFileId === 'object' && logoFileId !== null && '_id' in logoFileId
        ? (logoFileId._id?.toString() || logoFileId.toString?.())
        : typeof logoFileId === 'string'
        ? logoFileId
        : null)
    : null;

  const logoUrl = fileId 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/company-logo/${fileId}`
    : null;

  const authenticatedImageUrl = useAuthenticatedImage(logoUrl);

  const initials = useMemo(() => {
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [companyName]);

  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      {authenticatedImageUrl && (
        <AvatarImage 
          src={authenticatedImageUrl} 
          alt={companyName}
        />
      )}
      <AvatarFallback className="text-xs text-white font-semibold bg-purple-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}

function AgentAvatar({ profilePhotoFileId, firstName, lastName, initials }: { profilePhotoFileId?: string; firstName: string; lastName: string; initials: string }) {
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;

  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);

  return (
    <Avatar className="h-8 w-8 flex-shrink-0">
      {authenticatedImageUrl && (
        <AvatarImage 
          src={authenticatedImageUrl} 
          alt={`${firstName} ${lastName}`}
        />
      )}
      <AvatarFallback className="text-xs text-white font-semibold bg-emerald-600">
        {initials}
      </AvatarFallback>
    </Avatar>
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

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);
}
