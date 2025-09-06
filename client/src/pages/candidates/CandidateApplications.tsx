import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  User
} from 'lucide-react';
import { useMyCandidateAssignments } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

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
    };
    rating?: number;
    resumeFileId?: string;
  };
  jobId?: {
    _id: string;
    title: string;
    companyId: {
      name: string;
      industry?: string;
      location?: string;
    };
    location: string;
    type: string;
    salaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  assignedBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  candidateStatus?: 'new' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offer_sent' | 'hired' | 'rejected';
  notes?: string;
  feedback?: string;
  assignedAt: string;
  lastActivityAt: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const CandidateApplications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();

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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-purple-100 text-purple-800';
      case 'interview_scheduled': return 'bg-orange-100 text-orange-800';
      case 'interviewed': return 'bg-yellow-100 text-yellow-800';
      case 'offer_sent': return 'bg-indigo-100 text-indigo-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStage = (stage: string) => {
    return stage.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
    return (
      <Card key={assignment._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between">
            {/* Left side: Job info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {assignment.jobId?.title || 'Unknown Job'}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <Building2 className="w-4 h-4 mr-1" />
                <span className="mr-4">{assignment.jobId?.companyId?.name || 'Unknown Company'}</span>
                <MapPin className="w-4 h-4 mr-1" />
                <span>{assignment.jobId?.location || 'Unknown Location'}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getStatusColor(assignment.status)}>
                  <div className="flex items-center">
                    {getStatusIcon(assignment.status)}
                    <span className="ml-1">{assignment.status}</span>
                  </div>
                </Badge>
                <Badge variant="outline" className="bg-blue-50">
                  <User className="w-3 h-3 mr-1" />
                  {`Agent: ${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`}
                </Badge>
              </div>

              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Assigned {safeDateFormat(assignment.assignedAt, 'Unknown')} ago</span>
                </div>
              </div>

              {assignment.jobId?.salaryRange && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Salary:</strong> {formatSalary(assignment.jobId.salaryRange)}
                </div>
              )}
            </div>

            {/* Right side: Status and actions */}
            <div className="flex flex-col items-end gap-4">
              {assignment.candidateStatus && (
                <Badge className={getStageColor(assignment.candidateStatus)}>
                  {formatStage(assignment.candidateStatus)}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setIsViewDialogOpen(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </div>
          {/* Feedback Section */}
          {assignment.feedback && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span>HR Feedback</span>
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                {assignment.feedback}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
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

      {/* Assignment Details Dialog */}
      {selectedAssignment && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedAssignment.jobId?.title || 'Unknown Job'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center gap-4 -mt-2 mb-6">
              <div className="flex items-center text-gray-600">
                <Building2 className="w-4 h-4 mr-1" />
                {selectedAssignment.jobId?.companyId?.name || 'Unknown Company'}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {selectedAssignment.jobId?.location || 'Unknown Location'}
              </div>
              <Badge className={getStatusColor(selectedAssignment.status)}>
                {selectedAssignment.status}
              </Badge>
            </div>
            
            <div className="space-y-6">
              {/* Assignment Status */}
              <div>
                <h4 className="font-semibold mb-3">Assignment Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Current Status: <strong>{formatStage(selectedAssignment.candidateStatus || 'new')}</strong></span>
                    <Badge className={getStageColor(selectedAssignment.candidateStatus || 'new')}>
                      {formatStage(selectedAssignment.candidateStatus || 'new')}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div>
                <h4 className="font-semibold mb-3">Assignment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Assigned Date:</span>
                    <span className="ml-2">{safeFullDateFormat(selectedAssignment.assignedAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Assigned By:</span>
                    <span className="ml-2">{`${selectedAssignment.assignedBy.firstName} ${selectedAssignment.assignedBy.lastName}`}</span>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="ml-2">{safeFullDateFormat(selectedAssignment.lastActivityAt)}</span>
                  </div>
                  {selectedAssignment.jobId?.salaryRange && (
                    <div>
                      <span className="font-medium">Salary Range:</span>
                      <span className="ml-2">{formatSalary(selectedAssignment.jobId.salaryRange)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedAssignment.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedAssignment.notes}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {selectedAssignment.feedback && (
                <div>
                  <h4 className="font-semibold mb-2">Feedback</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CandidateApplications;
