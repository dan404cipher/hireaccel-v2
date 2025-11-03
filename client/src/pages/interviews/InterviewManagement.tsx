import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview, useInterviewStats, useCandidateAssignments } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { DashboardBanner } from "@/components/dashboard/Banner";

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CalendarPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Plus,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Table as TableIcon,
  User,
  Building2,
  Briefcase,
  Timer,
  MessageSquare,
  Edit,
  Trash2,
  ArrowUpDown
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Removed mock data - will use real API data

export default function InterviewManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || "all");
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "week" | "day">("table");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "candidate-asc" | "candidate-desc" | "job-asc" | "job-desc">("newest");
  
  // Schedule Interview Form State
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleFormData, setScheduleFormData] = useState({
    candidateId: '',
    type: '',
    round: '',
    scheduledAt: '',
    scheduledTime: '',
    duration: '60',
    location: '',
    notes: '',
  });

  // Edit Interview Form State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<any>(null);

  // View Interview Details State
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingInterview, setViewingInterview] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    type: '',
    round: '',
    scheduledAt: '',
    scheduledTime: '',
    duration: '60',
    location: '',
    notes: '',
    status: '',
  });

  // Check for URL action parameter to auto-open dialogs
  useEffect(() => {
    const action = searchParams.get('action');
    const candidateId = searchParams.get('candidateId');
    
    if (action === 'schedule') {
      // Pre-select the candidate if provided in URL
      if (candidateId) {
        setScheduleFormData(prev => ({
          ...prev,
          candidateId: candidateId
        }));
      }
      
      setIsScheduleDialogOpen(true);
      
      // Remove the action parameters from URL to prevent re-opening
      searchParams.delete('action');
      searchParams.delete('candidateId');
      searchParams.delete('candidateName');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get user context
  const { user } = useAuth();

  // Create stable API parameters
  const interviewsParams = useMemo(() => ({
    page,
    limit: 20,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    candidateId: user?.role === 'candidate' ? user?.id : undefined,
  }), [page, debouncedSearchTerm, statusFilter, user?.role, user?.id]);

  // Fetch data using hooks
  const { data: interviewsResponse, loading: interviewsLoading, error: interviewsError, refetch: refetchInterviews } = useInterviews(interviewsParams);
  const { data: statsResponse } = useInterviewStats();
  const { mutate: createInterview, loading: createLoading } = useCreateInterview({
    showToast: false, // Let component handle error display
    onSuccess: () => {
      setIsScheduleDialogOpen(false);
      resetScheduleForm();
      refetchInterviews();
    }
  });
  const { mutate: updateInterview, loading: updateLoading } = useUpdateInterview({
    showToast: false, // Let component handle error display
    onSuccess: () => {
      setIsEditDialogOpen(false);
      resetEditForm();
      refetchInterviews();
    }
  });
  const { mutate: deleteInterview, loading: deleteLoading } = useDeleteInterview();
  
  // Additional data for scheduling - fetch candidates instead of applications
  const { data: candidatesResponse, loading: candidatesLoading } = useCandidateAssignments({ 
    status: 'active',
    limit: 100 
  });

  // Extract interviews data (handle both array and {data: []} formats)
  const interviews = Array.isArray(interviewsResponse) ? interviewsResponse : ((interviewsResponse as any)?.data || []);
  const meta = Array.isArray(interviewsResponse) ? null : (interviewsResponse as any)?.meta;
  
  // Extract candidates data from assignments
  const candidateAssignments = Array.isArray(candidatesResponse) ? candidatesResponse : ((candidatesResponse as any)?.data || []);


  // Helper function to get local date string (YYYY-MM-DD) without timezone conversion issues
  const getLocalDateString = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Transform API data to the format expected by the UI
  const transformedInterviews = interviews.map((interview: any) => ({
    id: interview._id || interview.id,
    candidateName: interview.applicationId?.candidateId?.userId?.firstName && interview.applicationId?.candidateId?.userId?.lastName 
      ? `${interview.applicationId.candidateId.userId.firstName} ${interview.applicationId.candidateId.userId.lastName}`
      : "Unknown Candidate",
    jobTitle: interview.applicationId?.jobId?.title || "Unknown Job",
    company: interview.applicationId?.jobId?.companyId?.name || "Unknown Company",
    agent: interview.applicationId?.candidateId?.assignedAgentId?.firstName && interview.applicationId?.candidateId?.assignedAgentId?.lastName
      ? `${interview.applicationId.candidateId.assignedAgentId.firstName} ${interview.applicationId.candidateId.assignedAgentId.lastName}`
      : "Unassigned",
    date: getLocalDateString(interview.scheduledAt),
    time: new Date(interview.scheduledAt).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    type: interview.type,
    status: interview.status,
    round: interview.round,
    duration: `${interview.duration} min`,
    location: interview.location || "TBD",
    originalData: interview
  }));

  const filteredInterviews = transformedInterviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || interview.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === "today") {
      const today = getLocalDateString(new Date());
      matchesDate = interview.date === today;
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = interview.date === getLocalDateString(tomorrow);
    } else if (dateFilter === "week") {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const interviewDate = new Date(interview.date + 'T00:00:00');
      matchesDate = interviewDate <= weekFromNow && interviewDate >= new Date(new Date().setHours(0, 0, 0, 0));
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort interviews based on selected option
  const sortedInterviews = useMemo(() => {
    return [...filteredInterviews].sort((a, b) => {
      switch (sortOption) {
        case "newest":
          // Sort by scheduledAt descending (newest first)
          const aDate = new Date(a.originalData?.scheduledAt || a.date).getTime();
          const bDate = new Date(b.originalData?.scheduledAt || b.date).getTime();
          return bDate - aDate;
        
        case "oldest":
          // Sort by scheduledAt ascending (oldest first)
          const aDateOld = new Date(a.originalData?.scheduledAt || a.date).getTime();
          const bDateOld = new Date(b.originalData?.scheduledAt || b.date).getTime();
          return aDateOld - bDateOld;
        
        case "candidate-asc":
          return a.candidateName.localeCompare(b.candidateName, undefined, { sensitivity: 'base' });
        
        case "candidate-desc":
          return b.candidateName.localeCompare(a.candidateName, undefined, { sensitivity: 'base' });
        
        case "job-asc":
          return a.jobTitle.localeCompare(b.jobTitle, undefined, { sensitivity: 'base' });
        
        case "job-desc":
          return b.jobTitle.localeCompare(a.jobTitle, undefined, { sensitivity: 'base' });
        
        default:
          return 0;
      }
    });
  }, [filteredInterviews, sortOption]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-600 text-white border-blue-600";
      case "confirmed": return "bg-emerald-600 text-white border-emerald-600";
      case "completed": return "bg-purple-600 text-white border-purple-600";
      case "pending": return "bg-amber-600 text-white border-amber-600";
      case "cancelled": return "bg-red-600 text-white border-red-600";
      default: return "bg-gray-600 text-white border-gray-600";
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-500";
      case "confirmed": return "bg-green-500";
      case "completed": return "bg-primary";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-blue-600" />;
      case "phone": return <Phone className="w-4 h-4 text-emerald-600" />;
      case "in-person": return <MapPin className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending": return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "scheduled": return <Clock className="w-4 h-4 text-blue-600" />;
      case "confirmed": return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const todayInterviews = transformedInterviews.filter(interview => {
    const today = new Date().toISOString().split('T')[0];
    return interview.date === today && interview.status !== 'cancelled';
  });

  // Form handling functions
  const resetScheduleForm = () => {
    setScheduleFormData({
      candidateId: '',
      type: '',
      round: '',
      scheduledAt: '',
      scheduledTime: '',
      duration: '60',
      location: '',
      notes: '',
    });
  };

  const handleScheduleInterview = async () => {
    try {
      // Combine date and time into a single DateTime
      const scheduledDateTime = new Date(`${scheduleFormData.scheduledAt}T${scheduleFormData.scheduledTime}`);
      
      const interviewData = {
        candidateId: scheduleFormData.candidateId,
        type: scheduleFormData.type,
        round: scheduleFormData.round,
        scheduledAt: scheduledDateTime.toISOString(),
        duration: parseInt(scheduleFormData.duration),
        location: scheduleFormData.location || undefined,
        notes: scheduleFormData.notes || undefined,
      };

      await createInterview(interviewData);
      
      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      });
    } catch (error: any) {
      
      let errorMessage = "Failed to schedule interview";
      
      // Check if error has the expected structure
      if (error && typeof error === 'object') {
        // Handle validation errors with detailed messages
        if (error.issues && Array.isArray(error.issues) && error.issues.length > 0) {
          const validationErrors = error.issues.map((issue: any) => {
            // Convert field names to user-friendly labels
            const fieldLabels: { [key: string]: string } = {
              scheduledAt: "Scheduled Date & Time",
              type: "Interview Type",
              round: "Interview Round",
              duration: "Duration",
              location: "Location",
              status: "Status",
              interviewers: "Interviewers",
              candidateId: "Candidate"
            };
            
            const fieldName = fieldLabels[issue.field] || issue.field;
            return `${fieldName}: ${issue.message}`;
          });
          
          errorMessage = validationErrors.join(". ");
        } else if (error.detail) {
          // Use the detail message from the API
          errorMessage = error.detail;
        } else if (error.message) {
          // Use the error message
          errorMessage = error.message;
        } else if (error.title) {
          // Use the title as fallback
          errorMessage = error.title;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Edit Interview Form Functions
  const resetEditForm = () => {
    setEditFormData({
      type: '',
      round: '',
      scheduledAt: '',
      scheduledTime: '',
      duration: '60',
      location: '',
      notes: '',
      status: '',
    });
    setEditingInterview(null);
  };

  const openEditDialog = (interview: any) => {
    if (!interview || !interview.scheduledAt) {
      toast({
        title: "Error",
        description: "Invalid interview data. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const scheduledDate = new Date(interview.scheduledAt);
    
    // Check if the date is valid
    if (isNaN(scheduledDate.getTime())) {
      toast({
        title: "Error",
        description: "Invalid date format. Please try again.",
        variant: "destructive",
      });
      return;
    }
    
    const formattedDate = scheduledDate.toISOString().split('T')[0];
    const formattedTime = scheduledDate.toTimeString().slice(0, 5);
    
    setEditingInterview(interview);
    setEditFormData({
      type: interview.type || '',
      round: interview.round || '',
      scheduledAt: formattedDate,
      scheduledTime: formattedTime,
      duration: interview.duration?.toString() || '60',
      location: interview.location || interview.meetingLink || '',
      notes: interview.notes?.[0]?.content || '',
      status: interview.status || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleEditInterview = async () => {
    if (!editingInterview) return;
    
    try {
      // Combine date and time into a single DateTime
      const scheduledDateTime = new Date(`${editFormData.scheduledAt}T${editFormData.scheduledTime}`);
      
      const updateData = {
        type: editFormData.type,
        round: editFormData.round,
        scheduledAt: scheduledDateTime.toISOString(),
        duration: parseInt(editFormData.duration),
        location: editFormData.location || undefined,
        notes: editFormData.notes || undefined,
        status: editFormData.status,
      };

      await updateInterview({ id: editingInterview._id || editingInterview.id, data: updateData });
      
      toast({
        title: "Success",
        description: "Interview updated successfully",
      });
    } catch (error: any) {
      
      let errorMessage = "Failed to update interview";
      
      // Check if error has the expected structure
      if (error && typeof error === 'object') {
        // Handle validation errors with detailed messages
        if (error.issues && Array.isArray(error.issues) && error.issues.length > 0) {
          const validationErrors = error.issues.map((issue: any) => {
            // Convert field names to user-friendly labels
            const fieldLabels: { [key: string]: string } = {
              scheduledAt: "Scheduled Date & Time",
              type: "Interview Type",
              round: "Interview Round",
              duration: "Duration",
              location: "Location",
              status: "Status",
              interviewers: "Interviewers"
            };
            
            const fieldName = fieldLabels[issue.field] || issue.field;
            return `${fieldName}: ${issue.message}`;
          });
          
          errorMessage = validationErrors.join(". ");
        } else if (error.detail) {
          // Use the detail message from the API
          errorMessage = error.detail;
        } else if (error.message) {
          // Use the error message
          errorMessage = error.message;
        } else if (error.title) {
          // Use the title as fallback
          errorMessage = error.title;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Form validation for edit
  const isEditFormValid = () => {
    return editFormData.type && 
           editFormData.round && 
           editFormData.scheduledAt && 
           editFormData.scheduledTime && 
           editFormData.duration &&
           editFormData.status;
  };

  // Extract stats from API response or calculate from interviews
  const stats = (statsResponse as any)?.data || {
    todayCount: todayInterviews.length,
    byStatus: transformedInterviews.reduce((acc: any, interview) => {
      const existing = acc.find((item: any) => item._id === interview.status);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ _id: interview.status, count: 1 });
      }
      return acc;
    }, [])
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <DashboardBanner category={user?.role === 'candidate' ? 'candidate' : 'hr'} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {user?.role === 'candidate' ? 'My Interviews' : 'Interview Management'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'candidate' 
              ? 'View your scheduled interviews and their status'
              : 'Schedule and manage candidate interviews'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-md"
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Table
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="rounded-md"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Month
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
              className="rounded-md"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Week
            </Button>
            <Button
              variant={viewMode === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("day")}
              className="rounded-md"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Day
            </Button>
        </div>
        {user?.role !== 'candidate' && (
          <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
              onClick={() => {
                resetScheduleForm();
                setIsScheduleDialogOpen(true);
              }}
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>
                Schedule an interview between a candidate and company representative.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Candidate <span className="text-red-500">*</span></label>
                <Select 
                  value={scheduleFormData.candidateId} 
                  onValueChange={(value) => {
                    if (value !== 'loading' && value !== 'no-candidates') {
                      setScheduleFormData(prev => ({ ...prev, candidateId: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidatesLoading ? (
                      <SelectItem value="loading" disabled>Loading candidates...</SelectItem>
                    ) : candidateAssignments.length === 0 ? (
                      <SelectItem value="no-candidates" disabled>No candidates available</SelectItem>
                    ) : (
                      candidateAssignments.map((assignment: any) => (
                        <SelectItem key={assignment.candidateId._id} value={assignment.candidateId._id}>
                          {assignment.candidateId?.userId?.firstName} {assignment.candidateId?.userId?.lastName} - {assignment.jobId?.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Type <span className="text-red-500">*</span></label>
                  <Select 
                    value={scheduleFormData.type} 
                    onValueChange={(value) => setScheduleFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in-person">Walk In</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Round <span className="text-red-500">*</span></label>
                  <Select 
                    value={scheduleFormData.round} 
                    onValueChange={(value) => setScheduleFormData(prev => ({ ...prev, round: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screening">HR Screening</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
                  <Input 
                    type="date" 
                    value={scheduleFormData.scheduledAt}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time <span className="text-red-500">*</span></label>
                  <Input 
                    type="time" 
                    value={scheduleFormData.scheduledTime}
                    onChange={(e) => setScheduleFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration <span className="text-red-500">*</span></label>
                  <Select 
                    value={scheduleFormData.duration} 
                    onValueChange={(value) => setScheduleFormData(prev => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location / Meeting Link</label>
                <Input 
                  placeholder="Enter location or meeting link (e.g., Zoom: https://zoom.us/...)"
                  value={scheduleFormData.location}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input 
                  placeholder="Additional notes for the interview..."
                  value={scheduleFormData.notes}
                  onChange={(e) => setScheduleFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsScheduleDialogOpen(false);
                  resetScheduleForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleScheduleInterview}
                disabled={
                  createLoading || 
                  !scheduleFormData.candidateId || 
                  scheduleFormData.candidateId === 'loading' ||
                  scheduleFormData.candidateId === 'no-candidates' ||
                  !scheduleFormData.type || 
                  !scheduleFormData.round || 
                  !scheduleFormData.scheduledAt || 
                  !scheduleFormData.scheduledTime || 
                  !scheduleFormData.duration
                }
              >
                {createLoading ? "Scheduling..." : "Schedule Interview"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}

        {/* Edit Interview Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Interview</DialogTitle>
              <DialogDescription>
                Update interview details and schedule.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Interview Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Type <span className="text-red-500">*</span></label>
                <Select 
                  value={editFormData.type} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in-person">Walk In</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview Round */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Interview Round <span className="text-red-500">*</span></label>
                <Select 
                  value={editFormData.round} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, round: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interview round" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date <span className="text-red-500">*</span></label>
                  <Input
                    type="date"
                    value={editFormData.scheduledAt}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time <span className="text-red-500">*</span></label>
                  <Input
                    type="time"
                    value={editFormData.scheduledTime}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes) <span className="text-red-500">*</span></label>
                <Select 
                  value={editFormData.duration} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location/Meeting Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location / Meeting Link</label>
                <Input
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Meeting Room A or https://zoom.us/j/123456789"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status <span className="text-red-500">*</span></label>
                <Select 
                  value={editFormData.status} 
                  onValueChange={(value) => setEditFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or instructions"
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEditInterview}
                disabled={updateLoading || !isEditFormValid()}
              >
                {updateLoading ? "Updating..." : "Update Interview"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Interview Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Interview Details</DialogTitle>
              <DialogDescription>
                View detailed information about the interview
              </DialogDescription>
            </DialogHeader>
            
            {viewingInterview && (
              <div className="space-y-4 py-4">
                {/* Candidate Information */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Candidate</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{viewingInterview.candidateName}</span>
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Job</label>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                    <div>
                      <span className="font-medium">{viewingInterview.jobTitle}</span>
                      <span className="text-sm text-muted-foreground ml-2">at {viewingInterview.company}</span>
                    </div>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                      <CalendarIcon className="w-5 h-5 text-blue-600" />
                      <span>{viewingInterview.originalData?.scheduledAt 
                        ? new Date(viewingInterview.originalData.scheduledAt).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : new Date(viewingInterview.date + 'T00:00:00').toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                      }</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Time</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      <span>{viewingInterview.time}</span>
                      <span className="text-sm text-muted-foreground">({viewingInterview.duration})</span>
                    </div>
                  </div>
                </div>

                {/* Interview Type and Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                      {getTypeIcon(viewingInterview.type)}
                      <span className="capitalize">{viewingInterview.type}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Round</label>
                    <div className="p-3 bg-slate-50 rounded-md">
                      <span>Round {viewingInterview.round}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                {viewingInterview.location && viewingInterview.location !== 'TBD' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                      <MapPin className="w-5 h-5 text-purple-600" />
                      <span className="break-words">{viewingInterview.location}</span>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="p-3 bg-slate-50 rounded-md">
                    <Badge className={getStatusColor(viewingInterview.status)}>
                      {getStatusIcon(viewingInterview.status)}
                      <span className="ml-2 capitalize">{viewingInterview.status}</span>
                    </Badge>
                  </div>
                </div>

                {/* Agent */}
                {viewingInterview.agent && viewingInterview.agent !== 'Unassigned' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Assigned Agent</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                      <Users className="w-5 h-5 text-indigo-600" />
                      <span>{viewingInterview.agent}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {viewingInterview.originalData?.notes?.[0]?.content && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <div className="p-3 bg-slate-50 rounded-md">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
                        <p className="text-sm whitespace-pre-wrap">{viewingInterview.originalData.notes[0].content}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsViewDialogOpen(false)}
              >
                Close
              </Button>
              {user?.role !== 'candidate' && viewingInterview && (
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    openEditDialog(viewingInterview.originalData);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Interview
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Today's Interviews</p>
                <p className="text-2xl font-bold text-white">{stats.todayCount || todayInterviews.length}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Clock className="w-6 h-6 text-blue-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">Scheduled</p>
                <p className="text-2xl font-bold text-white">
                  {stats.byStatus?.find((s: any) => s._id === 'scheduled')?.count || 0}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <CalendarPlus className="w-6 h-6 text-emerald-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {stats.byStatus?.find((s: any) => s._id === 'completed')?.count || 0}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <CheckCircle className="w-6 h-6 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">Confirmed</p>
                <p className="text-2xl font-bold text-white">
                  {stats.byStatus?.find((s: any) => s._id === 'confirmed')?.count || 0}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <AlertCircle className="w-6 h-6 text-amber-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === "table" ? (
        /* Table View */
        <div className="w-full">
          <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
              <CardTitle className="text-slate-700 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                Interview Schedule
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <Input
                    placeholder="Search interviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32 border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                    <CalendarIcon className="w-4 h-4 mr-2 text-purple-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOption} onValueChange={(value: any) => setSortOption(value)}>
                  <SelectTrigger className="w-40 border-green-200 focus:border-green-400 focus:ring-green-400">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-green-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="candidate-asc">Candidate A-Z</SelectItem>
                    <SelectItem value="candidate-desc">Candidate Z-A</SelectItem>
                    <SelectItem value="job-asc">Job Title A-Z</SelectItem>
                    <SelectItem value="job-desc">Job Title Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {interviewsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading interviews...</p>
                  </div>
                </div>
              ) : interviewsError ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
                    <p className="text-destructive">Failed to load interviews</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refetchInterviews()} 
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate & Job</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type & Location</TableHead>
                    <TableHead>Status</TableHead>
                    {user?.role !== 'candidate' && <TableHead></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedInterviews.length > 0 ? sortedInterviews.map((interview) => (
                    <React.Fragment key={interview.id}>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium text-base flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            {interview.candidateName}
                          </div>
                          <div className="text-base text-muted-foreground flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-purple-600" />
                            {interview.jobTitle}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            {interview.company}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-base flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                            {new Date(interview.date).toLocaleDateString()}
                          </div>
                          <div className="text-base text-muted-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-600" />
                            {interview.time}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Timer className="w-4 h-4 text-amber-600" />
                            {interview.duration}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(interview.type)}
                          <div>
                            <div className="text-base font-medium capitalize">{interview.type}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-500" />
                              {interview.location}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(interview.status)}
                            <Badge className={getStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground capitalize flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-gray-500" />
                            {interview.round} Round
                          </div>
                        </div>
                      </TableCell>
                      {user?.role !== 'candidate' && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(interview.originalData)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Interview
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Interview
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                    
                    {/* Notes row - spans all columns */}
                    {interview.originalData?.notes?.[0]?.content && (
                      <TableRow key={`${interview.id}-notes`}>
                        <TableCell colSpan={user?.role === 'candidate' ? 5 : 6} className="border-t-0 pt-0 pb-4">
                          <div className="border-t pt-4">
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                              {interview.originalData.notes[0].content}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    </React.Fragment>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={user?.role === 'candidate' ? 5 : 6} className="text-center py-8">
                          <div className="text-muted-foreground">
                            <CalendarIcon className="w-8 h-8 mx-auto mb-2" />
                            <p>No interviews found</p>
                            <p className="text-sm">Try adjusting your search or filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      ) : viewMode === "calendar" ? (
        /* Calendar View */
        <div className="w-full max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="w-full">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date();
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    Previous Month
                  </Button>
                  
                  <h3 className="text-xl font-semibold">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date();
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    Next Month
                  </Button>
                </div>
                
                {/* Custom Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {/* Header */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {(() => {
                    const today = new Date();
                    const currentMonth = today.getMonth();
                    const currentYear = today.getFullYear();
                    const firstDay = new Date(currentYear, currentMonth, 1);
                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                    const startCalendar = new Date(firstDay);
                    startCalendar.setDate(startCalendar.getDate() - firstDay.getDay());
                    
                    const days = [];
                    for (let i = 0; i < 42; i++) {
                      const date = new Date(startCalendar);
                      date.setDate(startCalendar.getDate() + i);
                      days.push(date);
                    }
                    
                    return days.map((date, index) => {
                      const dateStr = getLocalDateString(date);
                      const dayInterviews = transformedInterviews.filter(interview => interview.date === dateStr);
                      const isCurrentMonth = date.getMonth() === currentMonth;
                      const isToday = date.toDateString() === today.toDateString();
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      
                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[120px] p-1 border border-border cursor-pointer transition-colors group relative
                            ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                            ${isToday ? 'bg-primary/10 border-primary' : ''}
                            ${isSelected ? 'bg-primary/20 border-primary' : ''}
                            hover:bg-muted/50
                          `}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className={`
                              text-sm font-medium
                              ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                              ${isToday ? 'text-primary font-bold' : ''}
                            `}>
                              {date.getDate()}
                            </div>
                            {user?.role !== 'candidate' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const dateStr = getLocalDateString(date);
                                  // Set default time to 10:00 (10:00 AM) for future dates, current time for today
                                  const today = new Date();
                                  const isToday = dateStr === getLocalDateString(today);
                                  const timeStr = isToday 
                                    ? new Date().toTimeString().slice(0, 5) // Current time if today
                                    : '10:00'; // Default to 10:00 (10 AM) for future dates
                                  setScheduleFormData(prev => ({
                                    ...prev,
                                    scheduledAt: dateStr,
                                    scheduledTime: timeStr
                                  }));
                                  setIsScheduleDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                          </div>
                          
                          {/* Interview Events */}
                          <div className="space-y-1">
                            {dayInterviews.slice(0, 3).map((interview, idx) => (
                              <div
                                key={interview.id}
                                className={`
                                  text-xs p-1 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity
                                  ${getStatusBackgroundColor(interview.status)}
                                `}
                                title={`${interview.time} - ${interview.candidateName} (${interview.jobTitle})`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setViewingInterview(interview);
                                  setIsViewDialogOpen(true);
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  {getTypeIcon(interview.type)}
                                  <span className="truncate">
                                    {interview.time} {interview.candidateName}
                                  </span>
                                </div>
                              </div>
                            ))}
                            
                            {/* Show more indicator */}
                            {dayInterviews.length > 3 && (
                              <div className="text-xs text-muted-foreground font-medium">
                                +{dayInterviews.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === "week" ? (
        /* Week View */
        <div className="w-full max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="w-full">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setDate(newDate.getDate() - 7);
                      setSelectedDate(newDate);
                    }}
                  >
                    Previous Week
                  </Button>
                  
                  <h3 className="text-xl font-semibold">
                    {(() => {
                      const startOfWeek = new Date(selectedDate || new Date());
                      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                      const endOfWeek = new Date(startOfWeek);
                      endOfWeek.setDate(endOfWeek.getDate() + 6);
                      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                    })()}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setDate(newDate.getDate() + 7);
                      setSelectedDate(newDate);
                    }}
                  >
                    Next Week
                  </Button>
                </div>
                
                {/* Week Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Header */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                    const startOfWeek = new Date(selectedDate || new Date());
                    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + idx);
                    const dateStr = getLocalDateString(date);
                    const dayInterviews = transformedInterviews.filter(interview => interview.date === dateStr);
                    const isToday = dateStr === getLocalDateString(new Date());
                    
                    return (
                      <div key={day} className="border rounded-lg">
                        <div className={`
                          p-2 border-b text-center font-medium
                          ${isToday ? 'bg-primary/10 text-primary' : 'bg-muted/30'}
                        `}>
                          <div className="text-sm">{day}</div>
                          <div className="text-lg font-bold">{date.getDate()}</div>
                        </div>
                        <div className="p-2 space-y-1 min-h-[400px]">
                          {user?.role !== 'candidate' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 mb-2 opacity-0 hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                const timeStr = isToday 
                                  ? new Date().toTimeString().slice(0, 5)
                                  : '10:00';
                                setScheduleFormData(prev => ({
                                  ...prev,
                                  scheduledAt: dateStr,
                                  scheduledTime: timeStr
                                }));
                                setIsScheduleDialogOpen(true);
                              }}
                            >
                              <Plus className="h-3 w-3 text-primary" />
                            </Button>
                          )}
                          {dayInterviews.map((interview) => (
                            <div
                              key={interview.id}
                              className={`
                                text-xs p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity
                                ${getStatusBackgroundColor(interview.status)}
                              `}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingInterview(interview);
                                setIsViewDialogOpen(true);
                              }}
                              title={`${interview.time} - ${interview.candidateName}`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {getTypeIcon(interview.type)}
                                <span className="font-medium">{interview.time}</span>
                              </div>
                              <div className="font-semibold truncate">{interview.candidateName}</div>
                              <div className="text-xs opacity-90 truncate">{interview.jobTitle}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : viewMode === "day" ? (
        /* Day View */
        <div className="w-full max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="w-full">
                {/* Day Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    Previous Day
                  </Button>
                  
                  <h3 className="text-xl font-semibold">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    Next Day
                  </Button>
                </div>
                
                {/* Day Timeline */}
                <div className="grid grid-cols-12 gap-4">
                  {/* Time Slots */}
                  <div className="col-span-2 space-y-2">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="h-16 text-sm text-muted-foreground text-right pr-2 pt-2">
                        {i.toString().padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>
                  
                  {/* Interview Schedule */}
                  <div className="col-span-10 border rounded-lg p-4">
                    <div className="relative min-h-[384px]">
                      {(() => {
                        const dateStr = getLocalDateString(selectedDate || new Date());
                        const dayInterviews = transformedInterviews
                          .filter(interview => interview.date === dateStr)
                          .sort((a, b) => {
                            const timeA = new Date(a.originalData?.scheduledAt || a.date + 'T' + a.time);
                            const timeB = new Date(b.originalData?.scheduledAt || b.date + 'T' + b.time);
                            return timeA.getTime() - timeB.getTime();
                          });
                        
                        return (
                          <div className="space-y-3">
                            {user?.role !== 'candidate' && (
                              <Button
                                variant="outline"
                                className="w-full mb-4"
                                onClick={() => {
                                  const timeStr = dateStr === getLocalDateString(new Date())
                                    ? new Date().toTimeString().slice(0, 5)
                                    : '10:00';
                                  setScheduleFormData(prev => ({
                                    ...prev,
                                    scheduledAt: dateStr,
                                    scheduledTime: timeStr
                                  }));
                                  setIsScheduleDialogOpen(true);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Schedule Interview
                              </Button>
                            )}
                            {dayInterviews.length > 0 ? (
                              dayInterviews.map((interview) => (
                                <div
                                  key={interview.id}
                                  className={`
                                    p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow
                                    ${getStatusBackgroundColor(interview.status)} text-white
                                  `}
                                  onClick={() => {
                                    setViewingInterview(interview);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        {getTypeIcon(interview.type)}
                                        <span className="font-bold text-base">{interview.time}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {interview.duration}
                                        </Badge>
                                      </div>
                                      <div className="font-semibold text-lg mb-1">{interview.candidateName}</div>
                                      <div className="text-sm opacity-90 mb-2">{interview.jobTitle}</div>
                                      {interview.location && interview.location !== 'TBD' && (
                                        <div className="flex items-center gap-1 text-xs opacity-80">
                                          <MapPin className="w-3 h-3" />
                                          {interview.location}
                                        </div>
                                      )}
                                      {interview.originalData?.notes?.[0]?.content && (
                                        <div className="mt-2 text-xs opacity-75 line-clamp-2">
                                          {interview.originalData.notes[0].content}
                                        </div>
                                      )}
                                    </div>
                                    <Badge className={getStatusColor(interview.status)}>
                                      {interview.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No interviews scheduled for this day</p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}