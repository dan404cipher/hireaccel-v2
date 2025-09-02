import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserPlus,
  Filter,
  Loader2,
  Calendar,
  MapPin,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { 
  useMyAgentAssignments, 
  useCandidateAssignmentStats,
  useUpdateCandidateAssignment,
  useDeleteCandidateAssignment 
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

export default function AssignmentTracking() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    status: '',
    priority: '',
    notes: '',
    feedback: '',
  });

  // API hooks
  const { 
    data: assignmentsResponse, 
    loading: assignmentsLoading, 
    error: assignmentsError, 
    refetch: refetchAssignments 
  } = useMyAgentAssignments({
    page,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  }, {
    showToast: false, // Don't show toast for initial load errors
  });



  const { 
    data: statsResponse, 
    loading: statsLoading, 
    error: statsError 
  } = useCandidateAssignmentStats({
    showToast: false, // Don't show toast for stats errors
  });

  const { mutate: updateAssignment, loading: updateLoading } = useUpdateCandidateAssignment({
    onSuccess: () => {
      setIsUpdateDialogOpen(false);
      refetchAssignments();
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      });
    }
  });

  const { mutate: deleteAssignment, loading: deleteLoading } = useDeleteCandidateAssignment({
    onSuccess: () => {
      refetchAssignments();
      toast({
        title: "Success",
        description: "Assignment deleted successfully"
      });
    }
  });

  // Extract data from API responses
  const assignments = assignmentsResponse || [];
  const assignmentsMeta = {}; // Meta info is not available from useApi hook
  const stats = statsResponse?.data || {};



  // Handle case where no assignments exist yet
  const hasAssignments = assignments.length > 0;

  // Filter assignments based on search term and urgency
  const filteredAssignments = assignments.filter((assignment: any) => {
    const matchesSearch = 
      assignment.candidateId?.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.candidateId?.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.jobId?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUrgency = urgencyFilter === 'all' || 
      (assignment.jobId?.urgency && assignment.jobId.urgency === urgencyFilter);
    
    return matchesSearch && matchesUrgency;
  });

  // Calculate summary stats
  const assignmentSummary = {
    totalAssignments: assignments.length,
    activeAssignments: stats.byStatus?.find((s: any) => s._id === 'active')?.count || 0,
    completedAssignments: stats.byStatus?.find((s: any) => s._id === 'completed')?.count || 0,
    pendingAssignments: stats.byStatus?.find((s: any) => s._id === 'rejected')?.count || 0,
    urgentAssignments: stats.overdue || 0,
    highPriorityAssignments: assignments.filter((a: any) => a.priority === 'high' || a.priority === 'urgent').length,
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-red-200 text-red-900 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleUpdateAssignment = () => {
    if (!selectedAssignment) return;

    const updateData: any = {};
    if (updateFormData.status) updateData.status = updateFormData.status;
    if (updateFormData.priority) updateData.priority = updateFormData.priority;
    if (updateFormData.notes) updateData.notes = updateFormData.notes;
    if (updateFormData.feedback) updateData.feedback = updateFormData.feedback;

    updateAssignment({ id: selectedAssignment._id, data: updateData });
  };

  const handleDeleteAssignment = (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignment(assignmentId);
    }
  };

  const handleQuickStatusUpdate = (assignmentId: string, newStatus: string) => {
    updateAssignment({ 
      id: assignmentId, 
      data: { status: newStatus } 
    });
  };

  const openUpdateDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    setUpdateFormData({
      status: assignment.status || '',
      priority: assignment.priority || '',
      notes: assignment.notes || '',
      feedback: assignment.feedback || '',
    });
    setIsUpdateDialogOpen(true);
  };

  // Handle filter changes
  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [statusFilter, priorityFilter]);

  if (assignmentsError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assignment Tracking</h1>
            <p className="text-muted-foreground">
              Monitor and manage candidate-job assignments
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Error Loading Assignments</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {assignmentsError.detail || assignmentsError.title || 'Failed to load assignment data'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {user?.role === 'agent' && 'Agents can only see assignments they created.'}
              {user?.role === 'hr' && 'HR users can only see assignments assigned to them.'}
              {user?.role === 'admin' && 'Admins can see all assignments.'}
            </p>
            <div className="text-xs text-muted-foreground mb-4">
              Status: {assignmentsError.status} | Code: {assignmentsError.code}
            </div>
            <Button onClick={() => refetchAssignments()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignment Tracking</h1>
          <p className="text-muted-foreground">
            Monitor and manage candidate-job assignments
          </p>
          {user?.role && (
            <p className="text-xs text-muted-foreground mt-1">
              Viewing assignments for {user.role} role: {user.role === 'hr' ? 'assigned to you' : user.role === 'agent' ? 'created by you' : 'all assignments'}
            </p>
          )}
        </div>
        <Button disabled={assignmentsLoading}>
          <UserPlus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>



      {/* Assignment Tracking Table */}
      <Card>
        <CardHeader>
                  <CardTitle className="flex items-center gap-2">
          {assignmentsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {assignmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading assignments...</span>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">
                {hasAssignments ? 'No assignments found' : 'No assignments yet'}
              </h3>
              <p className="text-sm">
                {hasAssignments 
                  ? 'No assignments match your current filters.' 
                  : 'Start by creating assignments in the Assignment Management page.'
                }
              </p>
              {!hasAssignments && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/assignment-management'}
                >
                  Go to Assignment Management
                </Button>
              )}
            </div>
          ) : (
                        <>
              <div className="grid grid-cols-1 gap-4">
                {filteredAssignments.map((assignment: any) => (
                  <Card key={assignment._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      {/* Compact Header with all main info in one row */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                              {assignment.candidateId?.userId?.firstName && assignment.candidateId?.userId?.lastName ? 
                                `${assignment.candidateId.userId.firstName} ${assignment.candidateId.userId.lastName}` : 
                                assignment.candidateId?.userId?.email || 
                                assignment.candidateId?.userId?.firstName || 
                                assignment.candidateId?.userId?.lastName ||
                                'Unnamed Candidate'
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {assignment.jobId?.title || 'No job specified'}
                            </p>
                          </div>
                          
                          {/* Company and Location in header */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {assignment.jobId?.companyId?.name && (
                              <span className="truncate max-w-[100px]">{assignment.jobId.companyId.name}</span>
                            )}
                            {assignment.jobId?.location && (
                              <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  <span className="truncate max-w-[80px]">{assignment.jobId.location}</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openUpdateDialog(assignment)}>
                              Update Assignment
                            </DropdownMenuItem>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            {assignment.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleDeleteAssignment(assignment._id)}>
                                Delete Assignment
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Compact info row */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <UserPlus className="w-3 h-3 text-emerald-500" />
                            <span className="text-muted-foreground text-xs">Assigned HR:</span>
                            <span className="truncate max-w-[100px] font-medium">
                              {assignment.assignedTo ? 
                                `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}` : 
                                'Unassigned'
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-blue-500" />
                            <span>{formatDate(assignment.assignedAt)}</span>
                          </div>
                          
                          {assignment.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-500" />
                              <span>{formatDate(assignment.dueDate)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(assignment.priority)} border-current`} variant="outline" className="text-xs px-2 py-1">
                            {assignment.priority}
                          </Badge>
                          {assignment.jobId?.urgency && (
                            <Badge className={`${getUrgencyColor(assignment.jobId.urgency)} border-current`} variant="outline" className="text-xs px-2 py-1">
                              {assignment.jobId.urgency}
                            </Badge>
                          )}
                          <Select 
                            value={assignment.status} 
                            onValueChange={(newStatus) => handleQuickStatusUpdate(assignment._id, newStatus)}
                          >
                            <SelectTrigger className="w-28 h-7 text-sm border-blue-200 hover:border-blue-300 focus:border-blue-400">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="withdrawn">Withdrawn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Notes - only if present, very compact */}
                      {assignment.notes && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            <span className="font-medium">Notes:</span> {assignment.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {assignments.length > limit && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, assignments.length)} of {assignments.length} assignments
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= assignmentsMeta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Update Assignment Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Assignment</DialogTitle>
            <DialogDescription>
              Update the status and details of this assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={updateFormData.status} onValueChange={(value) => setUpdateFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={updateFormData.priority} onValueChange={(value) => setUpdateFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
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
                value={updateFormData.notes}
                onChange={(e) => setUpdateFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="feedback">Feedback (for completed/rejected)</Label>
              <Textarea
                id="feedback"
                placeholder="Add feedback..."
                value={updateFormData.feedback}
                onChange={(e) => setUpdateFormData(prev => ({ ...prev, feedback: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateAssignment} disabled={updateLoading} className="flex-1">
                {updateLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
              </Button>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
