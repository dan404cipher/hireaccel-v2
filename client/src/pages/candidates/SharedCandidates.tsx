import React, { useState, useMemo } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { useMyCandidateAssignments, useUpdateCandidateAssignment, useCandidateAssignmentStats } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';

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
    companyId: string;
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
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // API calls
  const { data: assignmentsData, loading, refetch } = useMyCandidateAssignments({
    page: currentPage,
    limit: 20,
    status: statusFilter === 'all' ? undefined : statusFilter,
    priority: priorityFilter === 'all' ? undefined : priorityFilter,
    sortBy: 'assignedAt',
    sortOrder: 'desc'
  });

  const { data: statsData } = useCandidateAssignmentStats();
  const updateAssignment = useUpdateCandidateAssignment({
    onSuccess: () => {
      refetch();
      setSelectedAssignment(null);
      setFeedbackText('');
    }
  });

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

  // Filter assignments based on search term
  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments;
    
    return assignments.filter((assignment: CandidateAssignment) => {
      const firstName = assignment.candidateId.userId.firstName || '';
      const lastName = assignment.candidateId.userId.lastName || '';
      const email = assignment.candidateId.userId.email || '';
      const jobTitle = assignment.jobId?.title || '';
      const notes = assignment.notes || '';
      
      return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
             notes.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [assignments, searchTerm]);

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
      case 'new': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shortlisted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'interview_scheduled': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'interviewed': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'offer_sent': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'hired': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleStatusUpdate = (assignment: CandidateAssignment, newStatus: string) => {
    updateAssignment.mutate({
      id: assignment._id,
      data: {
        status: newStatus,
        feedback: feedbackText || undefined
      }
    });
  };

  const handleCandidateStatusUpdate = (assignment: CandidateAssignment, newCandidateStatus: string) => {
    updateAssignment.mutate({
      id: assignment._id,
      data: {
        candidateStatus: newCandidateStatus
      }
    });
  };

  const renderAssignmentCard = (assignment: CandidateAssignment) => {
    const candidate = assignment.candidateId;
    const firstName = candidate.userId.firstName || '';
    const lastName = candidate.userId.lastName || '';
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : 
                     firstName ? firstName : 
                     lastName ? lastName : 'Unnamed Candidate';
    const email = candidate.userId.email || 'No email provided';
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
                <DropdownMenuItem onClick={() => setSelectedAssignment(assignment)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                {candidate.resumeFileId && (
                  <DropdownMenuItem>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Resume
                  </DropdownMenuItem>
                )}
                {assignment.status === 'active' && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(assignment, 'completed')}
                      disabled={updateAssignment.loading}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleStatusUpdate(assignment, 'rejected')}
                      disabled={updateAssignment.loading}
                      className="text-red-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
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
                  {candidate.profile.phoneNumber && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{candidate.profile.phoneNumber}</span>
                    </div>
                  )}
                  {candidate.profile.location ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{candidate.profile.location}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate text-gray-400">Location not specified</span>
                    </div>
                  )}
                  {candidate.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{candidate.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: Job */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Position</div>
              <div className="text-sm font-medium text-gray-900">
                {assignment.jobId ? assignment.jobId.title : 'General'}
              </div>
            </div>

            {/* Column 3: Candidate Status */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Candidate Status</div>
              <Select
                value={assignment.candidateStatus || 'new'}
                onValueChange={(value) => handleCandidateStatusUpdate(assignment, value)}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="offer_sent">Offer Sent</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Assigned By, Experience, Resume */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Column 1: Assigned By */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Assigned by</div>
              <div className="text-sm text-gray-900">
                {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(assignment.assignedAt))} ago
              </div>
            </div>

            {/* Column 2: Experience */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Experience</div>
              {candidate.profile.experience && candidate.profile.experience.length > 0 ? (
                <div className="text-sm font-medium text-gray-900">
                  {candidate.profile.experience.length} {candidate.profile.experience.length === 1 ? 'year' : 'years'}
                </div>
              ) : (
                <span className="text-xs text-gray-500">No experience</span>
              )}
            </div>

            {/* Column 3: Resume */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">Resume</div>
              {candidate.resumeFileId ? (
                <Button variant="outline" size="sm" className="text-xs h-8">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View Resume
                </Button>
              ) : (
                <span className="text-xs text-gray-500">No resume</span>
              )}
            </div>
          </div>


        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shared Candidates</h1>
          <p className="text-gray-600 mt-1">
            Candidates assigned to you by agents for review
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.byStatus && stats.byStatus.map((stat: any) => (
          <Card key={stat._id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(stat._id).replace('border-', 'bg-').split(' ')[0]}`}></div>
                <div>
                  <p className="text-sm font-medium capitalize">{stat._id}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {stats.overdue > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
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

              {/* Feedback Section */}
              {selectedAssignment.status === 'active' && (
                <div>
                  <Label htmlFor="feedback">Add Feedback / Notes</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Enter your feedback or notes about this candidate..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}

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
                {selectedAssignment.status === 'active' && (
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
