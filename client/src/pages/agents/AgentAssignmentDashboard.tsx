import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
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
  DialogFooter,
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
  XCircle,
  Star,
  MapPin,
  Building2,
  Calendar,
  Loader2,
  UserCheck,
  FileText,
  MessageSquare,
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
  useCreateCandidateAssignment,
  useMyAgentAssignment,
  useAgentCandidates,
  useAgentAssignmentsList,
  useAgentAssignmentDetails,
  useUsers
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';

// Format custom ID to trim leading zeros (e.g., CAND00004 -> CAND4)
const formatCustomId = (customId: string | undefined): string => {
  if (!customId) return 'N/A';
  
  // Match pattern like CAND00004, HR00001, etc.
  const match = customId.match(/^([A-Z]+)(0+)(\d+)$/);
  if (match) {
    const [, prefix, zeros, number] = match;
    return `${prefix}${number}`;
  }
  
  // If pattern doesn't match, return as is
  return customId;
};

// Component for candidate dropdown item with avatar and ID
const CandidateDropdownItem = ({ candidate, onSelect }: { candidate: any; onSelect: () => void }) => {
  const profilePhotoFileId = candidate.userId?.profilePhotoFileId;
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <div
      className="px-3 py-2 hover:bg-accent cursor-pointer text-sm flex items-center gap-3"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent input blur
        onSelect();
      }}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        {authenticatedImageUrl ? (
          <AvatarImage src={authenticatedImageUrl} alt={`${candidate.userId?.firstName} ${candidate.userId?.lastName}`} />
        ) : null}
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {candidate.userId?.firstName?.[0] || ''}{candidate.userId?.lastName?.[0] || ''}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {candidate.userId?.firstName} {candidate.userId?.lastName}
        </div>
        {candidate.userId?.customId && (
          <div className="text-xs text-muted-foreground font-mono">
            {formatCustomId(candidate.userId.customId)}
          </div>
        )}
      </div>
    </div>
  );
};

// Component to display candidate avatar with profile picture support
const CandidateAvatar = ({ candidate, onClick }: { candidate: any; onClick?: () => void }) => {
  const profilePhotoFileId = candidate.userId?.profilePhotoFileId;
  const showProfilePicture = !!profilePhotoFileId;
  
  const profilePhotoUrl = showProfilePicture
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);

  const avatarContent = (
    <Avatar className="w-8 h-8 flex-shrink-0">
      {showProfilePicture && authenticatedImageUrl ? (
        <AvatarImage 
          src={authenticatedImageUrl || ''} 
          alt={`${candidate.userId?.firstName} ${candidate.userId?.lastName}`}
        />
      ) : null}
      <AvatarFallback className="text-xs font-semibold text-white bg-purple-600">
        {candidate.userId?.firstName?.[0] || ''}{candidate.userId?.lastName?.[0] || ''}
      </AvatarFallback>
    </Avatar>
  );

  if (onClick) {
    return (
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        {avatarContent}
      </div>
    );
  }

  return avatarContent;
};

// Component to display HR avatar with profile picture support
const HRAvatar = ({ hr, onClick }: { hr: any; onClick?: () => void }) => {
  const profilePhotoFileId = hr.profilePhotoFileId;
  const showProfilePicture = !!profilePhotoFileId;
  
  const profilePhotoUrl = showProfilePicture
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);

  const avatarContent = (
    <Avatar className="w-8 h-8 flex-shrink-0">
      {showProfilePicture && authenticatedImageUrl ? (
        <AvatarImage 
          src={authenticatedImageUrl || ''} 
          alt={`${hr.firstName} ${hr.lastName}`}
        />
      ) : null}
      <AvatarFallback className="text-xs font-semibold text-white bg-blue-600">
        {hr.firstName?.[0] || ''}{hr.lastName?.[0] || ''}
      </AvatarFallback>
    </Avatar>
  );

  if (onClick) {
    return (
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        {avatarContent}
      </div>
    );
  }

  return avatarContent;
};

// Component to display job avatar (using company logo)
const JobAvatar = ({ job, onClick }: { job: any; onClick?: () => void }) => {
  const companyName = job.companyId?.name || 'Unknown Company';
  
  // Extract company logo file ID from various formats
  const logoFileId = job.companyId?.logoFileId?._id || job.companyId?.logoFileId?.toString() || job.companyId?.logoFileId;
  
  // Construct authenticated API endpoint URL
  const logoUrl = logoFileId 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/company-logo/${logoFileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(logoUrl);
  
  // Memoize initials calculation
  const initials = companyName
    .split(' ')
    .map((word: string) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const avatarContent = (
    <Avatar className="w-8 h-8 flex-shrink-0">
      {authenticatedImageUrl ? (
        <AvatarImage 
          src={authenticatedImageUrl || ''} 
          alt={companyName} 
        />
      ) : null}
      <AvatarFallback className="text-xs font-semibold text-white bg-blue-600">
        {initials || <Briefcase className="w-4 h-4" />}
      </AvatarFallback>
    </Avatar>
  );

  if (onClick) {
    return (
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        {avatarContent}
      </div>
    );
  }

  return avatarContent;
};

export default function AgentAssignmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get initial tab from localStorage or default to 'jobs'
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('agentAssignmentActiveTab');
    return savedTab || 'jobs';
  });
  
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('');
  const [hrSearchTerm, setHrSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentPriority, setAssignmentPriority] = useState('medium');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [candidateDialogSearch, setCandidateDialogSearch] = useState('');
  const [candidatePopoverOpen, setCandidatePopoverOpen] = useState(false);
  const [isCandidateSearchActive, setIsCandidateSearchActive] = useState(false);
  const [isViewNotesDialogOpen, setIsViewNotesDialogOpen] = useState(false);
  const [selectedAgentForNotes, setSelectedAgentForNotes] = useState<string>('');
  const [selectedCandidateForNotes, setSelectedCandidateForNotes] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Save tab to localStorage when it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('agentAssignmentActiveTab', value);
  };

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

  // Get agent's assignment details to see assigned HRs
  const { 
    data: agentAssignmentResponse, 
    loading: agentAssignmentLoading, 
    error: agentAssignmentError,
    refetch: refetchAgentAssignment
  } = useMyAgentAssignment();

  // For admin/superadmin: Get all agents to select from
  const {
    data: agentsResponse,
  } = useUsers({
    role: 'agent',
    limit: 100,
    status: 'active',
  });

  // For admin/superadmin: Get all HR users
  const {
    data: allHRsResponse,
  } = useUsers({
    role: 'hr',
    limit: 100,
    status: 'active',
  });

  // For admin/superadmin: Get all agent assignments to find candidate's assignment
  const {
    data: allAssignmentsResponse,
  } = useAgentAssignmentsList();

  // Get selected agent's assignment details (for admin/superadmin) - only fetch when agent is selected and no candidate is selected
  const shouldFetchAgentAssignment = (user?.role === 'admin' || user?.role === 'superadmin') && selectedAgentForNotes && !selectedCandidateForNotes;
  const {
    data: selectedAgentAssignmentResponse,
    loading: selectedAgentAssignmentLoading,
  } = useAgentAssignmentDetails(shouldFetchAgentAssignment ? selectedAgentForNotes : '');

  // Get candidates assigned to the agent
  const { 
    data: candidatesResponse, 
    loading: candidatesLoading, 
    error: candidatesError,
    refetch: refetchCandidates
  } = useAgentCandidates({
    page,
    limit,
    search: candidateSearchTerm || undefined,
  });

  // Refresh data when component comes into focus (e.g., when user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      refetchAgentAssignment();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchAgentAssignment]);

  // Use the general endpoint for all roles (it now has proper validation for candidate-job combinations)
  const { mutate: createAssignment, loading: createLoading } = useCreateCandidateAssignment({
    onSuccess: () => {
      setIsAssignDialogOpen(false);
      setSelectedCandidate(null);
      setSelectedJob(null);
      setAssignmentNotes('');
      setAssignmentPriority('medium');
      setCandidateDialogSearch('');
      setCandidatePopoverOpen(false);
      setIsCandidateSearchActive(false);
      toast({
        title: "Success",
        description: "Candidate assigned successfully"
      });
      refetchJobs();
      refetchCandidates();
    }
  });

  // Extract data from API responses
  const jobs = jobsResponse || [];
  const agentAssignment = (agentAssignmentResponse as any)?.data || agentAssignmentResponse;
  const candidates = ((candidatesResponse as any)?.data || candidatesResponse || []); // Handle both response formats

  // Get selected candidate display info
  const selectedCandidateDisplay = selectedCandidate 
    ? candidates.find((c: any) => c._id === selectedCandidate)
    : null;
  const agents = Array.isArray(agentsResponse) 
    ? agentsResponse 
    : (agentsResponse as any)?.data || [];
  const allHRsFromAPI = Array.isArray(allHRsResponse) 
    ? allHRsResponse 
    : (allHRsResponse as any)?.data || [];
  const allAssignments = Array.isArray(allAssignmentsResponse) 
    ? allAssignmentsResponse 
    : (allAssignmentsResponse as any)?.data || [];

  // Find the agent assignment that contains the selected candidate
  const findAssignmentForCandidate = (candidateId: string) => {
    if (!allAssignments || allAssignments.length === 0) return null;
    return allAssignments.find((assignment: any) => {
      if (!assignment.assignedCandidates || assignment.assignedCandidates.length === 0) return false;
      return assignment.assignedCandidates.some((c: any) => {
        // Handle both populated and unpopulated candidate references
        // c could be a populated candidate object with _id or userId
        // or it could be just an ObjectId string
        const candidateDocId = c._id ? (c._id.toString ? c._id.toString() : c._id) : c.toString();
        const candidateUserId = c.userId?._id ? (c.userId._id.toString ? c.userId._id.toString() : c.userId._id) : null;
        return candidateDocId === candidateId || candidateUserId === candidateId;
      });
    });
  };

  // Determine which assignment to show notes for
  let assignmentForNotes = agentAssignment;
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    if (selectedCandidateForNotes) {
      // Find assignment for selected candidate
      const candidateAssignment = findAssignmentForCandidate(selectedCandidateForNotes);
      assignmentForNotes = candidateAssignment || null;
    } else if (selectedAgentForNotes) {
      // Use selected agent's assignment
      assignmentForNotes = ((selectedAgentAssignmentResponse as any)?.data || selectedAgentAssignmentResponse);
    } else {
      assignmentForNotes = null;
    }
  }











  // Helper function to check if search term matches ID flexibly
  const matchesId = (searchTerm: string, customId: string): boolean => {
    if (!customId || !searchTerm) return false;
    
    const searchUpper = searchTerm.toUpperCase().trim();
    const idUpper = customId.toUpperCase();
    
    // Direct match (case insensitive substring or exact)
    if (idUpper.includes(searchUpper) || idUpper === searchUpper) {
      return true;
    }
    
    // Check formatted ID match
    const formattedId = formatCustomId(customId).toUpperCase();
    if (formattedId.includes(searchUpper) || formattedId === searchUpper) {
      return true;
    }
    
    // Extract prefix and number from both search term and ID
    // Pattern: PREFIX followed by optional leading zeros and digits
    const idMatch = idUpper.match(/^([A-Z]+)(0*)(\d+)$/);
    const searchMatch = searchUpper.match(/^([A-Z]+)(0*)(\d+)$/);
    
    if (idMatch && searchMatch) {
      const [, idPrefix, , idNumber] = idMatch;
      const [, searchPrefix, , searchNumber] = searchMatch;
      
      // Match if prefix matches and the numeric part matches
      // This handles: "HR2" matches "HR000002", "HR002" matches "HR000002", etc.
      if (idPrefix === searchPrefix && idNumber === searchNumber) {
        return true;
      }
    }
    
    // Also check if search term without leading zeros matches ID with leading zeros
    // and vice versa
    const idWithoutZeros = idUpper.replace(/^([A-Z]+)0+(\d+)$/, '$1$2');
    const searchWithoutZeros = searchUpper.replace(/^([A-Z]+)0+(\d+)$/, '$1$2');
    
    if (idWithoutZeros === searchWithoutZeros && idWithoutZeros !== idUpper) {
      return true;
    }
    
    return false;
  };

  const filteredJobs = jobs.filter((job: any) => {
    if (!jobSearchTerm) {
      const matchesUrgency = urgencyFilter === 'all' || job.urgency === urgencyFilter;
      return matchesUrgency;
    }
    
    const searchLower = jobSearchTerm.toLowerCase();
    const jobId = job.jobId || '';
    
    // Check title and company name
    const nameMatches = (
      job.title.toLowerCase().includes(searchLower) ||
      (job.companyId?.name && job.companyId.name.toLowerCase().includes(searchLower))
    );
    
    // Check jobId with flexible matching
    const idMatches = matchesId(jobSearchTerm, jobId);
    
    const matchesSearch = nameMatches || idMatches;
    const matchesUrgency = urgencyFilter === 'all' || job.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  // Determine which HRs to show
  // For admin/superadmin: show ALL HR users in the system
  // For agents: show only HRs assigned to them
  const allHRs = (user?.role === 'admin' || user?.role === 'superadmin') 
    ? allHRsFromAPI 
    : (agentAssignment?.assignedHRs || []);

  // Determine which candidates to show
  // useAgentCandidates already returns all candidates for admin/superadmin, so use it directly
  const allCandidatesForDisplay = candidates;

  const filteredCandidates = allCandidatesForDisplay.filter((candidate: any) => {
    if (!candidateSearchTerm) return true;
    
    const searchLower = candidateSearchTerm.toLowerCase();
    const customId = candidate.userId?.customId || '';
    
    // Check firstName, lastName, and email
    const nameMatches = (
      candidate.userId?.firstName?.toLowerCase().includes(searchLower) ||
      candidate.userId?.lastName?.toLowerCase().includes(searchLower) ||
      candidate.userId?.email?.toLowerCase().includes(searchLower)
    );
    
    // Check customId with flexible matching
    const idMatches = matchesId(candidateSearchTerm, customId);
    
    return nameMatches || idMatches;
  });

  // Filter HR users based on search term
  const filteredHRs = allHRs.filter((hr: any) => {
    if (!hrSearchTerm) return true;
    
    const searchLower = hrSearchTerm.toLowerCase();
    const customId = hr.customId || '';
    
    // Check firstName, lastName, and email
    const nameMatches = (
      hr.firstName?.toLowerCase().includes(searchLower) ||
      hr.lastName?.toLowerCase().includes(searchLower) ||
      hr.email?.toLowerCase().includes(searchLower)
    );
    
    // Check customId with flexible matching
    const idMatches = matchesId(hrSearchTerm, customId);
    
    return nameMatches || idMatches;
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

  // Helper function to get current role from candidate experience
  const getCurrentRole = (candidate: any) => {
    if (!candidate.profile?.experience || !Array.isArray(candidate.profile.experience)) {
      return 'N/A';
    }
    const currentExperience = candidate.profile.experience.find((exp: any) => exp.current === true);
    if (currentExperience) {
      return `${currentExperience.position} at ${currentExperience.company}`;
    }
    // If no current role, get the most recent experience
    const sortedExperiences = [...candidate.profile.experience].sort((a: any, b: any) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA;
    });
    if (sortedExperiences.length > 0) {
      return `${sortedExperiences[0].position} at ${sortedExperiences[0].company}`;
    }
    return 'N/A';
  };

  // Helper function to calculate total experience in years
  const getExperienceSummary = (candidate: any) => {
    if (!candidate.profile?.experience || !Array.isArray(candidate.profile.experience) || candidate.profile.experience.length === 0) {
      return 'No experience';
    }
    
    let totalMonths = 0;
    const now = new Date();
    
    candidate.profile.experience.forEach((exp: any) => {
      if (!exp.startDate) return;
      
      const startDate = new Date(exp.startDate);
      const endDate = exp.current || !exp.endDate ? now : new Date(exp.endDate);
      
      // Calculate months between start and end
      const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
      const monthsDiff = endDate.getMonth() - startDate.getMonth();
      const totalMonthsForThisRole = yearsDiff * 12 + monthsDiff;
      
      // Ensure at least 1 month if there's any overlap
      totalMonths += Math.max(totalMonthsForThisRole, 0);
    });
    
    // Convert months to years
    const totalYears = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    
    if (totalYears === 0 && remainingMonths === 0) {
      return 'Less than 1 year';
    }
    
    if (totalYears === 0) {
      return `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
    
    if (remainingMonths === 0) {
      return `${totalYears} ${totalYears === 1 ? 'year' : 'years'}`;
    }
    
    return `${totalYears} ${totalYears === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
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

    // The backend automatically determines the HR user from the job's createdBy field
    // and properly validates that the same candidate can be assigned to different jobs
    createAssignment({
      candidateId: selectedCandidate,
      jobId: selectedJob,
      priority: assignmentPriority as 'low' | 'medium' | 'high' | 'urgent',
      notes: assignmentNotes,
    });
  };

  if (jobsError || agentAssignmentError || candidatesError) {
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
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {jobsError?.detail || agentAssignmentError?.detail || candidatesError?.detail || 'Failed to load data'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => refetchJobs()}>
                Retry Jobs
              </Button>
              <Button onClick={() => refetchCandidates()}>
                Retry Candidates
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry All
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
            <Button disabled={jobsLoading || agentAssignmentLoading || candidatesLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Assign Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" id="assign-candidate-dialog">
            <DialogHeader>
              <DialogTitle>Assign Candidate to Job</DialogTitle>
              <DialogDescription>
                Select a candidate and job to create a new assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="candidate">Candidate</Label>
                <div className="relative">
                  {isCandidateSearchActive ? (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Type to search candidates..."
                          value={candidateDialogSearch}
                          onChange={(e) => setCandidateDialogSearch(e.target.value)}
                          onBlur={() => {
                            // Close search if clicking outside, but delay to allow item selection
                            setTimeout(() => {
                              setIsCandidateSearchActive(false);
                              if (!selectedCandidate) {
                                setCandidateDialogSearch('');
                              }
                            }, 200);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                              setIsCandidateSearchActive(false);
                              setCandidateDialogSearch('');
                            }
                          }}
                          autoFocus
                          className="pl-8"
                        />
                      </div>
                      {candidateDialogSearch && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-auto">
                          {candidates
                            .filter((candidate: any) => {
                              const searchLower = candidateDialogSearch.toLowerCase();
                              const firstName = candidate.userId?.firstName?.toLowerCase() || '';
                              const lastName = candidate.userId?.lastName?.toLowerCase() || '';
                              const email = candidate.userId?.email?.toLowerCase() || '';
                              const customId = candidate.userId?.customId?.toLowerCase() || '';
                              return firstName.includes(searchLower) || 
                                     lastName.includes(searchLower) || 
                                     email.includes(searchLower) ||
                                     customId.includes(searchLower) ||
                                     `${firstName} ${lastName}`.includes(searchLower);
                            })
                            .length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No candidates found
                            </div>
                          ) : (
                            candidates
                              .filter((candidate: any) => {
                                const searchLower = candidateDialogSearch.toLowerCase();
                                const firstName = candidate.userId?.firstName?.toLowerCase() || '';
                                const lastName = candidate.userId?.lastName?.toLowerCase() || '';
                                const email = candidate.userId?.email?.toLowerCase() || '';
                                const customId = candidate.userId?.customId?.toLowerCase() || '';
                                return firstName.includes(searchLower) || 
                                       lastName.includes(searchLower) || 
                                       email.includes(searchLower) ||
                                       customId.includes(searchLower) ||
                                       `${firstName} ${lastName}`.includes(searchLower);
                              })
                              .map((candidate: any) => (
                                <CandidateDropdownItem
                                  key={candidate._id}
                                  candidate={candidate}
                                  onSelect={() => {
                                    setSelectedCandidate(candidate._id);
                                    setIsCandidateSearchActive(false);
                                    setCandidateDialogSearch('');
                                  }}
                                />
                              ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setIsCandidateSearchActive(true)}
                    >
                      {selectedCandidateDisplay ? (
                        <div className="flex items-center gap-3 w-full">
                          <CandidateAvatar candidate={selectedCandidateDisplay} />
                          <div className="flex-1 min-w-0 text-left">
                            <div className="font-medium truncate">
                              {selectedCandidateDisplay.userId?.firstName} {selectedCandidateDisplay.userId?.lastName}
                            </div>
                            {selectedCandidateDisplay.userId?.customId && (
                              <div className="text-xs text-muted-foreground font-mono">
                                {formatCustomId(selectedCandidateDisplay.userId.customId)}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="truncate">Select candidate...</span>
                      )}
                    </Button>
                  )}
                </div>
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



      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            My Jobs ({filteredJobs.length})
          </TabsTrigger>
        <TabsTrigger value="candidates" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          My Candidates ({allCandidatesForDisplay.length})
        </TabsTrigger>
          <TabsTrigger value="hrs" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            My HRs ({allHRs.length})
          </TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Jobs from Assigned HR Users
                  {jobsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
                <div className="flex gap-4 items-center">
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
                  <p className="text-sm">
                    {agentAssignment?.assignedHRs?.length === 0 
                      ? 'No HR managers are currently assigned to you. Please contact an administrator to get assigned to HR managers.'
                      : 'No jobs match your current filters or no jobs have been posted by your assigned HR managers yet.'
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
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
                        <TableCell>
                          {job.jobId && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {formatCustomId(job.jobId)}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <JobAvatar 
                              job={job}
                              onClick={() => {
                                navigate(`/dashboard/jobs/${job.jobId || job._id}`);
                              }}
                            />
                            <div>
                              <p 
                                className="font-medium text-base cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                onClick={() => {
                                  navigate(`/dashboard/jobs/${job.jobId || job._id}`);
                                }}
                              >
                                {job.title}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p 
                            className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => {
                              if (job.companyId?._id) {
                                navigate(`/dashboard/companies/${job.companyId._id}`);
                              }
                            }}
                          >
                            {job.companyId?.name || 'Unknown Company'}
                          </p>
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
                          <div className="flex items-center gap-3">
                            {job.createdBy && (
                              <HRAvatar 
                                hr={job.createdBy}
                                onClick={() => {
                                  if (job.createdBy?.customId) {
                                    navigate(`/dashboard/hr-profile/${job.createdBy.customId}`);
                                  }
                                }}
                              />
                            )}
                            <div>
                              <p 
                                className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                onClick={() => {
                                  if (job.createdBy?.customId) {
                                    navigate(`/dashboard/hr-profile/${job.createdBy.customId}`);
                                  }
                                }}
                              >
                                {job.createdBy?.firstName} {job.createdBy?.lastName}
                              </p>
                              <div className="text-sm text-muted-foreground">{job.createdBy?.email}</div>
                            </div>
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
                              <DropdownMenuItem onClick={() => {
                                navigate(`/dashboard/jobs/${job.jobId || job.id || job._id}`);
                              }}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setIsViewNotesDialogOpen(true)}>
                                View Notes
                              </DropdownMenuItem>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Candidates Assigned to Me
                  {candidatesLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                </CardTitle>
                <div className="flex items-center gap-4">
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
                      <TableHead>Contact</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCandidates.map((candidate: any) => (
                      <TableRow key={candidate._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <CandidateAvatar 
                              candidate={candidate}
                              onClick={() => {
                                if (candidate.userId?.customId) {
                                  navigate(`/dashboard/candidates/${candidate.userId.customId}`);
                                }
                              }}
                            />
                            <div>
                              <p 
                                className="font-medium text-base cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                onClick={() => {
                                  if (candidate.userId?.customId) {
                                    navigate(`/dashboard/candidates/${candidate.userId.customId}`);
                                  }
                                }}
                              >
                                {candidate.userId?.firstName} {candidate.userId?.lastName}
                              </p>
                              <Badge variant="outline" className="font-mono text-xs mt-1">
                                {formatCustomId(candidate.userId?.customId)}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{candidate.userId?.email}</div>
                            {candidate.profile?.phoneNumber && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {candidate.profile.phoneNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getCurrentRole(candidate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {getExperienceSummary(candidate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {candidate.status || 'Active'}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => {
                                // Make sure we have a valid userId and customId before navigating
                                if (candidate.userId?.customId) {
                                  navigate(`/dashboard/candidates/${candidate.userId.customId}`);
                                } else {
                                  toast({
                                    title: "Error",
                                    description: "Cannot view profile: Invalid candidate data",
                                    variant: "destructive"
                                  });
                                }
                              }}>
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                if (user?.role === 'admin' || user?.role === 'superadmin') {
                                  setSelectedCandidateForNotes(candidate._id);
                                  setSelectedAgentForNotes('');
                                }
                                setIsViewNotesDialogOpen(true);
                              }}>
                                View Notes
                              </DropdownMenuItem>
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

        {/* HRs Tab */}
        <TabsContent value="hrs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  HR Users Assigned to Me
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <Input
                      placeholder="Search HR users..."
                      value={hrSearchTerm}
                      onChange={(e) => setHrSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {allHRs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No HR users assigned</h3>
                  <p className="text-sm">
                    {user?.role === 'admin' || user?.role === 'superadmin'
                      ? 'No HR users are currently assigned to any agents.'
                      : 'You don\'t have any HR users assigned to you yet.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Assigned Candidates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentAssignmentLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                          <p>Loading HR users...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredHRs && filteredHRs.length > 0 ? (
                      filteredHRs.map((hr: any) => (
                        <TableRow key={hr._id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <HRAvatar 
                                hr={hr}
                                onClick={() => {
                                  if (hr.customId) {
                                    navigate(`/dashboard/hr-profile/${hr.customId}`);
                                  }
                                }}
                              />
                              <div>
                                <p 
                                  className="font-medium text-base cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                  onClick={() => {
                                    if (hr.customId) {
                                      navigate(`/dashboard/hr-profile/${hr.customId}`);
                                    }
                                  }}
                                >
                                  {hr.firstName} {hr.lastName}
                                </p>
                                <Badge variant="outline" className="font-mono text-xs mt-1">
                                  {formatCustomId(hr.customId)}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{hr.email}</div>
                              {hr.phoneNumber && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {hr.phoneNumber}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {hr.companyName || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {hr.assignedCandidatesCount ?? 0} candidates
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
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
                                  navigate(`/dashboard/hr-profile/${hr.customId || hr._id}`);
                                }}>
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsViewNotesDialogOpen(true)}>
                                  View Notes
                                </DropdownMenuItem>
                                <DropdownMenuItem>Contact</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : hrSearchTerm ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No HR users found</p>
                          <p className="text-sm">No HR users match your search criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No HR users assigned</p>
                          <p className="text-sm">Contact admin to get HR users assigned to you</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Notes Dialog */}
      <Dialog open={isViewNotesDialogOpen} onOpenChange={setIsViewNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Assignment Notes
            </DialogTitle>
            <DialogDescription>
              {user?.role === 'agent' 
                ? 'Notes about your HR and candidate assignments'
                : selectedCandidateForNotes
                ? 'Assignment notes for this candidate'
                : 'Select an agent to view their assignment notes'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(user?.role === 'admin' || user?.role === 'superadmin') && !selectedCandidateForNotes && (
              <div>
                <Label htmlFor="agent-select-notes">Select Agent</Label>
                <Select 
                  value={selectedAgentForNotes} 
                  onValueChange={(value) => {
                    setSelectedAgentForNotes(value);
                    setSelectedCandidateForNotes(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent to view notes..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent: any) => (
                      <SelectItem key={agent._id} value={agent._id}>
                        {agent.firstName} {agent.lastName} ({agent.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {selectedAgentAssignmentLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading assignment notes...</span>
              </div>
            ) : assignmentForNotes?.notes ? (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm whitespace-pre-wrap text-foreground">
                  {assignmentForNotes.notes}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-muted-foreground">
                  {(user?.role === 'admin' || user?.role === 'superadmin') && !selectedAgentForNotes && !selectedCandidateForNotes
                    ? 'Please select an agent to view their assignment notes'
                    : (user?.role === 'admin' || user?.role === 'superadmin') && selectedCandidateForNotes
                    ? 'No notes available for this candidate\'s agent assignment'
                    : (user?.role === 'admin' || user?.role === 'superadmin') && selectedAgentForNotes
                    ? 'No notes available for this agent\'s assignment'
                    : 'No notes available for this assignment'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsViewNotesDialogOpen(false);
              setSelectedAgentForNotes('');
              setSelectedCandidateForNotes(null);
            }}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
