import { useState, useEffect, useMemo, useCallback } from "react";
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
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJobs, useCreateJob, useDeleteJob, useCompanies, useUpdateJob } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardBanner } from "@/components/dashboard/Banner";

export default function JobManagementIntegrated(): React.JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editIdFromQuery = searchParams.get('editId');
  
  // Initialize filters from URL parameters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<any>(null);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    location: '',
    type: 'full-time' as const,
    workType: 'wfo' as const,
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    skills: '',
    experience: 'mid' as const,
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

  // Filter suggestions based on input
  const filteredSuggestions = skillSuggestions.filter(skill => 
    skill.toLowerCase().includes(skillInputValue.toLowerCase()) &&
    !createFormData.skills.split(',').map(s => s.trim()).filter(Boolean).includes(skill)
  ).slice(0, 8); // Show max 8 suggestions

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

  // TEMPORARY FIX: Direct API call to bypass the broken useApi hook
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState(null);
  
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
  
  // Check if HR has any companies
  const hasCompanies = companies.length > 0;
  
  // Redirect to company management if no companies exist
  useEffect(() => {
    if (!companiesLoading && user?.role === 'hr' && !hasCompanies) {
      toast({
        title: "Add a Company First",
        description: "Please add your company before posting jobs.",
        variant: "default"
      });
      navigate('/dashboard/companies');
    }
  }, [companiesLoading, hasCompanies, user?.role, navigate, toast]);

  const { mutate: createJob, loading: createLoading } = useCreateJob();
  const { mutate: updateJob, loading: updateLoading } = useUpdateJob();

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

  // Auto-open edit dialog when editId is present
  useEffect(() => {
    if (editIdFromQuery && filteredJobs.length > 0) {
      const found = filteredJobs.find((j: any) => (j._id || j.id || j.jobId) === editIdFromQuery);
      if (found) {
        handleEditJob(found);
      }
    }
  }, [editIdFromQuery, filteredJobs]);

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
        experience: createFormData.experience
      },
      benefits: createFormData.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
      applicationDeadline: createFormData.applicationDeadline ? new Date(createFormData.applicationDeadline).toISOString() : undefined,
      interviewProcess: createFormData.interviewRounds || createFormData.estimatedDuration ? {
        rounds: createFormData.interviewRounds,
        estimatedDuration: createFormData.estimatedDuration
      } : undefined
    };

    try {
      const createdJob = await createJob(jobData);
      setIsCreateDialogOpen(false);
      resetCreateForm();
      refetchJobs();
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
    setCreateFormData({
      title: '',
      description: '',
      location: '',
      type: 'full-time',
      workType: 'wfo',
      salaryMin: '',
      salaryMax: '',
      currency: 'INR',
      skills: '',
      experience: 'mid',
      benefits: '',
      applicationDeadline: '',
      interviewRounds: 2,
      estimatedDuration: '2-3 weeks',
      duration: '',
      numberOfOpenings: '1',
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
    // Open inline edit dialog prefilled with job data
    const salaryMin = job.salaryRange?.min ? String(job.salaryRange.min) : '';
    const salaryMax = job.salaryRange?.max ? String(job.salaryRange.max) : '';
    const currency = job.salaryRange?.currency || 'INR';
    const skills = Array.isArray(job.requirements?.skills) ? job.requirements.skills.join(', ') : '';
    const experience = job.requirements?.experience || 'mid';
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
      experience,
      benefits,
      applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
      interviewRounds,
      estimatedDuration,
      duration: job.duration || '',
      numberOfOpenings: String(job.numberOfOpenings || '1'),
      companyId: job.companyId?._id || job.companyId || ''
    });
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
    experience: 'mid' as const,
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
    const data = {
      title: editFormData.title.trim(),
      description: editFormData.description.trim(),
      location: editFormData.location.trim(),
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
        experience: editFormData.experience,
      },
      benefits: editFormData.benefits.split(',').map(s => s.trim()).filter(Boolean),
      applicationDeadline: editFormData.applicationDeadline ? new Date(editFormData.applicationDeadline).toISOString() : undefined,
      interviewProcess: editFormData.interviewRounds || editFormData.estimatedDuration ? {
        rounds: editFormData.interviewRounds,
        estimatedDuration: editFormData.estimatedDuration
      } : undefined
    };

    try {
      await updateJob({ id: selectedJobForEdit.id || selectedJobForEdit._id, data });
      setIsEditDialogOpen(false);
      setSelectedJobForEdit(null);
      refetchJobs();
      toast({ title: 'Success', description: 'Job updated successfully' });
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
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Auto-filled from company)</Label>
                    <Input 
                      id="location" 
                      placeholder="Select a company to auto-fill location"
                      value={createFormData.location}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground">Location will be automatically filled when you select a company</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                    <Select 
                      value={createFormData.companyId} 
                      onValueChange={(value) => {
                        const selectedCompany = companies.find((company: any) => company._id === value);
                        let location = '';
                        
                        if (selectedCompany) {
                          // Auto-fill complete location from company address including PIN code
                          if (selectedCompany.address) {
                            const addressParts = [
                              selectedCompany.address.street,
                              selectedCompany.address.city,
                              selectedCompany.address.state,
                              selectedCompany.address.zipCode,
                              selectedCompany.address.country
                            ].filter(Boolean);
                            location = addressParts.join(', ');
                          } else if (selectedCompany.location) {
                            // Fallback to old location format
                            location = selectedCompany.location;
                          }
                        }
                        
                        setCreateFormData({
                          ...createFormData, 
                          companyId: value,
                          location: location
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
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select value={createFormData.experience} onValueChange={(value) => setCreateFormData({...createFormData, experience: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">0-2 years (Entry Level)</SelectItem>
                        <SelectItem value="junior">2-5 years (Junior)</SelectItem>
                        <SelectItem value="mid">5-10 years (Mid Level)</SelectItem>
                        <SelectItem value="senior">10-15 years (Senior)</SelectItem>
                        <SelectItem value="lead">15+ years (Lead/Principal)</SelectItem>
                        <SelectItem value="executive">20+ years (Executive)</SelectItem>
                      </SelectContent>
                    </Select>
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
                    onChange={(e) => setCreateFormData({...createFormData, numberOfOpenings: e.target.value})}
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
                      onChange={(e) => setCreateFormData({...createFormData, salaryMin: e.target.value})}
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location (Auto-filled from company)</Label>
                    <Input id="edit-location" value={editFormData.location} readOnly className="bg-muted/50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-company">Company <span className="text-red-500">*</span></Label>
                    <Select value={editFormData.companyId} onValueChange={(value) => {
                      const selectedCompany = companies.find((company: any) => company._id === value);
                      let location = '';
                      if (selectedCompany) {
                        if (selectedCompany.address) {
                          const addressParts = [
                            selectedCompany.address.street,
                            selectedCompany.address.city,
                            selectedCompany.address.state,
                            selectedCompany.address.zipCode,
                            selectedCompany.address.country
                          ].filter(Boolean);
                          location = addressParts.join(', ');
                        } else if (selectedCompany.location) {
                          location = selectedCompany.location;
                        }
                      }
                      setEditFormData({ ...editFormData, companyId: value, location });
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-experience">Experience Level</Label>
                    <Select value={editFormData.experience} onValueChange={(value) => setEditFormData({...editFormData, experience: value as any})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">0-2 years (Entry Level)</SelectItem>
                        <SelectItem value="junior">2-5 years (Junior)</SelectItem>
                        <SelectItem value="mid">5-10 years (Mid Level)</SelectItem>
                        <SelectItem value="senior">10-15 years (Senior)</SelectItem>
                        <SelectItem value="lead">15+ years (Lead/Principal)</SelectItem>
                        <SelectItem value="executive">20+ years (Executive)</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateLoading}>Cancel</Button>
              <Button onClick={handleUpdateJob} disabled={updateLoading}> {updateLoading ? 'Saving...' : 'Save Changes'} </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
              <Input
                placeholder="Search jobs by title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                  <Filter className="w-4 h-4 mr-2 text-purple-600" />
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
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Openings</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job: any) => (
                  <TableRow key={job.id || job._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-base">{job.title}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{job.companyId?.name || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm">{job.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {job.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">{job.applications || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="font-medium">{job.numberOfOpenings || 1}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'N/A'}
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
        </CardContent>
      </Card>
    </div>
  );
}