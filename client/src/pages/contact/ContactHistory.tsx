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
  useDeleteContactHistory 
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ContactHistoryEntry | null>(null);
  const [hrUsers, setHrUsers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    contactType: 'hr' as 'hr' | 'candidate',
    contactId: '',
    contactMethod: 'phone' as 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other',
    subject: '',
    notes: '',
    duration: '',
    outcome: '' as '' | 'positive' | 'neutral' | 'negative' | 'follow_up_required',
    followUpDate: '',
    followUpNotes: '',
    tags: [] as string[],
    tagInput: '',
    relatedJobId: '',
    relatedCandidateAssignmentId: '',
  });

  // Fetch HR users and candidates for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hrResponse, candidatesResponse, jobsResponse] = await Promise.all([
          apiClient.getUsers({ role: 'hr', limit: 100 }),
          apiClient.getCandidates({ limit: 100 }),
          apiClient.getJobs({ limit: 100, status: 'open' }),
        ]);
        setHrUsers(Array.isArray(hrResponse.data) ? hrResponse.data : (hrResponse.data as any)?.data || []);
        setCandidates(Array.isArray(candidatesResponse.data) ? candidatesResponse.data : (candidatesResponse.data as any)?.data || []);
        setJobs(Array.isArray(jobsResponse.data) ? jobsResponse.data : (jobsResponse.data as any)?.data || []);
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error);
      }
    };
    fetchData();
  }, []);

  // API calls
  const { data: contactHistoryData, loading, refetch } = useContactHistory({
    page: currentPage,
    limit: 20,
    contactType: contactTypeFilter !== 'all' ? contactTypeFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data: statsData } = useContactHistoryStats();
  const createContactHistory = useCreateContactHistory({ onSuccess: () => { setIsCreateDialogOpen(false); refetch(); } });
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
      outcome: '',
      followUpDate: '',
      followUpNotes: '',
      tags: [],
      tagInput: '',
      relatedJobId: '',
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
      outcome: entry.outcome || '',
      followUpDate: entry.followUpDate ? format(new Date(entry.followUpDate), "yyyy-MM-dd'T'HH:mm") : '',
      followUpNotes: entry.followUpNotes || '',
      tags: entry.tags || [],
      tagInput: '',
      relatedJobId: entry.relatedJobId?._id.toString() || '',
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

    await createContactHistory.execute({
      contactType: formData.contactType,
      contactId: formData.contactId,
      contactMethod: formData.contactMethod,
      subject: formData.subject,
      notes: formData.notes,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      outcome: formData.outcome || undefined,
      followUpDate: formData.followUpDate || undefined,
      followUpNotes: formData.followUpNotes || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      relatedJobId: formData.relatedJobId || undefined,
      relatedCandidateAssignmentId: formData.relatedCandidateAssignmentId || undefined,
    });
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

    await updateContactHistory.execute({
      id: selectedEntry._id,
      data: {
        contactMethod: formData.contactMethod,
        subject: formData.subject,
        notes: formData.notes,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        outcome: formData.outcome || undefined,
        followUpDate: formData.followUpDate || undefined,
        followUpNotes: formData.followUpNotes || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        relatedJobId: formData.relatedJobId || undefined,
        relatedCandidateAssignmentId: formData.relatedCandidateAssignmentId || undefined,
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEntry) return;
    await deleteContactHistory.execute(selectedEntry._id);
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
          <div className="grid gap-4 md:grid-cols-4">
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
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
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
                        <h3 className="font-semibold text-lg">{entry.subject}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.notes}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Agent: {entry.agentId?.firstName} {entry.agentId?.lastName}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Contact: {getContactName(entry)}</span>
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
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
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
                  onValueChange={(value) => setFormData({ ...formData, contactId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.contactType === 'hr'
                      ? hrUsers.map((hr) => (
                          <SelectItem key={hr.id} value={hr.id}>
                            {hr.firstName} {hr.lastName} ({hr.email})
                          </SelectItem>
                        ))
                      : candidates.map((candidate) => (
                          <SelectItem key={candidate._id} value={candidate._id}>
                            {candidate.userId?.firstName} {candidate.userId?.lastName} ({candidate.userId?.email})
                          </SelectItem>
                        ))}
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
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                  value={formData.outcome}
                  onValueChange={(value: any) => setFormData({ ...formData, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
                  value={formData.relatedJobId}
                  onValueChange={(value) => setFormData({ ...formData, relatedJobId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select job (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id || job._id} value={job.id || job._id}>
                        {job.title}
                      </SelectItem>
                    ))}
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
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
                  value={formData.outcome}
                  onValueChange={(value: any) => setFormData({ ...formData, outcome: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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

