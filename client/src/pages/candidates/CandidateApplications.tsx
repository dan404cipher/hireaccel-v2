import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Building2,
  FileText,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Briefcase,
  ExternalLink,
  User,
  Phone,
  MoreHorizontal
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyCandidateAssignments } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { DashboardBanner } from '@/components/dashboard/Banner';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';
import { getApiUrl } from '@/lib/utils';

interface CandidateAssignment {
  _id: string;
  candidateId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
      profilePhotoFileId?: string;
    };
    profile: {
      skills: string[];
      summary: string;
      location?: string;
      phoneNumber: string;
      experience?: Array<{
        position: string;
        company: string;
        current?: boolean;
        startDate?: string;
        endDate?: string;
      }>;
      preferredSalaryRange?: {
        min?: number;
        max?: number;
        currency: string;
      };
    };
    rating?: number;
    resumeFileId?: string;
  };
  jobId?: {
    _id?: string;
    id?: string;
    jobId?: string;
    title: string;
    companyId: {
      _id: string;
      companyId?: string;
      name: string;
      industry?: string;
      location?: string;
      logoUrl?: string;
      logoFileId?: string | { _id?: string; toString?: () => string };
    };
    location?: string;
    type?: string;
    salaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
    createdBy?: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
      profilePhotoFileId?: string;
    };
  };
  assignedBy: {
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
    profilePhotoFileId?: string;
    phoneNumber?: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
    profilePhotoFileId?: string;
  };
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  candidateStatus?: 'new' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offer_sent' | 'hired' | 'rejected';
  notes?: string;
  feedback?: string;
  assignedAt: string;
  lastActivityAt?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Component for Agent avatar with profile photo
const AgentAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  initials: string;
}> = ({ profilePhotoFileId, firstName, lastName, initials }) => {
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
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
};

// Component for HR avatar with profile photo
const HRAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  initials: string;
}> = ({ profilePhotoFileId, firstName, lastName, initials }) => {
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      {authenticatedImageUrl && (
        <AvatarImage 
          src={authenticatedImageUrl} 
          alt={`${firstName} ${lastName}`}
        />
      )}
      <AvatarFallback className="text-xs text-white font-semibold bg-blue-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

// Component for company avatar with logo
const CompanyAvatar: React.FC<{
  logoFileId?: string | { _id?: string; toString?: () => string };
  companyName: string;
}> = ({ logoFileId, companyName }) => {
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
};

const CandidateApplications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();
  const navigate = useNavigate();

  // API calls - fetch assignments for current candidate
  // Get the candidate's assignments
  const params = useMemo(() => ({
    page: currentPage,
    limit: 10,
    candidateId: user?.id, // Filter by the current user's ID
    sortBy: 'assignedAt',
    sortOrder: 'desc'
  }), [currentPage, user?.id]);

  const { data: assignmentsData, loading, refetch } = useMyCandidateAssignments(params);

  // Handle both possible response formats
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData as any)?.data || [];
  const meta = Array.isArray(assignmentsData) ? {} : (assignmentsData as any)?.meta || {};

  // Filter assignments based on search term
  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    
    return assignments.filter((assignment: CandidateAssignment) => {
      const jobTitle = assignment.jobId?.title?.toLowerCase() || '';
      const companyName = assignment.jobId?.companyId?.name?.toLowerCase() || '';
      const hrName = assignment.assignedTo 
        ? `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`.toLowerCase()
        : '';
      const agentName = `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`.toLowerCase();
      
      return jobTitle.includes(searchTerm.toLowerCase()) ||
        companyName.includes(searchTerm.toLowerCase()) ||
        hrName.includes(searchTerm.toLowerCase()) ||
        agentName.includes(searchTerm.toLowerCase());
    });
  }, [assignments, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCandidateStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-gray-600 text-white border-gray-600';
      case 'reviewed': return 'bg-blue-600 text-white border-blue-600';
      case 'shortlisted': return 'bg-purple-600 text-white border-purple-600';
      case 'interview_scheduled': return 'bg-orange-600 text-white border-orange-600';
      case 'interviewed': return 'bg-yellow-600 text-white border-yellow-600';
      case 'offer_sent': return 'bg-indigo-600 text-white border-indigo-600';
      case 'hired': return 'bg-green-600 text-white border-green-600';
      case 'rejected': return 'bg-red-600 text-white border-red-600';
      default: return 'bg-gray-600 text-white border-gray-600';
    }
  };

  const formatCandidateStatus = (status?: string) => {
    switch (status) {
      case 'new': return 'New';
      case 'reviewed': return 'Reviewed';
      case 'shortlisted': return 'Shortlisted';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'interviewed': return 'Interviewed';
      case 'offer_sent': return 'Offer Sent';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      default: return 'New';
    }
  };

  const formatCustomId = (customId: string | undefined): string => {
    if (!customId) return '';
    const match = customId.match(/^([A-Z]+)(0*)(\d+)$/);
    if (match) {
      const [, prefix, zeros, number] = match;
      return `${prefix}${parseInt(number, 10)}`;
    }
    return customId;
  };

  const formatSalary = (salaryRange: any) => {
    if (!salaryRange || !salaryRange.min || !salaryRange.max) return 'Not disclosed';
    return `${salaryRange.currency} ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}`;
  };

  const safeDateFormat = (dateString: string | null | undefined, defaultText: string = 'Unknown') => {
    if (!dateString) return defaultText;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return defaultText;
      return formatDistanceToNow(date);
    } catch {
      return defaultText;
    }
  };

  const safeFullDateFormat = (dateString: string | null | undefined, defaultText: string = 'Unknown') => {
    if (!dateString) return defaultText;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return defaultText;
      return format(date, 'MMM dd, yyyy');
    } catch {
      return defaultText;
    }
  };

  const getApplicationProgress = (stage: string) => {
    const stages = ['applied', 'screening', 'phone_interview', 'technical_interview', 'final_interview', 'offer_pending', 'offer_accepted'];
    const currentIndex = stages.indexOf(stage);
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 10;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4" />;
      case 'hired': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'withdrawn': return <AlertTriangle className="w-4 h-4" />;
      case 'on_hold': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const renderAssignmentCard = (assignment: CandidateAssignment) => {
    if (!assignment || !assignment.jobId) {
      console.warn('Invalid assignment data:', assignment);
      return null;
    }

    const agentInitials = `${assignment.assignedBy?.firstName?.charAt(0) || ''}${assignment.assignedBy?.lastName?.charAt(0) || ''}`;
    const hrInitials = assignment.assignedTo 
      ? `${assignment.assignedTo.firstName?.charAt(0) || ''}${assignment.assignedTo.lastName?.charAt(0) || ''}`
      : '';
    const agentDisplayId = assignment.assignedBy?.customId ? formatCustomId(assignment.assignedBy.customId) : undefined;
    const hrDisplayId = assignment.assignedTo?.customId ? formatCustomId(assignment.assignedTo.customId) : undefined;
    const jobIdentifier = assignment.jobId?.jobId || assignment.jobId?.id || assignment.jobId?._id;

    return (
      <Card key={assignment._id} className="hover:shadow-md transition-shadow relative">
        <CardContent className="p-4 pb-2">
          {/* 3-dots menu in top right corner */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedAssignment(assignment);
                  setIsViewDialogOpen(true);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </DropdownMenuItem>
                {assignment.jobId?._id || assignment.jobId?.id ? (
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/jobs/${assignment.jobId._id || assignment.jobId.id}`)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Job Details
                  </DropdownMenuItem>
                ) : null}
                {assignment.assignedBy?.customId && (
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/agent-profile/${assignment.assignedBy.customId}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View Agent Profile
                  </DropdownMenuItem>
                )}
                {assignment.assignedTo?.customId && (
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/hr-profile/${assignment.assignedTo.customId}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View HR Profile
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
              </div>
              
          {/* Row 1: Job, Agent, HR (if any), Candidate Status */}
          <div className={`grid gap-4 mb-3 ${assignment.assignedTo ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {/* Column 1: Job & Company Info */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                {assignment.jobId?.companyId ? (
                  <>
                    <CompanyAvatar
                      logoFileId={assignment.jobId.companyId.logoFileId}
                      companyName={assignment.jobId.companyId.name || 'Unknown Company'}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-base font-medium text-gray-900 truncate ${assignment.jobId?._id || assignment.jobId?.id ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                        onClick={() => {
                          const jobIdRef = assignment.jobId?._id || assignment.jobId?.id;
                          if (jobIdRef) {
                            navigate(`/dashboard/jobs/${jobIdRef}`);
                          }
                        }}
                      >
                        {assignment.jobId.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5 truncate">
                        <span
                          className={`${assignment.jobId?.companyId?._id ? 'font-medium cursor-pointer hover:text-blue-600 transition-colors' : 'font-medium'}`}
                          onClick={() => {
                            const companyIdRef = assignment.jobId?.companyId?._id;
                            if (companyIdRef) {
                              navigate(`/dashboard/companies/${companyIdRef}`);
                            }
                          }}
                        >
                          {assignment.jobId?.companyId?.name || 'Unknown Company'}
                        </span>
                        {assignment.jobId.location && (
                          <span className="text-gray-400 ml-2">• {assignment.jobId.location}</span>
                        )}
                      </div>
                      {jobIdentifier && (
                        <div className="text-xs font-mono text-blue-600 mt-1 truncate">
                          {jobIdentifier}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-base font-medium text-gray-900 truncate ${assignment.jobId?._id || assignment.jobId?.id ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                      onClick={() => {
                        const jobIdRef = assignment.jobId?._id || assignment.jobId?.id;
                        if (jobIdRef) {
                          navigate(`/dashboard/jobs/${jobIdRef}`);
                        }
                      }}
                    >
                      {assignment.jobId.title}
                    </div>
                    {jobIdentifier && (
                      <div className="text-xs font-mono text-blue-600 mt-1 truncate">
                        {jobIdentifier}
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>

            {/* Column 2: Agent Profile */}
            <div className="flex items-start space-x-3">
              <AgentAvatar
                profilePhotoFileId={assignment.assignedBy?.profilePhotoFileId}
                firstName={assignment.assignedBy?.firstName || ''}
                lastName={assignment.assignedBy?.lastName || ''}
                initials={agentInitials}
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-gray-900 truncate">
                  {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName}
                  {agentDisplayId && (
                    <span className="text-xs font-mono text-emerald-600 ml-2">{agentDisplayId}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate mt-0.5">
                  {assignment.assignedBy?.email}
              </div>
                {assignment.assignedBy?.phoneNumber && (
                  <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{assignment.assignedBy.phoneNumber}</span>
                </div>
              )}
              </div>
            </div>

            {/* Column 3: HR Profile (if exists) */}
            {assignment.assignedTo && (
              <div className="flex items-start space-x-3">
                <HRAvatar
                  profilePhotoFileId={assignment.assignedTo.profilePhotoFileId}
                  firstName={assignment.assignedTo.firstName}
                  lastName={assignment.assignedTo.lastName}
                  initials={hrInitials}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-gray-900 truncate">
                    {assignment.assignedTo.firstName} {assignment.assignedTo.lastName}
                    {hrDisplayId && (
                      <span className="text-xs font-mono text-blue-600 ml-2">{hrDisplayId}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Column 3: Candidate Status & Assigned Date */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Status & Assigned</div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`capitalize ${getCandidateStatusColor(assignment.candidateStatus)}`}>
                  {formatCandidateStatus(assignment.candidateStatus)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{safeDateFormat(assignment.assignedAt, 'Unknown')} ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Agent Notes */}
          {assignment.notes && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Agent's Notes
              </div>
              <div className="text-base text-gray-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                {assignment.notes}
              </div>
            </div>
          )}

          {/* Row 4: HR Feedback */}
          {assignment.feedback && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                HR's Feedback
              </div>
              <div className="text-base text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                {assignment.feedback}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <DashboardBanner category="candidate" />
      
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Job Assignments</h1>
          <p className="text-gray-600 mt-1">
            Track jobs that agents have assigned you to
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['active', 'completed', 'rejected', 'withdrawn'].map((status) => {
          const count = assignments.filter((assignment: CandidateAssignment) => 
            assignment.status === status
          ).length;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`}></div>
                  <div>
                    <p className="text-sm font-medium capitalize">{status.replace('_', ' ')}</p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading assignments...' : `${filteredAssignments.length} assignments found`}
        </p>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">No job assignments yet</h3>
              <p className="text-gray-600">
                You haven't been assigned to any jobs by agents yet. When an agent matches you with a job, it will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAssignments.map(renderAssignmentCard).filter(Boolean)}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Assignment Details Dialog */}
      {selectedAssignment && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedAssignment.jobId?.title || 'Unknown Job'}
              </DialogTitle>
              <DialogDescription>
                Complete details of your job assignment
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Job & Company Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Job & Company Information</h4>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3 mb-4">
                    {selectedAssignment.jobId?.companyId && (
                      <CompanyAvatar
                        logoFileId={selectedAssignment.jobId.companyId.logoFileId}
                        companyName={selectedAssignment.jobId.companyId.name || 'Unknown Company'}
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAssignment.jobId?.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedAssignment.jobId?.companyId?.name}
                        {selectedAssignment.jobId?.companyId?.industry && (
                          <span className="ml-2 text-gray-500">• {selectedAssignment.jobId.companyId.industry}</span>
                        )}
                      </div>
                      {selectedAssignment.jobId?.location && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                          {selectedAssignment.jobId.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedAssignment.jobId?.salaryRange && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <span className="font-medium text-gray-700">Salary Range: </span>
                      <span className="text-gray-600">{formatSalary(selectedAssignment.jobId.salaryRange)}</span>
              </div>
                  )}
              </div>
            </div>
            
              {/* Agent Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Agent Who Assigned You</h4>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-start space-x-3">
                    <AgentAvatar
                      profilePhotoFileId={selectedAssignment.assignedBy?.profilePhotoFileId}
                      firstName={selectedAssignment.assignedBy?.firstName || ''}
                      lastName={selectedAssignment.assignedBy?.lastName || ''}
                      initials={`${selectedAssignment.assignedBy?.firstName?.charAt(0) || ''}${selectedAssignment.assignedBy?.lastName?.charAt(0) || ''}`}
                    />
                    <div className="flex-1">
                      <div 
                        className="text-base font-semibold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                        onClick={() => {
                          if (selectedAssignment.assignedBy?.customId) {
                            navigate(`/dashboard/agent-profile/${selectedAssignment.assignedBy.customId}`);
                            setIsViewDialogOpen(false);
                          }
                        }}
                      >
                        {selectedAssignment.assignedBy?.firstName} {selectedAssignment.assignedBy?.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedAssignment.assignedBy?.email}
                      </div>
                      <div className="text-sm text-emerald-600 font-mono mt-1">
                        {formatCustomId(selectedAssignment.assignedBy?.customId)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HR Information (if exists) */}
              {selectedAssignment.assignedTo && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">HR Contact</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <HRAvatar
                        profilePhotoFileId={selectedAssignment.assignedTo.profilePhotoFileId}
                        firstName={selectedAssignment.assignedTo.firstName}
                        lastName={selectedAssignment.assignedTo.lastName}
                        initials={`${selectedAssignment.assignedTo.firstName?.charAt(0) || ''}${selectedAssignment.assignedTo.lastName?.charAt(0) || ''}`}
                      />
                      <div className="flex-1">
                        <div 
                          className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            if (selectedAssignment.assignedTo?.customId) {
                              navigate(`/dashboard/hr-profile/${selectedAssignment.assignedTo.customId}`);
                              setIsViewDialogOpen(false);
                            }
                          }}
                        >
                          {selectedAssignment.assignedTo.firstName} {selectedAssignment.assignedTo.lastName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedAssignment.assignedTo.email}
                        </div>
                        <div className="text-sm text-blue-600 font-mono mt-1">
                          {formatCustomId(selectedAssignment.assignedTo.customId)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Status */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Your Application Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Current Status:</span>
                    <div className="mt-2">
                      <Badge className={getCandidateStatusColor(selectedAssignment.candidateStatus)}>
                        {formatCandidateStatus(selectedAssignment.candidateStatus)}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Assignment Status:</span>
                    <div className="mt-2">
                      <Badge className={getStatusColor(selectedAssignment.status)}>
                        {selectedAssignment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Assigned Date:</span>
                    <div className="mt-1 text-gray-600">{safeFullDateFormat(selectedAssignment.assignedAt)}</div>
                  </div>
                  {selectedAssignment.lastActivityAt && (
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <div className="mt-1 text-gray-600">{safeFullDateFormat(selectedAssignment.lastActivityAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Notes */}
              {selectedAssignment.notes && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Agent's Notes
                  </h4>
                  <p className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    {selectedAssignment.notes}
                  </p>
                </div>
              )}

              {/* HR Feedback */}
              {selectedAssignment.feedback && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    HR's Feedback
                  </h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedAssignment.jobId?._id || selectedAssignment.jobId?.id ? (
                  <Button 
                    variant="default"
                    onClick={() => {
                      navigate(`/dashboard/jobs/${selectedAssignment.jobId._id || selectedAssignment.jobId.id}`);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Job Details
                  </Button>
                ) : null}
                {selectedAssignment.assignedBy?.customId && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigate(`/dashboard/agent-profile/${selectedAssignment.assignedBy.customId}`);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Contact Agent
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CandidateApplications;
