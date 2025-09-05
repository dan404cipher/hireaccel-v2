import { useState, useEffect, useMemo } from "react";
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
  Building2, 
  Search, 
  Filter, 
  MoreHorizontal,
  MapPin,
  Users,
  Briefcase,
  Star,
  Phone,
  Mail,
  Globe,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany, useMutation } from "@/hooks/useApi";
import { apiClient } from "@/services/api";
import { toast } from "@/hooks/use-toast";

export default function CompanyManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [createFormData, setCreateFormData] = useState<any>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Debug fieldErrors changes
  useEffect(() => {
    console.log('🔍 fieldErrors state changed:', fieldErrors);
  }, [fieldErrors]);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize the API parameters to prevent unnecessary re-renders
  const companiesParams = useMemo(() => {
    const params: any = {
      page, 
      limit: 50
    };
    
    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    
    if (industryFilter !== "all") {
      params.industry = industryFilter;
    }
    
    return params;
  }, [page, debouncedSearchTerm, statusFilter, industryFilter]);

  // API hooks
  const { 
    data: companiesResponse, 
    loading: companiesLoading, 
    error: companiesError, 
    refetch: refetchCompanies 
  } = useCompanies(companiesParams);

  const { mutate: createCompany, loading: createLoading } = useMutation((companyData: any) => apiClient.createCompany(companyData), { showToast: false });

  const { mutate: updateCompany, loading: updateLoading } = useMutation(({ id, data }: any) => apiClient.updateCompany(id, data), { showToast: false });

  const { mutate: deleteCompany, loading: deleteLoading } = useMutation((id: string) => apiClient.deleteCompany(id), { showToast: false });

  // Handle both API response formats: {data: [...], meta: {...}} or direct array
  const companies = Array.isArray(companiesResponse) ? companiesResponse : ((companiesResponse as any)?.data || []);
  const meta = Array.isArray(companiesResponse) ? null : (companiesResponse as any)?.meta;

  // Additional client-side filtering
  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPartnershipColor = (level: string) => {
    switch (level) {
      case "premium": return "bg-primary text-primary-foreground";
      case "standard": return "bg-blue-500 text-white";
      case "basic": return "bg-gray-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleViewCompany = (company: any) => {
    setSelectedCompany(company);
    setIsViewDialogOpen(true);
  };

  const handleEditCompany = (company: any) => {
    setSelectedCompany(company);
    setEditFormData({
      name: company.name || '',
      industry: company.industry || '',
      location: company.location || '',
      status: company.status || 'active',
      description: company.description || '',
      website: company.website || '',
      employees: company.employees || '',
      foundedYear: company.foundedYear || '',
      partnership: company.partnership || 'basic'
    });
    setIsEditDialogOpen(true);
  };

  // Helper function to handle validation errors with comprehensive user-friendly messages
  const handleValidationError = (error: any, defaultMessage: string) => {
    console.log('🔍 handleValidationError called with:', error);
    
    // Clear previous field errors
    setFieldErrors({});
    
    // Check for issues in multiple possible locations
    let issues = null;
    if (error?.issues && Array.isArray(error.issues)) {
      issues = error.issues;
      console.log('🔍 Found issues directly on error object:', issues);
    } else if (error?.response?.data?.issues && Array.isArray(error.response.data.issues)) {
      issues = error.response.data.issues;
      console.log('🔍 Found issues in error.response.data:', issues);
    }
    
    if (issues) {
      const fieldErrorsMap: Record<string, string> = {};
      const validationErrors = issues.map((issue: any) => {
        console.log('🔍 Processing issue:', issue);
        let userFriendlyMessage = issue.message;
        const fieldName = issue.field || 'Field';
        
        // Convert technical validation messages to user-friendly ones
        switch (issue.field) {
          // Basic Company Information
          case 'name':
            if (issue.code === 'too_small' || issue.message.includes('required')) {
              userFriendlyMessage = 'Company name is required';
            } else if (issue.code === 'too_big' || issue.message.includes('exceed 200 characters')) {
              userFriendlyMessage = 'Company name cannot exceed 200 characters';
            } else if (issue.message.includes('duplicate') || issue.message.includes('already exists')) {
              userFriendlyMessage = 'A company with this name already exists';
            }
            break;
            
          case 'description':
            if (issue.code === 'too_small' || issue.message.includes('required')) {
              userFriendlyMessage = 'Company description is required';
            } else if (issue.code === 'too_big' || issue.message.includes('exceed 2000 characters')) {
              userFriendlyMessage = 'Description cannot exceed 2000 characters';
            }
            break;
            
          case 'industry':
            if (issue.code === 'too_small' || issue.message.includes('required')) {
              userFriendlyMessage = 'Industry is required';
            } else if (issue.code === 'too_big' || issue.message.includes('exceed 100 characters')) {
              userFriendlyMessage = 'Industry cannot exceed 100 characters';
            }
            break;
            
          case 'size':
            if (issue.message.includes('required')) {
              userFriendlyMessage = 'Company size is required';
            } else if (issue.message.includes('predefined ranges') || issue.code === 'invalid_enum_value') {
              userFriendlyMessage = 'Please select a valid company size range (1-10, 11-25, 26-50, 51-100, 101-250, 251-500, 501-1000, or 1000+)';
            }
            break;
            
          case 'location':
            if (issue.code === 'too_small' || issue.message.includes('required')) {
              userFriendlyMessage = 'Company location is required';
            } else if (issue.code === 'too_big' || issue.message.includes('exceed 200 characters')) {
              userFriendlyMessage = 'Location cannot exceed 200 characters';
            }
            break;
            
          // URLs and Links
          case 'website':
            if (issue.message.includes('Invalid url') || issue.code === 'invalid_url') {
              userFriendlyMessage = 'Please enter a valid website URL (e.g., https://www.company.com)';
            } else if (issue.message.includes('valid website URL')) {
              userFriendlyMessage = 'Website URL must start with http:// or https://';
            }
            break;
            
          case 'logoUrl':
            if (issue.message.includes('Invalid url') || issue.code === 'invalid_url') {
              userFriendlyMessage = 'Please enter a valid logo URL (e.g., https://www.company.com/logo.png)';
            } else if (issue.message.includes('valid logo URL')) {
              userFriendlyMessage = 'Logo URL must start with http:// or https://';
            }
            break;
            
          // Numeric Fields
          case 'employees':
            if (issue.code === 'too_small') {
              userFriendlyMessage = 'Number of employees must be 0 or greater';
            } else if (issue.code === 'invalid_type') {
              userFriendlyMessage = 'Number of employees must be a valid number';
            }
            break;
            
          case 'foundedYear':
            if (issue.code === 'too_small') {
              userFriendlyMessage = 'Founded year must be 1800 or later';
            } else if (issue.code === 'too_big') {
              userFriendlyMessage = 'Founded year cannot be in the future';
            } else if (issue.code === 'invalid_type') {
              userFriendlyMessage = 'Founded year must be a valid year (e.g., 2020)';
            }
            break;
            
          // Partnership and Status
          case 'partnership':
            if (issue.code === 'invalid_enum_value') {
              userFriendlyMessage = 'Please select a valid partnership level (Basic, Standard, Premium, or Enterprise)';
            }
            break;
            
          case 'status':
            if (issue.code === 'invalid_enum_value') {
              userFriendlyMessage = 'Please select a valid company status (Active, Inactive, Pending, or Suspended)';
            }
            break;
            
          // Contact Information
          case 'contacts':
            if (issue.message.includes('array')) {
              userFriendlyMessage = 'Contact information format is invalid';
            }
            break;
            
          // Contact sub-fields (contacts.0.name, contacts.0.email, etc.)
          default:
            if (issue.field.startsWith('contacts.')) {
              const contactField = issue.field.split('.')[2] || issue.field.split('.')[1];
              switch (contactField) {
                case 'name':
                  if (issue.code === 'too_small') {
                    userFriendlyMessage = 'Contact name is required';
                  } else if (issue.code === 'too_big') {
                    userFriendlyMessage = 'Contact name cannot exceed 100 characters';
                  }
                  break;
                case 'email':
                  if (issue.message.includes('Invalid email') || issue.code === 'invalid_email') {
                    userFriendlyMessage = 'Please enter a valid contact email address';
                  }
                  break;
                case 'phone':
                  if (issue.code === 'too_small') {
                    userFriendlyMessage = 'Contact phone number is required';
                  }
                  break;
                case 'position':
                  if (issue.code === 'too_small') {
                    userFriendlyMessage = 'Contact position is required';
                  } else if (issue.code === 'too_big') {
                    userFriendlyMessage = 'Contact position cannot exceed 100 characters';
                  }
                  break;
                default:
                  userFriendlyMessage = `Contact ${contactField || 'information'} is invalid`;
              }
            } else {
              // Generic improvements for other validation messages
              if (issue.message.includes('required')) {
                userFriendlyMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
              } else if (issue.message.includes('too_short') || issue.code === 'too_small') {
                userFriendlyMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is too short`;
              } else if (issue.message.includes('too_long') || issue.code === 'too_big') {
                userFriendlyMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is too long`;
              } else if (issue.message.includes('Invalid email') || issue.code === 'invalid_email') {
                userFriendlyMessage = 'Please enter a valid email address';
              } else if (issue.message.includes('Invalid url') || issue.code === 'invalid_url') {
                userFriendlyMessage = 'Please enter a valid URL';
              } else if (issue.code === 'invalid_type') {
                userFriendlyMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} has an invalid format`;
              }
            }
            break;
        }
        
        // Store field-specific error for UI highlighting
        if (issue.field) {
          fieldErrorsMap[issue.field] = userFriendlyMessage;
        }
        
        return userFriendlyMessage;
      });
      
      // Set field errors for UI highlighting
      console.log('🔍 Setting field errors:', fieldErrorsMap);
      setFieldErrors(fieldErrorsMap);
      
      // Debug: Check if field errors were set
      setTimeout(() => {
        console.log('🔍 Field errors after setState:', fieldErrorsMap);
      }, 100);
      
      const errorMessage = validationErrors.length === 1 
        ? validationErrors[0]
        : `Please fix the following errors:\n• ${validationErrors.join('\n• ')}`;
      
      toast({
        title: "Validation Error",
        description: errorMessage,
        variant: "destructive"
      });
    } else if (error?.response?.status === 409) {
      // Handle duplicate company name error
      toast({
        title: "Duplicate Company",
        description: "A company with this name already exists. Please choose a different name.",
        variant: "destructive"
      });
    } else if (error?.response?.status === 403) {
      // Handle permission errors
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create companies. Please contact your administrator.",
        variant: "destructive"
      });
    } else if (error?.response?.status === 401) {
      // Handle authentication errors
      toast({
        title: "Authentication Required",
        description: "Your session has expired. Please log in again.",
        variant: "destructive"
      });
    } else if (error?.response?.status >= 500) {
      // Handle server errors
      toast({
        title: "Server Error",
        description: "Something went wrong on our end. Please try again in a few moments.",
        variant: "destructive"
      });
    } else {
      // Handle other types of errors
      let errorMessage = defaultMessage;
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Helper function to clear field errors
  const clearFieldError = (fieldName: string) => {
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Helper function to clear all field errors
  const clearAllFieldErrors = () => {
    setFieldErrors({});
  };

  const handleCreateCompany = async () => {
    // Validate required fields
    if (!createFormData.name || !createFormData.size || !createFormData.industry || !createFormData.location || !createFormData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Company Name, Size, Industry, Location, and Description",
        variant: "destructive"
      });
      return;
    }

    // Validate website URL if provided
    if (createFormData.website && createFormData.website.trim() !== '') {
      try {
        new URL(createFormData.website);
      } catch {
        toast({
          title: "Validation Error",
          description: "Please enter a valid website URL (e.g., https://www.company.com)",
          variant: "destructive"
        });
        return;
      }
    }
    
    const newCompanyData = {
      name: createFormData.name.trim(),
      industry: createFormData.industry,
      location: createFormData.location.trim(),
      size: createFormData.size,
      website: createFormData.website && createFormData.website.trim() !== '' ? createFormData.website.trim() : undefined,
      description: createFormData.description.trim(),
      employees: parseInt(createFormData.employees) || 0,
      foundedYear: parseInt(createFormData.foundedYear) || new Date().getFullYear(),
      partnership: createFormData.partnership || 'basic',
      status: 'active',
      contacts: []
    };

    console.log('Creating company with data:', newCompanyData);

    try {
      await createCompany(newCompanyData);
      setIsCreateDialogOpen(false);
      setCreateFormData({}); // Clear form
      clearAllFieldErrors(); // Clear any previous errors
      refetchCompanies();
      toast({
        title: "Success",
        description: "Company created successfully"
      });
    } catch (error: any) {
      console.error('Failed to create company:', error);
      console.log('🔍 Full error object:', JSON.stringify(error, null, 2));
      console.log('🔍 Error.response:', error?.response);
      console.log('🔍 Error.response.data:', error?.response?.data);
      console.log('🔍 Error.issues:', error?.issues);
      console.log('🔍 Error.detail:', error?.detail);
      handleValidationError(error, "Failed to create company. Please try again.");
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany?.id) return;
    
    const updateData = {
      name: editFormData.name,
      industry: editFormData.industry,
      location: editFormData.location,
      status: editFormData.status,
      description: editFormData.description,
      website: editFormData.website,
      employees: parseInt(editFormData.employees) || 0,
      foundedYear: parseInt(editFormData.foundedYear) || new Date().getFullYear(),
      partnership: editFormData.partnership
    };

    try {
      await updateCompany({ id: selectedCompany.id, data: updateData });
      setIsEditDialogOpen(false);
      clearAllFieldErrors(); // Clear any previous errors
      refetchCompanies();
      toast({
        title: "Success",
        description: "Company updated successfully"
      });
    } catch (error: any) {
      console.error('Failed to update company:', error);
      handleValidationError(error, "Failed to update company. Please try again.");
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Are you sure you want to delete this company?')) {
      try {
        await deleteCompany(id);
        refetchCompanies();
        toast({
          title: "Success", 
          description: "Company deleted successfully"
        });
      } catch (error: any) {
        console.error('Failed to delete company:', error);
        handleValidationError(error, "Failed to delete company. Please try again.");
      }
    }
  };

  const formatEmployeeCount = (count: number) => {
    if (count === undefined || count === null) return 'N/A';
    if (count === 0) return '0';
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k+`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Management</h1>
          <p className="text-muted-foreground">Manage partner companies and business relationships</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Add a new partner company to your recruitment network.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Company Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="create-name" 
                    value={createFormData.name || ''}
                    onChange={(e) => {
                      setCreateFormData({...createFormData, name: e.target.value});
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
                  <Label htmlFor="create-industry">Industry <span className="text-red-500">*</span></Label>
                  <Select 
                    value={createFormData.industry || ''} 
                    onValueChange={(value) => {
                      setCreateFormData({...createFormData, industry: value});
                      clearFieldError('industry');
                    }}
                  >
                    <SelectTrigger className={fieldErrors.industry ? "border-red-500 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldErrors.industry && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.industry}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-size">Company Size <span className="text-red-500">*</span></Label>
                  <Select 
                    value={createFormData.size || ''} 
                    onValueChange={(value) => {
                      setCreateFormData({...createFormData, size: value});
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-location">Location <span className="text-red-500">*</span></Label>
                  <Input 
                    id="create-location" 
                    value={createFormData.location || ''}
                    onChange={(e) => {
                      setCreateFormData({...createFormData, location: e.target.value});
                      clearFieldError('location');
                    }}
                    placeholder="e.g. San Francisco, CA" 
                    className={fieldErrors.location ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.location && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.location}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-website">Website</Label>
                  <Input 
                    id="create-website" 
                    value={createFormData.website || ''}
                    onChange={(e) => {
                      setCreateFormData({...createFormData, website: e.target.value});
                      clearFieldError('website');
                    }}
                    placeholder="e.g. https://www.company.com" 
                    className={fieldErrors.website ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.website && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.website}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-employees">Employee Count</Label>
                  <Input 
                    id="create-employees" 
                    type="number"
                    value={createFormData.employees || ''}
                    onChange={(e) => {
                      setCreateFormData({...createFormData, employees: e.target.value});
                      clearFieldError('employees');
                    }}
                    placeholder="e.g. 500" 
                    className={fieldErrors.employees ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.employees && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.employees}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-founded">Founded Year</Label>
                  <Input 
                    id="create-founded" 
                    type="number"
                    value={createFormData.foundedYear || ''}
                    onChange={(e) => {
                      setCreateFormData({...createFormData, foundedYear: e.target.value});
                      clearFieldError('foundedYear');
                    }}
                    placeholder="e.g. 2010" 
                    className={fieldErrors.foundedYear ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.foundedYear && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.foundedYear}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-partnership">Partnership Level</Label>
                  <Select 
                    value={createFormData.partnership || 'basic'} 
                    onValueChange={(value) => {
                      setCreateFormData({...createFormData, partnership: value});
                      clearFieldError('partnership');
                    }}
                  >
                  <SelectTrigger className={fieldErrors.partnership ? "border-red-500 focus:border-red-500" : ""}>
                      <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                  {fieldErrors.partnership && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.partnership}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-description">Company Description <span className="text-red-500">*</span></Label>
                <Textarea 
                  id="create-description" 
                  value={createFormData.description || ''}
                  onChange={(e) => {
                    setCreateFormData({...createFormData, description: e.target.value});
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
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setCreateFormData({});
                  clearAllFieldErrors();
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCompany} 
                disabled={createLoading || !createFormData.name || !createFormData.size || !createFormData.industry || !createFormData.location || !createFormData.description}
              >
                {createLoading ? "Creating..." : "Add Company"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-2xl font-bold text-primary">
                  {companiesLoading ? "..." : companies.length}
                </p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Partners</p>
                <p className="text-2xl font-bold text-success">
                  {companiesLoading ? "..." : companies.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Star className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Industries</p>
                <p className="text-2xl font-bold text-info">
                  {companiesLoading ? "..." : new Set(companies.map(c => c.industry)).size}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Positions</p>
                <p className="text-2xl font-bold text-warning">
                  {companiesLoading ? "..." : companies.reduce((sum, c) => sum + (c.activeJobs || 0), 0)}
                </p>
              </div>
              <Briefcase className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Companies Table */}
          <Card>
            <CardHeader>
          <CardTitle>Companies</CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
          {companiesLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading companies...</div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No companies found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || industryFilter !== "all"
                  ? "Try adjusting your search or filters" 
                  : "Get started by adding your first company"
                }
              </p>
            </div>
          ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  <TableHead>Partnership</TableHead>
                  <TableHead>Employees</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                      <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {company.website && (
                            <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {company.website}
                            </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {company.industry}
                      </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {company.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                      </TableCell>
                    <TableCell>
                      <Badge className={getPartnershipColor(company.partnership)} variant="outline">
                        {company.partnership || 'basic'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        {formatEmployeeCount(company.employees)}
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
                          <DropdownMenuItem onClick={() => handleViewCompany(company)}>
                              <Eye className="w-4 h-4 mr-2" />
                            View Details
                            </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCompany(company)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Company
                            </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteCompany(company.id)}
                          >
                              <Trash2 className="w-4 h-4 mr-2" />
                            Delete Company
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

      {/* View Company Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Complete company profile and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompany && (
        <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Company Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Industry:</span>
                        <span className="capitalize">{selectedCompany.industry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{selectedCompany.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Employees:</span>
                        <span>{formatEmployeeCount(selectedCompany.employees)}</span>
                  </div>
                      {selectedCompany.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Website:</span>
                          <a href={`https://${selectedCompany.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {selectedCompany.website}
                          </a>
                    </div>
                      )}
                    </div>
                    </div>
                  </div>
                  
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Partnership Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(selectedCompany.status)}>
                          {selectedCompany.status}
                        </Badge>
                    </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Partnership Level:</span>
                        <Badge className={getPartnershipColor(selectedCompany.partnership)} variant="outline">
                          {selectedCompany.partnership || 'basic'}
                        </Badge>
                    </div>
                      {selectedCompany.foundedYear && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Founded:</span>
                          <span>{selectedCompany.foundedYear}</span>
                    </div>
                      )}
                    </div>
                  </div>
                    </div>
                  </div>
                  
              {selectedCompany.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Company Description</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedCompany.description}
                    </p>
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
              handleEditCompany(selectedCompany);
            }}>
              Edit Company
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Edit Company: {selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Update company details and information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="edit-industry">Industry <span className="text-red-500">*</span></Label>
                <Select 
                  value={editFormData.industry || ''} 
                  onValueChange={(value) => {
                    setEditFormData({...editFormData, industry: value});
                    clearFieldError('industry');
                  }}
                >
                  <SelectTrigger className={fieldErrors.industry ? "border-red-500 focus:border-red-500" : ""}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors.industry && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.industry}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location <span className="text-red-500">*</span></Label>
                <Input 
                  id="edit-location" 
                  value={editFormData.location || ''}
                  onChange={(e) => {
                    setEditFormData({...editFormData, location: e.target.value});
                    clearFieldError('location');
                  }}
                  placeholder="e.g. San Francisco, CA" 
                  className={fieldErrors.location ? "border-red-500 focus:border-red-500" : ""}
                />
                {fieldErrors.location && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.location}</p>
                )}
              </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employees">Employee Count</Label>
                <Input 
                  id="edit-employees" 
                  type="number"
                  value={editFormData.employees || ''}
                  onChange={(e) => {
                    setEditFormData({...editFormData, employees: e.target.value});
                    clearFieldError('employees');
                  }}
                  placeholder="e.g. 500" 
                  className={fieldErrors.employees ? "border-red-500 focus:border-red-500" : ""}
                />
                {fieldErrors.employees && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.employees}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-founded">Founded Year</Label>
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

            <div className="space-y-2">
                <Label htmlFor="edit-partnership">Partnership Level</Label>
                <Select 
                  value={editFormData.partnership || 'basic'} 
                  onValueChange={(value) => {
                    setEditFormData({...editFormData, partnership: value});
                    clearFieldError('partnership');
                  }}
                >
                <SelectTrigger className={fieldErrors.partnership ? "border-red-500 focus:border-red-500" : ""}>
                  <SelectValue placeholder="Select partnership level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
                {fieldErrors.partnership && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.partnership}</p>
                )}
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
          
          <DialogFooter className="gap-2">
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
    </div>
  );
}