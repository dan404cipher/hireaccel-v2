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
import { DashboardBanner } from "@/components/dashboard/Banner";

export default function CompanyManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    
    return params;
  }, [page, debouncedSearchTerm, statusFilter]);

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
    const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-600 text-white border-emerald-600";
      case "inactive": return "bg-gray-600 text-white border-gray-600";
      case "pending": return "bg-amber-600 text-white border-amber-600";
      default: return "bg-gray-600 text-white border-gray-600";
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
      foundedYear: company.foundedYear || '',
      numberOfOpenings: company.numberOfOpenings || ''
    });
    setIsEditDialogOpen(true);
  };

  // Helper function to handle validation errors with comprehensive user-friendly messages
  const handleValidationError = (error: any, defaultMessage: string) => {
    
    // Clear previous field errors
    setFieldErrors({});
    
    // Check for issues in multiple possible locations
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
            
          // Status
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
      setFieldErrors(fieldErrorsMap);
      
      // Debug: Check if field errors were set
      setTimeout(() => {
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
    if (!createFormData.name || !createFormData.size || !createFormData.address?.street || !createFormData.address?.city || !createFormData.foundedYear || !createFormData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Company Name, Size, Street Address, City, Founded Year, and Description",
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
      address: {
        street: createFormData.address?.street?.trim() || '',
        city: createFormData.address?.city?.trim() || '',
        state: createFormData.address?.state?.trim() || '',
        zipCode: createFormData.address?.zipCode?.trim() || '',
        country: createFormData.address?.country?.trim() || ''
      },
      size: createFormData.size,
      website: createFormData.website && createFormData.website.trim() !== '' ? createFormData.website.trim() : undefined,
      description: createFormData.description.trim(),
      foundedYear: parseInt(createFormData.foundedYear) || new Date().getFullYear(),
      numberOfOpenings: parseInt(createFormData.numberOfOpenings) || 0,
      status: 'active',
      contacts: []
    };


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
      handleValidationError(error, "Failed to create company. Please try again.");
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany?.id) return;
    
    // Validate required fields
    if (!editFormData.name || !editFormData.size || !editFormData.address?.street || !editFormData.address?.city || !editFormData.foundedYear || !editFormData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Company Name, Size, Street Address, City, Founded Year, and Description",
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
      foundedYear: parseInt(editFormData.foundedYear) || new Date().getFullYear(),
      numberOfOpenings: parseInt(editFormData.numberOfOpenings) || 0
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


  return (
    <div className="space-y-6">
      {/* Banner */}
      <DashboardBanner category="hr" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Company Management</h1>
          <p className="text-muted-foreground">Manage partner companies and business relationships</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Add New Company</DialogTitle>
              <DialogDescription>
                Add a new partner company to your recruitment network.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto px-2">
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
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Address <span className="text-red-500">*</span></Label>
                  <p className="text-sm text-muted-foreground mb-3">Please provide the company's complete address</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-street">Street Address <span className="text-red-500">*</span></Label>
                    <Input 
                      id="create-street" 
                      value={createFormData.address?.street || ''}
                      onChange={(e) => {
                        setCreateFormData({
                          ...createFormData, 
                          address: { ...createFormData.address, street: e.target.value }
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
                    <Label htmlFor="create-city">City <span className="text-red-500">*</span></Label>
                    <Input 
                      id="create-city" 
                      value={createFormData.address?.city || ''}
                      onChange={(e) => {
                        setCreateFormData({
                          ...createFormData, 
                          address: { ...createFormData.address, city: e.target.value }
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
                    <Label htmlFor="create-state">State/Province</Label>
                    <Input 
                      id="create-state" 
                      value={createFormData.address?.state || ''}
                      onChange={(e) => {
                        setCreateFormData({
                          ...createFormData, 
                          address: { ...createFormData.address, state: e.target.value }
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
                    <Label htmlFor="create-zipcode">ZIP/Postal Code</Label>
                    <Input 
                      id="create-zipcode" 
                      value={createFormData.address?.zipCode || ''}
                      onChange={(e) => {
                        setCreateFormData({
                          ...createFormData, 
                          address: { ...createFormData.address, zipCode: e.target.value }
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
                    <Label htmlFor="create-country">Country</Label>
                    <Input 
                      id="create-country" 
                      value={createFormData.address?.country || ''}
                      onChange={(e) => {
                        setCreateFormData({
                          ...createFormData, 
                          address: { ...createFormData.address, country: e.target.value }
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
                <div className="space-y-2">
                  <Label htmlFor="create-founded">Founded Year <span className="text-red-500">*</span></Label>
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-openings">Number of Openings</Label>
                  <Input 
                    id="create-openings" 
                    type="number"
                    value={createFormData.numberOfOpenings || ''}
                    onChange={(e) => {
                      setCreateFormData({...createFormData, numberOfOpenings: e.target.value});
                      clearFieldError('numberOfOpenings');
                    }}
                    placeholder="e.g. 5" 
                    className={fieldErrors.numberOfOpenings ? "border-red-500 focus:border-red-500" : ""}
                  />
                  {fieldErrors.numberOfOpenings && (
                    <p className="text-sm text-red-500 mt-1">{fieldErrors.numberOfOpenings}</p>
                  )}
                </div>
                <div></div>
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
            </div>
            <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
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
                disabled={createLoading || !createFormData.name || !createFormData.size || !createFormData.address?.street || !createFormData.address?.city || !createFormData.foundedYear || !createFormData.description}
              >
                {createLoading ? "Creating..." : "Add Company"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Companies</p>
                <p className="text-2xl font-bold text-white">
                  {companiesLoading ? "..." : companies.length}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Building2 className="w-6 h-6 text-blue-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-100">Active Partners</p>
                <p className="text-2xl font-bold text-white">
                  {companiesLoading ? "..." : companies.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Star className="w-6 h-6 text-emerald-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Total</p>
                <p className="text-2xl font-bold text-white">
                  {companiesLoading ? "..." : companies.length}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-6 h-6 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-100">Open Positions</p>
                <p className="text-2xl font-bold text-white">
                  {companiesLoading ? "..." : companies.reduce((sum, c) => sum + (c.activeJobs || 0), 0)}
                </p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Briefcase className="w-6 h-6 text-amber-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        {/* Companies Table */}
          <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
          <CardTitle className="text-slate-700 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Companies
          </CardTitle>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <Filter className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
                {searchTerm || statusFilter !== "all"
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
                  <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Openings</TableHead>
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
                          <div className="font-medium text-base">{company.name}</div>
                          <div className="text-base text-muted-foreground">
                            {company.website && (
                            <span className="flex items-center gap-1">
                                <Globe className="w-4 h-4 text-blue-600" />
                                {company.website}
                            </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-base">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <div className="text-sm">
                          {company.address ? (
                            <>
                              <div>{company.address.street}</div>
                              <div className="text-muted-foreground">
                                {[company.address.city, company.address.state].filter(Boolean).join(', ')}
                              </div>
                            </>
                          ) : (
                            company.location || 'No address provided'
                          )}
                        </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(company.status)}>
                          {company.status}
                        </Badge>
                      </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-base">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <Badge variant="outline" className="text-xs">
                          {company.size}
                        </Badge>
                      </div>
                      </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-base">
                        <Briefcase className="w-4 h-4 text-green-600" />
                        {company.numberOfOpenings || 0}
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
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <span className="font-medium">Address:</span>
                          <div className="text-sm text-muted-foreground mt-1">
                            {selectedCompany.address ? (
                              <>
                                <div>{selectedCompany.address.street}</div>
                                <div>
                                  {[selectedCompany.address.city, selectedCompany.address.state, selectedCompany.address.zipCode].filter(Boolean).join(', ')}
                                </div>
                                {selectedCompany.address.country && (
                                  <div>{selectedCompany.address.country}</div>
                                )}
                              </>
                            ) : (
                              selectedCompany.location || 'No address provided'
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Company Size:</span>
                        <Badge variant="outline" className="text-xs">
                          {selectedCompany.size}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Open Positions:</span>
                        <span>{selectedCompany.numberOfOpenings || 0}</span>
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
                    <h3 className="font-semibold text-lg mb-2">Company Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge className={getStatusColor(selectedCompany.status)}>
                          {selectedCompany.status}
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
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Company: {selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Update company details and information
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-2">
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
              <div>
                <Label className="text-base font-medium">Address <span className="text-red-500">*</span></Label>
                <p className="text-sm text-muted-foreground mb-3">Please provide the company's complete address</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-street">Street Address <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="edit-zipcode">ZIP/Postal Code</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-openings">Number of Openings</Label>
                <Input 
                  id="edit-openings" 
                  type="number"
                  value={editFormData.numberOfOpenings || ''}
                  onChange={(e) => {
                    setEditFormData({...editFormData, numberOfOpenings: e.target.value});
                    clearFieldError('numberOfOpenings');
                  }}
                  placeholder="e.g. 5" 
                  className={fieldErrors.numberOfOpenings ? "border-red-500 focus:border-red-500" : ""}
                />
                {fieldErrors.numberOfOpenings && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.numberOfOpenings}</p>
                )}
              </div>
              <div></div>
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
    </div>
  );
}