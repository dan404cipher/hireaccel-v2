import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Users,
  Briefcase,
  Calendar,
  Globe,
  GraduationCap,
  Languages,
  Award,
  Clock3,
  UserCheck,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import { useJob, useDeleteJob, useUpdateJob, useCompanies } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);

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

  const { data: jobResponse, loading, error, refetch: refetchJob } = useJob(jobId!);
  const job = jobResponse?.data || jobResponse;

  const { mutate: deleteJob, loading: deleteLoading } = useDeleteJob({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
      navigate("/dashboard/jobs");
    }
  });

  const { mutate: updateJob, loading: updateLoading } = useUpdateJob({
    onSuccess: async () => {
      console.log('Update job onSuccess called');
      toast({ title: "Success", description: "Job updated successfully" });
      setIsEditDialogOpen(false);
      // Refetch job data to show updated information
      refetchJob();
    },
    onError: (error) => {
      console.error('Update job onError called:', error);
      // Dialog stays open on error so user can fix issues
    }
  });

  // Companies for selection and autofill location
  const { data: companiesResp } = useCompanies({ page: 1, limit: 50 });
  const companies = Array.isArray(companiesResp) ? companiesResp : (companiesResp as any)?.data || [];

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
      case "urgent": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatSalary = (job: any) => {
    if (job.salaryRange?.min && job.salaryRange?.max) {
      const currency = job.salaryRange.currency || 'USD';
      const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
      return `${symbol}${(job.salaryRange.min / 1000).toFixed(0)}k - ${symbol}${(job.salaryRange.max / 1000).toFixed(0)}k`;
    }
    return "Salary TBD";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openEditDialog = () => {
    if (!job) return;
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
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    console.log('handleUpdate called');
    if (!job) {
      console.log('No job found, returning');
      return;
    }
    if (!editFormData.title?.trim() || !editFormData.description?.trim() || !editFormData.location?.trim() || !editFormData.companyId) {
      toast({ title: 'Validation Error', description: 'Please fill all required fields', variant: 'destructive' });
      console.log('Validation failed');
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
        skills: editFormData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        experienceMin: parseInt(editFormData.experienceMin) || 0,
        experienceMax: parseInt(editFormData.experienceMax) || 0,
      },
      benefits: editFormData.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
      applicationDeadline: editFormData.applicationDeadline ? new Date(editFormData.applicationDeadline).toISOString() : undefined,
      interviewProcess: editFormData.interviewRounds || editFormData.estimatedDuration ? {
        rounds: editFormData.interviewRounds,
        estimatedDuration: editFormData.estimatedDuration
      } : undefined
    };
    
    console.log('Calling updateJob with data:', data);
    try {
      const result = await updateJob({ id: job._id || job.id, data });
      console.log('updateJob result:', result);
      
      // Manually handle success since mutation hook's onSuccess isn't firing
      toast({ title: "Success", description: "Job updated successfully" });
      setIsEditDialogOpen(false);
      refetchJob();
    } catch (e) {
      console.error('Update job error in catch:', e);
      // Error toast is handled by the mutation hook
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="container mx-auto px-2 py-3 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {job.companyId?.logoUrl ? (
                    <img 
                      src={job.companyId.logoUrl} 
                      alt={`${job.companyId.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Building2 className={`w-16 h-16 text-blue-600 p-3 rounded-lg border-2 border-slate-200 bg-slate-50 ${job.companyId?.logoUrl ? 'hidden' : ''}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard/jobs")}
                  className="hover:bg-blue-50 text-blue-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Jobs
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={openEditDialog}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Job
                    </DropdownMenuItem>
                    {user?.role === 'hr' && (
                      <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Job
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Overview */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Job Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">Company:</span>
                      <span className="text-slate-600">{job.companyId?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-slate-700">Location:</span>
                      <span className="text-slate-600">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-slate-700">Type:</span>
                      <span className="capitalize text-slate-600">{job.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-slate-700">Salary:</span>
                      <span className="text-slate-600">{formatSalary(job)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">Work Type:</span>
                      <Badge variant="secondary" className={
                        job.workType === 'remote' ? "bg-green-100 text-green-800 border-green-200" :
                        job.workType === 'wfh' ? "bg-blue-100 text-blue-800 border-blue-200" :
                        "bg-orange-100 text-orange-800 border-orange-200"
                      }>
                        {job.workType === 'wfo' ? 'Onsite' : job.workType === 'wfh' ? 'Hybrid' : job.workType === 'remote' ? 'Remote' : job.workType || 'N/A'}
                      </Badge>
                    </div>
                    {job.applicationDeadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-slate-700">Deadline:</span>
                        <span className="text-slate-600">{formatDate(job.applicationDeadline)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span className="font-medium text-slate-700">Posted by:</span>
                      <span className="text-slate-600">
                        {job.createdBy?.firstName && job.createdBy?.lastName 
                          ? `${job.createdBy.firstName} ${job.createdBy.lastName}`
                          : job.createdBy?.email || 'Unknown'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Job Description */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-700">Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {job.description || 'No description available.'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Status & Priority */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-700">Status & Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Status</span>
                    <div className="mt-1">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Urgency</span>
                    <div className="mt-1">
                      <Badge className={getUrgencyColor(job.urgency)} variant="outline">
                        {job.urgency}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Applications</span>
                    <div className="mt-1 flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-slate-700">{job.applications || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card className="shadow-lg bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-700">
                      <Award className="w-5 h-5 text-yellow-600" />
                      Benefits & Perks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.map((benefit: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Requirements */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Experience Level */}
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Experience Level</h4>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                      {job.requirements?.experienceMin !== undefined && job.requirements?.experienceMax !== undefined
                        ? `${job.requirements.experienceMin}-${job.requirements.experienceMax} years`
                        : 'N/A'}
                    </Badge>
                  </div>

                  {/* Skills */}
                  {job.requirements?.skills && job.requirements.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-slate-700">Required Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {job.requirements?.education && job.requirements.education.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        Education Requirements
                      </h4>
                      <ul className="space-y-1">
                        {job.requirements.education.map((edu: string, index: number) => (
                          <li key={index} className="text-sm text-slate-600">• {edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Languages */}
                  {job.requirements?.languages && job.requirements.languages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700">
                        <Languages className="w-4 h-4 text-orange-600" />
                        Languages
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.languages.map((language: string, index: number) => (
                          <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Interview Process */}
              {job.interviewProcess && (
                <Card className="shadow-lg bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-700">
                      <Clock3 className="w-5 h-5 text-indigo-600" />
                      Interview Process
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-600 font-medium">Rounds</span>
                      <div className="mt-1 font-medium text-slate-700">{job.interviewProcess.rounds}</div>
                    </div>
                    {job.interviewProcess.estimatedDuration && (
                      <div>
                        <span className="text-sm text-slate-600 font-medium">Timeline</span>
                        <div className="mt-1 font-medium text-slate-700">{job.interviewProcess.estimatedDuration}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Dates */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-700">Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Posted</span>
                    <div className="mt-1 font-medium text-slate-700">
                      {job.postedAt ? formatDate(job.postedAt) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Created</span>
                    <div className="mt-1 font-medium text-slate-700">
                      {job.createdAt ? formatDate(job.createdAt) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Last Updated</span>
                    <div className="mt-1 font-medium text-slate-700">
                      {job.updatedAt ? formatDate(job.updatedAt) : 'N/A'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Job</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this job? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteJob(jobId!);
                  setShowDeleteDialog(false);
                }}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Job"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Inline Edit Dialog over the details page */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update the job details.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Job Title <span className="text-red-500">*</span></Label>
                  <Input id="edit-title" value={editFormData.title || ''} onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} />
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="edit-location">Location <span className="text-red-500">*</span></Label>
                  <Input 
                    id="edit-location" 
                    placeholder="Type to search cities in India..."
                    value={editFormData.location || ''} 
                    onChange={(e) => {
                      const value = e.target.value;
                      setEditFormData({...editFormData, location: value});
                      
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
                  <Select value={editFormData.companyId || ''} onValueChange={(value) => {
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
                  <Select value={editFormData.type || 'full-time'} onValueChange={(value) => setEditFormData({...editFormData, type: value as any})}>
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
                  <Select value={editFormData.workType || 'wfo'} onValueChange={(value) => setEditFormData({...editFormData, workType: value as any})}>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-openings">Number of Openings <span className="text-red-500">*</span></Label>
                <Input id="edit-openings" type="number" min="1" value={editFormData.numberOfOpenings || ''} onChange={(e) => setEditFormData({...editFormData, numberOfOpenings: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-estimated">Estimated Hiring Timeline <span className="text-red-500">*</span></Label>
                <Select value={editFormData.estimatedDuration || '2-3 weeks'} onValueChange={(value) => setEditFormData({...editFormData, estimatedDuration: value})}>
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

            {(editFormData.type === 'contract' || editFormData.type === 'internship') && (
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration <span className="text-red-500">*</span></Label>
                <Input id="edit-duration" value={editFormData.duration || ''} onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-description">Detailed Description <span className="text-red-500">*</span></Label>
              <Textarea id="edit-description" className="min-h-[120px]" value={editFormData.description || ''} onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative col-span-2">
                  <Label htmlFor="edit-skills">Required Skills <span className="text-red-500">*</span></Label>
                  <Input id="edit-skills" value={editFormData.skills || ''} onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Compensation & Benefits</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-salary-min">Minimum Salary <span className="text-red-500">*</span></Label>
                  <Input id="edit-salary-min" type="number" value={editFormData.salaryMin || ''} onChange={(e) => setEditFormData({...editFormData, salaryMin: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-salary-max">Maximum Salary <span className="text-red-500">*</span></Label>
                  <Input id="edit-salary-max" type="number" value={editFormData.salaryMax || ''} onChange={(e) => setEditFormData({...editFormData, salaryMax: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-currency">Currency</Label>
                  <Select value={editFormData.currency || 'INR'} onValueChange={(value) => setEditFormData({...editFormData, currency: value})}>
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
                <Input id="edit-benefits" value={editFormData.benefits || ''} onChange={(e) => setEditFormData({...editFormData, benefits: e.target.value})} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateLoading}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateLoading}>{updateLoading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
