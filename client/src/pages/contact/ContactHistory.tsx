import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
  Phone,
  Mail,
  Video,
  MoreHorizontal,
  Building2,
  Plus,
  Edit,
  Trash2,
  History,
  TrendingUp,
  Users as UsersIcon,
  FileText
} from 'lucide-react';
import { 
  useContactHistory, 
  useContactHistoryStats, 
  useCreateContactHistory, 
  useUpdateContactHistory, 
  useDeleteContactHistory,
  useMyAgentAssignment,
  useAgentCandidates
} from '@/hooks/useApi';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { DashboardBanner } from '@/components/dashboard/Banner';

interface ContactHistoryEntry {
  _id: string;
  agentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
  };
  contactType: 'hr' | 'candidate';
  contactId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    customId?: string;
    userId?: {
      firstName: string;
      lastName: string;
      email: string;
      customId: string;
    };
  };
  contactMethod: 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other';
  subject: string;
  notes: string;
  duration?: number;
  outcome?: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
  followUpDate?: string;
  followUpNotes?: string;
  tags?: string[];
  relatedJobId?: {
    _id: string;
    title: string;
    companyId: string;
  };
  relatedCandidateAssignmentId?: {
    _id: string;
    status: string;
    priority: string;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const ContactHistory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState<'all' | 'hr' | 'candidate'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'follow_up_required'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ContactHistoryEntry | null>(null);
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    contactType: 'hr' as 'hr' | 'candidate',
    contactId: '',
    contactMethod: 'phone' as 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other',
    subject: '',
    notes: '',
    duration: '',
    outcome: 'none' as 'none' | '' | 'positive' | 'neutral' | 'negative' | 'follow_up_required',
    followUpDate: '',
    followUpNotes: '',
    tags: [] as string[],
    tagInput: '',
    relatedJobId: 'none',
    relatedCandidateAssignmentId: '',
  });

  // Fetch agent assignment for agents (only if user is an agent)
  const shouldFetchAgentData = user?.role === 'agent';
  const { data: agentAssignmentResponse } = useMyAgentAssignment();
  const agentAssignment = shouldFetchAgentData 
    ? ((agentAssignmentResponse as any)?.data || agentAssignmentResponse)
    : null;

  // Fetch agent candidates for agents (only if user is an agent)
  const { data: agentCandidatesResponse } = useAgentCandidates({ 
    limit: 100 
  });

  // Fetch HR users, candidates, jobs, and agents for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        if (user?.role === 'agent' && shouldFetchAgentData) {
          // For agents: Get assigned HRs from agent assignment and candidates from agent candidates
          const assignedHRs = agentAssignment?.assignedHRs || [];
          const agentCandidates = Array.isArray(agentCandidatesResponse) 
            ? agentCandidatesResponse 
            : (agentCandidatesResponse as any)?.data || [];
          
          // For candidates, we need to keep the candidate document structure
          // The contactId should be the Candidate document ID (_id), not the user ID
          const candidatesList = agentCandidates.map((candidate: any) => {
            // Log candidate structure for debugging
            console.log('Agent candidate structure:', {
              _id: candidate._id,
              candidateId: candidate._id,
              userId: candidate.userId?._id,
              hasUserId: !!candidate.userId,
            });
            
            // Keep the candidate structure with userId for display
            return {
              ...candidate,
              // _id is the Candidate document ID, which is what the API expects for contactId
              userId: candidate.userId || {
                _id: candidate._id,
                firstName: candidate.firstName,
                lastName: candidate.lastName,
                email: candidate.email,
                customId: candidate.customId,
              }
            };
          });
          
          console.log('Formatted candidates list:', candidatesList.map((c: any) => ({
            _id: c._id,
            userId: c.userId?._id,
            name: `${c.userId?.firstName} ${c.userId?.lastName}`
          })));

          setHrUsers(assignedHRs);
          setCandidates(candidatesList);
          
          // Fetch jobs for agents (from assigned HRs)
          try {
            const jobsResponse = await apiClient.getAgentJobs({ limit: 100, status: 'open' });
            const jobs = Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse.data as any)?.data || [];
            setJobs(jobs);
          } catch (error) {
            console.error('Failed to fetch jobs:', error);
            setJobs([]);
          }
        } else {
          // For admin/superadmin: Fetch all data
          const promises = [
            apiClient.getUsers({ role: 'hr', limit: 100 }),
            apiClient.getAgentCandidates({ limit: 100 }).catch(() => ({ data: [] })),
            apiClient.getJobs({ limit: 100, status: 'open' }),
          ];

          // Only fetch agents if user is admin or superadmin
          if (user?.role === 'admin' || user?.role === 'superadmin') {
            promises.push(apiClient.getUsers({ role: 'agent', limit: 100 }));
          }

          const results = await Promise.all(promises);
          const hrUsersList = Array.isArray(results[0].data) ? results[0].data : (results[0].data as any)?.data || [];
          const candidatesList = Array.isArray(results[1].data) ? results[1].data : (results[1].data as any)?.data || [];
          const jobsList = Array.isArray(results[2].data) ? results[2].data : (results[2].data as any)?.data || [];
          
          // Ensure candidates have the correct structure (Candidate document with _id)
          // The API returns Candidate documents, so _id should be the Candidate document ID
          const formattedCandidates = candidatesList.map((candidate: any) => {
            // Ensure we have the Candidate document structure
            return {
              ...candidate,
              // _id is the Candidate document ID (what the API expects)
              // userId is populated User data for display
              userId: candidate.userId || candidate,
            };
          });
          
          setHrUsers(hrUsersList);
          setCandidates(formattedCandidates);
          setJobs(jobsList);
          
          if (user?.role === 'admin' || user?.role === 'superadmin') {
            setAgents(Array.isArray(results[3].data) ? results[3].data : (results[3].data as any)?.data || []);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
        setHrUsers([]);
        setCandidates([]);
        setJobs([]);
        setAgents([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [user?.role, agentAssignment, agentCandidatesResponse, shouldFetchAgentData]);

  // API calls
  const { data: contactHistoryData, loading, refetch } = useContactHistory({
    page: currentPage,
    limit: 20,
    contactType: contactTypeFilter !== 'all' ? contactTypeFilter : undefined,
    agentId: agentFilter !== 'all' ? agentFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: statsData } = useContactHistoryStats();
  const createContactHistory = useCreateContactHistory({ 
    onSuccess: () => { 
      setIsCreateDialogOpen(false); 
      refetch(); 
    },
    onError: (error: any) => {
      console.error('Contact history creation error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create contact history';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });
  const updateContactHistory = useUpdateContactHistory({ onSuccess: () => { setIsEditDialogOpen(false); refetch(); } });
  const deleteContactHistory = useDeleteContactHistory({ onSuccess: () => { setIsDeleteDialogOpen(false); refetch(); } });

  const contactHistory = Array.isArray(contactHistoryData) 
    ? contactHistoryData 
    : (contactHistoryData as any)?.data || [];
  const meta = Array.isArray(contactHistoryData) 
    ? {} 
    : (contactHistoryData as any)?.meta || {};
  const stats = (statsData as any)?.data || {};

  // Filter entries based on search and filters
  const filteredEntries = useMemo(() => {
    let filtered = contactHistory;

    if (searchTerm) {
      filtered = filtered.filter((entry: ContactHistoryEntry) => {
        const subject = entry.subject?.toLowerCase() || '';
        const notes = entry.notes?.toLowerCase() || '';
        const agentName = `${entry.agentId?.firstName || ''} ${entry.agentId?.lastName || ''}`.toLowerCase();
        const contactName = entry.contactType === 'hr'
          ? `${entry.contactId?.firstName || ''} ${entry.contactId?.lastName || ''}`.toLowerCase()
          : `${entry.contactId?.userId?.firstName || ''} ${entry.contactId?.userId?.lastName || ''}`.toLowerCase();
        return subject.includes(searchTerm.toLowerCase()) ||
               notes.includes(searchTerm.toLowerCase()) ||
               agentName.includes(searchTerm.toLowerCase()) ||
               contactName.includes(searchTerm.toLowerCase());
      });
    }

    if (methodFilter !== 'all') {
      filtered = filtered.filter((entry: ContactHistoryEntry) => entry.contactMethod === methodFilter);
    }

    if (outcomeFilter !== 'all') {
      filtered = filtered.filter((entry: ContactHistoryEntry) => entry.outcome === outcomeFilter);
    }

    return filtered;
  }, [contactHistory, searchTerm, methodFilter, outcomeFilter]);

  const handleCreate = () => {
    setFormData({
      contactType: 'hr',
      contactId: '',
      contactMethod: 'phone',
      subject: '',
      notes: '',
      duration: '',
      outcome: 'none',
      followUpDate: '',
      followUpNotes: '',
      tags: [],
      tagInput: '',
      relatedJobId: 'none',
      relatedCandidateAssignmentId: '',
    });
    setSelectedEntry(null);
    setIsCreateDialogOpen(true);
  };

  const handleView = (entry: ContactHistoryEntry) => {
    setSelectedEntry(entry);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (entry: ContactHistoryEntry) => {
    setSelectedEntry(entry);
    setFormData({
      contactType: entry.contactType,
      contactId: entry.contactId._id.toString(),
      contactMethod: entry.contactMethod,
      subject: entry.subject,
      notes: entry.notes,
      duration: entry.duration?.toString() || '',
      outcome: entry.outcome || 'none',
      followUpDate: entry.followUpDate ? format(new Date(entry.followUpDate), "yyyy-MM-dd'T'HH:mm") : '',
      followUpNotes: entry.followUpNotes || '',
      tags: entry.tags || [],
      tagInput: '',
      relatedJobId: entry.relatedJobId?._id.toString() || 'none',
      relatedCandidateAssignmentId: entry.relatedCandidateAssignmentId?._id.toString() || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (entry: ContactHistoryEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.contactId || !formData.subject || !formData.notes) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Convert datetime-local to ISO datetime format
    let followUpDateISO: string | undefined;
    if (formData.followUpDate && formData.followUpDate.trim()) {
      // datetime-local format is "YYYY-MM-DDTHH:mm", convert to ISO format
      const date = new Date(formData.followUpDate);
      if (!isNaN(date.getTime())) {
        followUpDateISO = date.toISOString();
      }
    }

    // Log the data being sent for debugging
    console.log('Creating contact history with:', {
      contactType: formData.contactType,
      contactId: formData.contactId,
      contactMethod: formData.contactMethod,
    });
    
    // Verify the selected candidate exists in our candidates list
    if (formData.contactType === 'candidate') {
      const selectedCandidate = candidates.find((c: any) => String(c._id) === formData.contactId);
      console.log('Selected candidate:', selectedCandidate);
      if (!selectedCandidate) {
        console.error('Selected candidate not found in candidates list!', {
          contactId: formData.contactId,
          availableIds: candidates.map((c: any) => c._id),
        });
        toast({
          title: 'Error',
          description: 'Selected candidate not found. Please try selecting again.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Validate MongoDB ObjectId format for candidate contactId
    if (formData.contactType === 'candidate') {
      // MongoDB ObjectId is 24 hex characters
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(formData.contactId)) {
        console.error('Invalid candidate ID format:', formData.contactId);
        toast({
          title: 'Error',
          description: 'Invalid candidate ID format. Please try selecting the candidate again.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      const payload = {
        contactType: formData.contactType,
        contactId: formData.contactId,
        contactMethod: formData.contactMethod,
        subject: formData.subject,
        notes: formData.notes,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        outcome: (formData.outcome && formData.outcome !== 'none' && formData.outcome.trim()) ? formData.outcome : undefined,
        followUpDate: followUpDateISO,
        followUpNotes: (formData.followUpNotes && formData.followUpNotes.trim()) ? formData.followUpNotes : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        relatedJobId: (formData.relatedJobId && formData.relatedJobId !== 'none' && formData.relatedJobId.trim()) ? formData.relatedJobId : undefined,
        relatedCandidateAssignmentId: (formData.relatedCandidateAssignmentId && formData.relatedCandidateAssignmentId.trim()) ? formData.relatedCandidateAssignmentId : undefined,
      };
      
      console.log('Sending payload to API:', payload);
      
      await createContactHistory.mutate(payload);
    } catch (error) {
      console.error('Error creating contact history:', error);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedEntry || !formData.subject || !formData.notes) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Convert datetime-local to ISO datetime format
    let followUpDateISO: string | undefined;
    if (formData.followUpDate && formData.followUpDate.trim()) {
      // datetime-local format is "YYYY-MM-DDTHH:mm", convert to ISO format
      const date = new Date(formData.followUpDate);
      if (!isNaN(date.getTime())) {
        followUpDateISO = date.toISOString();
      }
    }

    await updateContactHistory.mutate({
      id: selectedEntry._id,
      data: {
        contactMethod: formData.contactMethod,
        subject: formData.subject,
        notes: formData.notes,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        outcome: (formData.outcome && formData.outcome !== 'none' && formData.outcome.trim()) ? formData.outcome : undefined,
        followUpDate: followUpDateISO,
        followUpNotes: (formData.followUpNotes && formData.followUpNotes.trim()) ? formData.followUpNotes : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        relatedJobId: (formData.relatedJobId && formData.relatedJobId !== 'none' && formData.relatedJobId.trim()) ? formData.relatedJobId : undefined,
        relatedCandidateAssignmentId: (formData.relatedCandidateAssignmentId && formData.relatedCandidateAssignmentId.trim()) ? formData.relatedCandidateAssignmentId : undefined,
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;
    await deleteContactHistory.mutate(selectedEntry._id);
  };

  const addTag = () => {
    if (formData.tagInput.trim() && !formData.tags.includes(formData.tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, formData.tagInput.trim()], tagInput: '' });
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getOutcomeBadge = (outcome?: string) => {
    if (!outcome) return null;
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      positive: { variant: 'default', label: 'Positive' },
      neutral: { variant: 'secondary', label: 'Neutral' },
      negative: { variant: 'destructive', label: 'Negative' },
      follow_up_required: { variant: 'outline', label: 'Follow-up Required' },
    };
    const config = variants[outcome];
    return config ? <Badge variant={config.variant}>{config.label}</Badge> : null;
  };

  const getContactName = (entry: ContactHistoryEntry) => {
    if (entry.contactType === 'hr') {
      return `${entry.contactId?.firstName || ''} ${entry.contactId?.lastName || ''}`.trim() || entry.contactId?.email || 'Unknown HR';
    } else {
      return `${entry.contactId?.userId?.firstName || ''} ${entry.contactId?.userId?.lastName || ''}`.trim() || entry.contactId?.userId?.email || 'Unknown Candidate';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <DashboardBanner />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact History</h1>
          <p className="text-muted-foreground">Log and manage your contact history with HR and candidates</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Log Contact
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">HR Contacts</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType?.hr || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidate Contacts</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType?.candidate || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Follow-ups</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingFollowUps || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contact Type</Label>
              <Select value={contactTypeFilter} onValueChange={(value: any) => setContactTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                  <SelectItem value="candidate">Candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select value={agentFilter} onValueChange={(value: any) => setAgentFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {agents.map((agent) => {
                      const agentId = String(agent.id || agent._id || '');
                      if (!agentId || agentId === 'undefined' || agentId === 'null') return null;
                      return (
                        <SelectItem key={agentId} value={agentId}>
                          {agent.firstName || ''} {agent.lastName || ''} {agent.email ? `(${agent.email})` : ''}
                        </SelectItem>
                      );
                    }).filter(Boolean)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Contact Method</Label>
              <Select value={methodFilter} onValueChange={(value: any) => setMethodFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Outcome</Label>
              <Select value={outcomeFilter} onValueChange={(value: any) => setOutcomeFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                  <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact History List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact History</CardTitle>
          <CardDescription>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-5 bg-gray-300 rounded w-16"></div>
                        <div className="h-5 bg-gray-300 rounded w-24"></div>
                        <div className="h-5 bg-gray-300 rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No contact history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntries.map((entry: ContactHistoryEntry) => (
                <Card key={entry._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg">{entry.subject}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={entry.contactType === 'hr' ? 'default' : 'secondary'}>
                            {entry.contactType === 'hr' ? 'HR' : 'Candidate'}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {getContactMethodIcon(entry.contactMethod)}
                            {entry.contactMethod}
                          </Badge>
                          {getOutcomeBadge(entry.outcome)}
                          {entry.followUpDate && new Date(entry.followUpDate) > new Date() && (
                            <Badge variant="outline" className="text-orange-600">
                              Follow-up Scheduled
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Agent: {entry.agentId?.firstName} {entry.agentId?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Contact: {getContactName(entry)} ({entry.contactType === 'hr' ? 'HR' : 'Candidate'})</span>
                          </div>
                          {entry.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{entry.duration} min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(entry)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          {(user?.role === 'admin' || user?.role === 'superadmin' || 
                            (user?.role === 'agent' && entry.agentId?._id === user?.id)) && (
                            <>
                              <DropdownMenuItem onClick={() => handleEdit(entry)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </>
                          )}
                          {(user?.role === 'admin' || user?.role === 'superadmin') && (
                            <DropdownMenuItem 
                              onClick={() => handleDelete(entry)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta?.page && meta.page.total > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {meta.page.current} of {meta.page.total}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!meta.page.hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log New Contact</DialogTitle>
            <DialogDescription>
              Record a new contact interaction with HR or a candidate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Type *</Label>
                <Select
                  value={formData.contactType}
                  onValueChange={(value: any) => setFormData({ ...formData, contactType: value, contactId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="candidate">Candidate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Contact *</Label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) => {
                    console.log('Contact selected:', value);
                    console.log('Available candidates:', candidates.map((c: any) => ({
                      _id: c._id,
                      id: c.id,
                      value: String(c._id || c.id)
                    })));
                    setFormData({ ...formData, contactId: value });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingData ? (
                      <SelectItem value="loading" disabled>Loading contacts...</SelectItem>
                    ) : formData.contactType === 'hr' ? (
                      <>
                        {(hrUsers || []).filter(hr => hr && (hr.id || hr._id)).map((hr) => {
                          const hrId = String(hr.id || hr._id || '');
                          if (!hrId || hrId === 'undefined' || hrId === 'null') return null;
                          return (
                            <SelectItem key={hrId} value={hrId}>
                              {hr.firstName || ''} {hr.lastName || ''} {hr.email ? `(${hr.email})` : ''}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                        {(!hrUsers || hrUsers.length === 0 || hrUsers.filter(hr => hr && (hr.id || hr._id)).length === 0) && (
                          <SelectItem value="no-options" disabled>No HR users available</SelectItem>
                        )}
                      </>
                    ) : (
                      <>
                        {(candidates || []).filter(candidate => {
                          // For candidates, we need the Candidate document ID (_id), not the user ID
                          // The API expects Candidate.findById(contactId) to work
                          const candidateId = String(candidate._id || candidate.id || '');
                          const isValid = candidate && candidateId && candidateId !== 'undefined' && candidateId !== 'null';
                          if (!isValid) {
                            console.warn('Invalid candidate in dropdown:', candidate);
                          }
                          return isValid;
                        }).map((candidate) => {
                          // Use candidate._id (Candidate document ID) for the contactId (this is what the API expects)
                          const candidateId = String(candidate._id || candidate.id || '');
                          if (!candidateId || candidateId === 'undefined' || candidateId === 'null') {
                            console.warn('Skipping candidate with invalid ID:', candidate);
                            return null;
                          }
                          const userId = candidate.userId || candidate;
                          console.log('Rendering candidate dropdown item:', {
                            candidateId,
                            userId: userId?._id,
                            name: `${userId?.firstName} ${userId?.lastName}`
                          });
                          return (
                            <SelectItem key={candidateId} value={candidateId}>
                              {userId?.firstName || ''} {userId?.lastName || ''} {userId?.email ? `(${userId.email})` : ''}
                            </SelectItem>
                          );
                        }).filter(Boolean)}
                        {(!candidates || candidates.length === 0 || candidates.filter(c => {
                          const candidateId = String(c?._id || c?.id || '');
                          return c && candidateId && candidateId !== 'undefined' && candidateId !== 'null';
                        }).length === 0) && (
                          <SelectItem value="no-options" disabled>No candidates available</SelectItem>
                        )}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Method *</Label>
                <Select
                  value={formData.contactMethod}
                  onValueChange={(value: any) => setFormData({ ...formData, contactMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers (including empty string for clearing)
                    if (value === '' || /^\d+$/.test(value)) {
                      setFormData({ ...formData, duration: value });
                    }
                  }}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief subject of the contact"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes *</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detailed notes about the contact..."
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select
                  value={formData.outcome || 'none'}
                  onValueChange={(value: any) => setFormData({ ...formData, outcome: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>
            </div>
            {formData.followUpDate && (
              <div className="space-y-2">
                <Label>Follow-up Notes</Label>
                <Textarea
                  value={formData.followUpNotes}
                  onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                  placeholder="Notes for follow-up..."
                  rows={3}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Related Job</Label>
                <Select
                  value={formData.relatedJobId || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, relatedJobId: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {(jobs || []).filter(job => job?.id || job?._id).map((job) => {
                      const jobId = job.id || job._id;
                      return (
                        <SelectItem key={jobId} value={String(jobId)}>
                          {job.title || 'Untitled Job'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitCreate} disabled={createContactHistory.loading}>
              {createContactHistory.loading ? 'Creating...' : 'Create Contact Log'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              View contact history entry details
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contact Type</Label>
                  <p className="font-medium">
                    <Badge variant={selectedEntry.contactType === 'hr' ? 'default' : 'secondary'}>
                      {selectedEntry.contactType === 'hr' ? 'HR' : 'Candidate'}
                    </Badge>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact Method</Label>
                  <p className="font-medium flex items-center gap-2">
                    {getContactMethodIcon(selectedEntry.contactMethod)}
                    {selectedEntry.contactMethod}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <p className="font-medium">{selectedEntry.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Notes</Label>
                <p className="whitespace-pre-wrap">{selectedEntry.notes}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Agent</Label>
                  <p className="font-medium">
                    {selectedEntry.agentId?.firstName} {selectedEntry.agentId?.lastName}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Contact</Label>
                  <p className="font-medium">{getContactName(selectedEntry)}</p>
                </div>
              </div>
              {selectedEntry.duration && (
                <div>
                  <Label className="text-muted-foreground">Duration</Label>
                  <p className="font-medium">{selectedEntry.duration} minutes</p>
                </div>
              )}
              {selectedEntry.outcome && (
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  <p>{getOutcomeBadge(selectedEntry.outcome)}</p>
                </div>
              )}
              {selectedEntry.followUpDate && (
                <div>
                  <Label className="text-muted-foreground">Follow-up Date</Label>
                  <p className="font-medium">{format(new Date(selectedEntry.followUpDate), 'PPpp')}</p>
                </div>
              )}
              {selectedEntry.followUpNotes && (
                <div>
                  <Label className="text-muted-foreground">Follow-up Notes</Label>
                  <p className="whitespace-pre-wrap">{selectedEntry.followUpNotes}</p>
                </div>
              )}
              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="font-medium">{format(new Date(selectedEntry.createdAt), 'PPpp')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {(user?.role === 'admin' || user?.role === 'superadmin' || 
              (user?.role === 'agent' && selectedEntry?.agentId?._id === user?.id)) && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedEntry) handleEdit(selectedEntry);
              }}>
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Similar to Create but with pre-filled data */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Contact Log</DialogTitle>
            <DialogDescription>
              Update contact history entry
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Method *</Label>
                <Select
                  value={formData.contactMethod}
                  onValueChange={(value: any) => setFormData({ ...formData, contactMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.duration}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers (including empty string for clearing)
                    if (value === '' || /^\d+$/.test(value)) {
                      setFormData({ ...formData, duration: value });
                    }
                  }}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes *</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={5}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Select
                  value={formData.outcome || 'none'}
                  onValueChange={(value: any) => setFormData({ ...formData, outcome: value === 'none' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="follow_up_required">Follow-up Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                />
              </div>
            </div>
            {formData.followUpDate && (
              <div className="space-y-2">
                <Label>Follow-up Notes</Label>
                <Textarea
                  value={formData.followUpNotes}
                  onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                  rows={3}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" onClick={addTag} variant="outline">Add</Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitEdit} disabled={updateContactHistory.loading}>
              {updateContactHistory.loading ? 'Updating...' : 'Update Contact Log'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Contact Log</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact history entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="py-4">
              <p className="font-medium">{selectedEntry.subject}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Created {formatDistanceToNow(new Date(selectedEntry.createdAt), { addSuffix: true })}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteContactHistory.loading}>
              {deleteContactHistory.loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactHistory;

