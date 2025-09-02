import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Eye,
  Edit,
  Trash2,
  Users,
  Briefcase
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob, useCompanies } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function JobManagementIntegrated() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time' as const,
    urgency: 'medium' as const,
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    skills: '',
    experience: 'mid' as const,
    education: '',
    languages: 'English',
    isRemote: false,
    benefits: '',
    applicationDeadline: '',
    interviewRounds: 2,
    estimatedDuration: '2-3 weeks',
    companyId: ''
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Memoize the API parameters to prevent unnecessary re-renders
  const jobsParams = useMemo(() => ({
    page, 
    limit: 20, 
    search: debouncedSearchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    // HR users can only see jobs they posted
    ...(user?.role === 'hr' && { createdBy: user.id })
  }), [page, debouncedSearchTerm, statusFilter, user?.role, user?.id]);
  
  // API hooks
  const { 
    data: jobsResponse, 
    loading: jobsLoading, 
    error: jobsError, 
    refetch: refetchJobs 
  } = useJobs(jobsParams);

  const { data: companiesResponse } = useCompanies();
  const companies = Array.isArray(companiesResponse) ? companiesResponse : (companiesResponse?.data || []);

  const { mutate: createJob, loading: createLoading } = useCreateJob({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      resetCreateForm();
      refetchJobs();
      toast({
        title: "Success",
        description: "Job created successfully"
      });
    },
    onError: (error: any) => {
      // Handle backend validation errors
      if (error.issues && Array.isArray(error.issues)) {
        const backendErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          backendErrors[issue.field] = issue.message;
        });
        setFormErrors(backendErrors);
      } else {
        toast({
          title: "Error",
          description: error.detail || "Failed to create job",
          variant: "destructive"
        });
      }
    }
  });

  const { mutate: updateJob, loading: updateLoading } = useUpdateJob({
    onSuccess: () => {
      setIsEditDialogOpen(false);
      refetchJobs();
      toast({
        title: "Success",
        description: "Job updated successfully"
      });
    }
  });

  const { mutate: deleteJob, loading: deleteLoading } = useDeleteJob({
    onSuccess: () => {
      refetchJobs();
      toast({
        title: "Success", 
        description: "Job deleted successfully"
      });
    }
  });

  // Handle both API response formats: {data: [...], meta: {...}} or direct array
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse?.data || []);
  const meta = Array.isArray(jobsResponse) ? null : jobsResponse?.meta;

  // Filter jobs (additional client-side filtering)
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  const handleCreateJob = () => {
    if (!validateForm()) {
      return;
    }

    const jobData = {
      title: createFormData.title.trim(),
      description: createFormData.description.trim(),
      location: createFormData.location.trim(),
      type: createFormData.type,
      urgency: createFormData.urgency,
      companyId: createFormData.companyId,
      salaryRange: {
        min: parseInt(createFormData.salaryMin) || 0,
        max: parseInt(createFormData.salaryMax) || 0,
        currency: createFormData.currency
      },
      requirements: {
        skills: createFormData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        experience: createFormData.experience,
        education: createFormData.education.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: createFormData.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
      },
      isRemote: createFormData.isRemote,
      benefits: createFormData.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
      applicationDeadline: createFormData.applicationDeadline ? new Date(createFormData.applicationDeadline) : undefined,
      interviewProcess: {
        rounds: createFormData.interviewRounds,
        estimatedDuration: createFormData.estimatedDuration
      }
    };

    createJob(jobData);
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

    if (!createFormData.location.trim()) {
      errors.location = 'Location is required';
    } else if (createFormData.location.length > 200) {
      errors.location = 'Location cannot exceed 200 characters';
    }

    if (!createFormData.companyId) {
      errors.companyId = 'Company selection is required';
    }

    if (!createFormData.skills.trim()) {
      errors.skills = 'Required skills are needed';
    }

    // Salary validation
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
      if (deadline <= today) {
        errors.applicationDeadline = 'Application deadline must be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetCreateForm = () => {
    setCreateFormData({
      title: '',
      description: '',
      location: '',
      type: 'full-time' as const,
      urgency: 'medium' as const,
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      skills: '',
      experience: 'mid' as const,
      education: '',
      languages: 'English',
      isRemote: false,
      benefits: '',
      applicationDeadline: '',
      interviewRounds: 2,
      estimatedDuration: '2-3 weeks',
      companyId: ''
    });
    setFormErrors({});
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      deleteJob(id);
    }
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    // Pre-populate form with existing job data
    setEditFormData({
      title: job.title || '',
      description: job.description || '',
      location: job.location || '',
      type: job.type || 'full-time',
      urgency: job.urgency || 'medium',
      salaryMin: job.salaryRange?.min || '',
      salaryMax: job.salaryRange?.max || '',
      skills: job.requirements?.skills?.join(', ') || '',
      experience: job.requirements?.experience || 'mid',
      status: job.status || 'open'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateJob = () => {
    if (!selectedJob?.id) return;
    
    const updateData = {
      title: editFormData.title,
      description: editFormData.description,
      location: editFormData.location,
      type: editFormData.type,
      urgency: editFormData.urgency,
      status: editFormData.status,
      salaryRange: {
        min: parseInt(editFormData.salaryMin) || 0,
        max: parseInt(editFormData.salaryMax) || 0,
        currency: 'USD'
      },
      requirements: {
        skills: editFormData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        experience: editFormData.experience,
        education: selectedJob.requirements?.education || [],
        languages: selectedJob.requirements?.languages || ['English']
      }
    };

    updateJob({ id: selectedJob.id, data: updateData });
  };

  const formatSalary = (job: any) => {
    if (job.salaryRange?.min && job.salaryRange?.max) {
      return `$${(job.salaryRange.min / 1000).toFixed(0)}k - $${(job.salaryRange.max / 1000).toFixed(0)}k`;
    }
    return "Salary TBD";
  };

  const getAssignedAgent = (job: any) => {
    // In real implementation, this would be populated from the API
    return job.assignedAgentId ? "Agent Assigned" : "Unassigned";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Management</h1>
          <p className="text-muted-foreground">Manage job postings and track recruitment progress</p>
          {user?.role === 'hr' && (
            <p className="text-sm text-blue-600 mt-1">
              Showing only jobs you posted
            </p>
          )}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
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
                    <Label htmlFor="title">Job Title *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location" 
                      placeholder="e.g. Remote, New York, NY"
                      value={createFormData.location}
                      onChange={(e) => setCreateFormData({...createFormData, location: e.target.value})}
                      className={formErrors.location ? "border-red-500" : ""}
                    />
                    {formErrors.location && (
                      <p className="text-sm text-red-500">{formErrors.location}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Select value={createFormData.companyId} onValueChange={(value) => setCreateFormData({...createFormData, companyId: value})}>
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
                    <Label htmlFor="type">Job Type *</Label>
                    <Select value={createFormData.type} onValueChange={(value) => setCreateFormData({...createFormData, type: value})}>
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
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={createFormData.urgency} onValueChange={(value) => setCreateFormData({...createFormData, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={createFormData.experience} onValueChange={(value) => setCreateFormData({...createFormData, experience: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid Level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="skills">Required Skills *</Label>
                    <Input 
                      id="skills" 
                      placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                      value={createFormData.skills}
                      onChange={(e) => setCreateFormData({...createFormData, skills: e.target.value})}
                      className={formErrors.skills ? "border-red-500" : ""}
                    />
                    {formErrors.skills && (
                      <p className="text-sm text-red-500">{formErrors.skills}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Requirements</Label>
                    <Input 
                      id="education" 
                      placeholder="e.g. Bachelor's in Computer Science (comma separated)"
                      value={createFormData.education}
                      onChange={(e) => setCreateFormData({...createFormData, education: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="languages">Languages</Label>
                  <Input 
                    id="languages" 
                    placeholder="e.g. English, Spanish (comma separated)"
                    value={createFormData.languages}
                    onChange={(e) => setCreateFormData({...createFormData, languages: e.target.value})}
                  />
                </div>
              </div>

              {/* Compensation & Benefits */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Compensation & Benefits</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryMin">Minimum Salary</Label>
                    <Input 
                      id="salaryMin" 
                      type="number"
                      placeholder="e.g. 80000"
                      value={createFormData.salaryMin}
                      onChange={(e) => setCreateFormData({...createFormData, salaryMin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryMax">Maximum Salary</Label>
                    <Input 
                      id="salaryMax" 
                      type="number"
                      placeholder="e.g. 120000"
                      value={createFormData.salaryMax}
                      onChange={(e) => setCreateFormData({...createFormData, salaryMax: e.target.value})}
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
                    <Label htmlFor="applicationDeadline">Application Deadline</Label>
                    <Input 
                      id="applicationDeadline" 
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
                    <Label htmlFor="interviewRounds">Interview Rounds</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Hiring Timeline</Label>
                  <Select value={createFormData.estimatedDuration} onValueChange={(value) => setCreateFormData({...createFormData, estimatedDuration: value})}>
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
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRemote"
                    checked={createFormData.isRemote}
                    onChange={(e) => setCreateFormData({...createFormData, isRemote: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isRemote">Remote work available</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateDialogOpen(false);
                resetCreateForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateJob} disabled={createLoading || !createFormData.title || !createFormData.description || !createFormData.location || !createFormData.companyId}>
                {createLoading ? "Creating..." : "Create Job Posting"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview - using real data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Jobs</p>
                <p className="text-2xl font-bold text-success">
                  {jobsLoading ? "..." : jobs.filter(j => j.status === 'open').length}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-warning">
                  {jobsLoading ? "..." : jobs.filter(j => j.status === 'assigned' || j.status === 'interview').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold text-info">
                  {jobsLoading ? "..." : jobs.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold text-primary">
                  {jobsLoading ? "..." : new Set(jobs.map(j => j.company?.name)).size}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Listings</CardTitle>
          {user?.role === 'hr' && (
            <p className="text-sm text-blue-600">
              Showing only jobs you posted
            </p>
          )}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs or companies..."
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
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading jobs...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : user?.role === 'hr' 
                    ? "Get started by posting your first job"
                    : "No jobs available at the moment"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Details</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Applicants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                        {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatSalary(job)}
                          </span>
                          <span>{job.type}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {job.company?.name || 'Company'}
                      </div>
                    </TableCell>
                    <TableCell>{getAssignedAgent(job)}</TableCell>
                    <TableCell className="text-center">{job.applications || 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getUrgencyColor(job.urgency)} variant="outline">
                        {job.urgency}
                      </Badge>
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
                          <DropdownMenuItem>
                            View Applicants
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                          onClick={() => handleDeleteJob(job.id)}
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
        </CardContent>
      </Card>

      {/* Job Details Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Complete job details and requirements
            </DialogDescription>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Company:</span>
                        <span>{selectedJob.company?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{selectedJob.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{selectedJob.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Salary:</span>
                        <span>{formatSalary(selectedJob)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Status & Priority</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(selectedJob.status)}>
                          {selectedJob.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Urgency:</span>
                        <Badge className={getUrgencyColor(selectedJob.urgency)} variant="outline">
                          {selectedJob.urgency}
                        </Badge>
                      </div>
          <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Applications:</span>
                        <span>{selectedJob.applications || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Requirements</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Experience Level:</span>
                        <span className="ml-2 capitalize">{selectedJob.requirements?.experience || 'N/A'}</span>
                      </div>
                      {selectedJob.requirements?.skills && selectedJob.requirements.skills.length > 0 && (
                        <div>
                          <span className="font-medium">Required Skills:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedJob.requirements.skills.map((skill: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
          </div>
        </div>
      )}
                      {selectedJob.requirements?.education && selectedJob.requirements.education.length > 0 && (
                        <div>
                          <span className="font-medium">Education:</span>
                          <ul className="ml-4 mt-1">
                            {selectedJob.requirements.education.map((edu: string, index: number) => (
                              <li key={index} className="text-sm">• {edu}</li>
                            ))}
                          </ul>
    </div>
                      )}
        </div>
        </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Dates</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Posted:</span>
                        <span className="ml-2">
                          {selectedJob.postedAt ? new Date(selectedJob.postedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
          <div>
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">
                          {selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
          </div>
          <div>
                        <span className="font-medium">Last Updated:</span>
                        <span className="ml-2">
                          {selectedJob.updatedAt ? new Date(selectedJob.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
          </div>
        </div>

              {/* Job Description */}
        <div>
                <h3 className="font-semibold text-lg mb-3">Job Description</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedJob.description || 'No description available.'}
                  </p>
        </div>
          </div>

              {/* Additional Details */}
              {(selectedJob.benefits && selectedJob.benefits.length > 0) && (
          <div>
                  <h3 className="font-semibold text-lg mb-3">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.benefits.map((benefit: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
          </div>
        </div>
              )}
        </div>
          )}
          
        <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
          </Button>
                        <Button onClick={() => {
              setIsViewDialogOpen(false);
              handleEditJob(selectedJob);
            }}>
              Edit Job
            </Button>
        </DialogFooter>
            </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Job: {selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Update job details and requirements
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title</Label>
                <Input 
                  id="edit-title" 
                  value={editFormData.title || ''}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  placeholder="e.g. Senior React Developer" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  value={editFormData.location || ''}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  placeholder="e.g. Remote, New York" 
                />
              </div>
            </div>

            {/* Job Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Job Type</Label>
            <Select 
                  value={editFormData.type || 'full-time'} 
                  onValueChange={(value) => setEditFormData({...editFormData, type: value})}
            >
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
                <Label htmlFor="edit-urgency">Urgency Level</Label>
                <Select 
                  value={editFormData.urgency || 'medium'} 
                  onValueChange={(value) => setEditFormData({...editFormData, urgency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
            <Select 
                  value={editFormData.status || 'open'} 
                  onValueChange={(value) => setEditFormData({...editFormData, status: value})}
            >
              <SelectTrigger>
                    <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-salary-min">Minimum Salary ($)</Label>
                <Input 
                  id="edit-salary-min" 
                  type="number"
                  value={editFormData.salaryMin || ''}
                  onChange={(e) => setEditFormData({...editFormData, salaryMin: e.target.value})}
                  placeholder="e.g. 100000" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary-max">Maximum Salary ($)</Label>
                <Input 
                  id="edit-salary-max" 
                  type="number"
                  value={editFormData.salaryMax || ''}
                  onChange={(e) => setEditFormData({...editFormData, salaryMax: e.target.value})}
                  placeholder="e.g. 150000" 
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-skills">Required Skills (comma-separated)</Label>
          <Input
                  id="edit-skills" 
                  value={editFormData.skills || ''}
                  onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})}
            placeholder="e.g. React, TypeScript, Node.js"
          />
        </div>
              <div className="space-y-2">
                <Label htmlFor="edit-experience">Experience Level</Label>
                <Select 
                  value={editFormData.experience || 'mid'} 
                  onValueChange={(value) => setEditFormData({...editFormData, experience: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                    <SelectItem value="lead">Lead (8+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Job Description</Label>
              <Textarea 
                id="edit-description" 
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Enter detailed job description..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={updateLoading}
            >
            Cancel
          </Button>
            <Button 
              onClick={handleUpdateJob}
              disabled={updateLoading || !editFormData.title}
            >
              {updateLoading ? "Updating..." : "Update Job"}
          </Button>
        </DialogFooter>
    </DialogContent>
      </Dialog>
    </div>
  );
}