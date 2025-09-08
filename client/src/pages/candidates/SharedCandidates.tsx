// TODO: Completed tasks:
// 1. Add shared candidates route access for admin and agent roles
// 2. Update sidebar navigation to show shared candidates for admin and agent roles
// 3. Modify SharedCandidates component to use agent-specific API for agents
// 4. Update UI to handle agent-specific view
// 5. Test the changes
// 6. Fix data structure handling for agent view
// 7. Fix assigned by and job information for agent view
// 8. Fix data structure handling for agent view to handle both profile and direct properties
// 9. Fix data structure handling to use correct nested paths for agent view
// 10. Update API call to only fetch candidates assigned by the agent
// 11. Fix data structure handling to properly handle null/undefined values
// 12. Fix job position display in agent view
// 13. Add update and delete functionalities for agent view
// 14. Add delete confirmation dialog for agent assignments
// 15. Add update assignment functionality for agent view
// 16. Add notes section to candidate cards
// 17. Remove redundant status update options from HR dropdown
// 18. Add feedback functionality for HR users
// 19. Remove duplicate view details and view resume options for HR
// 20. Remove mark as complete and reject buttons from view details for HR

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Briefcase,
  ExternalLink,
  MapPin,
  Phone,
  Star,
  MoreHorizontal,
  Building2
} from 'lucide-react';
import { useMyCandidateAssignments, useUpdateCandidateAssignment, useCandidateAssignmentStats, useCandidateAssignments } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import { DashboardBanner } from '@/components/dashboard/Banner';

interface CandidateAssignment {
  _id: string;
  candidateId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
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
  assignedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  jobId?: {
    title: string;
    companyId: {
      _id: string;
      name: string;
      industry?: string;
      location?: string;
    };
    location?: string;
  };
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  candidateStatus?: 'new' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offer_sent' | 'hired' | 'rejected';
  notes?: string;
  assignedAt: string;
  dueDate?: string;
  feedback?: string;
  isOverdue?: boolean;
  isDueSoon?: boolean;
  daysSinceAssigned?: number;
}

const SharedCandidates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<CandidateAssignment | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [assignmentToUpdate, setAssignmentToUpdate] = useState<CandidateAssignment | null>(null);
  const [updatePriority, setUpdatePriority] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [assignmentForFeedback, setAssignmentForFeedback] = useState<CandidateAssignment | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();
  
  // API calls
  const { data: assignmentsData, loading, refetch } = user?.role === 'agent' 
    ? useCandidateAssignments({
        page: currentPage,
        limit: 20,
        assignedBy: user?.id,
        sortBy: 'assignedAt',
        sortOrder: 'desc'
      })
    : user?.role === 'admin'
    ? useCandidateAssignments({
        page: currentPage,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        sortBy: 'assignedAt',
        sortOrder: 'desc'
      })
    : useCandidateAssignments({
        page: currentPage,
        limit: 20,
        assignedTo: user?.id,
        status: statusFilter === 'all' ? undefined : statusFilter,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        sortBy: 'assignedAt',
        sortOrder: 'desc'
      });

  const { data: statsData } = useCandidateAssignmentStats();
  const updateAssignment = useUpdateCandidateAssignment();

  // Handle both possible response formats
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData as any)?.data || [];
  const meta = Array.isArray(assignmentsData) ? {} : (assignmentsData as any)?.meta || {};
  const stats = (statsData as any)?.data || {};

  // Debug logging
  console.log('📊 SharedCandidates Debug:', {
    loading,
    assignmentsData,
    assignmentsDataType: typeof assignmentsData,
    assignmentsDataKeys: assignmentsData ? Object.keys(assignmentsData) : null,
    assignments,
    meta,
    statusFilter,
    priorityFilter
  });

  // Filter assignments based on search term and filters
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((assignment: CandidateAssignment) => {
        const firstName = assignment.candidateId.userId.firstName || '';
        const lastName = assignment.candidateId.userId.lastName || '';
        const email = assignment.candidateId.userId.email || '';
        const jobTitle = assignment.jobId?.title || '';
        const companyName = assignment.jobId?.companyId?.name || '';
        const notes = assignment.notes || '';
        
        return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
               companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               notes.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Apply company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter((assignment: CandidateAssignment) => 
        assignment.jobId?.companyId?.name === companyFilter
      );
    }
    
    return filtered;
  }, [assignments, searchTerm, companyFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatExperience = (experienceArray: any[]) => {
    if (!experienceArray || experienceArray.length === 0) {
      return 'No experience';
    }
    
    const totalYears = experienceArray.length;
    
    if (totalYears <= 2) {
      return '0-2 years';
    } else if (totalYears <= 5) {
      return '2-5 years';
    } else if (totalYears <= 10) {
      return '5-10 years';
    } else {
      return '10+ years';
    }
  };

  const handleStatusUpdate = async (assignment: CandidateAssignment, newStatus: string) => {
    try {
      await updateAssignment.mutate({
        id: assignment._id,
        data: {
          status: newStatus,
          feedback: feedbackText || undefined
        }
      });
      refetch();
      setSelectedAssignment(null);
      setFeedbackText('');
      toast({
        title: "Success",
        description: `Status updated to ${newStatus}`
      });
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAssignment = async () => {
    if (!assignmentToUpdate) return;

    try {
      await updateAssignment.mutate({
        id: assignmentToUpdate._id,
        data: {
          priority: updatePriority,
          notes: updateNotes
        }
      });
      refetch();
      setUpdateDialogOpen(false);
      setAssignmentToUpdate(null);
      setUpdatePriority('');
      setUpdateNotes('');
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      });
    } catch (error: any) {
      console.error('Failed to update assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };

  const handleFeedbackUpdate = async () => {
    if (!assignmentForFeedback) return;

    try {
      await updateAssignment.mutate({
        id: assignmentForFeedback._id,
        data: {
          feedback: feedbackText
        }
      });
      refetch();
      setFeedbackDialogOpen(false);
      setAssignmentForFeedback(null);
      setFeedbackText('');
      toast({
        title: "Success",
        description: "Feedback updated successfully"
      });
    } catch (error: any) {
      console.error('Failed to update feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback",
        variant: "destructive"
      });
    }
  };

  const handleCandidateStatusUpdate = async (assignment: CandidateAssignment, newCandidateStatus: string) => {
    try {
      await updateAssignment.mutate({
        id: assignment._id,
        data: {
          candidateStatus: newCandidateStatus
        }
      });
      refetch();
      toast({
        title: "Success",
        description: `Candidate status updated to ${formatCandidateStatus(newCandidateStatus)}`
      });
    } catch (error: any) {
      console.error('Failed to update candidate status:', error);
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive"
      });
    }
  };

  const renderAssignmentCard = (assignment: any) => {
    // Handle both agent candidates and candidate assignments data structures
    const isAgentView = user?.role === 'agent';
    
    let candidate, firstName, lastName, email;
    if (isAgentView) {
      // Agent view structure
      candidate = assignment.candidateId;
      firstName = candidate?.userId?.firstName || '';
      lastName = candidate?.userId?.lastName || '';
      email = candidate?.userId?.email || 'No email provided';
    } else {
      // HR view structure
      candidate = assignment.candidateId;
      firstName = candidate.userId.firstName || '';
      lastName = candidate.userId.lastName || '';
      email = candidate.userId.email || 'No email provided';
    }
    
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : 
                     firstName ? firstName : 
                     lastName ? lastName : 'Unnamed Candidate';
    const initials = firstName && lastName ? 
                    `${firstName.charAt(0)}${lastName.charAt(0)}` : 
                    firstName ? firstName.charAt(0) : 
                    lastName ? lastName.charAt(0) : 'UC';
    
    return (
      <Card key={assignment._id} className="hover:shadow-md transition-shadow relative">
        <CardContent className="p-4">
          {/* 3-dots menu in top right corner */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAgentView ? (
                  <>
                    <DropdownMenuItem onClick={() => setSelectedAssignment(assignment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {candidate?.resumeFileId && (
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/candidates/${candidate._id}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => {
                        setAssignmentToUpdate(assignment);
                        setUpdatePriority(assignment.priority || 'medium');
                        setUpdateNotes(assignment.notes || '');
                        setUpdateDialogOpen(true);
                      }}
                      disabled={updateAssignment.loading}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Update Assignment
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/candidates/${candidate._id}`)}>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    {candidate?.resumeFileId && (
                      <DropdownMenuItem onClick={async () => {
                        try {
                          const response = await fetch(getApiUrl(`/api/v1/files/resume/${candidate.resumeFileId}`), {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            },
                          });
                          
                          if (!response.ok) {
                            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                          }

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${candidate.userId.firstName}_${candidate.userId.lastName}_resume.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          toast({
                            title: 'Success',
                            description: 'Resume downloaded successfully',
                          });
                        } catch (error) {
                          console.error('Download error:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to download resume',
                            variant: 'destructive',
                          });
                        }
                      }}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Download Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => {
                      setAssignmentForFeedback(assignment);
                      setFeedbackText(assignment.feedback || '');
                      setFeedbackDialogOpen(true);
                    }}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Feedback
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Row 1: Candidate Info, Job, Candidate Status */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            {/* Column 1: Candidate Info */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarFallback className="text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{fullName}</div>
                <div className="text-sm text-gray-500 truncate">{email}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                  {isAgentView ? (
                    <>
                      {candidate?.profile?.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span className="truncate">{candidate.profile.phoneNumber}</span>
                        </div>
                      )}
                      {candidate?.profile?.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span className="truncate">{candidate.profile.location}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate text-gray-400">Location not specified</span>
                        </div>
                      )}
                      {candidate?.profile?.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{candidate.profile.rating}/5</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {candidate.profile.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-blue-600" />
                          <span className="truncate">{candidate.profile.phoneNumber}</span>
                        </div>
                      )}
                      {candidate.profile.location ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span className="truncate">{candidate.profile.location}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate text-gray-400">Location not specified</span>
                        </div>
                      )}
                      {candidate.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{candidate.rating}/5</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Job */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Job Position</div>
              {isAgentView ? (
                <>
                  <div className="text-sm font-medium text-gray-900">
                    {assignment.jobId ? assignment.jobId.title : 'General'}
                  </div>
                  {assignment.jobId?.companyId && (
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-3 h-3 text-purple-600" />
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{assignment.jobId.companyId.name}</span>
                        {assignment.jobId.companyId.industry && (
                          <span className="text-gray-400 ml-2">• {assignment.jobId.companyId.industry}</span>
                        )}
                        {assignment.jobId.location && (
                          <span className="text-gray-400 ml-2">• {assignment.jobId.location}</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-900">
                    {assignment.jobId ? assignment.jobId.title : 'General'}
                  </div>
                  {assignment.jobId?.companyId && (
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className="w-3 h-3 text-purple-600" />
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{assignment.jobId.companyId.name}</span>
                        {assignment.jobId.companyId.industry && (
                          <span className="text-gray-400 ml-2">• {assignment.jobId.companyId.industry}</span>
                        )}
                        {assignment.jobId.location && (
                          <span className="text-gray-400 ml-2">• {assignment.jobId.location}</span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Column 3: Candidate Status */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Candidate Status</div>
              {isAgentView ? (
                <Badge variant="outline" className={`capitalize ${getCandidateStatusColor(assignment.candidateStatus)}`}>
                  {assignment.candidateStatus || 'new'}
                </Badge>
              ) : (
                <Select
                  value={assignment.candidateStatus || 'new'}
                  onValueChange={(value) => handleCandidateStatusUpdate(assignment, value)}
                >
                  <SelectTrigger className={`w-32 h-8 text-xs ${getCandidateStatusColor(assignment.candidateStatus || 'new')}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" className="text-gray-700 hover:bg-gray-100 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-800">
                      New
                    </SelectItem>
                    <SelectItem value="reviewed" className="text-blue-700 hover:bg-blue-50 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-800">
                      Reviewed
                    </SelectItem>
                    <SelectItem value="shortlisted" className="text-purple-700 hover:bg-purple-50 data-[state=checked]:bg-purple-100 data-[state=checked]:text-purple-800">
                      Shortlisted
                    </SelectItem>
                    <SelectItem value="interview_scheduled" className="text-orange-700 hover:bg-orange-50 data-[state=checked]:bg-orange-100 data-[state=checked]:text-orange-800">
                      Interview Scheduled
                    </SelectItem>
                    <SelectItem value="interviewed" className="text-yellow-700 hover:bg-yellow-50 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-800">
                      Interviewed
                    </SelectItem>
                    <SelectItem value="offer_sent" className="text-indigo-700 hover:bg-indigo-50 data-[state=checked]:bg-indigo-100 data-[state=checked]:text-indigo-800">
                      Offer Sent
                    </SelectItem>
                    <SelectItem value="hired" className="text-green-700 hover:bg-green-50 data-[state=checked]:bg-green-100 data-[state=checked]:text-green-800">
                      Hired
                    </SelectItem>
                    <SelectItem value="rejected" className="text-red-700 hover:bg-red-50 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-800">
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Row 2: Assigned By, Experience, Resume */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Column 1: Assigned By/HR */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-blue-600" />
                {isAgentView ? "Assigned HR" : "Assigned by"}
              </div>
              <div className="text-sm text-gray-900">
                {isAgentView ? (
                  assignment.assignedTo ? (
                    `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`
                  ) : (
                    "Not assigned"
                  )
                ) : (
                  `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`
                )}
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-400" />
                {isAgentView ? (
                  assignment.assignedAt ? formatDistanceToNow(new Date(assignment.assignedAt)) + " ago" : "Not assigned"
                ) : (
                  formatDistanceToNow(new Date(assignment.assignedAt)) + " ago"
                )}
              </div>
            </div>

            {/* Column 2: Experience */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-emerald-600" />
                Experience
              </div>
              {isAgentView ? (
                <div className="text-sm font-medium text-gray-900">
                  {formatExperience(candidate?.profile?.experience || [])}
                </div>
              ) : (
                <div className="text-sm font-medium text-gray-900">
                  {formatExperience(candidate.profile.experience || [])}
                </div>
              )}
            </div>

            {/* Column 3: Resume */}
            <div>
              {isAgentView ? (
                candidate?.resumeFileId ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    onClick={() => navigate(`/dashboard/candidate-profile/${candidate.customId}`)}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Resume
                  </Button>
                ) : (
                  <span className="text-xs text-gray-500">No resume</span>
                )
              ) : (
                candidate.resumeFileId ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    onClick={async () => {
                      try {
                        const response = await fetch(getApiUrl(`/api/v1/files/resume/${candidate.resumeFileId}`), {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                          },
                        });
                        
                        if (!response.ok) {
                          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${candidate.userId.firstName}_${candidate.userId.lastName}_resume.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        toast({
                          title: 'Success',
                          description: 'Resume downloaded successfully',
                        });
                      } catch (error) {
                        console.error('Download error:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to download resume',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Download Resume
                  </Button>
                ) : (
                  <span className="text-xs text-gray-500">No resume</span>
                )
              )}
            </div>
          </div>

          {/* Row 3: Notes */}
          {assignment.notes && (
            <div className="mt-4 border-t pt-4">
              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-amber-600" />
                {isAgentView ? "My Notes" : "Agent Notes"}
              </div>
              <div className="text-sm text-gray-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                {assignment.notes}
              </div>
            </div>
          )}

          {/* Row 4: Feedback */}
          {assignment.feedback && (
            <div className="mt-4 border-t pt-4">
              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-blue-600" />
                {isAgentView ? "HR's Feedback" : "My Feedback"}
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
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
      <DashboardBanner category="hr" />




      {/* Stats Cards */}
      {user?.role !== 'agent' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.byStatus && stats.byStatus.map((stat: any, index: number) => {
            const gradients = [
              "from-blue-500 to-blue-600",
              "from-emerald-500 to-emerald-600", 
              "from-amber-500 to-amber-600",
              "from-purple-500 to-purple-600"
            ];
            const iconColors = [
              "text-blue-100",
              "text-emerald-100",
              "text-amber-100", 
              "text-purple-100"
            ];
            const gradient = gradients[index % gradients.length];
            const iconColor = iconColors[index % iconColors.length];
            
            return (
              <Card key={stat._id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`${iconColor} bg-white/20 p-2 rounded-lg backdrop-blur-sm`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90 capitalize">{stat._id}</p>
                      <p className="text-2xl font-bold text-white">{stat.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {stats.overdue > 0 && (
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-90"></div>
              <CardContent className="relative p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-red-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">Overdue</p>
                    <p className="text-2xl font-bold text-white">{stats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-90"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-2">
                <div className="text-blue-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Total Assigned Candidates</p>
                  <p className="text-2xl font-bold text-white">{assignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-90"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-2">
                <div className="text-emerald-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Active HRs</p>
                  <p className="text-2xl font-bold text-white">
                    {Array.from(new Set(assignments.map((a: any) => a.assignedTo?.id))).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-90"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-2">
                <div className="text-purple-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Companies</p>
                  <p className="text-2xl font-bold text-white">
                    {Array.from(new Set(assignments.filter((a: any) => a.jobId?.companyId?.name).map((a: any) => a.jobId.companyId.name))).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Filters */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>
            </div>
            {user?.role !== 'agent' && (
              <>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40 border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                    <Filter className="w-4 h-4 mr-2 text-purple-600" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-40 border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                <Building2 className="w-4 h-4 mr-2 text-amber-600" />
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {Array.from(new Set(assignments
                  .filter((a: CandidateAssignment) => a.jobId?.companyId?.name)
                  .map((a: CandidateAssignment) => a.jobId!.companyId!.name)
                )).map((companyName: string) => (
                  <SelectItem key={companyName} value={companyName}>
                    {companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">No candidates assigned</h3>
              <p className="text-gray-600">
                You don't have any candidate assignments matching the current filters.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAssignments.map(renderAssignmentCard)}
        </div>
      )}

      {/* Pagination */}
      {meta && typeof meta.totalPages === 'number' && meta.totalPages > 1 && (
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

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription>
              Add or update feedback for this candidate assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback about this candidate..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setFeedbackDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFeedbackUpdate}
                disabled={updateAssignment.loading}
              >
                {updateAssignment.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Feedback'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Assignment Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assignment</DialogTitle>
            <DialogDescription>
              Update the priority and notes for this assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={updatePriority} onValueChange={setUpdatePriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this assignment..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAssignment}
                disabled={updateAssignment.loading}
              >
                {updateAssignment.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (assignmentToDelete) {
                  handleStatusUpdate(assignmentToDelete, 'withdrawn');
                  setDeleteConfirmOpen(false);
                  setAssignmentToDelete(null);
                }
              }}
              disabled={updateAssignment.loading}
            >
              {updateAssignment.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      {selectedAssignment && (
        <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {(() => {
                  const firstName = selectedAssignment.candidateId.userId.firstName || '';
                  const lastName = selectedAssignment.candidateId.userId.lastName || '';
                  return firstName && lastName ? `${firstName} ${lastName}` : 
                         firstName ? firstName : 
                         lastName ? lastName : 'Unnamed Candidate';
                })()}
              </DialogTitle>
              <DialogDescription>
                Candidate details and assignment information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {selectedAssignment.candidateId.userId.email || 'No email provided'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedAssignment.candidateId.profile.phoneNumber || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {selectedAssignment.candidateId.profile.location || 'Not specified'}
                  </div>
                  {selectedAssignment.candidateId.rating && (
                    <div>
                      <span className="font-medium">Rating:</span> {selectedAssignment.candidateId.rating}/5
                    </div>
                  )}
                </div>
              </div>

              {/* Salary Expectation */}
              {selectedAssignment.candidateId.profile.preferredSalaryRange && selectedAssignment.candidateId.profile.preferredSalaryRange.min && selectedAssignment.candidateId.profile.preferredSalaryRange.max && (
                <div>
                  <h4 className="font-semibold mb-2">Salary Expectation</h4>
                  <p className="text-sm">
                    {selectedAssignment.candidateId.profile.preferredSalaryRange.currency} {selectedAssignment.candidateId.profile.preferredSalaryRange.min?.toLocaleString()} - {selectedAssignment.candidateId.profile.preferredSalaryRange.max?.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Full Skills List */}
              {selectedAssignment.candidateId.profile.skills && selectedAssignment.candidateId.profile.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAssignment.candidateId.profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Summary */}
              {selectedAssignment.candidateId.profile.summary && (
                <div>
                  <h4 className="font-semibold mb-2">Professional Summary</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedAssignment.candidateId.profile.summary}
                  </p>
                </div>
              )}

              {/* Assignment Information */}
              <div>
                <h4 className="font-semibold mb-2">Assignment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <Badge className={getPriorityColor(selectedAssignment.priority)}>
                      {selectedAssignment.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedAssignment.status)}>
                      {selectedAssignment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned by:</span>
                    <span>{selectedAssignment.assignedBy.firstName} {selectedAssignment.assignedBy.lastName}</span>
                  </div>
                  {selectedAssignment.jobId && (
                    <div className="flex justify-between">
                      <span>Job:</span>
                      <span>{selectedAssignment.jobId.title}</span>
                    </div>
                  )}
                  {selectedAssignment.jobId?.companyId && (
                    <div className="flex justify-between">
                      <span>Company:</span>
                      <span>
                        {selectedAssignment.jobId.companyId.name}
                        {selectedAssignment.jobId.companyId.industry && (
                          <span className="text-gray-500 ml-2">({selectedAssignment.jobId.companyId.industry})</span>
                        )}
                      </span>
                    </div>
                  )}
                  {selectedAssignment.dueDate && (
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span>{new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedAssignment.notes && (
                    <div>
                      <span className="font-medium">Agent Notes:</span>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {selectedAssignment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAssignment.feedback && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Feedback</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex space-x-2">
                {user?.role === 'agent' && selectedAssignment.status === 'active' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleStatusUpdate(selectedAssignment, 'completed')}
                      disabled={updateAssignment.loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedAssignment, 'rejected')}
                      disabled={updateAssignment.loading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SharedCandidates;
