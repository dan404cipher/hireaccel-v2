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
  ExternalLink
} from 'lucide-react';
import { useApplications, useAdvanceApplication, useRejectApplication } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';

interface Application {
  _id: string;
  candidateId: string;
  jobId: {
    _id: string;
    title: string;
    companyId: {
      name: string;
      industry?: string;
    };
    location: string;
    type: string;
    salaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
  };
  status: string;
  stage: string;
  appliedAt: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  feedback?: string;
  source: string;
  timeline?: Array<{
    stage: string;
    date: string;
    notes?: string;
  }>;
}

const CandidateApplications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();

  // API calls - filter applications by current candidate
  const params = useMemo(() => ({
    page: currentPage,
    limit: 10,
    userId: user?.id,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    sortBy: 'appliedAt',
    sortOrder: 'desc'
  }), [currentPage, user?.id, statusFilter, stageFilter]);

  const { data: applicationsData, loading, refetch } = useApplications(params);

  const advanceApplication = useAdvanceApplication({
    onSuccess: () => {
      refetch();
      toast({
        title: 'Application Updated',
        description: 'Application status has been updated successfully.',
      });
    }
  });

  // Handle both possible response formats
  const applications = Array.isArray(applicationsData) ? applicationsData : (applicationsData as any)?.data || [];
  const meta = Array.isArray(applicationsData) ? {} : (applicationsData as any)?.meta || {};

  // Filter applications based on search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm) return applications;
    
    return applications.filter((application: Application) => {
      const jobTitle = application.jobId?.title?.toLowerCase() || '';
      const companyName = application.jobId?.companyId?.name?.toLowerCase() || '';
      const stage = application.stage?.toLowerCase() || '';
      
      return jobTitle.includes(searchTerm.toLowerCase()) ||
        companyName.includes(searchTerm.toLowerCase()) ||
        stage.includes(searchTerm.toLowerCase());
    });
  }, [applications, searchTerm]);

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

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'applied': return 'bg-gray-100 text-gray-800';
      case 'screening': return 'bg-blue-100 text-blue-800';
      case 'phone_interview': return 'bg-purple-100 text-purple-800';
      case 'technical_interview': return 'bg-orange-100 text-orange-800';
      case 'final_interview': return 'bg-yellow-100 text-yellow-800';
      case 'reference_check': return 'bg-indigo-100 text-indigo-800';
      case 'offer_pending': return 'bg-green-100 text-green-800';
      case 'offer_accepted': return 'bg-green-100 text-green-800';
      case 'offer_declined': return 'bg-red-100 text-red-800';
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

  const renderApplicationCard = (application: Application) => {
    const progress = getApplicationProgress(application.stage);
    
    return (
      <Card key={application._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {application.jobId?.title || 'Unknown Job'}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <Building2 className="w-4 h-4 mr-1" />
                <span className="mr-4">{application.jobId?.companyId?.name || 'Unknown Company'}</span>
                <MapPin className="w-4 h-4 mr-1" />
                <span>{application.jobId?.location || 'Unknown Location'}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getStatusColor(application.status)}>
                  <div className="flex items-center">
                    {getStatusIcon(application.status)}
                    <span className="ml-1">{application.status}</span>
                  </div>
                </Badge>
                <Badge className={getStageColor(application.stage)}>
                  {formatStage(application.stage)}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Application Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Applied {safeDateFormat(application.appliedAt, 'Unknown')} ago</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Updated {safeDateFormat(application.lastActivityAt, 'Unknown')} ago</span>
                </div>
              </div>

              {application.jobId.salaryRange && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Salary:</strong> {formatSalary(application.jobId.salaryRange)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedApplication(application);
                setIsViewDialogOpen(true);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {application.feedback && (
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                View Feedback
              </Button>
            )}
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
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Track the progress of your job applications
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['active', 'hired', 'rejected', 'on_hold'].map((status) => {
          const count = applications.filter((app: Application) => app.status === status).length;
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="phone_interview">Phone Interview</SelectItem>
                <SelectItem value="technical_interview">Technical Interview</SelectItem>
                <SelectItem value="final_interview">Final Interview</SelectItem>
                <SelectItem value="reference_check">Reference Check</SelectItem>
                <SelectItem value="offer_pending">Offer Pending</SelectItem>
                <SelectItem value="offer_accepted">Offer Accepted</SelectItem>
                <SelectItem value="offer_declined">Offer Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading applications...' : `${filteredApplications.length} applications found`}
        </p>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">No applications found</h3>
              <p className="text-gray-600">
                You haven't applied to any jobs yet, or no applications match your current filters.
              </p>
              <Button className="mt-4">
                <Briefcase className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredApplications.map(renderApplicationCard)}
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

      {/* Application Details Dialog */}
      {selectedApplication && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {selectedApplication.jobId?.title || 'Unknown Job'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center gap-4 -mt-2 mb-6">
              <div className="flex items-center text-gray-600">
                <Building2 className="w-4 h-4 mr-1" />
                {selectedApplication.jobId?.companyId?.name || 'Unknown Company'}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {selectedApplication.jobId?.location || 'Unknown Location'}
              </div>
              <Badge className={getStatusColor(selectedApplication.status)}>
                {selectedApplication.status}
              </Badge>
            </div>
            
            <div className="space-y-6">
              {/* Application Status */}
              <div>
                <h4 className="font-semibold mb-3">Application Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Current Stage: <strong>{formatStage(selectedApplication.stage)}</strong></span>
                    <Badge className={getStageColor(selectedApplication.stage)}>
                      {formatStage(selectedApplication.stage)}
                    </Badge>
                  </div>
                  <Progress value={getApplicationProgress(selectedApplication.stage)} className="h-3" />
                </div>
              </div>

              {/* Timeline */}
              {selectedApplication.timeline && selectedApplication.timeline.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Application Timeline</h4>
                  <div className="space-y-3">
                    {selectedApplication.timeline.map((event, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">{formatStage(event.stage)}</span>
                            <span className="text-sm text-gray-500">
                              {safeFullDateFormat(event.date)}
                            </span>
                          </div>
                          {event.notes && (
                            <p className="text-sm text-gray-600 mt-1">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Application Details */}
              <div>
                <h4 className="font-semibold mb-3">Application Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Applied Date:</span>
                    <span className="ml-2">{safeFullDateFormat(selectedApplication.appliedAt)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Source:</span>
                    <span className="ml-2 capitalize">{selectedApplication.source.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>
                    <span className="ml-2">{safeFullDateFormat(selectedApplication.lastActivityAt)}</span>
                  </div>
                  {selectedApplication.jobId.salaryRange && (
                    <div>
                      <span className="font-medium">Salary Range:</span>
                      <span className="ml-2">{formatSalary(selectedApplication.jobId.salaryRange)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedApplication.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedApplication.notes}
                  </p>
                </div>
              )}

              {/* Feedback */}
              {selectedApplication.feedback && (
                <div>
                  <h4 className="font-semibold mb-2">Feedback</h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded border border-blue-200">
                    {selectedApplication.feedback}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex space-x-2">
                {selectedApplication.status === 'active' && (
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CandidateApplications;
