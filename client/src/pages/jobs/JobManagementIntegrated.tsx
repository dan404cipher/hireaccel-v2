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
  Building2,
  Eye,
  Edit,
  Trash2,
  Users,
  Briefcase,
  UserCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobs, useCreateJob, useDeleteJob, useCompanies } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function JobManagementIntegrated() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time' as const,
    urgency: 'medium' as const,
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
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
  const companies = Array.isArray(companiesResponse) ? companiesResponse : (companiesResponse as any)?.data || [];

  const { mutate: createJob, loading: createLoading } = useCreateJob();

  const { mutate: deleteJob, loading: deleteLoading } = useDeleteJob();

  // Handle both API response formats: {data: [...], meta: {...}} or direct array
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse as any)?.data || [];
  const meta = Array.isArray(jobsResponse) ? null : (jobsResponse as any)?.meta;

  // Filter jobs (additional client-side filtering)
  const filteredJobs = jobs.filter(job => {
    if (!searchTerm) return true;
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
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

    const jobData = {
      title: createFormData.title.trim(),
      description: createFormData.description.trim(),
      location: createFormData.location.trim(),
      type: createFormData.type,
      urgency: createFormData.urgency,
      companyId: createFormData.companyId,
      salaryRange: createFormData.salaryMin || createFormData.salaryMax ? {
        min: createFormData.salaryMin ? parseInt(createFormData.salaryMin) : undefined,
        max: createFormData.salaryMax ? parseInt(createFormData.salaryMax) : undefined,
        currency: createFormData.currency
      } : undefined,
      requirements: {
        skills: createFormData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        experience: createFormData.experience,
        education: createFormData.education.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: createFormData.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
      },
      isRemote: createFormData.isRemote,
      benefits: createFormData.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
      applicationDeadline: createFormData.applicationDeadline ? new Date(createFormData.applicationDeadline).toISOString() : undefined,
      interviewProcess: createFormData.interviewRounds || createFormData.estimatedDuration ? {
        rounds: createFormData.interviewRounds,
        estimatedDuration: createFormData.estimatedDuration
      } : undefined
    };

    try {
      console.log('Sending job data:', jobData);
      console.log('Current user:', user);
      console.log('Selected company ID:', createFormData.companyId);
      const createdJob = await createJob(jobData);
      setIsCreateDialogOpen(false);
      resetCreateForm();
      refetchJobs();
      toast({
        title: "Success",
        description: `Job created successfully${createdJob?.jobId ? ` with ID: ${createdJob.jobId}` : ''}`
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

    if (!createFormData.location.trim()) {
      errors.location = 'Location is required';
    } else if (createFormData.location.length > 200) {
      errors.location = 'Location cannot exceed 200 characters';
    }

    if (!createFormData.companyId) {
      errors.companyId = 'Company selection is required';
    }

    if (!createFormData.skills.trim()) {
      errors.skills = 'At least one skill is required';
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
      if (deadline < today) {
        errors.applicationDeadline = 'Application deadline cannot be in the past';
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
      type: 'full-time',
      urgency: 'medium',
      salaryMin: '',
      salaryMax: '',
      currency: 'INR',
      skills: '',
      experience: 'mid',
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

  const handleDeleteJob = async (id: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        await deleteJob(id);
        refetchJobs();
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
    navigate(`/dashboard/jobs/${job.jobId || job.id || job._id}/edit`);
  };

  const formatSalary = (job: any) => {
    if (job.salaryRange?.min && job.salaryRange?.max) {
      const currency = job.salaryRange.currency || 'INR';
      const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
      return `${symbol}${(job.salaryRange.min / 1000).toFixed(0)}k - ${symbol}${(job.salaryRange.max / 1000).toFixed(0)}k`;
    }
    return "Salary TBD";
  };

  const getAssignedAgent = (job: any) => {
    if (!job.assignedAgentId) {
      return "Unassigned";
    }
    
    // If assignedAgentId is populated with agent data
    if (typeof job.assignedAgentId === 'object' && job.assignedAgentId.firstName) {
      return `${job.assignedAgentId.firstName} ${job.assignedAgentId.lastName}`;
    }
    
    // Fallback if it's just an ID
    return "Agent Assigned";
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            {company.companyId ? `${company.companyId} - ${company.name}` : company.name}
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
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select value={createFormData.urgency} onValueChange={(value) => setCreateFormData({...createFormData, urgency: value as any})}>
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
                    <Select value={createFormData.experience} onValueChange={(value) => setCreateFormData({...createFormData, experience: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">0-2 years</SelectItem>
                        <SelectItem value="junior">2-5 years</SelectItem>
                        <SelectItem value="mid">5-10 years</SelectItem>
                        <SelectItem value="senior">10+ years</SelectItem>
                        <SelectItem value="lead">10+ years</SelectItem>
                        <SelectItem value="executive">10+ years</SelectItem>
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
                    <Label htmlFor="salary-min">Minimum Salary</Label>
                    <Input 
                      id="salary-min" 
                      type="number"
                      placeholder="e.g. 80000"
                      value={createFormData.salaryMin}
                      onChange={(e) => setCreateFormData({...createFormData, salaryMin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary-max">Maximum Salary</Label>
                    <Input 
                      id="salary-max" 
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
                <div className="space-y-2">
                  <Label htmlFor="estimated-duration">Estimated Hiring Timeline</Label>
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
                    id="is-remote"
                    checked={createFormData.isRemote}
                    onChange={(e) => setCreateFormData({...createFormData, isRemote: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="is-remote">Remote work available</Label>
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search jobs by title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading jobs...</span>
            </div>
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
            <div className="space-y-4">
              {filteredJobs.map((job: any) => (
                <Card key={job.id || job._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                          {job.jobId && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono flex-shrink-0">
                              {job.jobId}
                            </span>
                          )}
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span className="truncate">{job.companyId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{job.urgency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Center Section - Applications */}
                      <div className="flex items-center justify-center mx-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{job.applications || 0}</div>
                          <div className="text-xs text-muted-foreground">Applications</div>
                        </div>
                      </div>

                      {/* Right Section - Salary, Agent, Date & Actions */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatSalary(job)}</div>
                          <div className="text-xs text-muted-foreground">Salary</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{getAssignedAgent(job)}</div>
                          <div className="text-xs text-muted-foreground">Agent</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">Posted</div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}