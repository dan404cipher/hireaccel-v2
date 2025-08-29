import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview, useInterviewStats } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

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
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Table as TableIcon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Removed mock data - will use real API data

export default function InterviewManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Create stable API parameters
  const interviewsParams = useMemo(() => ({
    page,
    limit: 20,
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  }), [page, debouncedSearchTerm, statusFilter]);

  // Fetch data using hooks
  const { data: interviewsResponse, loading: interviewsLoading, error: interviewsError, refetch: refetchInterviews } = useInterviews(interviewsParams);
  const { data: statsResponse } = useInterviewStats();
  const { mutate: createInterview, loading: createLoading } = useCreateInterview();
  const { mutate: updateInterview, loading: updateLoading } = useUpdateInterview();
  const { mutate: deleteInterview, loading: deleteLoading } = useDeleteInterview();

  // Extract interviews data (handle both array and {data: []} formats)
  const interviews = Array.isArray(interviewsResponse) ? interviewsResponse : ((interviewsResponse as any)?.data || []);
  const meta = Array.isArray(interviewsResponse) ? null : (interviewsResponse as any)?.meta;


  // Transform API data to the format expected by the UI
  const transformedInterviews = interviews.map((interview: any) => ({
    id: interview._id || interview.id,
    candidateName: interview.applicationId?.candidateId?.userId?.firstName && interview.applicationId?.candidateId?.userId?.lastName 
      ? `${interview.applicationId.candidateId.userId.firstName} ${interview.applicationId.candidateId.userId.lastName}`
      : "Unknown Candidate",
    jobTitle: interview.applicationId?.jobId?.title || "Unknown Job",
    company: interview.applicationId?.jobId?.companyId?.name || "Unknown Company",
    agent: interview.interviewers?.[0]?.firstName && interview.interviewers?.[0]?.lastName
      ? `${interview.interviewers[0].firstName} ${interview.interviewers[0].lastName}`
      : "Unassigned",
    date: new Date(interview.scheduledAt).toISOString().split('T')[0],
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
      const today = new Date().toISOString().split('T')[0];
      matchesDate = interview.date === today;
    } else if (dateFilter === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      matchesDate = interview.date === tomorrow.toISOString().split('T')[0];
    } else if (dateFilter === "week") {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const interviewDate = new Date(interview.date);
      matchesDate = interviewDate <= weekFromNow && interviewDate >= new Date();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-info text-info-foreground";
      case "confirmed": return "bg-success text-success-foreground";
      case "completed": return "bg-primary text-primary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "cancelled": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
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
      case "video": return <Video className="w-4 h-4" />;
      case "phone": return <Phone className="w-4 h-4" />;
      case "in-person": return <MapPin className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-success" />;
      case "cancelled": return <XCircle className="w-4 h-4 text-destructive" />;
      case "pending": return <AlertCircle className="w-4 h-4 text-warning" />;
      default: return <Clock className="w-4 h-4 text-info" />;
    }
  };

  const todayInterviews = transformedInterviews.filter(interview => {
    const today = new Date().toISOString().split('T')[0];
    return interview.date === today && interview.status !== 'cancelled';
  });

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Management</h1>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
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
              Calendar
            </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Candidate</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john">John Smith</SelectItem>
                      <SelectItem value="emily">Emily Chen</SelectItem>
                      <SelectItem value="michael">Michael Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Position</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">Senior React Developer</SelectItem>
                      <SelectItem value="marketing">Marketing Manager</SelectItem>
                      <SelectItem value="data">Data Analyst</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Interview Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Round</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select round" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screening">HR Screening</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Schedule Interview</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Interviews</p>
                <p className="text-2xl font-bold text-primary">{stats.todayCount || todayInterviews.length}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-info">
                  {stats.byStatus?.find((s: any) => s._id === 'scheduled')?.count || 0}
                </p>
              </div>
              <CalendarPlus className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {stats.byStatus?.find((s: any) => s._id === 'completed')?.count || 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.byStatus?.find((s: any) => s._id === 'confirmed')?.count || 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === "table" ? (
        /* Table View */
        <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>Interview Schedule</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search interviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="w-4 h-4 mr-2" />
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
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="tomorrow">Tomorrow</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
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
                    <TableHead>Agent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredInterviews.length > 0 ? filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{interview.candidateName}</div>
                          <div className="text-sm text-muted-foreground">{interview.jobTitle}</div>
                          <div className="text-xs text-muted-foreground">{interview.company}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{new Date(interview.date).toLocaleDateString()}</div>
                          <div className="text-sm text-muted-foreground">{interview.time}</div>
                          <div className="text-xs text-muted-foreground">{interview.duration}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(interview.type)}
                          <div>
                            <div className="text-sm font-medium capitalize">{interview.type}</div>
                            <div className="text-xs text-muted-foreground">{interview.location}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{interview.agent}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(interview.status)}
                          <Badge className={getStatusColor(interview.status)}>
                            {interview.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Interview</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Cancel Interview
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
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
      ) : (
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
                      const dateStr = date.toISOString().split('T')[0];
                      const dayInterviews = transformedInterviews.filter(interview => interview.date === dateStr);
                      const isCurrentMonth = date.getMonth() === currentMonth;
                      const isToday = date.toDateString() === today.toDateString();
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      
                      return (
                        <div
                          key={index}
                          className={`
                            min-h-[120px] p-1 border border-border cursor-pointer transition-colors
                            ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                            ${isToday ? 'bg-primary/10 border-primary' : ''}
                            ${isSelected ? 'bg-primary/20 border-primary' : ''}
                            hover:bg-muted/50
                          `}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className={`
                            text-sm font-medium mb-1
                            ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                            ${isToday ? 'text-primary font-bold' : ''}
                          `}>
                            {date.getDate()}
                          </div>
                          
                          {/* Interview Events */}
                          <div className="space-y-1">
                            {dayInterviews.slice(0, 3).map((interview, idx) => (
                              <div
                                key={interview.id}
                                className={`
                                  text-xs p-1 rounded text-white truncate
                                  ${getStatusBackgroundColor(interview.status)}
                                `}
                                title={`${interview.time} - ${interview.candidateName} (${interview.jobTitle})`}
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
      )}
    </div>
  );
}