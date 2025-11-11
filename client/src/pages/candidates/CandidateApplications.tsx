  const handleMetricClick = (status: AssignmentStatus) => {
    switch (status) {
      case 'active':
        setStatusFilter('in_progress');
        break;
      case 'completed':
        setStatusFilter('hired');
        break;
      case 'rejected':
        setStatusFilter('rejected');
        break;
      case 'withdrawn':
        setStatusFilter('withdrawn');
        break;
      default:
        setStatusFilter('all' as StatusFilter);
    }
  };
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { LucideIcon } from 'lucide-react';
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
  User,
  Phone,
  MoreHorizontal,
  ArrowUpRight
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMyCandidateAssignments } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { DashboardBanner } from '@/components/dashboard/Banner';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';
import { getApiUrl } from '@/lib/utils';

interface CandidateAssignment {
  _id: string;
  candidateId: {
    _id: string;
    userId: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
      profilePhotoFileId?: string;
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
        startDate?: string;
        endDate?: string;
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
  jobId?: {
    _id?: string;
    id?: string;
    jobId?: string;
    title: string;
    companyId: {
      _id: string;
      companyId?: string;
      name: string;
      industry?: string;
      location?: string;
      logoUrl?: string;
      logoFileId?: string | { _id?: string; toString?: () => string };
    };
    location?: string;
    type?: string;
    salaryRange?: {
      min: number;
      max: number;
      currency: string;
    };
    createdBy?: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
      profilePhotoFileId?: string;
    };
  };
  assignedBy: {
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
    profilePhotoFileId?: string;
    phoneNumber?: string;
  };
  assignedTo?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
    profilePhotoFileId?: string;
  };
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  candidateStatus?: 'new' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offer_sent' | 'hired' | 'rejected';
  notes?: string;
  feedback?: string;
  assignedAt: string;
  lastActivityAt?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

type AssignmentStatus = CandidateAssignment['status'];
type CandidateFlowStatus = NonNullable<CandidateAssignment['candidateStatus']>;

const ASSIGNMENT_STATUS_ORDER: AssignmentStatus[] = ['active', 'completed', 'rejected', 'withdrawn'];

const CANDIDATE_STATUS_ORDER: CandidateFlowStatus[] = [
  'new',
  'reviewed',
  'shortlisted',
  'interview_scheduled',
  'interviewed',
  'offer_sent',
  'hired',
  'rejected',
];

const STATUS_CARD_CONFIG: Record<AssignmentStatus, {
  title: string;
  subtitle: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
  icon: LucideIcon;
}> = {
  active: {
    title: 'Active Assignments',
    subtitle: 'In progress',
    color: 'blue',
    icon: Clock
  },
  completed: {
    title: 'Completed',
    subtitle: 'Successfully closed',
    color: 'emerald',
    icon: CheckCircle
  },
  rejected: {
    title: 'Rejected',
    subtitle: 'Closed out',
    color: 'purple',
    icon: XCircle
  },
  withdrawn: {
    title: 'Withdrawn',
    subtitle: 'Paused or on hold',
    color: 'amber',
    icon: AlertTriangle
  }
};

type StatusFilter = 'all' | CandidateFlowStatus | 'in_progress' | 'withdrawn';
type SortOption = 'recent' | 'oldest' | 'company' | 'status';

const CANDIDATE_STATUS_RANK: Record<CandidateFlowStatus, number> = {
  new: 0,
  reviewed: 1,
  shortlisted: 2,
  interview_scheduled: 3,
  interviewed: 4,
  offer_sent: 5,
  hired: 6,
  rejected: 7,
};

// Component for Agent avatar with profile photo
const AgentAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  initials: string;
}> = ({ profilePhotoFileId, firstName, lastName, initials }) => {
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      {authenticatedImageUrl && (
        <AvatarImage 
          src={authenticatedImageUrl} 
          alt={`${firstName} ${lastName}`}
        />
      )}
      <AvatarFallback className="text-xs text-white font-semibold bg-emerald-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

// Component for HR avatar with profile photo
const HRAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  initials: string;
}> = ({ profilePhotoFileId, firstName, lastName, initials }) => {
  const profilePhotoUrl = profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      {authenticatedImageUrl && (
        <AvatarImage 
          src={authenticatedImageUrl} 
          alt={`${firstName} ${lastName}`}
        />
      )}
      <AvatarFallback className="text-xs text-white font-semibold bg-blue-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

// Component for company avatar with logo
const CompanyAvatar: React.FC<{
  logoFileId?: string | { _id?: string; toString?: () => string };
  companyName: string;
}> = ({ logoFileId, companyName }) => {
  const fileId = logoFileId 
    ? (typeof logoFileId === 'object' && logoFileId !== null && '_id' in logoFileId
        ? (logoFileId._id?.toString() || logoFileId.toString?.())
        : typeof logoFileId === 'string'
        ? logoFileId
        : null)
    : null;
  
  const logoUrl = fileId 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/company-logo/${fileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(logoUrl);
  
  const initials = useMemo(() => {
    return companyName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [companyName]);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      {authenticatedImageUrl && (
        <AvatarImage 
          src={authenticatedImageUrl} 
          alt={companyName}
        />
      )}
      <AvatarFallback className="text-xs text-white font-semibold bg-purple-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
};

const StatusMetricCard: React.FC<{
  status: AssignmentStatus;
  count: number;
  onClick?: () => void;
  isActive?: boolean;
}> = ({ status, count, onClick, isActive }) => {
  const config = STATUS_CARD_CONFIG[status];
  const Icon = config.icon;
  const safeCount = typeof count === 'number' && Number.isFinite(count) ? count : 0;

  const colorClasses: Record<typeof config.color, string> = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <Card
      className={`bg-gradient-to-br ${colorClasses[config.color]} text-white shadow-lg hover:shadow-xl transition-all duration-300 ${
        onClick ? 'cursor-pointer' : ''
      } ${isActive ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-transparent' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-white/80">{config.subtitle}</p>
            <h3 className="text-3xl font-bold mt-1">{safeCount.toLocaleString()}</h3>
            <p className="text-xs text-white/70 mt-1 uppercase tracking-wide">{config.title}</p>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CandidateApplications: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useAuth();
  const navigate = useNavigate();

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
  const assignments: CandidateAssignment[] = Array.isArray(assignmentsData)
    ? (assignmentsData as CandidateAssignment[])
    : ((assignmentsData as { data?: CandidateAssignment[] })?.data || []);
  const meta = Array.isArray(assignmentsData) ? {} : (assignmentsData as any)?.meta || {};

  const companyOptions = useMemo(() => {
    const names = new Set<string>();
    assignments.forEach((assignment) => {
      const name = assignment.jobId?.companyId?.name;
      if (name) {
        names.add(name);
      }
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [assignments]);

  // Filter & sort assignments based on search term, status/company filters and sort option
  const filteredAssignments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const companyFilterLower = companyFilter === 'all' ? 'all' : companyFilter.toLowerCase();

    const filtered = assignments.filter((assignment: CandidateAssignment) => {
      const jobTitle = assignment.jobId?.title?.toLowerCase() || '';
      const companyName = assignment.jobId?.companyId?.name?.toLowerCase() || '';
      const hrName = assignment.assignedTo
        ? `${assignment.assignedTo.firstName} ${assignment.assignedTo.lastName}`.toLowerCase()
        : '';
      const agentName = `${assignment.assignedBy.firstName} ${assignment.assignedBy.lastName}`.toLowerCase();
      const jobIdentifier = assignment.jobId?.jobId || assignment.jobId?.id || assignment.jobId?._id;

      const jobIdMatchesSearch = (() => {
        if (!term) return true;
        if (!jobIdentifier) return false;

        const rawId = String(jobIdentifier).toLowerCase();
        const normalizedTerm = term.replace(/\s+/g, '').toLowerCase();

        if (!normalizedTerm.startsWith('job')) {
          return rawId.includes(normalizedTerm);
        }

        const rawIdNormalized = rawId.replace(/\s+/g, '');
        const termNumeric = normalizedTerm.slice(3);
        const rawNumeric = rawIdNormalized.startsWith('job') ? rawIdNormalized.slice(3) : rawIdNormalized;

        if (!termNumeric) {
          return rawIdNormalized.startsWith('job');
        }

        if (rawNumeric === termNumeric) return true;
        if (rawNumeric.replace(/^0+/, '') === termNumeric.replace(/^0+/, '')) return true;
        if (rawNumeric.includes(termNumeric) || termNumeric.includes(rawNumeric)) return true;

        const variations = [
          `job${termNumeric}`,
          `job${termNumeric.replace(/^0+/, '')}`,
          `job${termNumeric.padStart(rawNumeric.length, '0')}`,
        ];

        return variations.some((variant) => rawIdNormalized.includes(variant));
      })();

      const matchesSearch = term
        ? jobTitle.includes(term) ||
          companyName.includes(term) ||
          hrName.includes(term) ||
          agentName.includes(term) ||
          jobIdMatchesSearch
        : true;

      const matchesStatus = (() => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'in_progress') {
          const activeCandidateStatuses: CandidateFlowStatus[] = [
            'new',
            'reviewed',
            'shortlisted',
            'interview_scheduled',
            'interviewed',
            'offer_sent',
          ];
          return (
            assignment.status === 'active' &&
            activeCandidateStatuses.includes(
              (assignment.candidateStatus || 'new') as CandidateFlowStatus
            )
          );
        }
        if (statusFilter === 'withdrawn') {
          return assignment.status === 'withdrawn';
        }
        return assignment.candidateStatus === statusFilter;
      })();

      const matchesCompany =
        companyFilterLower === 'all' || companyName === companyFilterLower;

      return matchesSearch && matchesStatus && matchesCompany;
    });

    const sorted = [...filtered].sort((a, b) => {
      const getTime = (value?: string) => {
        const time = value ? new Date(value).getTime() : NaN;
        return Number.isFinite(time) ? time : 0;
      };

      switch (sortOption) {
        case 'recent':
          return getTime(b.assignedAt) - getTime(a.assignedAt);
        case 'oldest':
          return getTime(a.assignedAt) - getTime(b.assignedAt);
        case 'company': {
          const aName = a.jobId?.companyId?.name || '';
          const bName = b.jobId?.companyId?.name || '';
          return aName.localeCompare(bName);
        }
        case 'status': {
          const aStatus = a.candidateStatus;
          const bStatus = b.candidateStatus;
          const aRank =
            aStatus && aStatus in CANDIDATE_STATUS_RANK
              ? CANDIDATE_STATUS_RANK[aStatus as CandidateFlowStatus]
              : Number.MAX_SAFE_INTEGER;
          const bRank =
            bStatus && bStatus in CANDIDATE_STATUS_RANK
              ? CANDIDATE_STATUS_RANK[bStatus as CandidateFlowStatus]
              : Number.MAX_SAFE_INTEGER;
          return aRank - bRank;
        }
        default:
          return 0;
      }
    });

    return sorted;
  }, [assignments, searchTerm, statusFilter, companyFilter, sortOption]);

  const statusCounts = useMemo(() => {
    const baseCounts: Record<AssignmentStatus, number> = {
      active: 0,
      completed: 0,
      rejected: 0,
      withdrawn: 0,
    };

    for (const assignment of assignments) {
      const status = assignment?.status as AssignmentStatus | undefined;
      if (status && status in baseCounts) {
        baseCounts[status] += 1;
      }

      if (assignment.candidateStatus === 'rejected' && status !== 'rejected') {
        baseCounts.rejected += 1;
        if (status === 'active' && baseCounts.active > 0) {
          baseCounts.active -= 1;
        }
      }

      if (assignment.candidateStatus === 'hired') {
        if (status !== 'completed') {
          baseCounts.completed += 1;
        }
        if (status === 'active' && baseCounts.active > 0) {
          baseCounts.active -= 1;
        }
      }
    }

    return baseCounts;
  }, [assignments]);

  const summaryStatusFilterMap: Record<AssignmentStatus, StatusFilter> = {
    active: 'in_progress',
    completed: 'hired',
    rejected: 'rejected',
    withdrawn: 'withdrawn',
  };

  const handleMetricClick = (status: AssignmentStatus) => {
    const mappedFilter = summaryStatusFilterMap[status];
    setStatusFilter((prev) => (prev === mappedFilter ? 'all' : mappedFilter));
    setCompanyFilter('all');
    setCurrentPage(1);
  };

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

  const getCandidateStatusColor = (status?: string) => {
    switch (status) {
      case 'new': return 'bg-gray-600 text-white border-gray-600';
      case 'reviewed': return 'bg-blue-600 text-white border-blue-600';
      case 'shortlisted': return 'bg-purple-600 text-white border-purple-600';
      case 'interview_scheduled': return 'bg-orange-600 text-white border-orange-600';
      case 'interviewed': return 'bg-yellow-600 text-white border-yellow-600';
      case 'offer_sent': return 'bg-indigo-600 text-white border-indigo-600';
      case 'hired': return 'bg-green-600 text-white border-green-600';
      case 'rejected': return 'bg-red-600 text-white border-red-600';
      default: return 'bg-gray-600 text-white border-gray-600';
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

  const formatCustomId = (customId: string | undefined): string => {
    if (!customId) return '';
    const match = customId.match(/^([A-Z]+)(0*)(\d+)$/);
    if (match) {
      const [, prefix, zeros, number] = match;
      return `${prefix}${parseInt(number, 10)}`;
    }
    return customId;
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
    if (!assignment || !assignment.jobId) {
      console.warn('Invalid assignment data:', assignment);
      return null;
    }

    const agentInitials = `${assignment.assignedBy?.firstName?.charAt(0) || ''}${assignment.assignedBy?.lastName?.charAt(0) || ''}`;
    const hrInitials = assignment.assignedTo 
      ? `${assignment.assignedTo.firstName?.charAt(0) || ''}${assignment.assignedTo.lastName?.charAt(0) || ''}`
      : '';
    const agentDisplayId = assignment.assignedBy?.customId ? formatCustomId(assignment.assignedBy.customId) : undefined;
    const hrDisplayId = assignment.assignedTo?.customId ? formatCustomId(assignment.assignedTo.customId) : undefined;
    const jobIdentifier = assignment.jobId?.jobId || assignment.jobId?.id || assignment.jobId?._id;

    return (
      <Card key={assignment._id} className="hover:shadow-md transition-shadow relative">
        <CardContent className="p-4 pb-2">
          {/* 3-dots menu in top right corner */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedAssignment(assignment);
                  setIsViewDialogOpen(true);
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </DropdownMenuItem>
                {assignment.jobId?._id || assignment.jobId?.id ? (
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/jobs/${assignment.jobId._id || assignment.jobId.id}`)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Job Details
                  </DropdownMenuItem>
                ) : null}
                {assignment.assignedBy?.customId && (
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/agent-profile/${assignment.assignedBy.customId}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View Agent Profile
                  </DropdownMenuItem>
                )}
                {assignment.assignedTo?.customId && (
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/hr-profile/${assignment.assignedTo.customId}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View HR Profile
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
              </div>
              
          {/* Row 1: Job, Agent, HR (if any), Candidate Status */}
          <div className={`grid gap-4 mb-3 ${assignment.assignedTo ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {/* Column 1: Job & Company Info */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                {assignment.jobId?.companyId ? (
                  <>
                    <CompanyAvatar
                      logoFileId={assignment.jobId.companyId.logoFileId}
                      companyName={assignment.jobId.companyId.name || 'Unknown Company'}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-base font-medium text-gray-900 truncate ${assignment.jobId?._id || assignment.jobId?.id ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                        onClick={() => {
                          const jobIdRef = assignment.jobId?._id || assignment.jobId?.id;
                          if (jobIdRef) {
                            navigate(`/dashboard/jobs/${jobIdRef}`);
                          }
                        }}
                      >
                        {assignment.jobId.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-0.5 truncate">
                        <span
                          className={`${assignment.jobId?.companyId?._id ? 'font-medium cursor-pointer hover:text-blue-600 transition-colors' : 'font-medium'}`}
                          onClick={() => {
                            const companyIdRef = assignment.jobId?.companyId?._id;
                            if (companyIdRef) {
                              navigate(`/dashboard/companies/${companyIdRef}`);
                            }
                          }}
                        >
                          {assignment.jobId?.companyId?.name || 'Unknown Company'}
                        </span>
                        {assignment.jobId.location && (
                          <span className="text-gray-400 ml-2">• {assignment.jobId.location}</span>
                        )}
                      </div>
                      {jobIdentifier && (
                        <div className="text-xs font-mono text-blue-600 mt-1 truncate">
                          {jobIdentifier}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-base font-medium text-gray-900 truncate ${assignment.jobId?._id || assignment.jobId?.id ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''}`}
                      onClick={() => {
                        const jobIdRef = assignment.jobId?._id || assignment.jobId?.id;
                        if (jobIdRef) {
                          navigate(`/dashboard/jobs/${jobIdRef}`);
                        }
                      }}
                    >
                      {assignment.jobId.title}
                    </div>
                    {jobIdentifier && (
                      <div className="text-xs font-mono text-blue-600 mt-1 truncate">
                        {jobIdentifier}
                      </div>
                    )}
                  </div>
                )}
              </div>
              </div>

            {/* Column 2: Agent Profile */}
            <div className="flex items-start space-x-3">
              <AgentAvatar
                profilePhotoFileId={assignment.assignedBy?.profilePhotoFileId}
                firstName={assignment.assignedBy?.firstName || ''}
                lastName={assignment.assignedBy?.lastName || ''}
                initials={agentInitials}
              />
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-gray-900 truncate">
                  {assignment.assignedBy?.firstName} {assignment.assignedBy?.lastName}
                  {agentDisplayId && (
                    <span className="text-xs font-mono text-emerald-600 ml-2">{agentDisplayId}</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate mt-0.5">
                  {assignment.assignedBy?.email}
              </div>
                {assignment.assignedBy?.phoneNumber && (
                  <div className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{assignment.assignedBy.phoneNumber}</span>
                </div>
              )}
              </div>
            </div>

            {/* Column 3: HR Profile (if exists) */}
            {assignment.assignedTo && (
              <div className="flex items-start space-x-3">
                <HRAvatar
                  profilePhotoFileId={assignment.assignedTo.profilePhotoFileId}
                  firstName={assignment.assignedTo.firstName}
                  lastName={assignment.assignedTo.lastName}
                  initials={hrInitials}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-base font-semibold text-gray-900 truncate">
                    {assignment.assignedTo.firstName} {assignment.assignedTo.lastName}
                    {hrDisplayId && (
                      <span className="text-xs font-mono text-blue-600 ml-2">{hrDisplayId}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Column 3: Candidate Status & Assigned Date */}
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Status & Assigned</div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`capitalize ${getCandidateStatusColor(assignment.candidateStatus)}`}>
                  {formatCandidateStatus(assignment.candidateStatus)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>{safeDateFormat(assignment.assignedAt, 'Unknown')} ago</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Agent Notes */}
          {assignment.notes && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                Agent's Notes
              </div>
              <div className="text-base text-gray-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                {assignment.notes}
              </div>
            </div>
          )}

          {/* Row 4: HR Feedback */}
          {assignment.feedback && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                HR's Feedback
              </div>
              <div className="text-base text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-200">
                {assignment.feedback}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <DashboardBanner category="candidate" />
      
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSIGNMENT_STATUS_ORDER.map((statusKey) => (
          <StatusMetricCard
            key={statusKey}
            status={statusKey}
            count={statusCounts[statusKey] ?? 0}
            onClick={() => handleMetricClick(statusKey)}
            isActive={statusFilter === summaryStatusFilterMap[statusKey]}
          />
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusFilter);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  {CANDIDATE_STATUS_ORDER.map((status) => (
                    <SelectItem key={status} value={status}>
                      {formatCandidateStatus(status)}
                    </SelectItem>
                  ))}
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={companyFilter}
                onValueChange={(value) => setCompanyFilter(value)}
              >
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companyOptions.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="company">Company A–Z</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
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
          {filteredAssignments.map(renderAssignmentCard).filter(Boolean)}
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
              <DialogDescription>
                Complete details of your job assignment
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Job & Company Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Job & Company Information</h4>
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3 mb-4">
                    {selectedAssignment.jobId?.companyId && (
                      <CompanyAvatar
                        logoFileId={selectedAssignment.jobId.companyId.logoFileId}
                        companyName={selectedAssignment.jobId.companyId.name || 'Unknown Company'}
                      />
                    )}
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-900">
                        {selectedAssignment.jobId?.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedAssignment.jobId?.companyId?.name}
                        {selectedAssignment.jobId?.companyId?.industry && (
                          <span className="ml-2 text-gray-500">• {selectedAssignment.jobId.companyId.industry}</span>
                        )}
                      </div>
                      {selectedAssignment.jobId?.location && (
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                          {selectedAssignment.jobId.location}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedAssignment.jobId?.salaryRange && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <span className="font-medium text-gray-700">Salary Range: </span>
                      <span className="text-gray-600">{formatSalary(selectedAssignment.jobId.salaryRange)}</span>
              </div>
                  )}
              </div>
            </div>
            
              {/* Agent Information */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Agent Who Assigned You</h4>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-start space-x-3">
                    <AgentAvatar
                      profilePhotoFileId={selectedAssignment.assignedBy?.profilePhotoFileId}
                      firstName={selectedAssignment.assignedBy?.firstName || ''}
                      lastName={selectedAssignment.assignedBy?.lastName || ''}
                      initials={`${selectedAssignment.assignedBy?.firstName?.charAt(0) || ''}${selectedAssignment.assignedBy?.lastName?.charAt(0) || ''}`}
                    />
                    <div className="flex-1">
                      <div 
                        className="text-base font-semibold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors"
                        onClick={() => {
                          if (selectedAssignment.assignedBy?.customId) {
                            navigate(`/dashboard/agent-profile/${selectedAssignment.assignedBy.customId}`);
                            setIsViewDialogOpen(false);
                          }
                        }}
                      >
                        {selectedAssignment.assignedBy?.firstName} {selectedAssignment.assignedBy?.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedAssignment.assignedBy?.email}
                      </div>
                      <div className="text-sm text-emerald-600 font-mono mt-1">
                        {formatCustomId(selectedAssignment.assignedBy?.customId)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* HR Information (if exists) */}
              {selectedAssignment.assignedTo && (
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">HR Contact</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <HRAvatar
                        profilePhotoFileId={selectedAssignment.assignedTo.profilePhotoFileId}
                        firstName={selectedAssignment.assignedTo.firstName}
                        lastName={selectedAssignment.assignedTo.lastName}
                        initials={`${selectedAssignment.assignedTo.firstName?.charAt(0) || ''}${selectedAssignment.assignedTo.lastName?.charAt(0) || ''}`}
                      />
                      <div className="flex-1">
                        <div 
                          className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => {
                            if (selectedAssignment.assignedTo?.customId) {
                              navigate(`/dashboard/hr-profile/${selectedAssignment.assignedTo.customId}`);
                              setIsViewDialogOpen(false);
                            }
                          }}
                        >
                          {selectedAssignment.assignedTo.firstName} {selectedAssignment.assignedTo.lastName}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedAssignment.assignedTo.email}
                        </div>
                        <div className="text-sm text-blue-600 font-mono mt-1">
                          {formatCustomId(selectedAssignment.assignedTo.customId)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Status */}
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Your Application Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Current Status:</span>
                    <div className="mt-2">
                      <Badge className={getCandidateStatusColor(selectedAssignment.candidateStatus)}>
                        {formatCandidateStatus(selectedAssignment.candidateStatus)}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Assignment Status:</span>
                    <div className="mt-2">
                      <Badge className={getStatusColor(selectedAssignment.status)}>
                        {selectedAssignment.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <span className="font-medium text-gray-700">Assigned Date:</span>
                    <div className="mt-1 text-gray-600">{safeFullDateFormat(selectedAssignment.assignedAt)}</div>
                  </div>
                  {selectedAssignment.lastActivityAt && (
                    <div className="bg-gray-50 p-3 rounded">
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <div className="mt-1 text-gray-600">{safeFullDateFormat(selectedAssignment.lastActivityAt)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent Notes */}
              {selectedAssignment.notes && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600" />
                    Agent's Notes
                  </h4>
                  <p className="text-sm text-gray-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    {selectedAssignment.notes}
                  </p>
                </div>
              )}

              {/* HR Feedback */}
              {selectedAssignment.feedback && (
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    HR's Feedback
                  </h4>
                  <p className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedAssignment.jobId?._id || selectedAssignment.jobId?.id ? (
                  <Button 
                    variant="default"
                    onClick={() => {
                      navigate(`/dashboard/jobs/${selectedAssignment.jobId._id || selectedAssignment.jobId.id}`);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Full Job Details
                  </Button>
                ) : null}
                {selectedAssignment.assignedBy?.customId && (
                  <Button 
                    variant="outline"
                    onClick={() => {
                      navigate(`/dashboard/agent-profile/${selectedAssignment.assignedBy.customId}`);
                      setIsViewDialogOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Contact Agent
                  </Button>
                )}
              </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CandidateApplications;
