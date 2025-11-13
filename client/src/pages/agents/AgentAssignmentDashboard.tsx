import { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
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

const PAGE_SIZE = 20;

const buildPaginationInfo = (
  currentPage: number,
  totalCountForPage: number,
  meta?: {
    total?: number;
    limit?: number;
    page?: {
      current: number;
      total: number;
      hasMore: boolean;
    };
  }
) => {
  if (meta && typeof meta.total === 'number') {
    const pageLimit = meta.limit ?? PAGE_SIZE;
    const total = meta.total;
    const totalPages = meta.page?.total ?? Math.max(1, Math.ceil(total / pageLimit));
    const start = total === 0 ? 0 : ((currentPage - 1) * pageLimit) + 1;
    const end = total === 0 ? 0 : Math.min(currentPage * pageLimit, total);
    const hasMore = meta.page?.hasMore ?? (currentPage < totalPages);
    return { total, start, end, totalPages, hasMore, pageLimit };
  }

  const total = totalCountForPage;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = total === 0 ? 0 : ((currentPage - 1) * PAGE_SIZE) + 1;
  const end = total === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, total);
  const hasMore = currentPage < totalPages;
  return { total, start, end, totalPages, hasMore, pageLimit: PAGE_SIZE };
};

type PageIndicator = number | 'ellipsis';

const generatePageIndicators = (currentPage: number, totalPages: number): PageIndicator[] => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);
  pages.add(currentPage - 1);
  pages.add(currentPage + 1);
  pages.add(currentPage - 2);
  pages.add(currentPage + 2);

  const sortedPages = Array.from(pages)
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const indicators: PageIndicator[] = [];
  sortedPages.forEach((page, index) => {
    if (index === 0) {
      indicators.push(page);
      return;
    }

    const previous = sortedPages[index - 1];
    if (page - previous > 1) {
      indicators.push('ellipsis');
    }
    indicators.push(page);
  });

  return indicators;
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
  const [companyFilter, setCompanyFilter] = useState('all');
  const [jobSort, setJobSort] = useState('createdAt-desc');
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
  const [jobsPage, setJobsPage] = useState(1);
  const [candidatesPage, setCandidatesPage] = useState(1);
  const [hrPage, setHrPage] = useState(1);
  
  // Save tab to localStorage when it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('agentAssignmentActiveTab', value);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  // Parse job sort into sortBy and sortOrder
  const [jobSortBy, jobSortOrder] = useMemo(() => {
    const [field, order] = jobSort.split('-');
    return [field, order as 'asc' | 'desc'];
  }, [jobSort]);

  // API hooks - Fetch jobs without company filter (will filter client-side)
  const { 
    data: jobsResponse, 
    loading: jobsLoading, 
    error: jobsError, 
    refetch: refetchJobs 
  } = useJobs({
    page: jobsPage,
    limit: PAGE_SIZE,
    sortBy: jobSortBy,
    sortOrder: jobSortOrder,
    search: jobSearchTerm ? jobSearchTerm : undefined,
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
  const hrParams = useMemo(() => {
    if (isAdmin) {
      return {
        role: 'hr',
        status: 'active',
        page: hrPage,
        limit: PAGE_SIZE,
        sortBy: 'firstName',
        sortOrder: 'asc',
      };
    }
    return {
      role: 'hr',
      status: 'active',
      limit: 100,
    };
  }, [isAdmin, hrPage]);

  const {
    data: allHRsResponse,
    loading: hrLoading,
  } = useUsers(hrParams);

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
    page: candidatesPage,
    limit: PAGE_SIZE,
  });

  // Extract data from API responses
  const jobsMeta = Array.isArray(jobsResponse) ? null : (jobsResponse as any)?.meta;
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : ((jobsResponse as any)?.data || []);
  const agentAssignment = (agentAssignmentResponse as any)?.data || agentAssignmentResponse;
  const candidatesMeta = Array.isArray(candidatesResponse) ? null : (candidatesResponse as any)?.meta;
  const candidates = Array.isArray(candidatesResponse)
    ? candidatesResponse
    : (((candidatesResponse as any)?.data) || candidatesResponse || []);

  // Get selected candidate display info
  const selectedCandidateDisplay = selectedCandidate 
    ? candidates.find((c: any) => c._id === selectedCandidate)
    : null;
  const agents = Array.isArray(agentsResponse) 
    ? agentsResponse 
    : (agentsResponse as any)?.data || [];
  const hrMeta = isAdmin
    ? (Array.isArray(allHRsResponse) ? null : (allHRsResponse as any)?.meta || null)
    : null;
  const allHRsFromAPI = Array.isArray(allHRsResponse) 
    ? allHRsResponse 
    : (allHRsResponse as any)?.data || [];
  const allAssignments = Array.isArray(allAssignmentsResponse) 
    ? allAssignmentsResponse 
    : (allAssignmentsResponse as any)?.data || [];

  // Refresh data when component comes into focus (e.g., when user switches back to tab)
  useEffect(() => {
    const handleFocus = () => {
      refetchAgentAssignment();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchAgentAssignment]);

  useEffect(() => {
    setJobsPage(1);
  }, [jobSearchTerm, companyFilter, jobSort]);

  useEffect(() => {
    setCandidatesPage(1);
  }, [candidateSearchTerm, candidates.length]);

  useEffect(() => {
    setHrPage(1);
  }, [hrSearchTerm, isAdmin]);

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

  // Apply company filter client-side (like JobManagementIntegrated)
  const filteredJobs = useMemo(() => {
    if (companyFilter === 'all') {
      return jobs;
    }
    return jobs.filter(job => 
      (job.companyId?._id === companyFilter) || 
      (job.companyId?.id === companyFilter)
    );
  }, [jobs, companyFilter]);

  // Extract unique companies from jobs for the filter dropdown
  const uniqueCompanies = useMemo(() => {
    const companiesMap = new Map<string, { id: string; name: string }>();
    jobs.forEach((job: any) => {
      if (job.companyId?._id && job.companyId?.name) {
        companiesMap.set(job.companyId._id, {
          id: job.companyId._id,
          name: job.companyId.name,
        });
      }
    });
    return Array.from(companiesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  // Determine which HRs to show
  // For admin/superadmin: show ALL HR users in the system
  // For agents: show only HRs assigned to them
  const allHRs = isAdmin 
    ? allHRsFromAPI 
    : (agentAssignment?.assignedHRs || []);

  useEffect(() => {
    console.debug('[AgentAssignmentDashboard] HR dataset snapshot', {
      isAdmin,
      allHRsSourceCount: isAdmin ? allHRsFromAPI.length : (agentAssignment?.assignedHRs?.length || 0),
      derivedCount: allHRs.length,
      sample: allHRs.slice(0, 5).map((hr: any) => ({
        id: hr._id,
        customId: hr.customId,
        name: `${hr.firstName || ''} ${hr.lastName || ''}`.trim(),
      })),
    });
  }, [isAdmin, allHRs, allHRsFromAPI, agentAssignment]);

  useEffect(() => {
    console.debug('[AgentAssignmentDashboard] Candidate dataset snapshot', {
      total: candidates.length,
      sample: candidates.slice(0, 5).map((candidate: any) => ({
        id: candidate._id,
        userCustomId: candidate.userId?.customId,
        name: `${candidate.userId?.firstName || ''} ${candidate.userId?.lastName || ''}`.trim(),
      })),
    });
  }, [candidates]);

  const candidateMatchesSearchTerm = (candidate: any, searchTerm: string) => {
    if (!searchTerm) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase();
    const firstName = candidate.userId?.firstName?.toLowerCase() || '';
    const lastName = candidate.userId?.lastName?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const email = candidate.userId?.email?.toLowerCase() || '';
    const customId = candidate.userId?.customId || '';

    if (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      email.includes(searchLower)
    ) {
      return true;
    }

    return matchesId(searchTerm, customId);
  };

  const filteredCandidates = useMemo(() => {
    if (!candidateSearchTerm) {
      console.debug('[AgentAssignmentDashboard] Candidate search cleared, returning all candidates:', candidates.length);
      return candidates;
    }

    const results = candidates.filter((candidate: any) =>
      candidateMatchesSearchTerm(candidate, candidateSearchTerm)
    );

    console.debug('[AgentAssignmentDashboard] Candidate search results', {
      searchTerm: candidateSearchTerm,
      totalCandidates: candidates.length,
      matchedCount: results.length,
      matchedIds: results.slice(0, 10).map((candidate: any) => ({
        candidateId: candidate._id,
        userCustomId: candidate.userId?.customId,
        userName: `${candidate.userId?.firstName || ''} ${candidate.userId?.lastName || ''}`.trim(),
      })),
    });

    return results;
  }, [candidates, candidateSearchTerm]);

  // Filter HR users based on search term
  const hrMatchesSearchTerm = (hr: any, searchTerm: string) => {
    if (!searchTerm) {
      return true;
    }

    const searchLower = searchTerm.toLowerCase();
    const customId = hr.customId || '';
    const firstName = (hr.firstName || '').toLowerCase();
    const lastName = (hr.lastName || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const email = (hr.email || '').toLowerCase();

    if (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      email.includes(searchLower)
    ) {
      return true;
    }

    return matchesId(searchTerm, customId);
  };

  const filteredHRs = useMemo(() => {
    if (!hrSearchTerm) {
      console.debug('[AgentAssignmentDashboard] HR search cleared, returning all HRs:', allHRs.length);
      return allHRs;
    }

    const results = allHRs.filter((hr: any) => hrMatchesSearchTerm(hr, hrSearchTerm));

    console.debug('[AgentAssignmentDashboard] HR search results', {
      searchTerm: hrSearchTerm,
      totalHRs: allHRs.length,
      matchedCount: results.length,
      matchedIds: results.slice(0, 10).map((hr: any) => ({
        hrId: hr._id,
        customId: hr.customId,
        name: `${hr.firstName || ''} ${hr.lastName || ''}`.trim(),
      })),
    });

    return results;
  }, [allHRs, hrSearchTerm]);

  useEffect(() => {
    if (!isAdmin) {
      const totalPages = Math.max(1, Math.ceil(filteredHRs.length / PAGE_SIZE));
      if (hrPage > totalPages) {
        setHrPage(totalPages);
      }
    }
  }, [filteredHRs.length, hrPage, isAdmin]);

  const displayedHRs = isAdmin
    ? filteredHRs
    : filteredHRs.slice((hrPage - 1) * PAGE_SIZE, hrPage * PAGE_SIZE);

  const jobsPagination = buildPaginationInfo(jobsPage, filteredJobs.length, jobsMeta);
  const candidatesPagination = buildPaginationInfo(candidatesPage, filteredCandidates.length, candidatesMeta);
  const hrPagination = buildPaginationInfo(hrPage, filteredHRs.length, isAdmin ? hrMeta : undefined);
  const jobsPageIndicators = useMemo(
    () => generatePageIndicators(jobsPage, jobsPagination.totalPages),
    [jobsPage, jobsPagination.totalPages]
  );
  const candidatesPageIndicators = useMemo(
    () => generatePageIndicators(candidatesPage, candidatesPagination.totalPages),
    [candidatesPage, candidatesPagination.totalPages]
  );
  const hrPageIndicators = useMemo(
    () => generatePageIndicators(hrPage, hrPagination.totalPages),
    [hrPage, hrPagination.totalPages]
  );

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

  const resolveCurrencyPresentation = (currency?: string) => {
    const normalized = currency?.toString().trim().toUpperCase();

    switch (normalized) {
      case undefined:
      case '':
      case 'INR':
      case '₹':
        return { symbol: '₹', locale: 'en-IN' };
      case 'USD':
      case '$':
        return { symbol: '$', locale: 'en-US' };
      case 'EUR':
      case '€':
        return { symbol: '€', locale: 'de-DE' };
      case 'GBP':
      case '£':
        return { symbol: '£', locale: 'en-GB' };
      case 'AUD':
        return { symbol: 'A$', locale: 'en-AU' };
      case 'CAD':
        return { symbol: 'C$', locale: 'en-CA' };
      case 'SGD':
        return { symbol: 'S$', locale: 'en-SG' };
      default:
        return { symbol: normalized || '₹', locale: 'en-IN' };
    }
  };

  const formatSalaryValue = (value?: number, symbol?: string, locale: string = 'en-IN') => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return null;
    }

    const formatted = value.toLocaleString(locale);
    return `${symbol || '₹'} ${formatted}`;
  };

  const formatSalary = (range: any) => {
    if (!range) {
      return 'Not specified';
    }

    const { symbol, locale } = resolveCurrencyPresentation(range.currency);
    const formattedMin = formatSalaryValue(range.min, symbol, locale);
    const formattedMax = formatSalaryValue(range.max, symbol, locale);

    if (formattedMin && formattedMax) {
      return `${formattedMin} - ${formattedMax}`;
    }

    if (formattedMin) {
      return `${formattedMin}+`;
    }

    if (formattedMax) {
      return formattedMax;
    }

    return 'Not specified';
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
                          {(() => {
                            const dialogResults = candidates.filter((candidate: any) =>
                              candidateMatchesSearchTerm(candidate, candidateDialogSearch)
                            );

                            if (dialogResults.length === 0) {
                              return (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No candidates found
                            </div>
                              );
                            }

                            return dialogResults.map((candidate: any) => (
                              <CandidateDropdownItem
                                key={candidate._id}
                                candidate={candidate}
                                onSelect={() => {
                                  setSelectedCandidate(candidate._id);
                                  setIsCandidateSearchActive(false);
                                  setCandidateDialogSearch('');
                                }}
                              />
                            ));
                          })()}
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
            My Jobs ({jobsPagination.total})
          </TabsTrigger>
        <TabsTrigger value="candidates" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          My Candidates ({candidatesPagination.total})
        </TabsTrigger>
          <TabsTrigger value="hrs" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            My HRs ({hrPagination.total})
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
                  <Select value={companyFilter} onValueChange={setCompanyFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Companies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {uniqueCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={jobSort} onValueChange={setJobSort}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                      <SelectItem value="title-asc">Job Title (A-Z)</SelectItem>
                      <SelectItem value="title-desc">Job Title (Z-A)</SelectItem>
                      <SelectItem value="urgency-desc">Urgency (High to Low)</SelectItem>
                      <SelectItem value="urgency-asc">Urgency (Low to High)</SelectItem>
                      <SelectItem value="salaryRange.max-desc">Salary (High to Low)</SelectItem>
                      <SelectItem value="salaryRange.max-asc">Salary (Low to High)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job ID</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-[200px]">Salary</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Posted By</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-5 w-20 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                            <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                              <div className="h-3 bg-gray-300 rounded w-32 animate-pulse"></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                      <TableHead className="w-[200px]">Salary</TableHead>
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
                              if (!job.companyId?._id) {
                                return;
                              }

                              if (user?.role === 'candidate') {
                                toast({
                                  title: "Access denied",
                                  description: "Company profiles are not available for candidates.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              navigate(`/dashboard/companies/${job.companyId._id}`);
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
                        <TableCell className="w-[200px]">{formatSalary(job.salaryRange)}</TableCell>
                        <TableCell>
                          <Badge className={getUrgencyColor(job.urgency)} variant="outline">
                            {job.urgency || 'medium'}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[220px]">
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
                            <div className="min-w-0 space-y-1">
                              <p 
                                className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors truncate"
                                title={`${job.createdBy?.firstName || ''} ${job.createdBy?.lastName || ''}`}
                                onClick={() => {
                                  if (job.createdBy?.customId) {
                                    navigate(`/dashboard/hr-profile/${job.createdBy.customId}`);
                                  }
                                }}
                              >
                                {job.createdBy?.firstName} {job.createdBy?.lastName}
                              </p>
                              <div className="text-sm text-muted-foreground truncate" title={job.createdBy?.email || ''}>
                                {job.createdBy?.email}
                              </div>
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
              {!jobsLoading && filteredJobs.length > 0 && jobsPagination.total > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{jobsPagination.start}</span> to{' '}
                    <span className="font-medium">{jobsPagination.end}</span> of{' '}
                    <span className="font-medium">{jobsPagination.total}</span> jobs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobsPage(prev => Math.max(1, prev - 1))}
                      disabled={jobsPage === 1 || jobsLoading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {jobsPagination.totalPages > 1 &&
                        jobsPageIndicators.map((indicator, index) =>
                          indicator === 'ellipsis' ? (
                            <span key={`jobs-ellipsis-${index}`} className="px-2">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={`jobs-page-${indicator}`}
                              variant={jobsPage === indicator ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setJobsPage(indicator)}
                              className="w-9"
                            >
                              {indicator}
                            </Button>
                          )
                        )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJobsPage(prev => prev + 1)}
                      disabled={!jobsPagination.hasMore || jobsLoading}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
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
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
                              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
                            <div className="h-3 bg-gray-300 rounded w-28 animate-pulse"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
              {!candidatesLoading && filteredCandidates.length > 0 && candidatesPagination.total > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{candidatesPagination.start}</span> to{' '}
                    <span className="font-medium">{candidatesPagination.end}</span> of{' '}
                    <span className="font-medium">{candidatesPagination.total}</span> candidates
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCandidatesPage(prev => Math.max(1, prev - 1))}
                      disabled={candidatesPage === 1 || candidatesLoading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {candidatesPagination.totalPages > 1 &&
                        candidatesPageIndicators.map((indicator, index) =>
                          indicator === 'ellipsis' ? (
                            <span key={`candidates-ellipsis-${index}`} className="px-2">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={`candidates-page-${indicator}`}
                              variant={candidatesPage === indicator ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCandidatesPage(indicator)}
                              className="w-9"
                            >
                              {indicator}
                            </Button>
                          )
                        )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCandidatesPage(prev => prev + 1)}
                      disabled={!candidatesPagination.hasMore || candidatesLoading}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentAssignmentLoading || hrLoading ? (
                      <>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                                <div className="space-y-2">
                                  <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
                                  <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-40 animate-pulse"></div>
                                <div className="h-3 bg-gray-300 rounded w-28 animate-pulse"></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                            </TableCell>
                            <TableCell>
                              <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : displayedHRs && displayedHRs.length > 0 ? (
                      displayedHRs.map((hr: any) => (
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
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No HR users found</p>
                          <p className="text-sm">No HR users match your search criteria</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No HR users assigned</p>
                          <p className="text-sm">Contact admin to get HR users assigned to you</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              {hrPagination.total > 0 && displayedHRs.length > 0 && (
                <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{hrPagination.start}</span> to{' '}
                    <span className="font-medium">{Math.min(hrPagination.end, hrPagination.total)}</span> of{' '}
                    <span className="font-medium">{hrPagination.total}</span> HR users
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHrPage(prev => Math.max(1, prev - 1))}
                      disabled={hrPage === 1 || hrLoading}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {hrPagination.totalPages > 1 &&
                        hrPageIndicators.map((indicator, index) =>
                          indicator === 'ellipsis' ? (
                            <span key={`hr-ellipsis-${index}`} className="px-2">
                              ...
                            </span>
                          ) : (
                            <Button
                              key={`hr-page-${indicator}`}
                              variant={hrPage === indicator ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setHrPage(indicator)}
                              className="w-9"
                            >
                              {indicator}
                            </Button>
                          )
                        )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHrPage(prev => prev + 1)}
                      disabled={!hrPagination.hasMore || hrLoading}
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
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
