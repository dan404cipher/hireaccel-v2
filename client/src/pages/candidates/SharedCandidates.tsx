import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageSquare,
  Briefcase,
  ExternalLink,
  MapPin,
  Phone,
  MoreHorizontal,
  Building2
} from 'lucide-react';
import { useMyCandidateAssignments, useUpdateCandidateAssignment, useCandidateAssignmentStats, useCandidateAssignments } from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { getApiUrl } from '@/lib/utils';
import { DashboardBanner } from '@/components/dashboard/Banner';
import { useAuthenticatedImage } from '@/hooks/useAuthenticatedImage';

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
      }>;
      preferredSalaryRange?: {
        min?: number;
        max?: number;
        currency: string;
      };
    };
    resumeFileId?: string;
  };
  assignedBy: {
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
    profilePhotoFileId?: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
    profilePhotoFileId?: string;
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
    };
    location?: string;
    createdBy?: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
      profilePhotoFileId?: string;
    };
  };
  status: 'active' | 'completed' | 'rejected' | 'withdrawn';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  candidateStatus?: 'new' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'offer_sent' | 'hired' | 'rejected';
  notes?: string;
  assignedAt: string;
  dueDate?: string;
  feedback?: string;
  isOverdue?: boolean;
  isDueSoon?: boolean;
  daysSinceAssigned?: number;
}

// Component for candidate avatar with profile photo (moved outside to prevent re-creation)
const CandidateAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  statusColor: string;
  initials: string;
}> = React.memo(({ profilePhotoFileId, firstName, lastName, statusColor, initials }) => {
  // Memoize the URL to prevent unnecessary re-fetches
  const profilePhotoUrl = useMemo(() => {
    return profilePhotoFileId
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
      : null;
  }, [profilePhotoFileId]);
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-12 w-12 flex-shrink-0">
      <AvatarImage 
        src={authenticatedImageUrl || ''} 
        alt={`${firstName} ${lastName}`} 
      />
      <AvatarFallback className={`text-sm text-white font-semibold ${statusColor}`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if props actually changed
  return (
    prevProps.profilePhotoFileId === nextProps.profilePhotoFileId &&
    prevProps.firstName === nextProps.firstName &&
    prevProps.lastName === nextProps.lastName &&
    prevProps.statusColor === nextProps.statusColor &&
    prevProps.initials === nextProps.initials
  );
});
CandidateAvatar.displayName = 'CandidateAvatar';

// Component for HR avatar with profile photo (moved outside to prevent re-creation)
const HRAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  initials: string;
}> = React.memo(({ profilePhotoFileId, firstName, lastName, initials }) => {
  // Memoize the URL to prevent unnecessary re-fetches
  const profilePhotoUrl = useMemo(() => {
    return profilePhotoFileId
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
      : null;
  }, [profilePhotoFileId]);
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      <AvatarImage 
        src={authenticatedImageUrl || ''} 
        alt={`${firstName} ${lastName}`} 
      />
      <AvatarFallback className="text-xs text-white font-semibold bg-blue-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if props actually changed
  return (
    prevProps.profilePhotoFileId === nextProps.profilePhotoFileId &&
    prevProps.firstName === nextProps.firstName &&
    prevProps.lastName === nextProps.lastName &&
    prevProps.initials === nextProps.initials
  );
});
HRAvatar.displayName = 'HRAvatar';

// Component for Agent avatar with profile photo (moved outside to prevent re-creation)
const AgentAvatar: React.FC<{
  profilePhotoFileId?: string;
  firstName: string;
  lastName: string;
  initials: string;
}> = React.memo(({ profilePhotoFileId, firstName, lastName, initials }) => {
  // Memoize the URL to prevent unnecessary re-fetches
  const profilePhotoUrl = useMemo(() => {
    return profilePhotoFileId
      ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
      : null;
  }, [profilePhotoFileId]);
  
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      <AvatarImage 
        src={authenticatedImageUrl || ''} 
        alt={`${firstName} ${lastName}`} 
      />
      <AvatarFallback className="text-xs text-white font-semibold bg-emerald-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if props actually changed
  return (
    prevProps.profilePhotoFileId === nextProps.profilePhotoFileId &&
    prevProps.firstName === nextProps.firstName &&
    prevProps.lastName === nextProps.lastName &&
    prevProps.initials === nextProps.initials
  );
});
AgentAvatar.displayName = 'AgentAvatar';

// Component for company avatar with logo (moved outside to prevent re-creation)
const CompanyAvatar: React.FC<{
  logoFileId?: string | { _id?: string; toString?: () => string };
  companyName: string;
}> = React.memo(({ logoFileId, companyName }) => {
  // Extract company logo file ID from various formats
  const fileId = logoFileId 
    ? (typeof logoFileId === 'object' && logoFileId !== null && '_id' in logoFileId
        ? (logoFileId._id?.toString() || logoFileId.toString?.())
        : typeof logoFileId === 'string'
        ? logoFileId
        : null)
    : null;
  
  // Construct authenticated API endpoint URL
  const logoUrl = fileId 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/company-logo/${fileId}`
    : null;
  
  const authenticatedImageUrl = useAuthenticatedImage(logoUrl);
  
  // Memoize initials calculation
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
      <AvatarImage 
        src={authenticatedImageUrl || ''} 
        alt={companyName} 
      />
      <AvatarFallback className="text-xs text-white font-semibold bg-purple-600">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if props actually changed
  const prevFileId = prevProps.logoFileId 
    ? (typeof prevProps.logoFileId === 'object' && prevProps.logoFileId !== null && '_id' in prevProps.logoFileId
        ? (prevProps.logoFileId._id?.toString() || prevProps.logoFileId.toString?.())
        : typeof prevProps.logoFileId === 'string'
        ? prevProps.logoFileId
        : null)
    : null;
  const nextFileId = nextProps.logoFileId 
    ? (typeof nextProps.logoFileId === 'object' && nextProps.logoFileId !== null && '_id' in nextProps.logoFileId
        ? (nextProps.logoFileId._id?.toString() || nextProps.logoFileId.toString?.())
        : typeof nextProps.logoFileId === 'string'
        ? nextProps.logoFileId
        : null)
    : null;
  
  return (
    prevFileId === nextFileId &&
    prevProps.companyName === nextProps.companyName
  );
});
CompanyAvatar.displayName = 'CompanyAvatar';

const SharedCandidates: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [candidateStatusFilter, setCandidateStatusFilter] = useState(searchParams.get('candidateStatus') || 'all');
  const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') ? 'all' : 'all'); // Will be set from jobId if provided
  const [companyFilter, setCompanyFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState<CandidateAssignment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<CandidateAssignment | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [assignmentToUpdate, setAssignmentToUpdate] = useState<CandidateAssignment | null>(null);
  const [updatePriority, setUpdatePriority] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [assignmentForFeedback, setAssignmentForFeedback] = useState<CandidateAssignment | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const navigate = useNavigate();

  const { user } = useAuth();

  // Update candidateStatus filter when URL changes
  useEffect(() => {
    const statusFromUrl = searchParams.get('candidateStatus');
    if (statusFromUrl && statusFromUrl !== candidateStatusFilter) {
      setCandidateStatusFilter(statusFromUrl);
    }
  }, [searchParams]);

  // API calls - Always call hooks unconditionally (React Rules of Hooks)
  const { data: assignmentsData, loading, refetch } = useCandidateAssignments({
    page: currentPage,
    limit: 20,
    ...(user?.role === 'agent' 
      ? { assignedBy: user?.id }
      : (user?.role === 'admin' || user?.role === 'superadmin')
      ? {}
      : { assignedTo: user?.id }),
    sortBy: 'assignedAt',
    sortOrder: 'desc'
  });

  const { data: statsData } = useCandidateAssignmentStats();
  const updateAssignment = useUpdateCandidateAssignment();

  // Handle both possible response formats
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData as any)?.data || [];
  const meta = Array.isArray(assignmentsData) ? {} : (assignmentsData as any)?.meta || {};
  const stats = (statsData as any)?.data || {};

  // Update job filter when jobId is provided in URL
  useEffect(() => {
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl && assignments && assignments.length > 0) {
      // Find the job title from assignments that match the jobId
      const matchingAssignment = assignments.find((assignment: CandidateAssignment) => {
        if (!assignment || !assignment.jobId) return false;
        const jobId = assignment.jobId;
        const jobIdStr = jobId._id ? (typeof jobId._id === 'string' ? jobId._id : String(jobId._id)) : null;
        return (
          jobIdStr === jobIdFromUrl ||
          (jobId as any).id === jobIdFromUrl
        );
      });
      if (matchingAssignment?.jobId?.title) {
        setJobFilter(matchingAssignment.jobId.title);
      }
    }
  }, [searchParams, assignments]);

  // Normalize ID for flexible matching (CAND0001, CAND1, CAND01 all match)
  const normalizeIdForSearch = (id: string | undefined): string => {
    if (!id) return '';
    
    // Match pattern like CAND00001, CAND001, CAND1, etc.
    const match = id.toUpperCase().match(/^([A-Z]+)(0*)(\d+)$/);
    if (match) {
      const [, prefix, zeros, number] = match;
      // Return normalized format: PREFIX + number (e.g., CAND1)
      return `${prefix}${parseInt(number, 10)}`;
    }
    
    // If pattern doesn't match, return uppercase for case-insensitive matching
    return id.toUpperCase();
  };

  // Check if search term matches an ID (supports flexible formats)
  const matchesId = (searchTerm: string, id: string | undefined): boolean => {
    if (!id || !searchTerm) return false;
    
    const normalizedSearch = normalizeIdForSearch(searchTerm);
    const normalizedId = normalizeIdForSearch(id);
    
    // Check if normalized IDs match
    if (normalizedSearch === normalizedId) return true;
    
    // Also check if the original ID contains the search term (case-insensitive)
    return id.toUpperCase().includes(searchTerm.toUpperCase());
  };

  // Filter assignments based on search term and filters
  const filteredAssignments = useMemo(() => {
    let filtered = assignments;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((assignment: CandidateAssignment) => {
        // Safety check for malformed assignment data
        if (!assignment || !assignment.candidateId) {
          return false;
        }

        const searchLower = searchTerm.toLowerCase();
        
        // Candidate information
        const candidateFirstName = assignment.candidateId?.userId?.firstName || '';
        const candidateLastName = assignment.candidateId?.userId?.lastName || '';
        const candidateFullName = `${candidateFirstName} ${candidateLastName}`.trim();
        const candidateEmail = assignment.candidateId?.userId?.email || '';
        const candidateId = assignment.candidateId?.userId?.customId || '';
        
        // Agent information (assignedBy)
        const agentFirstName = assignment.assignedBy?.firstName || '';
        const agentLastName = assignment.assignedBy?.lastName || '';
        const agentFullName = `${agentFirstName} ${agentLastName}`.trim();
        const agentId = assignment.assignedBy?.customId || '';
        
        // Job information
        const jobTitle = assignment.jobId?.title || '';
        const jobCustomId = assignment.jobId?.jobId || ''; // Custom ID like JOB00001
        const jobId = assignment.jobId?._id || assignment.jobId?.id || '';
        const jobIdStr = typeof jobId === 'string' ? jobId : (jobId ? String(jobId) : '');
        
        // Company information
        const companyName = assignment.jobId?.companyId?.name || '';
        const companyCustomId = assignment.jobId?.companyId?.companyId || ''; // Custom ID like COMP00001
        const companyId = assignment.jobId?.companyId?._id || '';
        const companyIdStr = typeof companyId === 'string' ? companyId : (companyId ? String(companyId) : '');
        
        // Notes
        const notes = assignment.notes || '';
        
        // Search in all fields
        return (
          // Candidate name
          candidateFirstName.toLowerCase().includes(searchLower) ||
          candidateLastName.toLowerCase().includes(searchLower) ||
          candidateFullName.toLowerCase().includes(searchLower) ||
          // Candidate ID (flexible matching: CAND0001, CAND1, CAND01)
          matchesId(searchTerm, candidateId) ||
          candidateId.toLowerCase().includes(searchLower) ||
          // Candidate email
          candidateEmail.toLowerCase().includes(searchLower) ||
          // Agent name
          agentFirstName.toLowerCase().includes(searchLower) ||
          agentLastName.toLowerCase().includes(searchLower) ||
          agentFullName.toLowerCase().includes(searchLower) ||
          // Agent ID (flexible matching: AGENT0001, AGENT1, AGENT01)
          matchesId(searchTerm, agentId) ||
          agentId.toLowerCase().includes(searchLower) ||
          // Job title
          jobTitle.toLowerCase().includes(searchLower) ||
          // Job custom ID (flexible matching: JOB0001, JOB1, JOB01)
          matchesId(searchTerm, jobCustomId) ||
          jobCustomId.toLowerCase().includes(searchLower) ||
          // Job ID (MongoDB _id)
          jobIdStr.toLowerCase().includes(searchLower) ||
          // Company name
          companyName.toLowerCase().includes(searchLower) ||
          // Company custom ID (flexible matching: COMP0001, COMP1, COMP01)
          matchesId(searchTerm, companyCustomId) ||
          companyCustomId.toLowerCase().includes(searchLower) ||
          // Company ID (MongoDB _id)
          companyIdStr.toLowerCase().includes(searchLower) ||
          // Notes
          notes.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter((assignment: CandidateAssignment) => 
        assignment && assignment.jobId?.companyId?.name === companyFilter
      );
    }
    
    // Apply job filter
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      // Filter by jobId if provided in URL
      filtered = filtered.filter((assignment: CandidateAssignment) => {
        if (!assignment || !assignment.jobId) return false;
        const jobId = assignment.jobId;
        return (
          jobId._id === jobIdFromUrl || 
          (jobId._id && jobId._id.toString() === jobIdFromUrl) ||
          (jobId as any).id === jobIdFromUrl
        );
      });
    } else if (jobFilter !== 'all') {
      // Filter by job title (existing behavior)
      filtered = filtered.filter((assignment: CandidateAssignment) => 
        assignment && assignment.jobId?.title === jobFilter
      );
    }
    
    // Apply candidate status filter
    if (candidateStatusFilter !== 'all') {
      filtered = filtered.filter((assignment: CandidateAssignment) => 
        assignment && (assignment.candidateStatus || 'new') === candidateStatusFilter
      );
    }
    
    return filtered;
  }, [assignments, searchTerm, companyFilter, jobFilter, candidateStatusFilter, searchParams]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Format customId to remove leading zeros (e.g., CAND00001 -> CAND1)
  const formatCustomId = (customId: string | undefined): string => {
    if (!customId) return '';
    
    // Match pattern like CAND00001, CAND001, etc.
    const match = customId.match(/^([A-Z]+)(0*)(\d+)$/);
    if (match) {
      const [, prefix, zeros, number] = match;
      // Remove leading zeros and return formatted ID
      return `${prefix}${parseInt(number, 10)}`;
    }
    
    // If pattern doesn't match, return as is
    return customId;
  };

  const formatExperience = (experienceArray: any[]) => {
    if (!experienceArray || experienceArray.length === 0) {
      return 'No experience';
    }
    
    // Calculate total months of experience from ALL entries in the candidate's profile
    let totalMonths = 0;
    const now = new Date();
    
    // Process all experience entries
    experienceArray.forEach(exp => {
      // Skip entries without valid start date
      if (!exp.startDate) return;
      
      try {
        const startDate = new Date(exp.startDate);
        
        // Validate start date
        if (isNaN(startDate.getTime())) return;
        
        // Determine end date: use current date if current job, otherwise use endDate or current date
        let endDate: Date;
        if (exp.current === true) {
          endDate = now;
        } else if (exp.endDate) {
          endDate = new Date(exp.endDate);
          // Validate end date
          if (isNaN(endDate.getTime())) {
            endDate = now;
          }
        } else {
          // If no endDate and not current, skip this entry (invalid data)
          return;
        }
        
        // Ensure end date is not before start date
        if (endDate < startDate) return;
        
        // Calculate months between start and end date
        const yearDiff = endDate.getFullYear() - startDate.getFullYear();
        const monthDiff = endDate.getMonth() - startDate.getMonth();
        const dayDiff = endDate.getDate() - startDate.getDate();
        
        // Calculate total months (including partial months)
        let months = yearDiff * 12 + monthDiff;
        // Add 1 month if day difference is positive (partial month counts)
        if (dayDiff > 0) {
          months += 1;
        }
        
        // Add to total (ensure non-negative)
        totalMonths += Math.max(0, months);
      } catch (error) {
        // Skip invalid entries
        console.warn('Invalid experience entry:', exp, error);
        return;
      }
    });
    
    // Convert months to years (rounded to 1 decimal place)
    const totalYears = Math.round(totalMonths / 12 * 10) / 10;
    
    if (totalYears === 0) {
      return 'No experience';
    } else {
      // Return exact total experience
      return `${totalYears} ${totalYears === 1 ? 'year' : 'years'}`;
    }
  };

  const getCurrentPosition = (experienceArray: any[]) => {
    if (!experienceArray || experienceArray.length === 0) {
      return null;
    }
    
    const currentExp = experienceArray.find(exp => exp.current === true);
    if (!currentExp || !currentExp.position) {
      return null;
    }
    
    return {
      position: currentExp.position,
      company: currentExp.company || ''
    };
  };

  const handleStatusUpdate = async (assignment: CandidateAssignment, newStatus: string) => {
    try {
      if (newStatus === 'withdrawn' && (user?.role === 'agent' || user?.role === 'admin' || user?.role === 'superadmin')) {
        // For agents, admins, and superadmins, when withdrawing, delete the assignment completely
        await apiClient.deleteCandidateAssignment(assignment._id);
        refetch();
        setSelectedAssignment(null);
        setFeedbackText('');
        toast({
          title: "Success",
          description: "Assignment deleted successfully"
        });
      } else {
        // For other status updates or non-agent users
        await updateAssignment.mutate({
          id: assignment._id,
          data: {
            status: newStatus,
            feedback: feedbackText || undefined
          }
        });
        refetch();
        setSelectedAssignment(null);
        setFeedbackText('');
        toast({
          title: "Success",
          description: `Status updated to ${newStatus}`
        });
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const handleUpdateAssignment = async () => {
    if (!assignmentToUpdate) return;

    try {
      await updateAssignment.mutate({
        id: assignmentToUpdate._id,
        data: {
          priority: updatePriority,
          notes: updateNotes
        }
      });
      refetch();
      setUpdateDialogOpen(false);
      setAssignmentToUpdate(null);
      setUpdatePriority('');
      setUpdateNotes('');
      toast({
        title: "Success",
        description: "Assignment updated successfully"
      });
    } catch (error: any) {
      console.error('Failed to update assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };

  const handleFeedbackUpdate = async () => {
    if (!assignmentForFeedback) return;

    try {
      await updateAssignment.mutate({
        id: assignmentForFeedback._id,
        data: {
          feedback: feedbackText
        }
      });
      refetch();
      setFeedbackDialogOpen(false);
      setAssignmentForFeedback(null);
      setFeedbackText('');
      toast({
        title: "Success",
        description: "Feedback updated successfully"
      });
    } catch (error: any) {
      console.error('Failed to update feedback:', error);
      toast({
        title: "Error",
        description: "Failed to update feedback",
        variant: "destructive"
      });
    }
  };

  const handleCandidateStatusUpdate = async (assignment: CandidateAssignment, newCandidateStatus: string) => {
    try {
      await updateAssignment.mutate({
        id: assignment._id,
        data: {
          candidateStatus: newCandidateStatus
        }
      });
      refetch();
      toast({
        title: "Success",
        description: `Candidate status updated to ${formatCandidateStatus(newCandidateStatus)}`
      });
    } catch (error: any) {
      console.error('Failed to update candidate status:', error);
      toast({
        title: "Error",
        description: "Failed to update candidate status",
        variant: "destructive"
      });
    }
  };

  const renderAssignmentCard = (assignment: any) => {
    // Safety check for malformed assignment data
    if (!assignment || !assignment.candidateId) {
      console.warn('Invalid assignment data:', assignment);
      return null;
    }

    // Handle both agent candidates and candidate assignments data structures
    const isAgentView = user?.role === 'agent';
    
    let candidate, firstName, lastName, email;
    if (isAgentView) {
      // Agent view structure
      candidate = assignment.candidateId;
      firstName = candidate?.userId?.firstName || '';
      lastName = candidate?.userId?.lastName || '';
      email = candidate?.userId?.email || 'No email provided';
    } else {
      // HR view structure
      candidate = assignment.candidateId;
      firstName = candidate?.userId?.firstName || '';
      lastName = candidate?.userId?.lastName || '';
      email = candidate?.userId?.email || 'No email provided';
    }
    
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : 
                     firstName ? firstName : 
                     lastName ? lastName : 'Unnamed Candidate';
    const initials = firstName && lastName ? 
                    `${firstName.charAt(0)}${lastName.charAt(0)}` : 
                    firstName ? firstName.charAt(0) : 
                    lastName ? lastName.charAt(0) : 'UC';
    
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
                {isAgentView ? (
                  <>
                    <DropdownMenuItem onClick={() => setSelectedAssignment(assignment)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {candidate?.resumeFileId && (
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/candidates/${candidate.userId.customId}`)}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => {
                        setAssignmentToUpdate(assignment);
                        setUpdatePriority(assignment.priority || 'medium');
                        setUpdateNotes(assignment.notes || '');
                        setUpdateDialogOpen(true);
                      }}
                      disabled={updateAssignment.loading}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Update Assignment
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        setAssignmentToDelete(assignment);
                        setDeleteConfirmOpen(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Delete Assignment
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/candidates/${candidate.userId.customId}`)}>
                      <User className="mr-2 h-4 w-4" />
                      View Profile
                    </DropdownMenuItem>
                    {candidate?.resumeFileId && (
                      <DropdownMenuItem onClick={async () => {
                        try {
                          const response = await fetch(getApiUrl(`/api/v1/files/resume/${candidate.resumeFileId}`), {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            },
                          });
                          
                          if (!response.ok) {
                            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                          }

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${candidate?.userId?.firstName || 'candidate'}_${candidate?.userId?.lastName || 'resume'}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          toast({
                            title: 'Success',
                            description: 'Resume downloaded successfully',
                          });
                        } catch (error) {
                          console.error('Download error:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to download resume',
                            variant: 'destructive',
                          });
                        }
                      }}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Download Resume
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate(`/dashboard/interviews?action=schedule&candidateId=${candidate._id}&candidateName=${encodeURIComponent(`${candidate.userId.firstName} ${candidate.userId.lastName}`)}`)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setAssignmentForFeedback(assignment);
                      setFeedbackText(assignment.feedback || '');
                      setFeedbackDialogOpen(true);
                    }}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Add Feedback
                    </DropdownMenuItem>
                    {(user?.role === 'admin' || user?.role === 'superadmin') && (
                      <DropdownMenuItem 
                        onClick={() => {
                          setAssignmentToDelete(assignment);
                          setDeleteConfirmOpen(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Delete Assignment
                      </DropdownMenuItem>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* Row 1: Candidate Info, Agent/HR Profile(s), Candidate Status */}
          <div className={`grid ${user?.role === 'admin' || user?.role === 'superadmin' ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-3`}>
            {/* Column 1: Candidate Info */}
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <CandidateAvatar
                  profilePhotoFileId={candidate?.userId?.profilePhotoFileId}
                  firstName={firstName}
                  lastName={lastName}
                  statusColor={getCandidateStatusColor(assignment.candidateStatus)}
                  initials={initials}
                />
                <div className="flex-1 min-w-0">
                  <div 
                    className="font-semibold text-lg text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => navigate(`/dashboard/candidates/${candidate.userId.customId}`)}
                  >
                    {fullName}
                  </div>
                  <div className="text-base text-gray-500 truncate">{email}</div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    {candidate?.profile?.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span className="truncate">{candidate?.profile?.phoneNumber}</span>
                      </div>
                    )}
                    {candidate?.profile?.location ? (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">{candidate?.profile?.location}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="truncate text-gray-400">Location not specified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Experience and Current Role - only for admin/superadmin in Row 1 */}
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-base font-medium text-gray-900">
                      {formatExperience(candidate?.profile?.experience || [])}
                    </div>
                    {candidate?.userId?.customId && (
                      <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-0">
                        <span className="text-gray-400 mr-1">•</span>
                        {formatCustomId(candidate.userId.customId)}
                      </Badge>
                    )}
                  </div>
                  {(() => {
                    const currentPosition = getCurrentPosition(candidate?.profile?.experience || []);
                    return currentPosition ? (
                      <div className="text-xs text-gray-600 mt-1">
                        <span className="font-medium">{currentPosition.position}</span>
                        {currentPosition.company && (
                          <span className="text-gray-500"> at {currentPosition.company}</span>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Column 2: Agent Profile (for admin/superadmin/HR) */}
            {(user?.role === 'admin' || user?.role === 'superadmin' || !isAgentView) && assignment.assignedBy && (
              <div className="flex items-start space-x-3">
                <AgentAvatar
                  profilePhotoFileId={assignment.assignedBy.profilePhotoFileId}
                  firstName={assignment.assignedBy.firstName}
                  lastName={assignment.assignedBy.lastName}
                  initials={`${assignment.assignedBy.firstName?.charAt(0) || ''}${assignment.assignedBy.lastName?.charAt(0) || ''}`}
                />
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-base font-semibold text-gray-900 cursor-pointer hover:text-emerald-600 transition-colors truncate"
                    onClick={() => {
                      if (assignment.assignedBy?.customId) {
                        navigate(`/dashboard/agent-profile/${assignment.assignedBy.customId}`);
                      } else {
                        navigate(`/dashboard/agent-dashboard`);
                      }
                    }}
                  >
                    {assignment.assignedBy.firstName} {assignment.assignedBy.lastName}
                  </div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {assignment.assignedBy.email}
                  </div>
                  <div className="text-xs text-emerald-600 font-mono mt-0.5">
                    {assignment.assignedBy.customId}
                  </div>
                </div>
              </div>
            )}

            {/* Column 3: HR Profile + Job (for admin/superadmin/agents) */}
            {(user?.role === 'admin' || user?.role === 'superadmin' || isAgentView) && assignment.assignedTo && (
              <div className="space-y-3">
                {/* HR Profile */}
                <div className="flex items-start space-x-3">
                  <HRAvatar
                    profilePhotoFileId={assignment.assignedTo.profilePhotoFileId}
                    firstName={assignment.assignedTo.firstName}
                    lastName={assignment.assignedTo.lastName}
                    initials={`${assignment.assignedTo.firstName?.charAt(0) || ''}${assignment.assignedTo.lastName?.charAt(0) || ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                      onClick={() => {
                        if (assignment.assignedTo?.customId) {
                          navigate(`/dashboard/hr-profile/${assignment.assignedTo.customId}`);
                        }
                      }}
                    >
                      {assignment.assignedTo.firstName} {assignment.assignedTo.lastName}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {assignment.assignedTo.email}
                    </div>
                    <div className="text-xs text-blue-600 font-mono mt-0.5">
                      {assignment.assignedTo.customId}
                    </div>
                  </div>
                </div>
                
                {/* Job Details (for admin/superadmin only) */}
                {(user?.role === 'admin' || user?.role === 'superadmin') && (
                  <div className="flex items-start space-x-3">
                    {assignment.jobId?.companyId ? (
                      <>
                        <CompanyAvatar
                          logoFileId={assignment.jobId.companyId.logoFileId}
                          companyName={assignment.jobId.companyId.name || 'Unknown Company'}
                        />
                        <div className="flex-1 min-w-0">
                          {assignment.jobId?._id || assignment.jobId?.id ? (
                            <div 
                              className="text-base font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                              onClick={() => navigate(`/dashboard/jobs/${assignment.jobId._id || assignment.jobId.id}`)}
                            >
                              {assignment.jobId.title}
                            </div>
                          ) : (
                            <div className="text-base font-medium text-gray-900">
                              {assignment.jobId ? assignment.jobId.title : 'General'}
                            </div>
                          )}
                          <div className="text-xs text-gray-600 mt-0.5">
                            {assignment.jobId?.companyId?._id ? (
                              <span 
                                className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => navigate(`/dashboard/companies/${assignment.jobId.companyId._id}`)}
                              >
                                {assignment.jobId?.companyId?.name || 'Unknown Company'}
                              </span>
                            ) : (
                              <span className="font-medium">
                                {assignment.jobId?.companyId?.name || 'Unknown Company'}
                              </span>
                            )}
                            {assignment.jobId.location && (
                              <span className="text-gray-400 ml-2">• {assignment.jobId.location}</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 min-w-0">
                        {assignment.jobId?._id || assignment.jobId?.id ? (
                          <div 
                            className="text-base font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                            onClick={() => navigate(`/dashboard/jobs/${assignment.jobId._id || assignment.jobId.id}`)}
                          >
                            {assignment.jobId ? assignment.jobId.title : 'General'}
                          </div>
                        ) : (
                          <div className="text-base font-medium text-gray-900">
                            {assignment.jobId ? assignment.jobId.title : 'General'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Last Column: Candidate Status + Resume (for admin/superadmin) */}
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">Candidate Status</div>
                {isAgentView ? (
                  <Badge variant="outline" className={`capitalize ${getCandidateStatusColor(assignment.candidateStatus)}`}>
                    {assignment.candidateStatus || 'new'}
                  </Badge>
                ) : (
                  <Select
                    value={assignment.candidateStatus || 'new'}
                    onValueChange={(value) => handleCandidateStatusUpdate(assignment, value)}
                  >
                    <SelectTrigger className={`w-48 h-10 text-sm ${getCandidateStatusColor(assignment.candidateStatus || 'new')}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new" className="text-gray-700 hover:bg-gray-100 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-800">
                        New
                      </SelectItem>
                      <SelectItem value="reviewed" className="text-blue-700 hover:bg-blue-50 data-[state=checked]:bg-blue-100 data-[state=checked]:text-blue-800">
                        Reviewed
                      </SelectItem>
                      <SelectItem value="shortlisted" className="text-purple-700 hover:bg-purple-50 data-[state=checked]:bg-purple-100 data-[state=checked]:text-purple-800">
                        Shortlisted
                      </SelectItem>
                      <SelectItem value="interview_scheduled" className="text-orange-700 hover:bg-orange-50 data-[state=checked]:bg-orange-100 data-[state=checked]:text-orange-800">
                        Interview Scheduled
                      </SelectItem>
                      <SelectItem value="interviewed" className="text-yellow-700 hover:bg-yellow-50 data-[state=checked]:bg-yellow-100 data-[state=checked]:text-yellow-800">
                        Interviewed
                      </SelectItem>
                      <SelectItem value="offer_sent" className="text-indigo-700 hover:bg-indigo-50 data-[state=checked]:bg-indigo-100 data-[state=checked]:text-indigo-800">
                        Offer Sent
                      </SelectItem>
                      <SelectItem value="hired" className="text-green-700 hover:bg-green-50 data-[state=checked]:bg-green-100 data-[state=checked]:text-green-800">
                        Hired
                      </SelectItem>
                      <SelectItem value="rejected" className="text-red-700 hover:bg-red-50 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-800">
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {/* Resume Button (for admin/superadmin only in Row 1) */}
              {(user?.role === 'admin' || user?.role === 'superadmin') && (
                <div>
                  {candidate.resumeFileId ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                      onClick={async () => {
                        try {
                          const response = await fetch(getApiUrl(`/api/v1/files/resume/${candidate.resumeFileId}`), {
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            },
                          });
                          
                          if (!response.ok) {
                            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                          }

                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${candidate?.userId?.firstName || 'candidate'}_${candidate?.userId?.lastName || 'resume'}.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);

                          toast({
                            title: 'Success',
                            description: 'Resume downloaded successfully',
                          });
                        } catch (error) {
                          console.error('Download error:', error);
                          toast({
                            title: 'Error',
                            description: 'Failed to download resume',
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Resume
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-500">No resume</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Experience, Job Position, Resume */}
          <div className={`grid ${user?.role === 'admin' || user?.role === 'superadmin' ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-4`}>
            {/* Column 1: Experience (empty for admin/superadmin since it's in Row 1) */}
            <div>
              {!(user?.role === 'admin' || user?.role === 'superadmin') && (
                <>
                  <div className="flex items-center gap-2">
                <div className="text-base font-medium text-gray-900">
                  {formatExperience(candidate?.profile?.experience || [])}
                </div>
                {candidate?.userId?.customId && (
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-0">
                    <span className="text-gray-400 mr-1">•</span>
                    {formatCustomId(candidate.userId.customId)}
                  </Badge>
                )}
              </div>
              {(() => {
                const currentPosition = getCurrentPosition(candidate?.profile?.experience || []);
                return currentPosition ? (
                  <div className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">{currentPosition.position}</span>
                    {currentPosition.company && (
                      <span className="text-gray-500"> at {currentPosition.company}</span>
                    )}
                  </div>
                ) : null;
              })()}
                </>
              )}
            </div>

            {/* Column 2: Job Position (only for HR/Agent, empty for admin/superadmin) */}
            {!(user?.role === 'admin' || user?.role === 'superadmin') ? (
              <div className="flex items-start space-x-3">
              {assignment.jobId?.companyId ? (
                <>
                  <CompanyAvatar
                    logoFileId={assignment.jobId.companyId.logoFileId}
                    companyName={assignment.jobId.companyId.name || 'Unknown Company'}
                  />
                  <div className="flex-1 min-w-0">
                    {assignment.jobId?._id || assignment.jobId?.id ? (
                      <div 
                        className="text-base font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                        onClick={() => navigate(`/dashboard/jobs/${assignment.jobId._id || assignment.jobId.id}`)}
                      >
                        {assignment.jobId.title}
                      </div>
                    ) : (
                      <div className="text-base font-medium text-gray-900">
                        {assignment.jobId ? assignment.jobId.title : 'General'}
                      </div>
                    )}
                    <div className="text-xs text-gray-600 mt-0.5">
                      {assignment.jobId?.companyId?._id ? (
                        <span 
                          className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => navigate(`/dashboard/companies/${assignment.jobId.companyId._id}`)}
                        >
                          {assignment.jobId?.companyId?.name || 'Unknown Company'}
                        </span>
                      ) : (
                        <span className="font-medium">
                          {assignment.jobId?.companyId?.name || 'Unknown Company'}
                        </span>
                      )}
                      {assignment.jobId.location && (
                        <span className="text-gray-400 ml-2">• {assignment.jobId.location}</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 min-w-0">
                  {assignment.jobId?._id || assignment.jobId?.id ? (
                    <div 
                      className="text-base font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate"
                      onClick={() => navigate(`/dashboard/jobs/${assignment.jobId._id || assignment.jobId.id}`)}
                    >
                      {assignment.jobId ? assignment.jobId.title : 'General'}
                    </div>
                  ) : (
                    <div className="text-base font-medium text-gray-900">
                      {assignment.jobId ? assignment.jobId.title : 'General'}
                    </div>
                  )}
                </div>
              )}
              </div>
            ) : (
              <>
                <div></div> {/* Empty column 2 */}
                <div></div> {/* Empty column 3 */}
              </>
            )}

            {/* Last Column: Resume (Column 3 for HR/Agent only, not shown for admin/superadmin in Row 2) */}
            {!(user?.role === 'admin' || user?.role === 'superadmin') && (
              <div>
                {isAgentView ? (
                  candidate?.resumeFileId ? (
                    <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    onClick={async () => {
                      try {
                        const response = await fetch(getApiUrl(`/api/v1/files/resume/${candidate.resumeFileId}`), {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                          },
                        });
                        
                        if (!response.ok) {
                          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${candidate?.userId?.firstName || 'candidate'}_${candidate?.userId?.lastName || 'resume'}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        toast({
                          title: 'Success',
                          description: 'Resume downloaded successfully',
                        });
                      } catch (error) {
                        console.error('Download error:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to download resume',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Resume
                  </Button>
                ) : (
                  <span className="text-xs text-gray-500">No resume</span>
                )
              ) : (
                candidate.resumeFileId ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300"
                    onClick={async () => {
                      try {
                        const response = await fetch(getApiUrl(`/api/v1/files/resume/${candidate.resumeFileId}`), {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                          },
                        });
                        
                        if (!response.ok) {
                          throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                        }

                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${candidate?.userId?.firstName || 'candidate'}_${candidate?.userId?.lastName || 'resume'}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);

                        toast({
                          title: 'Success',
                          description: 'Resume downloaded successfully',
                        });
                      } catch (error) {
                        console.error('Download error:', error);
                        toast({
                          title: 'Error',
                          description: 'Failed to download resume',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Download Resume
                  </Button>
                ) : (
                  <span className="text-xs text-gray-500">No resume</span>
                )
              )}
              </div>
            )}
          </div>

          {/* Row 3: Notes */}
          {assignment.notes && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-amber-600" />
                {isAgentView ? "My Notes" : "Agent Notes"}
              </div>
              <div className="text-base text-gray-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                {assignment.notes}
              </div>
            </div>
          )}

          {/* Row 4: Feedback */}
          {assignment.feedback && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                {isAgentView ? "HR's Feedback" : "My Feedback"}
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
      <DashboardBanner category="hr" />




      {/* Stats Cards */}
      {user?.role !== 'agent' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.byStatus && stats.byStatus.map((stat: any, index: number) => {
            const gradients = [
              "from-blue-500 to-blue-600",
              "from-emerald-500 to-emerald-600", 
              "from-amber-500 to-amber-600",
              "from-purple-500 to-purple-600"
            ];
            const iconColors = [
              "text-blue-100",
              "text-emerald-100",
              "text-amber-100", 
              "text-purple-100"
            ];
            const gradient = gradients[index % gradients.length];
            const iconColor = iconColors[index % iconColors.length];
            
            return (
              <Card key={stat._id} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}></div>
                <CardContent className="relative p-4">
                  <div className="flex items-center space-x-2">
                    <div className={`${iconColor} bg-white/20 p-2 rounded-lg backdrop-blur-sm`}>
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90 capitalize">{stat._id}</p>
                      <p className="text-2xl font-bold text-white">{stat.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {stats.overdue > 0 && (
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-90"></div>
              <CardContent className="relative p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-red-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/90">Overdue</p>
                    <p className="text-2xl font-bold text-white">{stats.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-90"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-2">
                <div className="text-blue-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Total Assigned Candidates</p>
                  <p className="text-2xl font-bold text-white">{assignments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-90"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-2">
                <div className="text-emerald-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Active HRs</p>
                  <p className="text-2xl font-bold text-white">
                    {Array.from(new Set(assignments.map((a: any) => a.assignedTo?.id))).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-90"></div>
            <CardContent className="relative p-4">
              <div className="flex items-center space-x-2">
                <div className="text-purple-100 bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">Companies</p>
                  <p className="text-2xl font-bold text-white">
                    {Array.from(new Set(assignments.filter((a: any) => a.jobId?.companyId?.name).map((a: any) => a.jobId.companyId.name))).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* Filters */}
      <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 w-4 h-4" />
                <Input
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                />
              </div>
            </div>
            <Select value={candidateStatusFilter} onValueChange={setCandidateStatusFilter}>
              <SelectTrigger className="w-40 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                <User className="w-4 h-4 mr-2 text-blue-600" />
                <SelectValue placeholder="Candidate Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                <SelectItem value="interviewed">Interviewed</SelectItem>
                <SelectItem value="offer_sent">Offer Sent</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jobFilter} onValueChange={setJobFilter}>
              <SelectTrigger className="w-40 border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                <Briefcase className="w-4 h-4 mr-2 text-purple-600" />
                <SelectValue placeholder="Job" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {Array.from(new Set(assignments
                  .filter((a: CandidateAssignment) => a.jobId?.title)
                  .map((a: CandidateAssignment) => a.jobId!.title)
                )).map((jobTitle: string) => (
                  <SelectItem key={jobTitle} value={jobTitle}>
                    {jobTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-40 border-amber-200 focus:border-amber-400 focus:ring-amber-400">
                <Building2 className="w-4 h-4 mr-2 text-amber-600" />
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {Array.from(new Set(assignments
                  .filter((a: CandidateAssignment) => a.jobId?.companyId?.name)
                  .map((a: CandidateAssignment) => a.jobId!.companyId!.name)
                )).map((companyName: string) => (
                  <SelectItem key={companyName} value={companyName}>
                    {companyName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">No candidates assigned</h3>
              <p className="text-gray-600">
                You don't have any candidate assignments matching the current filters.
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
      {meta && typeof meta.totalPages === 'number' && meta.totalPages > 1 && (
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

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Feedback</DialogTitle>
            <DialogDescription>
              Add or update feedback for this candidate assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Enter your feedback about this candidate..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setFeedbackDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFeedbackUpdate}
                disabled={updateAssignment.loading}
              >
                {updateAssignment.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Feedback'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Assignment Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assignment</DialogTitle>
            <DialogDescription>
              Update the priority and notes for this assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={updatePriority} onValueChange={setUpdatePriority}>
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this assignment..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAssignment}
                disabled={updateAssignment.loading}
              >
                {updateAssignment.loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Assignment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (assignmentToDelete) {
                  handleStatusUpdate(assignmentToDelete, 'withdrawn');
                  setDeleteConfirmOpen(false);
                  setAssignmentToDelete(null);
                }
              }}
              disabled={updateAssignment.loading}
            >
              {updateAssignment.loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      {selectedAssignment && (
        <Dialog open={!!selectedAssignment} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {(() => {
                  const firstName = selectedAssignment.candidateId?.userId?.firstName || '';
                  const lastName = selectedAssignment.candidateId?.userId?.lastName || '';
                  return firstName && lastName ? `${firstName} ${lastName}` : 
                         firstName ? firstName : 
                         lastName ? lastName : 'Unnamed Candidate';
                })()}
              </DialogTitle>
              <DialogDescription>
                Candidate details and assignment information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Contact Information */}
              <div>
                <h4 className="font-semibold mb-2">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {selectedAssignment.candidateId?.userId?.email || 'No email provided'}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {selectedAssignment.candidateId?.profile?.phoneNumber || 'Not provided'}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {selectedAssignment.candidateId?.profile?.location || 'Not specified'}
                  </div>
                </div>
              </div>

              {/* Salary Expectation */}
              {selectedAssignment.candidateId?.profile?.preferredSalaryRange && selectedAssignment.candidateId.profile.preferredSalaryRange.min && selectedAssignment.candidateId.profile.preferredSalaryRange.max && (
                <div>
                  <h4 className="font-semibold mb-2">Salary Expectation</h4>
                  <p className="text-sm">
                    {selectedAssignment.candidateId.profile.preferredSalaryRange.currency} {selectedAssignment.candidateId.profile.preferredSalaryRange.min?.toLocaleString()} - {selectedAssignment.candidateId.profile.preferredSalaryRange.max?.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Full Skills List */}
              {selectedAssignment.candidateId?.profile?.skills && selectedAssignment.candidateId.profile.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedAssignment.candidateId.profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Summary */}
              {selectedAssignment.candidateId?.profile?.summary && (
                <div>
                  <h4 className="font-semibold mb-2">Professional Summary</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {selectedAssignment.candidateId.profile.summary}
                  </p>
                </div>
              )}

              {/* Assignment Information */}
              <div>
                <h4 className="font-semibold mb-2">Assignment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Priority:</span>
                    <Badge className={getPriorityColor(selectedAssignment.priority)}>
                      {selectedAssignment.priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className={getStatusColor(selectedAssignment.status)}>
                      {selectedAssignment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned by:</span>
                    <span>{selectedAssignment.assignedBy ? `${selectedAssignment.assignedBy.firstName} ${selectedAssignment.assignedBy.lastName}` : 'Unknown'}</span>
                  </div>
                  {selectedAssignment.jobId && (
                    <div className="flex justify-between">
                      <span>Job:</span>
                      <span>{selectedAssignment.jobId.title}</span>
                    </div>
                  )}
                  {selectedAssignment.jobId?.companyId && (
                    <div className="flex justify-between">
                      <span>Company:</span>
                      <span>
                        {selectedAssignment.jobId.companyId.name}
                        {selectedAssignment.jobId.companyId.industry && (
                          <span className="text-gray-500 ml-2">({selectedAssignment.jobId.companyId.industry})</span>
                        )}
                      </span>
                    </div>
                  )}
                  {selectedAssignment.dueDate && (
                    <div className="flex justify-between">
                      <span>Due Date:</span>
                      <span>{new Date(selectedAssignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedAssignment.notes && (
                    <div>
                      <span className="font-medium">Agent Notes:</span>
                      <p className="text-gray-600 bg-gray-50 p-2 rounded mt-1">
                        {selectedAssignment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedAssignment.feedback && (
                <div>
                  <h4 className="font-semibold mb-2">Previous Feedback</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedAssignment.feedback}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <div className="flex space-x-2">
                {user?.role === 'agent' && selectedAssignment.status === 'active' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleStatusUpdate(selectedAssignment, 'completed')}
                      disabled={updateAssignment.loading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Complete
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedAssignment, 'rejected')}
                      disabled={updateAssignment.loading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SharedCandidates;
