import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@/hooks/useApi";
import { 
  Building2, 
  MapPin,
  Globe,
  Calendar,
  Users,
  Edit,
  Edit2,
  ArrowLeft,
  Briefcase,
  Star,
  Mail,
  Phone,
  DollarSign
} from "lucide-react";
import { useCompanies } from "@/hooks/useApi";
import { apiClient } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProfilePhotoUploadModal } from "@/components/candidates/ProfilePhotoUploadModal";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";

export default function CompanyProfile() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCandidate = user?.role === 'candidate';
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [photoUploadState, setPhotoUploadState] = useState<'idle' | 'uploading'>('idle');

  // Use authenticated image hook for company logo
  // Always use API endpoint when logoFileId exists (for authenticated access)
  // For companies without logoFileId (old data), we can't use direct S3 URLs due to CSP/403 issues
  const logoFileId = company?.logoFileId?._id || company?.logoFileId || company?.logoFileId?.toString();
  const logoUrl = logoFileId 
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/company-logo/${logoFileId}`
    : null; // Don't use direct S3 URLs - they're not publicly accessible
  const authenticatedLogoUrl = useAuthenticatedImage(logoUrl);

  const { mutate: updateCompany, loading: updateLoading } = useMutation(
    ({ id, data }: any) => apiClient.updateCompany(id, data),
    { showToast: false }
  );

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) return;
      
      try {
        setLoading(true);
        // Backend will try companyId first, then _id
        const companyData = await apiClient.getCompany(companyId);
        
        if (companyData?.data) {
          setCompany(companyData.data);
          
          // Fetch jobs for this company
          try {
            const jobsResponse = await apiClient.getJobs({ companyId: companyData.data._id, limit: 100 });
            const jobsData = Array.isArray(jobsResponse.data) 
              ? jobsResponse.data 
              : (jobsResponse.data?.data || []);
            setJobs(jobsData);
          } catch (error) {
            console.error('Error fetching jobs:', error);
          }
        }
      } catch (error: any) {
        console.error('Error fetching company:', error);
        toast({
          title: "Error",
          description: error?.detail || "Failed to load company details",
          variant: "destructive"
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-600 text-white border-emerald-600";
      case "inactive": return "bg-gray-600 text-white border-gray-600";
      case "pending": return "bg-amber-600 text-white border-amber-600";
      default: return "bg-gray-600 text-white border-gray-600";
    }
  };

  const handleEditCompany = () => {
    if (!company) return;
    setEditFormData({
      name: company.name || '',
      size: company.size || '',
      address: {
        street: company.address?.street || company.location || '',
        city: company.address?.city || '',
        state: company.address?.state || '',
        zipCode: company.address?.zipCode || '',
        country: company.address?.country || ''
      },
      status: company.status || 'active',
      description: company.description || '',
      website: company.website || '',
      foundedYear: company.foundedYear || ''
    });
    setIsEditDialogOpen(true);
  };

  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const clearAllFieldErrors = () => {
    setFieldErrors({});
  };

  const handleValidationError = (error: any, defaultMessage: string) => {
    setFieldErrors({});
    
    let issues = null;
    if (error?.issues && Array.isArray(error.issues)) {
      issues = error.issues;
    } else if (error?.response?.data?.issues && Array.isArray(error.response.data.issues)) {
      issues = error.response.data.issues;
    }
    
    if (issues) {
      const fieldErrorsMap: Record<string, string> = {};
      const validationErrors = issues.map((issue: any) => {
        let userFriendlyMessage = issue.message;
        const fieldName = issue.field || 'Field';
        
        switch (issue.field) {
          case 'name':
            if (issue.code === 'too_small' || issue.message.includes('required')) {
              userFriendlyMessage = 'Company name is required';
            } else if (issue.code === 'too_big') {
              userFriendlyMessage = 'Company name cannot exceed 200 characters';
            } else if (issue.message.includes('duplicate')) {
              userFriendlyMessage = 'A company with this name already exists';
            }
            break;
          case 'description':
            if (issue.code === 'too_small' || issue.message.includes('required')) {
              userFriendlyMessage = 'Company description is required';
            } else if (issue.code === 'too_big') {
              userFriendlyMessage = 'Description cannot exceed 2000 characters';
            }
            break;
          case 'size':
            if (issue.message.includes('required')) {
              userFriendlyMessage = 'Company size is required';
            } else if (issue.code === 'invalid_enum_value') {
              userFriendlyMessage = 'Please select a valid company size range';
            }
            break;
          case 'website':
            if (issue.code === 'invalid_url') {
              userFriendlyMessage = 'Please enter a valid website URL';
            }
            break;
          case 'foundedYear':
            if (issue.code === 'too_small') {
              userFriendlyMessage = 'Founded year must be 1800 or later';
            } else if (issue.code === 'too_big') {
              userFriendlyMessage = 'Founded year cannot be in the future';
            }
            break;
          default:
            if (issue.message.includes('required')) {
              userFriendlyMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
            }
        }
        
        if (issue.field) {
          fieldErrorsMap[issue.field] = userFriendlyMessage;
        }
        
        return userFriendlyMessage;
      });
      
      setFieldErrors(fieldErrorsMap);
      
      const errorMessage = validationErrors.length === 1 
        ? validationErrors[0]
        : `Please fix the following errors:\n• ${validationErrors.join('\n• ')}`;
      
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Error",
        description: error?.detail || error?.message || defaultMessage,
        variant: "destructive"
      });
    }
  };

  const handleLogoUpload = async (file: File) => {
    if (!company?.id && !company?._id) return;
    
    setPhotoUploadState('uploading');
    const companyId = company.id || company._id;

    try {
      // Upload the file as a company logo using apiClient
      const response = await apiClient.uploadCompanyLogo(file, companyId);
      const logoFileId = response.data?.file?.id || response.data?.company?.logoFileId;
      const logoUrl = response.data?.file?.url || response.data?.company?.logoUrl || response.data?.url;

      if (!logoUrl) {
        throw new Error('No logo URL returned from server');
      }

      // The backend already updated the company, so just refetch to get the latest data including logoFileId
      const companyData = await apiClient.getCompany(companyId);
      if (companyData?.data) {
        setCompany(companyData.data);
      }

      toast({
        title: "Success",
        description: "Company logo updated successfully"
      });

      setPhotoUploadState('idle');
      setShowPhotoUploadModal(false);
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: "Error",
        description: error?.detail || error?.message || "Failed to upload logo. Please try again.",
        variant: "destructive"
      });
      setPhotoUploadState('idle');
    }
  };

  const handleUpdateCompany = async () => {
    if (!company?.id && !company?._id) return;
    
    const companyId = company.id || company._id;
    
    // Validate required fields
    if (!editFormData.name || !editFormData.size || !editFormData.address?.street || !editFormData.address?.city || !editFormData.address?.zipCode || !editFormData.foundedYear || !editFormData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Company Name, Size, Company Address, City, ZIP/PIN Code, Founded Year, and Description",
        variant: "destructive"
      });
      return;
    }

    // Validate website URL if provided
    if (editFormData.website && editFormData.website.trim() !== '') {
      try {
        new URL(editFormData.website);
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter a valid website URL (e.g., https://www.company.com)",
          variant: "destructive"
        });
        return;
      }
    }
    
    const updateData = {
      name: editFormData.name,
      size: editFormData.size,
      address: {
        street: editFormData.address?.street?.trim() || '',
        city: editFormData.address?.city?.trim() || '',
        state: editFormData.address?.state?.trim() || '',
        zipCode: editFormData.address?.zipCode?.trim() || '',
        country: editFormData.address?.country?.trim() || ''
      },
      status: editFormData.status,
      description: editFormData.description,
      website: editFormData.website && editFormData.website.trim() !== '' ? editFormData.website.trim() : undefined,
      foundedYear: parseInt(editFormData.foundedYear) || new Date().getFullYear()
    };

    try {
      await updateCompany({ id: companyId, data: updateData });
      setIsEditDialogOpen(false);
      clearAllFieldErrors();
      
      // Refetch company data
      const companyData = await apiClient.getCompany(companyId);
      if (companyData?.data) {
        setCompany(companyData.data);
      }
      
      toast({
        title: "Success",
        description: "Company updated successfully"
      });
    } catch (error: any) {
      console.error('Failed to update company:', error);
      handleValidationError(error, "Failed to update company. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-muted-foreground">Loading company details...</div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-gray-50">
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Company not found</h3>
            <p className="text-muted-foreground mb-4">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-4 left-4 z-20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="px-4 md:px-6 -mt-24 relative z-10 pb-8">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Company Logo/Photo */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={authenticatedLogoUrl || undefined} 
                    alt={`${company.name} logo`}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-blue-600 text-white">
                    <Building2 className="w-16 h-16" />
                  </AvatarFallback>
                </Avatar>
                {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr') && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => setShowPhotoUploadModal(true)}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {company.name}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="text-blue-600 border-blue-200 font-mono">
                        {company.companyId || company._id}
                      </Badge>
                      {company.status && (
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {company.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a 
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {company.website}
                          </a>
                        </div>
                      )}
                      {company.address && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {company.address.city}{company.address.state ? `, ${company.address.state}` : ''}
                          </span>
                        </div>
                      )}
                      {company.size && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{company.size} employees</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr') && (
                    <Button onClick={handleEditCompany}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Company
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className={`grid grid-cols-1 ${isCandidate ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
        {/* Main Content */}
        <div className={`${isCandidate ? 'lg:col-span-1' : 'lg:col-span-2'} space-y-6`}>
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Address</p>
                    {company.address ? (
                      <div className="text-sm text-muted-foreground">
                        <div>{company.address.street}</div>
                        <div>
                          {[company.address.city, company.address.state, company.address.zipCode].filter(Boolean).join(', ')}
                        </div>
                        {company.address.country && (
                          <div>{company.address.country}</div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{company.location || 'No address provided'}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Company Size</p>
                    <Badge variant="outline" className="text-sm">
                      {company.size || 'Not specified'}
                    </Badge>
                  </div>
                </div>

                {company.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Website</p>
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}

                {company.foundedYear && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Founded</p>
                      <p className="text-sm text-muted-foreground">{company.foundedYear}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Status</p>
                    <Badge className={getStatusColor(company.status)}>
                      {company.status || 'active'}
                    </Badge>
                  </div>
                </div>

                {company.createdBy && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Created By</p>
                      <Badge variant="outline" className="font-mono text-xs">
                        {company.createdBy?.customId || company.createdBy?.firstName || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle>Company Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {company.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Jobs */}
          {user?.role !== 'candidate' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Jobs ({jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No jobs posted for this company yet.</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.slice(0, 10).map((job: any) => (
                      <div
                        key={job._id || job.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/dashboard/jobs/${job._id || job.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{job.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </span>
                              {job.salaryRange && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salaryRange.currency} {job.salaryRange.min}-{job.salaryRange.max}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {jobs.length > 10 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/dashboard/jobs?companyId=${company._id}`)}
                      >
                        View All {jobs.length} Jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        {!isCandidate && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Jobs ({jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No jobs posted for this company yet.</p>
                ) : (
                  <div className="space-y-3">
                    {jobs.slice(0, 10).map((job: any) => (
                      <div
                        key={job._id || job.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/dashboard/jobs/${job._id || job.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{job.title}</h4>
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {job.location}
                              </span>
                              {job.salaryRange && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salaryRange.currency} {job.salaryRange.min}-{job.salaryRange.max}
                                </span>
                              )}
                              <Badge variant="outline" className="text-xs w-fit">
                                {job.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {jobs.length > 10 && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(`/dashboard/jobs?companyId=${company._id}`)}
                      >
                        View All {jobs.length} Jobs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        </div>

      {/* Edit Company Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Company: {company?.name}</DialogTitle>
            <DialogDescription>
              Update company details and information
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="edit-name" 
                    value={editFormData.name || ''}
                    onChange={(e) => {
                      setEditFormData({...editFormData, name: e.target.value});
                      clearFieldError('name');
                    }}
                    placeholder="e.g. TechCorp Inc." 
                    className={fieldErrors.name ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.name && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Company Size <span className="text-red-500">*</span></Label>
                  <Select 
                    value={editFormData.size || ''} 
                    onValueChange={(value) => {
                      setEditFormData({...editFormData, size: value});
                      clearFieldError('size');
                    }}
                  >
                    <SelectTrigger className={fieldErrors.size ? "border-red-500 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-25">11-25 employees</SelectItem>
                      <SelectItem value="26-50">26-50 employees</SelectItem>
                      <SelectItem value="51-100">51-100 employees</SelectItem>
                      <SelectItem value="101-250">101-250 employees</SelectItem>
                      <SelectItem value="251-500">251-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.size && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.size}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-street">Company Address <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-street" 
                      value={editFormData.address?.street || ''}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData, 
                          address: { ...editFormData.address, street: e.target.value }
                        });
                        clearFieldError('street');
                      }}
                      placeholder="e.g. 123 Main Street, Suite 100" 
                      className={fieldErrors.street ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {fieldErrors.street && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.street}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-city" 
                      value={editFormData.address?.city || ''}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData, 
                          address: { ...editFormData.address, city: e.target.value }
                        });
                        clearFieldError('city');
                      }}
                      placeholder="e.g. San Francisco" 
                      className={fieldErrors.city ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {fieldErrors.city && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.city}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State/Province</Label>
                    <Input 
                      id="edit-state" 
                      value={editFormData.address?.state || ''}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData, 
                          address: { ...editFormData.address, state: e.target.value }
                        });
                        clearFieldError('state');
                      }}
                      placeholder="e.g. California" 
                      className={fieldErrors.state ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {fieldErrors.state && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.state}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-zipcode">ZIP/PIN Code <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-zipcode" 
                      value={editFormData.address?.zipCode || ''}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData, 
                          address: { ...editFormData.address, zipCode: e.target.value }
                        });
                        clearFieldError('zipCode');
                      }}
                      placeholder="e.g. 94105" 
                      className={fieldErrors.zipCode ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {fieldErrors.zipCode && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.zipCode}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-country">Country</Label>
                    <Input 
                      id="edit-country" 
                      value={editFormData.address?.country || ''}
                      onChange={(e) => {
                        setEditFormData({
                          ...editFormData, 
                          address: { ...editFormData.address, country: e.target.value }
                        });
                        clearFieldError('country');
                      }}
                      placeholder="e.g. United States" 
                      className={fieldErrors.country ? "border-red-500 focus:border-red-500" : ""}
                    />
                    {fieldErrors.country && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.country}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input 
                    id="edit-website" 
                    value={editFormData.website || ''}
                    onChange={(e) => {
                      setEditFormData({...editFormData, website: e.target.value});
                      clearFieldError('website');
                    }}
                    placeholder="e.g. https://www.company.com" 
                    className={fieldErrors.website ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.website && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.website}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-founded">Founded Year <span className="text-red-500">*</span></Label>
                  <Input 
                    id="edit-founded" 
                    type="number"
                    value={editFormData.foundedYear || ''}
                    onChange={(e) => {
                      setEditFormData({...editFormData, foundedYear: e.target.value});
                      clearFieldError('foundedYear');
                    }}
                    placeholder="e.g. 2010" 
                    className={fieldErrors.foundedYear ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.foundedYear && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.foundedYear}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={editFormData.status || 'active'} 
                    onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Company Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="edit-description" 
                  value={editFormData.description || ''}
                  onChange={(e) => {
                    setEditFormData({...editFormData, description: e.target.value});
                    clearFieldError('description');
                  }}
                  placeholder="Brief description of the company..."
                  className={`min-h-[100px] ${fieldErrors.description ? "border-red-500 focus:border-red-500" : ""}`}
                />
                {fieldErrors.description && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4 gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                clearAllFieldErrors();
              }}
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateCompany}
              disabled={updateLoading || !editFormData.name}
            >
              {updateLoading ? "Updating..." : "Update Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Logo Upload Modal */}
      {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr') && (
        <ProfilePhotoUploadModal
          isOpen={showPhotoUploadModal}
          onClose={() => setShowPhotoUploadModal(false)}
          onUpload={handleLogoUpload}
          isUploading={photoUploadState === 'uploading'}
        />
      )}
      </div>
    </div>
  );
}

