import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { apiClient } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  MapPin,
  Clock,
  Building2,
  Eye,
  Edit,
  Trash2,
  Users,
  Briefcase,
  UserCheck,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileText,
  Upload,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobs, useCreateJob, useDeleteJob, useCompanies, useUpdateJob } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardBanner } from "@/components/dashboard/Banner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";

// Format custom ID to trim leading zeros (e.g., JOB00004 -> JOB4)
const formatCustomId = (customId: string | undefined): string => {
  if (!customId) return 'N/A';
  
  // Match pattern like JOB00004, HR00001, etc.
  const match = customId.match(/^([A-Z]+)(0+)(\d+)$/);
  if (match) {
    const [, prefix, zeros, number] = match;
    return `${prefix}${number}`;
  }
  
  // If pattern doesn't match, return as is
  return customId;
};

// Helper function to check if search term matches ID flexibly (same as AgentAssignmentDashboard)
const matchesId = (searchTerm: string, customId: string | undefined): boolean => {
  if (!customId || !searchTerm) return false;
  
  const searchUpper = String(searchTerm).toUpperCase().trim();
  const idUpper = String(customId).toUpperCase().trim();
  
  // Only match IDs if search looks like an ID (has letters + numbers), not just text
  // This prevents "job" from matching all job IDs
  const searchLooksLikeId = /^[A-Z]+\d+$/.test(searchUpper) || /^\d+$/.test(searchUpper);
  if (!searchLooksLikeId) {
    return false; // Don't match IDs for pure text searches
  }
  
  // Direct match (case insensitive substring or exact)
  if (idUpper.includes(searchUpper) || idUpper === searchUpper) {
    return true;
  }
  
  // Check formatted ID match (e.g., "JOB1" matches "JOB00001", "job12" matches "JOB00012")
  const formattedId = formatCustomId(customId).toUpperCase();
  if (formattedId) {
    // Exact match: "JOB12" === "JOB12"
    if (formattedId === searchUpper) {
      return true;
    }
    // Check if formatted ID contains search or search contains formatted ID
    if (formattedId.includes(searchUpper) || searchUpper.includes(formattedId)) {
      return true;
    }
  }
  
  // Extract prefix and number from both search term and ID
  // Pattern: PREFIX followed by optional leading zeros and digits
  const idMatch = idUpper.match(/^([A-Z]+)(0*)(\d+)$/);
  const searchMatch = searchUpper.match(/^([A-Z]+)(0*)(\d+)$/);
  
  if (idMatch && searchMatch) {
    const [, idPrefix, , idNumber] = idMatch;
    const [, searchPrefix, , searchNumber] = searchMatch;
    
    // Match if prefix matches and the numeric part matches
    // This handles: "JOB2" matches "JOB000002", "JOB002" matches "JOB000002", etc.
    if (idPrefix === searchPrefix && idNumber === searchNumber) {
      return true;
    }
  }
  
  // Also check if search term without leading zeros matches ID with leading zeros
  // and vice versa (e.g., "JOB12" matches "JOB00012")
  const idWithoutZeros = idUpper.replace(/^([A-Z]+)0+(\d+)$/, '$1$2');
  const searchWithoutZeros = searchUpper.replace(/^([A-Z]+)0+(\d+)$/, '$1$2');
  
  if (idWithoutZeros === searchWithoutZeros && idWithoutZeros !== idUpper) {
    return true;
  }
  
  // Additional check: if search is just a number, check if it matches the number part
  const searchIsNumber = /^\d+$/.test(searchUpper);
  if (searchIsNumber && idMatch) {
    const [, , , idNumber] = idMatch;
    if (idNumber === searchUpper) {
      return true;
    }
  }
  
  return false;
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
  const initials = useMemo(() => {
    return companyName
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [companyName]);

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

// Component to display Agent avatar with profile picture support
const AgentAvatar = ({ agent, onClick }: { agent: any; onClick?: () => void }) => {
  const profilePhotoFileId = agent?.profilePhotoFileId;
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
          alt={`${agent?.firstName || ''} ${agent?.lastName || ''}`}
        />
      ) : null}
      <AvatarFallback className="text-xs font-semibold text-white bg-emerald-600">
        {agent?.firstName?.[0] || ''}{agent?.lastName?.[0] || ''}
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

export default function JobManagementIntegrated(): React.JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const editIdFromQuery = searchParams.get('editId');
  
  // Initialize filters from URL parameters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const [companyFilter, setCompanyFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<any>(null);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    location: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    type: 'full-time' as const,
    workType: 'wfo' as const,
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    skills: '',
    experienceMin: '',
    experienceMax: '',
    benefits: '',
    applicationDeadline: '',
    interviewRounds: 2,
    estimatedDuration: '2-3 weeks',
    duration: '',
    numberOfOpenings: '1',
    companyId: ''
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [skillInputValue, setSkillInputValue] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jdUploadState, setJDUploadState] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [jdFileId, setJDFileId] = useState<string | null>(null);
  const [editJDFileId, setEditJDFileId] = useState<string | null>(null);
  const [editJDUploadState, setEditJDUploadState] = useState<'idle' | 'uploading'>('idle');
  const [selectedEditJDFile, setSelectedEditJDFile] = useState<File | null>(null);
  const [isPostUsingJDDialogOpen, setIsPostUsingJDDialogOpen] = useState(false);
  
  // Additional state hooks (must be declared before any other hooks)
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);
  const [hiredCandidatesCount, setHiredCandidatesCount] = useState(0);
  const [hiredCandidatesLoading, setHiredCandidatesLoading] = useState(true);
  const [allJobsStats, setAllJobsStats] = useState({
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // All useRef hooks together
  const lastScrolledPageRef = useRef(page);
  const lastFetchedUserRef = useRef<{ id?: string; role?: string }>({});

  // Skill suggestions data
  const skillSuggestions = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'JavaScript', 'SQL', 'MongoDB', 
    'AWS', 'Docker', 'Git', 'Agile', 'Vue.js', 'Angular', 'Express.js', 'PostgreSQL',
    'Redis', 'Kubernetes', 'GraphQL', 'REST API', 'Microservices', 'CI/CD', 'Jenkins',
    'Terraform', 'Linux', 'Bash', 'HTML', 'CSS', 'SASS', 'Webpack', 'Babel',
    'Jest', 'Cypress', 'Selenium', 'Figma', 'Adobe XD', 'Sketch', 'Photoshop',
    'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    'Data Analysis', 'Business Intelligence', 'Tableau', 'Power BI', 'Excel',
    'Project Management', 'Scrum', 'Kanban', 'JIRA', 'Confluence', 'Slack',
    'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management'
  ];

  // Indian cities data
  const indianCities = [
    'Mumbai, Maharashtra', 'Delhi, Delhi', 'Bangalore, Karnataka', 'Hyderabad, Telangana',
    'Chennai, Tamil Nadu', 'Kolkata, West Bengal', 'Pune, Maharashtra', 'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan', 'Surat, Gujarat', 'Lucknow, Uttar Pradesh', 'Kanpur, Uttar Pradesh',
    'Nagpur, Maharashtra', 'Indore, Madhya Pradesh', 'Thane, Maharashtra', 'Bhopal, Madhya Pradesh',
    'Visakhapatnam, Andhra Pradesh', 'Pimpri-Chinchwad, Maharashtra', 'Patna, Bihar', 'Vadodara, Gujarat',
    'Ghaziabad, Uttar Pradesh', 'Ludhiana, Punjab', 'Agra, Uttar Pradesh', 'Nashik, Maharashtra',
    'Faridabad, Haryana', 'Meerut, Uttar Pradesh', 'Rajkot, Gujarat', 'Kalyan-Dombivali, Maharashtra',
    'Vasai-Virar, Maharashtra', 'Varanasi, Uttar Pradesh', 'Srinagar, Jammu and Kashmir', 'Aurangabad, Maharashtra',
    'Dhanbad, Jharkhand', 'Amritsar, Punjab', 'Navi Mumbai, Maharashtra', 'Allahabad, Uttar Pradesh',
    'Ranchi, Jharkhand', 'Howrah, West Bengal', 'Coimbatore, Tamil Nadu', 'Jabalpur, Madhya Pradesh',
    'Gwalior, Madhya Pradesh', 'Vijayawada, Andhra Pradesh', 'Jodhpur, Rajasthan', 'Madurai, Tamil Nadu',
    'Raipur, Chhattisgarh', 'Kota, Rajasthan', 'Chandigarh, Chandigarh', 'Guwahati, Assam',
    'Solapur, Maharashtra', 'Hubli-Dharwad, Karnataka', 'Mysore, Karnataka', 'Tiruchirappalli, Tamil Nadu',
    'Bareilly, Uttar Pradesh', 'Moradabad, Uttar Pradesh', 'Gurgaon, Haryana', 'Aligarh, Uttar Pradesh',
    'Jalandhar, Punjab', 'Bhubaneswar, Odisha', 'Salem, Tamil Nadu', 'Warangal, Telangana',
    'Guntur, Andhra Pradesh', 'Bhiwandi, Maharashtra', 'Saharanpur, Uttar Pradesh', 'Gorakhpur, Uttar Pradesh',
    'Bikaner, Rajasthan', 'Amravati, Maharashtra', 'Noida, Uttar Pradesh', 'Jamshedpur, Jharkhand',
    'Bhilai Nagar, Chhattisgarh', 'Cuttack, Odisha', 'Kochi, Kerala', 'Udaipur, Rajasthan',
    'Bhavnagar, Gujarat', 'Dehradun, Uttarakhand', 'Asansol, West Bengal', 'Nellore, Andhra Pradesh',
    'Ajmer, Rajasthan', 'Mangalore, Karnataka', 'Thiruvananthapuram, Kerala', 'Kolhapur, Maharashtra'
  ];

  // Filter suggestions based on input
  const filteredSuggestions = skillSuggestions.filter(skill => 
    skill.toLowerCase().includes(skillInputValue.toLowerCase()) &&
    !createFormData.skills.split(',').map(s => s.trim()).filter(Boolean).includes(skill)
  ).slice(0, 8); // Show max 8 suggestions

  // All useMemo hooks together
  // Check if search term looks like an ID - if so, don't send to API (let client-side handle it)
  const isIdSearch = useMemo(() => {
    if (!debouncedSearchTerm) return false;
    return /^[a-z]+0*\d+$/i.test(debouncedSearchTerm) || /^\d+$/.test(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  // Memoize the API parameters to prevent unnecessary re-renders
  // For ID searches, fetch all jobs to search across all pages client-side
  const jobsParams = useMemo(() => ({
    page: isIdSearch ? 1 : page,  // Always fetch first page for ID searches
    limit: isIdSearch ? 1000 : 20,  // Fetch more jobs for ID searches to search across all pages
    // Only send text searches to API, not ID searches
    search: (debouncedSearchTerm && !isIdSearch) ? debouncedSearchTerm : undefined,
    // HR users can only see jobs they posted
    ...(user?.role === 'hr' && { createdBy: user.id })
  }), [page, debouncedSearchTerm, isIdSearch, user?.role, user?.id]);
  
  // API hooks
  const { 
    data: jobsResponse, 
    loading: jobsLoading, 
    error: jobsError, 
    refetch: refetchJobs 
  } = useJobs(jobsParams);

  // Mutation hooks
  const { mutate: createJob, loading: createLoading } = useCreateJob();
  const { mutate: updateJob, loading: updateLoading } = useUpdateJob();
  const { mutate: deleteJob, loading: deleteLoading } = useDeleteJob();

  // All useCallback hooks together
  const fetchAllJobsStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      // Fetch all jobs without pagination for stats
      const params: any = {
        limit: 1000 // Get all jobs for accurate stats
      };
      
      // HR users can only see jobs they posted
      if (user?.role === 'hr' && user?.id) {
        params.createdBy = user.id;
      }
      
      const response = await apiClient.getJobs(params);
      const allJobs = Array.isArray(response) ? response : (response?.data || []);
      
      // Calculate total applications
      let totalApps = 0;
      for (const job of allJobs) {
        totalApps += (job as any).applications || 0;
      }
      
      setAllJobsStats({
        totalJobs: allJobs.length,
        openJobs: allJobs.filter((j: any) => j.status === 'open').length,
        totalApplications: totalApps
      });
    } catch (error) {
      console.error('Failed to fetch job stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [user?.role, user?.id]);
  
  const fetchHiredCandidates = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setHiredCandidatesLoading(true);
      // Fetch candidate assignments with candidateStatus 'hired' assigned to current HR
      const response = await apiClient.getCandidateAssignments({
        assignedTo: user.id,
        limit: 1000 // Get all to count them
      });
      
      const assignments = Array.isArray(response) ? response : (response?.data || []);
      // Count only assignments with candidateStatus = 'hired'
      const hiredCount = assignments.filter((assignment: any) => 
        assignment.candidateStatus === 'hired'
      ).length;
      
      setHiredCandidatesCount(hiredCount);
    } catch (error) {
      console.error('Failed to fetch hired candidates:', error);
      setHiredCandidatesCount(0);
    } finally {
      setHiredCandidatesLoading(false);
    }
  }, [user?.id]);

  // Handle both API response formats: {data: [...], meta: {...}} or direct array
  // MUST be declared before useEffect hooks that use jobs
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse as any)?.data || [];
  const meta = Array.isArray(jobsResponse) ? null : (jobsResponse as any)?.meta;

  // All useEffect hooks together
  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset to first page when company filter changes
  useEffect(() => {
    setPage(1);
  }, [companyFilter]);

  // Scroll to top after page changes and data loads
  useEffect(() => {
    // Only scroll if page changed and loading is complete
    if (lastScrolledPageRef.current !== page && !jobsLoading && jobs.length > 0) {
      // Use requestAnimationFrame twice to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          lastScrolledPageRef.current = page;
        });
      });
    }
  }, [page, jobsLoading, jobs.length]);

  // Fetch companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const response = await apiClient.getCompanies({ page: 1, limit: 50 });
        setCompanies(response.data || response);
        setCompaniesError(null);
      } catch (error) {
        console.error('🔍 Direct API error:', error);
        setCompaniesError(error);
      } finally {
        setCompaniesLoading(false);
      }
    };
    
    fetchCompanies();
  }, []);

  // Fetch stats when user changes
  useEffect(() => {
    const currentUserId = user?.id;
    const currentUserRole = user?.role;
    const lastFetched = lastFetchedUserRef.current;
    
    // Only fetch if user ID or role actually changed
    if (currentUserId !== lastFetched.id || currentUserRole !== lastFetched.role) {
      // Update ref immediately to prevent duplicate calls during this render cycle
      lastFetchedUserRef.current = { id: currentUserId, role: currentUserRole };
      
      // Fetch data asynchronously
      fetchAllJobsStats();
      fetchHiredCandidates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]); // Functions are stable via useCallback, ref check prevents infinite loops

  // Redirect to company management if no companies exist (for HR users)
  useEffect(() => {
    if (!companiesLoading && user?.role === 'hr' && companies.length === 0) {
      toast({
        title: "Add a Company First",
        description: "Please add your company before posting jobs.",
        variant: "default"
      });
      navigate('/dashboard/companies');
    }
  }, [companiesLoading, companies.length, user?.role, navigate, toast]);

  // Filter jobs (comprehensive client-side filtering) - useMemo hook
  const filteredJobs = useMemo(() => {
    // Safety check: ensure all dependencies are initialized
    if (!jobs || !Array.isArray(jobs)) return [];
    if (typeof searchTerm === 'undefined') return [];
    if (typeof companyFilter === 'undefined') return [];
    if (typeof sortBy === 'undefined') return [];
    
    let filtered = jobs.filter(job => {
      if (!searchTerm) {
        // No search term, only apply company filter
        const matchesCompany = companyFilter === "all" || 
                              (job.companyId?._id === companyFilter) ||
                              (job.companyId?.id === companyFilter);
        return matchesCompany;
      }

      const searchLower = searchTerm.toLowerCase();
      
      // Extract searchable fields
      const jobTitle = job.title || '';
      const companyName = job.companyId?.name || '';
      const location = job.location || '';
      const jobType = job.type || '';
      const workType = job.workType || '';
      const description = job.description || '';
      
      // Get job ID from multiple possible fields
      const jobCustomId = job.jobId || '';
      const jobMongoId = job._id || job.id || '';
      const jobIdStr = String(jobMongoId);
      
      // HR information
      const hrFirstName = job.createdBy?.firstName || '';
      const hrLastName = job.createdBy?.lastName || '';
      const hrFullName = `${hrFirstName} ${hrLastName}`.trim();
      const hrId = job.createdBy?.customId || '';
      
      // Skills (array)
      const skills = Array.isArray(job.requirements?.skills) 
        ? job.requirements.skills.join(' ') 
        : '';
      
      // Company ID
      const companyId = job.companyId?._id || job.companyId?.id || '';
      const companyIdStr = String(companyId);
      const companyCustomId = job.companyId?.companyId || '';
      
      // Check if search term looks like an ID (starts with letters, has numbers)
      // Pattern: letters followed by optional zeros and numbers (e.g., "job1", "JOB15", "job0015")
      const looksLikeId = /^[a-z]+0*\d+$/i.test(searchTerm);
      
      // Check text fields (title, description, etc.)
      const matchesTextFields = 
        jobTitle.toLowerCase().includes(searchLower) ||
        location.toLowerCase().includes(searchLower) ||
        jobType.toLowerCase().includes(searchLower) ||
        workType.toLowerCase().includes(searchLower) ||
        description.toLowerCase().includes(searchLower) ||
        hrFirstName.toLowerCase().includes(searchLower) ||
        hrLastName.toLowerCase().includes(searchLower) ||
        hrFullName.toLowerCase().includes(searchLower) ||
        skills.toLowerCase().includes(searchLower);
      
      // Check ID fields (with flexible matching) - same pattern as AgentAssignmentDashboard
      const matchesJobId = 
        // Check custom job ID first (JOB00001, JOB00002, etc.)
        (jobCustomId && matchesId(searchTerm, jobCustomId)) ||
        // Also check MongoDB _id as fallback
        (jobMongoId && matchesId(searchTerm, jobIdStr));
      
      const matchesOtherIds = 
        // HR ID (flexible matching)
        (hrId && matchesId(searchTerm, hrId));
      
      const matchesIds = matchesJobId || matchesOtherIds;
      
      // If search looks like an ID, prioritize ID matching but also allow text matches
      // If search is just text (like "job"), prioritize text matching
      const matchesSearch = looksLikeId 
        ? (matchesIds || matchesTextFields)  // ID-like search: try IDs first, but allow text matches
        : (matchesTextFields || matchesIds);  // Text search: try text first, but allow ID matches
      
      const matchesCompany = companyFilter === "all" || 
                            (job.companyId?._id === companyFilter) ||
                            (job.companyId?.id === companyFilter);
      
      return matchesSearch && matchesCompany;
    });

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.postedAt || 0).getTime() - new Date(a.createdAt || a.postedAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || a.postedAt || 0).getTime() - new Date(b.createdAt || b.postedAt || 0).getTime();
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title-desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'company':
          return (a.companyId?.name || '').localeCompare(b.companyId?.name || '');
        case 'applications':
          return (b.applications || 0) - (a.applications || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, companyFilter, sortBy]);

  // Auto-open edit dialog when editId is present in URL
  // Note: handleEditJob is defined later but will be available when effect runs
  useEffect(() => {
    if (editIdFromQuery && filteredJobs.length > 0) {
      const found = filteredJobs.find((j: any) => (j._id || j.id || j.jobId) === editIdFromQuery);
      if (found) {
        // handleEditJob will be defined by the time this effect runs
        // We'll define it with useCallback later or access it via closure
        const handleEdit = (job: any) => {
          setSelectedJobForEdit(job);
          setIsEditDialogOpen(true);
          // Copy job data to form
          const salaryMin = job.salaryRange?.min ? String(job.salaryRange.min) : '';
          const salaryMax = job.salaryRange?.max ? String(job.salaryRange.max) : '';
          setCreateFormData({
            title: job.title || '',
            description: job.description || '',
            location: job.location || '',
            address: job.address || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
              country: ''
            },
            type: job.type || 'full-time',
            workType: job.workType || 'wfo',
            salaryMin,
            salaryMax,
            currency: job.salaryRange?.currency || 'INR',
            skills: Array.isArray(job.requirements?.skills) 
              ? job.requirements.skills.join(', ') 
              : job.requirements?.skills || '',
            experienceMin: job.requirements?.experienceMin ? String(job.requirements.experienceMin) : '',
            experienceMax: job.requirements?.experienceMax ? String(job.requirements.experienceMax) : '',
            benefits: job.benefits || '',
            applicationDeadline: job.applicationDeadline || '',
            interviewRounds: job.interviewRounds || 2,
            estimatedDuration: job.estimatedDuration || '2-3 weeks',
            duration: job.duration || '',
            numberOfOpenings: job.numberOfOpenings ? String(job.numberOfOpenings) : '1',
            companyId: job.companyId?._id || job.companyId?.id || ''
          });
        };
        handleEdit(found);
      }
    }
  }, [editIdFromQuery, filteredJobs]);

  // Check if HR has any companies (computed value, not a hook)
  const hasCompanies = companies.length > 0;

  // Regular functions (not hooks) - can be defined after all hooks
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-success text-success-foreground";
      case "assigned": return "bg-info text-info-foreground";
      case "interview": return "bg-warning text-warning-foreground";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleCreateJob = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create jobs",
        variant: "destructive"
      });
      return;
    }

    // Check if company is selected
    if (!createFormData.companyId) {
      toast({
        title: "Validation Error", 
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }

    // Parse location to populate address fields
    const location = createFormData.location.trim();
    let city = '';
    let state = '';
    
    // If location is in "City, State" format, parse it
    if (location.includes(',')) {
      const parts = location.split(',').map(p => p.trim());
      city = parts[0] || location;
      state = parts[1] || '';
    } else {
      // If no comma, use the whole string as city
      city = location;
    }

    const jobData = {
      title: createFormData.title.trim(),
      description: createFormData.description.trim(),
      location: location,
      address: {
        street: createFormData.address.street.trim() || city, // Use city as fallback for street
        city: city,
        state: state,
        zipCode: createFormData.address.zipCode.trim() || '',
        country: createFormData.address.country.trim() || 'India'
      },
      type: createFormData.type,
      workType: createFormData.workType,
      duration: (createFormData.type === 'contract' || createFormData.type === 'internship') ? createFormData.duration : undefined,
      numberOfOpenings: parseInt(createFormData.numberOfOpenings) || 1,
      companyId: createFormData.companyId,
      salaryRange: {
        min: parseInt(createFormData.salaryMin),
        max: parseInt(createFormData.salaryMax),
        currency: createFormData.currency
      },
      requirements: {
        skills: createFormData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        experienceMin: parseInt(createFormData.experienceMin) || 0,
        experienceMax: parseInt(createFormData.experienceMax) || 0
      },
      benefits: createFormData.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
      applicationDeadline: createFormData.applicationDeadline ? new Date(createFormData.applicationDeadline).toISOString() : undefined,
      interviewProcess: createFormData.interviewRounds || createFormData.estimatedDuration ? {
        rounds: createFormData.interviewRounds,
        estimatedDuration: createFormData.estimatedDuration
      } : undefined,
      jdFileId: jdFileId || undefined
    };

    try {
      const createdJob = await createJob(jobData);
      setIsCreateDialogOpen(false);
      resetCreateForm();
      setJDFileId(null);
      refetchJobs();
      fetchAllJobsStats(); // Refresh stats
      toast({
        title: "Success",
        description: 'Job created successfully'
      });
    } catch (error: any) {
      console.error('Job creation error:', error);
      
      // Handle backend validation errors
      if (error.issues && Array.isArray(error.issues)) {
        const backendErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          const fieldName = issue.path?.join('.') || issue.field || 'unknown';
          let userFriendlyMessage = issue.message;
          
          // Make error messages more user-friendly
          if (issue.message.includes('Invalid company ID')) {
            userFriendlyMessage = 'Please select a valid company';
          } else if (issue.message.includes('Invalid agent ID')) {
            userFriendlyMessage = 'Please select a valid agent';
          } else if (issue.message.includes('required')) {
            userFriendlyMessage = 'This field is required';
          } else if (issue.message.includes('max')) {
            userFriendlyMessage = 'Text is too long';
          } else if (issue.message.includes('min')) {
            userFriendlyMessage = 'Value is too small';
          }
          
          backendErrors[fieldName] = userFriendlyMessage;
        });
        setFormErrors(backendErrors);
        
        toast({
          title: "Validation Error",
          description: "Please check the form for errors and try again",
          variant: "destructive"
        });
      } else {
        // Handle other types of errors
        let errorMessage = "Failed to create job";
        
        if (error.detail) {
          errorMessage = error.detail;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.title) {
          errorMessage = error.title;
        }
        
        // Make common error messages more user-friendly
        if (errorMessage.includes('400')) {
          errorMessage = "Please check all required fields and try again";
        } else if (errorMessage.includes('403')) {
          errorMessage = "You don't have permission to create jobs";
        } else if (errorMessage.includes('500')) {
          errorMessage = "Server error. Please try again later";
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!createFormData.title.trim()) {
      errors.title = 'Job title is required';
    } else if (createFormData.title.length > 200) {
      errors.title = 'Job title cannot exceed 200 characters';
    }

    if (!createFormData.description.trim()) {
      errors.description = 'Job description is required';
    } else if (createFormData.description.length > 5000) {
      errors.description = 'Job description cannot exceed 5000 characters';
    }

    // Location is auto-filled from company, so we only validate if company is selected
    if (!createFormData.companyId) {
      errors.location = 'Please select a company first to auto-fill location';
    } else if (createFormData.location.length > 200) {
      errors.location = 'Location cannot exceed 200 characters';
    }

    if (!createFormData.companyId) {
      errors.companyId = 'Company selection is required';
    }

    if (!createFormData.skills.trim()) {
      errors.skills = 'At least one skill is required';
    }

    // Experience validation
    if (!createFormData.experienceMin.trim()) {
      errors.experienceMin = 'Minimum experience is required';
    }
    
    if (!createFormData.experienceMax.trim()) {
      errors.experienceMax = 'Maximum experience is required';
    }
    
    if (createFormData.experienceMin && createFormData.experienceMax) {
      const min = parseInt(createFormData.experienceMin);
      const max = parseInt(createFormData.experienceMax);
      if (min < 0) {
        errors.experienceMin = 'Experience cannot be negative';
      }
      if (max < 0) {
        errors.experienceMax = 'Experience cannot be negative';
      }
      if (min > max) {
        errors.experienceMax = 'Maximum experience must be greater than or equal to minimum';
      }
    }

    // Duration validation for contract and internship positions
    if ((createFormData.type === 'contract' || createFormData.type === 'internship') && !createFormData.duration.trim()) {
      errors.duration = 'Duration is required for contract and internship positions';
    }

    // Number of openings validation
    if (!createFormData.numberOfOpenings.trim()) {
      errors.numberOfOpenings = 'Number of openings is required';
    } else {
      const openings = parseInt(createFormData.numberOfOpenings);
      if (isNaN(openings) || openings < 1) {
        errors.numberOfOpenings = 'Number of openings must be at least 1';
      }
    }

    // Estimated hiring timeline validation
    if (!createFormData.estimatedDuration) {
      errors.estimatedDuration = 'Estimated hiring timeline is required';
    }

    // Salary validation - both min and max are required
    if (!createFormData.salaryMin.trim()) {
      errors.salaryMin = 'Minimum salary is required';
    }
    
    if (!createFormData.salaryMax.trim()) {
      errors.salaryMax = 'Maximum salary is required';
    }
    
    if (createFormData.salaryMin && createFormData.salaryMax) {
      const min = parseInt(createFormData.salaryMin);
      const max = parseInt(createFormData.salaryMax);
      if (min > max) {
        errors.salaryMax = 'Maximum salary must be greater than minimum salary';
      }
    }

    // Date validation
    if (createFormData.applicationDeadline) {
      const deadline = new Date(createFormData.applicationDeadline);
      const today = new Date();
      if (deadline < today) {
        errors.applicationDeadline = 'Application deadline cannot be in the past';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetCreateForm = () => {
    setSelectedJDFile(null);
    setJDFileId(null);
    setJDUploadState('idle');
    setCreateFormData({
      title: '',
      description: '',
      location: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      type: 'full-time',
      workType: 'wfo',
      salaryMin: '',
      salaryMax: '',
      currency: 'INR',
      skills: '',
      experienceMin: '',
      experienceMax: '',
      benefits: '',
      applicationDeadline: '',
      interviewRounds: 2,
      estimatedDuration: '2-3 weeks',
      duration: '',
      numberOfOpenings: '1',
      companyId: ''
    });
    setFormErrors({});
    setJDFileId(null);
  };

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        refetchJobs();
        fetchAllJobsStats(); // Refresh stats
        toast({
          title: "Success", 
          description: "Job deleted successfully"
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.detail || "Failed to delete job",
          variant: "destructive"
        });
      }
    }
  };

  const handleViewJob = (job: any) => {
    navigate(`/dashboard/jobs/${job.jobId || job.id || job._id}`);
  };

  const handleEditJob = (job: any) => {
    // Open inline edit dialog prefilled with job data
    const salaryMin = job.salaryRange?.min ? String(job.salaryRange.min) : '';
    const salaryMax = job.salaryRange?.max ? String(job.salaryRange.max) : '';
    const currency = job.salaryRange?.currency || 'INR';
    const skills = Array.isArray(job.requirements?.skills) ? job.requirements.skills.join(', ') : '';
    const experienceMin = job.requirements?.experienceMin !== undefined ? String(job.requirements.experienceMin) : '';
    const experienceMax = job.requirements?.experienceMax !== undefined ? String(job.requirements.experienceMax) : '';
    const benefits = Array.isArray(job.benefits) ? job.benefits.join(', ') : '';
    const interviewRounds = job.interviewProcess?.rounds || 2;
    const estimatedDuration = job.interviewProcess?.estimatedDuration || '2-3 weeks';

    setEditFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      type: job.type || 'full-time',
      workType: job.workType || 'wfo',
      salaryMin,
      salaryMax,
      currency,
      skills,
      experienceMin,
      experienceMax,
      benefits,
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      interviewRounds,
      estimatedDuration,
      duration: job.duration || '',
      numberOfOpenings: String(job.numberOfOpenings || '1'),
      companyId: job.companyId?._id || job.companyId || ''
    });
    // Initialize JD file ID if job has one
    setEditJDFileId(job.jdFileId || null);
    setSelectedEditJDFile(null);
    setEditJDUploadState('idle');
    setSelectedJobForEdit(job);
    setIsEditDialogOpen(true);
  };

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time' as const,
    workType: 'wfo' as const,
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    skills: '',
    experienceMin: '',
    experienceMax: '',
    benefits: '',
    applicationDeadline: '',
    interviewRounds: 2,
    estimatedDuration: '2-3 weeks',
    duration: '',
    numberOfOpenings: '1',
    companyId: ''
  });

  const handleUpdateJob = async () => {
    if (!selectedJobForEdit) return;
    // Reuse validateForm for essential checks (title/desc/location/company)
    if (!editFormData.title.trim() || !editFormData.description.trim() || !editFormData.location.trim() || !editFormData.companyId) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    
    // Parse location to populate address fields
    const location = editFormData.location.trim();
    let city = '';
    let state = '';
    
    // If location is in "City, State" format, parse it
    if (location.includes(',')) {
      const parts = location.split(',').map(p => p.trim());
      city = parts[0] || location;
      state = parts[1] || '';
    } else {
      // If no comma, use the whole string as city
      city = location;
    }
    
    const data = {
      title: editFormData.title.trim(),
      description: editFormData.description.trim(),
      location: location,
      address: {
        street: city, // Use city as fallback for street
        city: city,
        state: state,
        zipCode: '',
        country: 'India'
      },
      type: editFormData.type,
      workType: editFormData.workType,
      duration: (editFormData.type === 'contract' || editFormData.type === 'internship') ? editFormData.duration : undefined,
      numberOfOpenings: parseInt(editFormData.numberOfOpenings) || 1,
      companyId: editFormData.companyId,
      salaryRange: {
        min: parseInt(editFormData.salaryMin) || 0,
        max: parseInt(editFormData.salaryMax) || 0,
        currency: editFormData.currency,
      },
      requirements: {
        skills: editFormData.skills.split(',').map(s => s.trim()).filter(Boolean),
        experienceMin: parseInt(editFormData.experienceMin) || 0,
        experienceMax: parseInt(editFormData.experienceMax) || 0,
      },
      benefits: editFormData.benefits.split(',').map(s => s.trim()).filter(Boolean),
      applicationDeadline: editFormData.applicationDeadline ? new Date(editFormData.applicationDeadline).toISOString() : undefined,
      interviewProcess: editFormData.interviewRounds || editFormData.estimatedDuration ? {
        rounds: editFormData.interviewRounds,
        estimatedDuration: editFormData.estimatedDuration
      } : undefined,
      jdFileId: editJDFileId || undefined
    };

    try {
      await updateJob({ id: selectedJobForEdit.id || selectedJobForEdit._id, data });
      toast({ title: 'Success', description: 'Job updated successfully' });
      setIsEditDialogOpen(false);
      setSelectedJobForEdit(null);
      setEditJDFileId(null);
      setSelectedEditJDFile(null);
      setEditJDUploadState('idle');
      refetchJobs();
      fetchAllJobsStats(); // Refresh stats
    } catch (e) {
      console.error('Update job error:', e);
    }
  };


  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Banner */}
      <DashboardBanner category="hr" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Management</h1>
          <p className="text-muted-foreground">Manage job postings and track recruitment progress</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isPostUsingJDDialogOpen} onOpenChange={setIsPostUsingJDDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                disabled={!hasCompanies}
                title={!hasCompanies ? "Please add a company first" : ""}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Post using JD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Job Description</DialogTitle>
                <DialogDescription>
                  Upload a PDF file containing the job description. We'll extract the information automatically.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="jd-upload">Job Description File</Label>
                  <div className="mt-2">
                  <input
                    type="file"
                    id="jd-upload"
                    accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file type - only PDF (check both MIME type and file extension)
                          const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                          if (!isPDF) {
                            toast({
                              title: 'Invalid File Type',
                              description: 'Please upload a PDF file (.pdf only)',
                              variant: 'destructive',
                            });
                            e.target.value = '';
                            return;
                          }

                          // Validate file size (5MB limit)
                          const maxSize = 5 * 1024 * 1024;
                          if (file.size > maxSize) {
                            toast({
                              title: 'File Too Large',
                              description: 'Please upload a file smaller than 5MB',
                              variant: 'destructive',
                            });
                            return;
                          }

                          setSelectedJDFile(file);
                        }
                      }}
                      className="hidden"
                    />
                    <label htmlFor="jd-upload">
                      <Button variant="outline" asChild className="w-full">
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {selectedJDFile ? selectedJDFile.name : 'Choose PDF File'}
                        </span>
                      </Button>
                    </label>
                    {selectedJDFile && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{(selectedJDFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedJDFile(null);
                    setIsPostUsingJDDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (!selectedJDFile) {
                      toast({
                        title: 'No File Selected',
                        description: 'Please select a JD file to upload',
                        variant: 'destructive',
                      });
                      return;
                    }

                    try {
                      setJDUploadState('uploading');
                      const uploadResponse = await apiClient.uploadJD(selectedJDFile);
                      
                      if (uploadResponse.data?.file?.id) {
                        setJDFileId(uploadResponse.data.file.id);
                        setJDUploadState('parsing');
                        
                        // Parse the JD
                        const parseResponse = await apiClient.parseJD(uploadResponse.data.file.id);
                        
                        if (parseResponse.data?.parsedJD) {
                          const parsed = parseResponse.data.parsedJD as any;
                          
                          // Auto-populate form
                          setCreateFormData({
                            ...createFormData,
                            title: parsed.title || '',
                            description: parsed.description || '',
                            location: parsed.location || '',
                            type: (parsed.type as any) || 'full-time',
                            workType: (parsed.workType as any) || 'wfo',
                            salaryMin: parsed.salaryRange?.min?.toString() || '',
                            salaryMax: parsed.salaryRange?.max?.toString() || '',
                            currency: parsed.salaryRange?.currency || 'INR',
                            skills: parsed.requirements?.skills?.join(', ') || '',
                            experienceMin: parsed.requirements?.experienceMin?.toString() || '',
                            experienceMax: parsed.requirements?.experienceMax?.toString() || '',
                            benefits: parsed.benefits?.join(', ') || '',
                            numberOfOpenings: parsed.numberOfOpenings?.toString() || '1',
                            duration: parsed.duration || '',
                            applicationDeadline: parsed.applicationDeadline ? new Date(parsed.applicationDeadline).toISOString().split('T')[0] : '',
                          });
                          
                          toast({
                            title: 'JD Parsed Successfully',
                            description: 'Job information has been extracted. Please review and complete the form.',
                          });
                          
                          setIsPostUsingJDDialogOpen(false);
                          setIsCreateDialogOpen(true);
                          setSelectedJDFile(null);
                          setJDUploadState('idle');
                        }
                      }
                    } catch (error: any) {
                      console.error('JD upload/parse error:', error);
                      toast({
                        title: 'Error',
                        description: error?.detail || error?.message || 'Failed to upload or parse JD. Please try again.',
                        variant: 'destructive',
                      });
                      setJDUploadState('idle');
                    }
                  }}
                  disabled={!selectedJDFile || jdUploadState !== 'idle'}
                >
                  {jdUploadState === 'uploading' ? 'Uploading...' : jdUploadState === 'parsing' ? 'Parsing...' : 'Upload & Parse'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!hasCompanies}
                title={!hasCompanies ? "Please add a company first" : ""}
              >
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job Posting</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job posting for recruitment agents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Senior React Developer"
                      value={createFormData.title}
                      onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                      className={formErrors.title ? "border-red-500" : ""}
                    />
                    {formErrors.title && (
                      <p className="text-sm text-red-500">{formErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                    <Input 
                      id="location" 
                      placeholder="Type to search cities in India..."
                      value={createFormData.location}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCreateFormData({...createFormData, location: value});
                        
                        // Filter cities based on input
                        if (value.length > 0) {
                          const filtered = indianCities.filter(city => 
                            city.toLowerCase().includes(value.toLowerCase())
                          ).slice(0, 8); // Show max 8 suggestions
                          setFilteredCities(filtered);
                          setShowCitySuggestions(filtered.length > 0);
                        } else {
                          setShowCitySuggestions(false);
                          setFilteredCities([]);
                        }
                      }}
                      onFocus={(e) => {
                        if (e.target.value.length > 0) {
                          const filtered = indianCities.filter(city => 
                            city.toLowerCase().includes(e.target.value.toLowerCase())
                          ).slice(0, 8);
                          setFilteredCities(filtered);
                          setShowCitySuggestions(filtered.length > 0);
                        }
                      }}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        setTimeout(() => setShowCitySuggestions(false), 200);
                      }}
                      className={formErrors.location ? "border-red-500" : ""}
                    />
                    {showCitySuggestions && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              setCreateFormData({...createFormData, location: city});
                              setShowCitySuggestions(false);
                            }}
                          >
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {formErrors.location && (
                      <p className="text-sm text-red-500">{formErrors.location}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                    <Select 
                      value={createFormData.companyId} 
                      onValueChange={(value) => {
                        setCreateFormData({
                          ...createFormData, 
                          companyId: value
                        });
                      }}
                    >
                      <SelectTrigger className={formErrors.companyId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company: any) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.companyId && (
                      <p className="text-sm text-red-500">{formErrors.companyId}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Job Type <span className="text-red-500">*</span></Label>
                    <Select value={createFormData.type} onValueChange={(value) => setCreateFormData({...createFormData, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workType">Work Type <span className="text-red-500">*</span></Label>
                    <Select value={createFormData.workType} onValueChange={(value) => setCreateFormData({...createFormData, workType: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wfo">Onsite</SelectItem>
                        <SelectItem value="wfh">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experienceMin">Min Experience (years) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="experienceMin" 
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      value={createFormData.experienceMin}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers (including empty string for deletion)
                        if (value === '' || /^\d+$/.test(value)) {
                          setCreateFormData({...createFormData, experienceMin: value});
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and arrow keys
                        if (!/[0-9]/.test(e.key) && 
                            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                            !(e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                        }
                      }}
                      className={formErrors.experienceMin ? "border-red-500" : ""}
                    />
                    {formErrors.experienceMin && (
                      <p className="text-sm text-red-500">{formErrors.experienceMin}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experienceMax">Max Experience (years) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="experienceMax" 
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={createFormData.experienceMax}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers (including empty string for deletion)
                        if (value === '' || /^\d+$/.test(value)) {
                          setCreateFormData({...createFormData, experienceMax: value});
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and arrow keys
                        if (!/[0-9]/.test(e.key) && 
                            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                            !(e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                        }
                      }}
                      className={formErrors.experienceMax ? "border-red-500" : ""}
                    />
                    {formErrors.experienceMax && (
                      <p className="text-sm text-red-500">{formErrors.experienceMax}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Number of Openings and Estimated Hiring Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfOpenings">Number of Openings <span className="text-red-500">*</span></Label>
                  <Input 
                    id="numberOfOpenings" 
                    type="number"
                    min="1"
                    placeholder="e.g. 2"
                    value={createFormData.numberOfOpenings}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers (including empty string for deletion)
                      if (value === '' || /^\d+$/.test(value)) {
                        setCreateFormData({...createFormData, numberOfOpenings: value});
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and arrow keys
                      if (!/[0-9]/.test(e.key) && 
                          !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                          !(e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                      }
                    }}
                    className={formErrors.numberOfOpenings ? "border-red-500" : ""}
                  />
                  {formErrors.numberOfOpenings && (
                    <p className="text-sm text-red-500">{formErrors.numberOfOpenings}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated-duration">Estimated Hiring Timeline <span className="text-red-500">*</span></Label>
                  <Select value={createFormData.estimatedDuration} onValueChange={(value) => setCreateFormData({...createFormData, estimatedDuration: value})}>
                    <SelectTrigger className={formErrors.estimatedDuration ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                      <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.estimatedDuration && (
                    <p className="text-sm text-red-500">{formErrors.estimatedDuration}</p>
                  )}
                </div>
              </div>

              {/* Duration field - only show for contract and internship */}
              {(createFormData.type === 'contract' || createFormData.type === 'internship') && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration <span className="text-red-500">*</span></Label>
                  <Input 
                    id="duration" 
                    placeholder="e.g. 6 months, 3 months, 1 year"
                    value={createFormData.duration}
                    onChange={(e) => setCreateFormData({...createFormData, duration: e.target.value})}
                    className={formErrors.duration ? "border-red-500" : ""}
                  />
                  {formErrors.duration && (
                    <p className="text-sm text-red-500">{formErrors.duration}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Specify the duration for this {createFormData.type} position
                  </p>
                </div>
              )}

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description <span className="text-red-500">*</span></Label>
                  <Textarea 
                    id="description" 
                    placeholder="Enter detailed job description, responsibilities, and expectations..."
                    className={`min-h-[120px] ${formErrors.description ? "border-red-500" : ""}`}
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-500">{formErrors.description}</p>
                  )}
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative col-span-2">
                    <Label htmlFor="skills">Required Skills <span className="text-red-500">*</span></Label>
                    <Input 
                      id="skills" 
                      placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                      value={createFormData.skills}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCreateFormData({...createFormData, skills: value});
                        
                        // Extract the last skill being typed for suggestions
                        const skills = value.split(',').map(s => s.trim());
                        const lastSkill = skills[skills.length - 1] || '';
                        setSkillInputValue(lastSkill);
                        setShowSkillSuggestions(lastSkill.length > 0);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
                          const raw = createFormData.skills;
                          const parts = raw.split(',');
                          const last = parts[parts.length - 1].trim();
                          if (last.length > 0) {
                            e.preventDefault();
                            const current = raw
                              .split(',')
                              .map(s => s.trim())
                              .filter(Boolean);
                            if (!current.includes(last)) {
                              const newSkills = [...current, last].join(', ') + ', ';
                              setCreateFormData({...createFormData, skills: newSkills});
                            } else if (!raw.endsWith(', ')) {
                              // Ensure consistent trailing comma+space after confirming token
                              setCreateFormData({...createFormData, skills: current.join(', ') + ', '});
                            }
                            setShowSkillSuggestions(false);
                            setSkillInputValue('');
                          }
                        }
                      }}
                      onFocus={() => {
                        const skills = createFormData.skills.split(',').map(s => s.trim());
                        const lastSkill = skills[skills.length - 1] || '';
                        setSkillInputValue(lastSkill);
                        setShowSkillSuggestions(lastSkill.length > 0);
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicking on them
                        setTimeout(() => setShowSkillSuggestions(false), 200);
                      }}
                      className={formErrors.skills ? "border-red-500" : ""}
                    />
                    
                    {/* Live Skill Suggestions */}
                    {showSkillSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {filteredSuggestions.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              // Replace the last (partial) token with the selected suggestion
                              const tokens = createFormData.skills.split(',').map(s => s.trim());
                              if (tokens.length === 0) {
                                const only = skill + ', ';
                                setCreateFormData({...createFormData, skills: only});
                              } else {
                                tokens[tokens.length - 1] = skill;
                                const unique = Array.from(new Set(tokens.filter(Boolean)));
                                const newSkills = unique.join(', ') + ', ';
                                setCreateFormData({...createFormData, skills: newSkills});
                              }
                              setShowSkillSuggestions(false);
                              setSkillInputValue('');
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Added skills as tags */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {createFormData.skills
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean)
                        .map(skill => (
                          <span key={skill} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200">
                            {skill}
                          </span>
                        ))}
                    </div>
                    {formErrors.skills && (
                      <p className="text-sm text-red-500">{formErrors.skills}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Compensation & Benefits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compensation & Benefits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary-min">Minimum Salary <span className="text-red-500">*</span></Label>
                    <Input 
                      id="salary-min" 
                      type="number"
                      placeholder="e.g. 80000"
                      value={createFormData.salaryMin}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers (including empty string for deletion)
                        if (value === '' || /^\d+$/.test(value)) {
                          setCreateFormData({...createFormData, salaryMin: value});
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and arrow keys
                        if (!/[0-9]/.test(e.key) && 
                            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                            !(e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                        }
                      }}
                      className={formErrors.salaryMin ? "border-red-500" : ""}
                    />
                    {formErrors.salaryMin && (
                      <p className="text-sm text-red-500">{formErrors.salaryMin}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Maximum Salary <span className="text-red-500">*</span></Label>
                    <Input 
                      id="salary-max" 
                      type="number"
                      placeholder="e.g. 120000"
                      value={createFormData.salaryMax}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers (including empty string for deletion)
                        if (value === '' || /^\d+$/.test(value)) {
                          setCreateFormData({...createFormData, salaryMax: value});
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent non-numeric keys except backspace, delete, tab, escape, enter, and arrow keys
                        if (!/[0-9]/.test(e.key) && 
                            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) &&
                            !(e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                        }
                      }}
                      className={formErrors.salaryMax ? "border-red-500" : ""}
                    />
                    {formErrors.salaryMax && (
                      <p className="text-sm text-red-500">{formErrors.salaryMax}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={createFormData.currency} onValueChange={(value) => setCreateFormData({...createFormData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits & Perks</Label>
                  <Input 
                    id="benefits" 
                    placeholder="e.g. Health insurance, 401k, Remote work, Flexible hours (comma separated)"
                    value={createFormData.benefits}
                    onChange={(e) => setCreateFormData({...createFormData, benefits: e.target.value})}
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="application-deadline">Application Deadline</Label>
                    <Input 
                      id="application-deadline" 
                      type="date"
                      value={createFormData.applicationDeadline}
                      onChange={(e) => setCreateFormData({...createFormData, applicationDeadline: e.target.value})}
                      className={formErrors.applicationDeadline ? "border-red-500" : ""}
                    />
                    {formErrors.applicationDeadline && (
                      <p className="text-sm text-red-500">{formErrors.applicationDeadline}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interview-rounds">Interview Rounds</Label>
                    <Select value={createFormData.interviewRounds.toString()} onValueChange={(value) => setCreateFormData({...createFormData, interviewRounds: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rounds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Round</SelectItem>
                        <SelectItem value="2">2 Rounds</SelectItem>
                        <SelectItem value="3">3 Rounds</SelectItem>
                        <SelectItem value="4">4+ Rounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Optional JD Upload */}
                <div className="space-y-2">
                  <Label htmlFor="jd-upload-create">Job Description PDF (Optional)</Label>
                  <input
                    type="file"
                    id="jd-upload-create"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file type - only PDF
                        if (file.type !== 'application/pdf') {
                          toast({
                            title: 'Invalid File Type',
                            description: 'Please upload a PDF file (.pdf only)',
                            variant: 'destructive',
                          });
                          e.target.value = '';
                          return;
                        }

                        // Validate file size (5MB limit)
                        const maxSize = 5 * 1024 * 1024;
                        if (file.size > maxSize) {
                          toast({
                            title: 'File Too Large',
                            description: 'Please upload a file smaller than 5MB',
                            variant: 'destructive',
                          });
                          e.target.value = '';
                          return;
                        }

                        setSelectedJDFile(file);
                        setJDUploadState('uploading');
                        
                        try {
                          const uploadResponse = await apiClient.uploadJD(file);
                          if (uploadResponse.data?.file?.id) {
                            setJDFileId(uploadResponse.data.file.id);
                            setJDUploadState('idle');
                            toast({
                              title: 'JD Uploaded',
                              description: 'Job Description PDF has been uploaded successfully.',
                            });
                          }
                        } catch (error: any) {
                          console.error('JD upload error:', error);
                          const errorMessage = error?.detail || error?.message || 'Failed to upload JD. Please try again.';
                          toast({
                            title: 'Upload Failed',
                            description: errorMessage,
                            variant: 'destructive',
                          });
                          setJDUploadState('idle');
                          setSelectedJDFile(null);
                          e.target.value = '';
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="jd-upload-create">
                    <Button variant="outline" asChild className="w-full">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {selectedJDFile ? selectedJDFile.name : 'Choose JD File (PDF)'}
                      </span>
                    </Button>
                  </label>
                  {selectedJDFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{(selectedJDFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      {jdUploadState === 'uploading' && (
                        <span className="text-blue-600">Uploading...</span>
                      )}
                    </div>
                  )}
                  {jdFileId && (
                    <p className="text-sm text-green-600 mt-1">JD uploaded successfully. It will be attached to this job.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF file containing the job description. This is optional but recommended.
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={createLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateJob}
                disabled={createLoading || !createFormData.title || !createFormData.description || !createFormData.location}
              >
                {createLoading ? "Creating..." : "Create Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </div>
        </div>

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>Update the job details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Job Title <span className="text-red-500">*</span></Label>
                    <Input id="edit-title" value={editFormData.title} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2 relative">
                    <Label htmlFor="edit-location">Location <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-location" 
                      placeholder="Type to search cities in India..."
                      value={editFormData.location}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEditFormData({...editFormData, location: value});
                        
                        // Filter cities based on input
                        if (value.length > 0) {
                          const filtered = indianCities.filter(city => 
                            city.toLowerCase().includes(value.toLowerCase())
                          ).slice(0, 8);
                          setFilteredCities(filtered);
                          setShowCitySuggestions(filtered.length > 0);
                        } else {
                          setShowCitySuggestions(false);
                          setFilteredCities([]);
                        }
                      }}
                      onFocus={(e) => {
                        if (e.target.value.length > 0) {
                          const filtered = indianCities.filter(city => 
                            city.toLowerCase().includes(e.target.value.toLowerCase())
                          ).slice(0, 8);
                          setFilteredCities(filtered);
                          setShowCitySuggestions(filtered.length > 0);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowCitySuggestions(false), 200);
                      }}
                    />
                    {showCitySuggestions && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              setEditFormData({...editFormData, location: city});
                              setShowCitySuggestions(false);
                            }}
                          >
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{city}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">Company <span className="text-red-500">*</span></Label>
                    <Select value={editFormData.companyId} onValueChange={(value) => {
                      setEditFormData({ ...editFormData, companyId: value });
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company: any) => (
                          <SelectItem key={company._id} value={company._id}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Job Type <span className="text-red-500">*</span></Label>
                    <Select value={editFormData.type} onValueChange={(value) => setEditFormData({...editFormData, type: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-workType">Work Type <span className="text-red-500">*</span></Label>
                    <Select value={editFormData.workType} onValueChange={(value) => setEditFormData({...editFormData, workType: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select work type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wfo">Onsite</SelectItem>
                        <SelectItem value="wfh">Hybrid</SelectItem>
                        <SelectItem value="remote">Remote</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-experienceMin">Min Experience (years) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-experienceMin" 
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      value={editFormData.experienceMin}
                      onChange={(e) => setEditFormData({...editFormData, experienceMin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-experienceMax">Max Experience (years) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-experienceMax" 
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={editFormData.experienceMax}
                      onChange={(e) => setEditFormData({...editFormData, experienceMax: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Openings & Timeline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-openings">Number of Openings <span className="text-red-500">*</span></Label>
                  <Input id="edit-openings" type="number" min="1" value={editFormData.numberOfOpenings} onChange={(e) => setEditFormData({...editFormData, numberOfOpenings: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estimated">Estimated Hiring Timeline <span className="text-red-500">*</span></Label>
                  <Select value={editFormData.estimatedDuration} onValueChange={(value) => setEditFormData({...editFormData, estimatedDuration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                      <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration (conditional) */}
              {(editFormData.type === 'contract' || editFormData.type === 'internship') && (
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration <span className="text-red-500">*</span></Label>
                  <Input id="edit-duration" value={editFormData.duration} onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})} />
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Detailed Description <span className="text-red-500">*</span></Label>
                <Textarea id="edit-description" className="min-h-[120px]" value={editFormData.description} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
              </div>

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 relative col-span-2">
                    <Label htmlFor="edit-skills">Required Skills <span className="text-red-500">*</span></Label>
                    <Input id="edit-skills" value={editFormData.skills} onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Compensation & Benefits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compensation & Benefits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-salary-min">Minimum Salary <span className="text-red-500">*</span></Label>
                    <Input id="edit-salary-min" type="number" value={editFormData.salaryMin} onChange={(e) => setEditFormData({...editFormData, salaryMin: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salary-max">Maximum Salary <span className="text-red-500">*</span></Label>
                    <Input id="edit-salary-max" type="number" value={editFormData.salaryMax} onChange={(e) => setEditFormData({...editFormData, salaryMax: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select value={editFormData.currency} onValueChange={(value) => setEditFormData({...editFormData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-benefits">Benefits & Perks</Label>
                  <Input id="edit-benefits" value={editFormData.benefits} onChange={(e) => setEditFormData({...editFormData, benefits: e.target.value})} />
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-application-deadline">Application Deadline</Label>
                    <Input 
                      id="edit-application-deadline" 
                      type="date"
                      value={editFormData.applicationDeadline}
                      onChange={(e) => setEditFormData({...editFormData, applicationDeadline: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-interview-rounds">Interview Rounds</Label>
                    <Select value={editFormData.interviewRounds.toString()} onValueChange={(value) => setEditFormData({...editFormData, interviewRounds: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rounds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Round</SelectItem>
                        <SelectItem value="2">2 Rounds</SelectItem>
                        <SelectItem value="3">3 Rounds</SelectItem>
                        <SelectItem value="4">4+ Rounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Optional JD Upload */}
              <div className="space-y-2">
                <Label htmlFor="jd-upload-edit">Job Description PDF (Optional)</Label>
                  <input
                    type="file"
                    id="jd-upload-edit"
                    accept=".pdf"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Validate file type - only PDF (check both MIME type and file extension)
                        const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                        if (!isPDF) {
                          toast({
                            title: 'Invalid File Type',
                            description: 'Please upload a PDF file (.pdf only)',
                            variant: 'destructive',
                          });
                          e.target.value = '';
                          return;
                        }

                        // Validate file size (5MB limit)
                        const maxSize = 5 * 1024 * 1024;
                        if (file.size > maxSize) {
                          toast({
                            title: 'File Too Large',
                            description: 'Please upload a file smaller than 5MB',
                            variant: 'destructive',
                          });
                          e.target.value = '';
                          return;
                        }

                        setSelectedEditJDFile(file);
                        setEditJDUploadState('uploading');
                        
                        try {
                          const uploadResponse = await apiClient.uploadJD(file);
                          if (uploadResponse.data?.file?.id) {
                            setEditJDFileId(uploadResponse.data.file.id);
                            setEditJDUploadState('idle');
                            toast({
                              title: 'JD Uploaded',
                              description: 'Job Description PDF has been uploaded successfully.',
                            });
                          }
                        } catch (error: any) {
                          console.error('JD upload error:', error);
                          const errorMessage = error?.detail || error?.message || 'Failed to upload JD. Please try again.';
                          toast({
                            title: 'Upload Failed',
                            description: errorMessage,
                            variant: 'destructive',
                          });
                          setEditJDUploadState('idle');
                          setSelectedEditJDFile(null);
                          e.target.value = '';
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <label htmlFor="jd-upload-edit">
                    <Button variant="outline" asChild className="w-full">
                      <span className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {selectedEditJDFile ? selectedEditJDFile.name : editJDFileId ? 'Replace JD File (PDF)' : 'Choose JD File (PDF)'}
                      </span>
                    </Button>
                  </label>
                  {selectedEditJDFile && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{(selectedEditJDFile.size / 1024 / 1024).toFixed(2)} MB</span>
                      {editJDUploadState === 'uploading' && (
                        <span className="text-blue-600">Uploading...</span>
                      )}
                    </div>
                  )}
                  {editJDFileId && !selectedEditJDFile && (
                    <p className="text-sm text-green-600 mt-1">JD file is already attached to this job. Upload a new file to replace it.</p>
                  )}
                  {editJDFileId && selectedEditJDFile && (
                    <p className="text-sm text-green-600 mt-1">New JD uploaded successfully. It will replace the existing one when you save changes.</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Upload a PDF file containing the job description. This is optional but recommended.
                  </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateLoading}>Cancel</Button>
              <Button onClick={handleUpdateJob} disabled={updateLoading}> {updateLoading ? 'Saving...' : 'Save Changes'} </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : allJobsStats.totalJobs}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-blue-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">Open Jobs</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : allJobsStats.openJobs}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-emerald-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Total Applications</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : allJobsStats.totalApplications}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">Hired Candidates</p>
                <p className="text-2xl font-bold text-white">
                  {hiredCandidatesLoading ? "..." : hiredCandidatesCount}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <UserCheck className="w-6 h-6 text-amber-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
              <Input
                placeholder="Search by title, location, skills, job ID, HR name/ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-[200px] border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                  <Filter className="w-4 h-4 mr-2 text-purple-600" />
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company: any) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                  <ArrowUpDown className="w-4 h-4 mr-2 text-emerald-600" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="company">Company Name</SelectItem>
                  <SelectItem value="applications">Most Applications</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
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
                    <TableHead className="w-40">Stats</TableHead>
                    <TableHead>{user?.role === 'hr' ? 'Agent' : 'Posted By'}</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead></TableHead>
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
                          <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-gray-300 rounded w-16 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-300 rounded-full animate-pulse"></div>
                          <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
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
            ) : jobsError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading jobs. Please try again.</p>
              <Button onClick={() => refetchJobs()} variant="outline" className="mt-2">
                Retry
              </Button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No jobs found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-40">Stats</TableHead>
                  <TableHead>{user?.role === 'hr' ? 'Agent' : 'Posted By'}</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job: any) => (
                  <TableRow key={job.id || job._id}>
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
                      <div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          {job.location || 'Remote'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-4 h-4 flex-shrink-0" />
                          <Badge variant="outline" className="text-xs">
                            {job.type}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="w-40">
                      <div className="flex flex-col gap-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs w-fit border-0 bg-transparent text-purple-600 cursor-pointer hover:underline"
                          onClick={() => {
                            navigate(`/dashboard/shared-candidates?jobId=${job._id || job.id}`);
                          }}
                        >
                          {job.applications || 0} Applicants
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="text-xs w-fit border-0 bg-transparent text-green-600 cursor-pointer hover:underline"
                          onClick={() => {
                            navigate(`/dashboard/jobs/${job.jobId || job._id || job.id}`);
                          }}
                        >
                          {job.numberOfOpenings || 1} Openings
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user?.role === 'hr' ? (
                        // For HR users, show the assigned agent
                        (() => {
                          const agent = job.assignedAgentId;
                          
                          // Check if agent exists and is populated (has firstName property)
                          if (agent && typeof agent === 'object' && agent.firstName) {
                            return (
                              <div className="flex items-center gap-3">
                                <AgentAvatar 
                                  agent={agent}
                                  onClick={() => {
                                    if (agent.customId) {
                                      navigate(`/dashboard/agent-profile/${agent.customId}`);
                                    } else if (agent._id || agent.id) {
                                      // Fallback to MongoDB _id if customId is not available
                                      navigate(`/dashboard/agent-profile/${agent._id || agent.id}`);
                                    }
                                  }}
                                />
                                <div>
                                  <p 
                                    className="font-medium cursor-pointer hover:text-emerald-600 hover:underline transition-colors"
                                    onClick={() => {
                                      if (agent.customId) {
                                        navigate(`/dashboard/agent-profile/${agent.customId}`);
                                      } else if (agent._id || agent.id) {
                                        // Fallback to MongoDB _id if customId is not available
                                        navigate(`/dashboard/agent-profile/${agent._id || agent.id}`);
                                      }
                                    }}
                                  >
                                    {agent.firstName} {agent.lastName}
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          // If agent exists but is not populated (just an ObjectId), still show "No agent assigned"
                          // This means the API didn't populate it, which shouldn't happen
                          return <span className="text-muted-foreground text-sm">No agent assigned</span>;
                        })()
                      ) : (
                        // For other users, show who posted the job
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
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {job.postedAt ? new Date(job.postedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }) : job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }) : 'N/A'}
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
                          <DropdownMenuItem onClick={() => handleViewJob(job)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditJob(job)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteJob(job.id || job._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination Controls - hide during ID search since we fetch all results */}
          {!jobsLoading && !jobsError && jobs.length > 0 && !isIdSearch && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                {meta ? (
                  <>
                    Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(page * 20, meta.total)}</span> of{' '}
                    <span className="font-medium">{meta.total}</span> jobs
                  </>
                ) : (
                  <>
                    Showing <span className="font-medium">{((page - 1) * 20) + 1}</span> to{' '}
                    <span className="font-medium">{((page - 1) * 20) + jobs.length}</span>
                    {allJobsStats.totalJobs > 0 && (
                      <>
                        {' '}of <span className="font-medium">{allJobsStats.totalJobs}</span>
                      </>
                    )} jobs
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {(() => {
                    // Calculate total pages from available data
                    const PAGE_SIZE = 20;
                    let totalPages = 1;
                    
                    if (meta?.totalPages) {
                      totalPages = meta.totalPages;
                    } else if (meta?.total) {
                      totalPages = Math.ceil(meta.total / PAGE_SIZE);
                    } else if (allJobsStats.totalJobs > 0) {
                      totalPages = Math.ceil(allJobsStats.totalJobs / PAGE_SIZE);
                    } else if (jobs.length > 0) {
                      // Fallback: if we have jobs but no total, estimate based on current page
                      totalPages = Math.max(page, Math.ceil(jobs.length / PAGE_SIZE));
                    }
                    
                    // Ensure at least 1 page
                    totalPages = Math.max(1, totalPages);
                    
                    if (totalPages <= 1) {
                      return (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-9"
                        >
                          1
                        </Button>
                      );
                    }
                    
                    // Calculate sliding window of 3 pages centered around current page
                    let startPage = Math.max(1, page - 1);
                    let endPage = Math.min(totalPages, startPage + 2);
                    
                    // Adjust start page if we're near the end
                    if (endPage - startPage < 2 && startPage > 1) {
                      startPage = Math.max(1, endPage - 2);
                    }
                    
                    const pagesToShow = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pagesToShow.push(i);
                    }
                    
                    return pagesToShow.map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-9"
                      >
                        {pageNum}
                      </Button>
                    ));
                  })()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={(() => {
                    const PAGE_SIZE = 20;
                    let totalPages = 1;
                    
                    if (meta?.totalPages) {
                      totalPages = meta.totalPages;
                    } else if (meta?.total) {
                      totalPages = Math.ceil(meta.total / PAGE_SIZE);
                    } else if (allJobsStats.totalJobs > 0) {
                      totalPages = Math.ceil(allJobsStats.totalJobs / PAGE_SIZE);
                    } else if (jobs.length > 0) {
                      totalPages = Math.max(page, Math.ceil(jobs.length / PAGE_SIZE));
                    }
                    
                    return page >= totalPages;
                  })()}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}