import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Users,
  Briefcase,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  MapPin,
  Building2,
  Calendar,
  Target,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { 
  useJobs, 
  useAgentCandidates,
  useCreateCandidateAssignment,
  useCandidateAssignmentStats
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

export default function AgentAssignmentDashboard() {
  const { user } = useAuth();
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentPriority, setAssignmentPriority] = useState('medium');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // API hooks
  const { 
    data: jobsResponse, 
    loading: jobsLoading, 
    error: jobsError, 
    refetch: refetchJobs 
  } = useJobs({
    page,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { 
    data: candidatesResponse, 
    loading: candidatesLoading, 
    error: candidatesError, 
    refetch: refetchCandidates 
  } = useAgentCandidates({
    page,
    limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { mutate: createAssignment, loading: createLoading } = useCreateCandidateAssignment({
    onSuccess: () => {
      setIsAssignDialogOpen(false);
      setSelectedCandidate(null);
      setSelectedJob(null);
      setAssignmentNotes('');
      setAssignmentPriority('medium');
      toast({
        title: "Success",
        description: "Candidate assigned successfully"
      });
    }
  });

  const { 
    data: statsResponse, 
    loading: statsLoading, 
    error: statsError 
  } = useCandidateAssignmentStats();

  // Extract data from API responses
  const jobs = jobsResponse || [];
  const candidates = candidatesResponse || [];
  const stats = statsResponse?.data || {};



  // Calculate dashboard summary from real data
  const dashboardSummary = {
    assignedHRs: stats.byStatus?.find((s: any) => s._id === 'active')?.count || 0,
    assignedCandidates: candidates.length,
    availableJobs: jobs.filter((job: any) => job.status === 'open').length,
    activeAssignments: stats.byStatus?.find((s: any) => s._id === 'active')?.count || 0,
    completedAssignments: stats.byStatus?.find((s: any) => s._id === 'completed')?.count || 0,
    pendingAssignments: stats.byStatus?.find((s: any) => s._id === 'rejected')?.count || 0,
  };

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
                         (job.companyId?.name && job.companyId.name.toLowerCase().includes(jobSearchTerm.toLowerCase()));
    const matchesUrgency = urgencyFilter === 'all' || job.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  const filteredCandidates = candidates.filter((candidate: any) => {
    if (!candidateSearchTerm) return true;
    
    const searchLower = candidateSearchTerm.toLowerCase();
    
    // Check userId fields if they exist
    const nameMatches = candidate.userId && (
      candidate.userId.firstName?.toLowerCase().includes(searchLower) ||
      candidate.userId.lastName?.toLowerCase().includes(searchLower)
    );
    
    // Check profile skills if they exist
    const skillMatches = candidate.profile?.skills && 
      candidate.profile.skills.some((skill: string) => 
        skill.toLowerCase().includes(searchLower)
      );
    
    return nameMatches || skillMatches;
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-red-200 text-red-900 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatSalary = (range: any) => {
    if (!range?.min || !range?.max) return 'Not specified';
    return `$${(range.min / 1000).toFixed(0)}k - $${(range.max / 1000).toFixed(0)}k`;
  };

  const handleAssignCandidate = () => {
    if (!selectedCandidate || !selectedJob) {
      toast({
        title: 'Error',
        description: 'Please select both a candidate and a job',
        variant: 'destructive',
      });
      return;
    }

    createAssignment({
      candidateId: selectedCandidate,
      assignedTo: user?.id || '', // This should be the HR user ID - you might need to add HR user selection
      jobId: selectedJob,
      priority: assignmentPriority,
      notes: assignmentNotes,
    });
  };

  if (jobsError || candidatesError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assignment Management</h1>
            <p className="text-muted-foreground">
              Manage job assignments and track candidate placements
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {jobsError?.detail || candidatesError?.detail || 'Failed to load data'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetchJobs()}>
                Retry Jobs
              </Button>
              <Button onClick={() => refetchCandidates()}>
                Retry Candidates
              </Button>
            </div>
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
          <h1 className="text-3xl font-bold">Assignment Management</h1>
          <p className="text-muted-foreground">
            Manage job assignments and track candidate placements
          </p>
        </div>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={jobsLoading || candidatesLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Candidate to Job</DialogTitle>
              <DialogDescription>
                Select a candidate and job to create a new assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="candidate">Candidate</Label>
                <Select value={selectedCandidate || ''} onValueChange={setSelectedCandidate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate: any) => (
                      <SelectItem key={candidate._id} value={candidate._id}>
                        {candidate.userId ? 
                          `${candidate.userId.firstName} ${candidate.userId.lastName}` : 
                          'Unnamed Candidate'
                        } - {candidate.profile?.skills?.slice(0, 2).join(', ') || 'No skills'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="job">Job</Label>
                <Select value={selectedJob || ''} onValueChange={setSelectedJob}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job: any) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title} - {job.companyId?.name || 'Unknown Company'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={assignmentPriority} onValueChange={setAssignmentPriority}>
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
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this assignment..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAssignCandidate} disabled={createLoading} className="flex-1">
                  {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Assign'}
                </Button>
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardSummary.assignedHRs}
                </p>
                <p className="text-sm text-muted-foreground">Assigned HRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {candidatesLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardSummary.assignedCandidates}
                </p>
                <p className="text-sm text-muted-foreground">My Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {jobsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardSummary.availableJobs}
                </p>
                <p className="text-sm text-muted-foreground">Available Jobs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardSummary.activeAssignments}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardSummary.completedAssignments}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {statsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : dashboardSummary.pendingAssignments}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            My Jobs ({filteredJobs.length})
          </TabsTrigger>
          <TabsTrigger value="candidates" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Candidates ({filteredCandidates.length})
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Jobs from Assigned HR Users
                {jobsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={jobSearchTerm}
                    onChange={(e) => setJobSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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
              {jobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Loading jobs...</span>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-sm">No jobs match your current filters.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Posted By</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job: any) => (
                      <TableRow key={job._id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.companyId?.name || 'Unknown Company'}</div>
                            <div className="text-sm text-muted-foreground">{job.companyId?.industry || 'Unknown Industry'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location || 'Remote'}
                          </div>
                        </TableCell>
                        <TableCell>{formatSalary(job.salaryRange)}</TableCell>
                        <TableCell>
                          <Badge className={getUrgencyColor(job.urgency)} variant="outline">
                            {job.urgency || 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{job.createdBy?.firstName} {job.createdBy?.lastName}</div>
                            <div className="text-sm text-muted-foreground">{job.createdBy?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(job.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setSelectedJob(job._id);
                                setIsAssignDialogOpen(true);
                              }}>
                                Assign Candidate
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Candidates Tab */}
        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Candidates Assigned to Me
                {candidatesLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              </CardTitle>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <Input
                    placeholder="Search candidates..."
                    value={candidateSearchTerm}
                    onChange={(e) => setCandidateSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {candidatesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="ml-2">Loading candidates...</span>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No candidates found</h3>
                  <p className="text-sm">No candidates match your current filters.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate: any) => (
                      <TableRow key={candidate._id}>
                        <TableCell className="font-medium">
                          {candidate.userId ? 
                            `${candidate.userId.firstName} ${candidate.userId.lastName}` : 
                            'Unnamed Candidate'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {candidate.profile?.skills?.slice(0, 3).map((skill: string) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {candidate.profile?.skills?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{candidate.profile.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {candidate.profile?.location || 'Not specified'}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-muted-foreground truncate">
                            {candidate.profile?.summary || 'No summary available'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{candidate.userId?.email || 'No email'}</div>
                            <div className="text-muted-foreground">{candidate.profile?.phoneNumber || 'No phone'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={() => {
                                setSelectedCandidate(candidate._id);
                                setIsAssignDialogOpen(true);
                              }}>
                                Assign to Job
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
