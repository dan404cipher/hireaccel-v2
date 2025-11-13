import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  BarChart3,
  ChevronLeft,
  ChevronRight
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { useAuth } from "@/contexts/AuthContext";

// Format customId to remove leading zeros (e.g., HR00001 -> HR1, ADMIN00001 -> ADMIN1)
const formatCustomId = (customId: string | undefined): string => {
  if (!customId) return 'N/A';
  
  // Match pattern like CAND00004, HR00001, ADMIN00001, etc.
  const match = customId.match(/^([A-Z]+)(0*)(\d+)$/);
  if (match) {
    const [, prefix, zeros, number] = match;
    // Remove leading zeros and return formatted ID
    return `${prefix}${parseInt(number, 10)}`;
  }
  
  // If pattern doesn't match, return as is
  return customId;
};

// Company Avatar Component
const CompanyAvatar: React.FC<{
  logoFileId?: string | { _id: string } | any;
  companyName: string;
}> = React.memo(({ logoFileId, companyName }) => {
  // Extract file ID from various formats
  const fileId = logoFileId?._id || logoFileId?.toString() || logoFileId;
  
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
  // Custom comparison function for React.memo
  const prevFileId = prevProps.logoFileId?._id || prevProps.logoFileId?.toString() || prevProps.logoFileId;
  const nextFileId = nextProps.logoFileId?._id || nextProps.logoFileId?.toString() || nextProps.logoFileId;
  return prevFileId === nextFileId && prevProps.companyName === nextProps.companyName;
});

CompanyAvatar.displayName = 'CompanyAvatar';

// HR Avatar Component (similar to JobManagementIntegrated.tsx)
const HRAvatar: React.FC<{
  hr: any;
  onClick?: () => void;
}> = React.memo(({ hr, onClick }) => {
  const profilePhotoFileId = hr?.profilePhotoFileId;
  const showProfilePicture = !!profilePhotoFileId;
  
  const profilePhotoUrl = showProfilePicture
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${profilePhotoFileId}`
    : null;
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);

  const avatarContent = (
    <Avatar className="w-8 h-8 flex-shrink-0">
      {showProfilePicture && authenticatedImageUrl ? (
        <AvatarImage 
          src={authenticatedImageUrl || ''} 
          alt={`${hr?.firstName || ''} ${hr?.lastName || ''}`}
        />
      ) : null}
      <AvatarFallback className="text-xs font-semibold text-white bg-blue-600">
        {hr?.firstName?.[0] || ''}{hr?.lastName?.[0] || ''}
      </AvatarFallback>
    </Avatar>
  );

  if (onClick) {
    return (
      <div 
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
      >
        {avatarContent}
      </div>
    );
  }

  return avatarContent;
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  const prevFileId = prevProps.hr?.profilePhotoFileId?._id || prevProps.hr?.profilePhotoFileId?.toString() || prevProps.hr?.profilePhotoFileId;
  const nextFileId = nextProps.hr?.profilePhotoFileId?._id || nextProps.hr?.profilePhotoFileId?.toString() || nextProps.hr?.profilePhotoFileId;
  const prevName = `${prevProps.hr?.firstName || ''} ${prevProps.hr?.lastName || ''}`;
  const nextName = `${nextProps.hr?.firstName || ''} ${nextProps.hr?.lastName || ''}`;
  return prevFileId === nextFileId && prevName === nextName;
});

HRAvatar.displayName = 'HRAvatar';

const PAGE_SIZE = 20;

export default function CompanyManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [createFormData, setCreateFormData] = useState<any>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Check for URL action parameter to auto-open dialogs
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setIsCreateDialogOpen(true);
      // Remove the action parameter from URL to prevent re-opening
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);


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
      limit: PAGE_SIZE
    };
    
    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }
    
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }
    
    // Add sort parameter
    if (sortBy) {
      params.sortBy = sortBy;
    }
    
    return params;
  }, [page, debouncedSearchTerm, statusFilter, sortBy]);

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
  const rawMeta = Array.isArray(companiesResponse) ? null : (companiesResponse as any)?.meta;
  
  // Transform meta to add totalPages for compatibility (like JobManagement does)
  const meta = rawMeta ? {
    ...rawMeta,
    totalPages: rawMeta.page?.total ?? Math.ceil((rawMeta.total || 0) / (rawMeta.limit || 20))
  } : null;

  useEffect(() => {
    const totalPages = meta?.totalPages ?? 1;
    if (totalPages && page > totalPages) {
      setPage(Math.max(totalPages, 1));
    }
  }, [meta?.totalPages, page]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [debouncedSearchTerm, statusFilter]);

  // Check for edit company from navigation state
  useEffect(() => {
    const locationState = (window.history.state && window.history.state.usr) || {};
    if (locationState.editCompanyId && companies.length > 0) {
      // Find the company and open edit dialog
      const company = companies.find((c: any) => 
        (c.companyId || c._id || c.id) === locationState.editCompanyId
      );
      if (company) {
        handleEditCompany(company);
        // Clear the state
        window.history.replaceState({ ...window.history.state, usr: {} }, '');
      }
    }
  }, [companies]);

  // Use companies directly from API - no client-side filtering/sorting to avoid pagination issues
  // The API handles search filtering, and sorting should be done on the backend for proper pagination
  const totalPages = meta?.totalPages ?? 1;
  const canGoNext = meta ? (meta.page?.hasMore ?? (page < totalPages)) : false;
  const startItem = companies.length === 0 ? 0 : ((page - 1) * PAGE_SIZE) + 1;
  const endItem = companies.length === 0 ? 0 : ((page - 1) * PAGE_SIZE) + companies.length;
  const totalCompanies = meta?.total ?? companies.length;
  const pageIndicators = useMemo(() => {
    if (totalPages) {
      const total = Math.max(totalPages, 1);
      if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const pages = new Set<number>();
      pages.add(1);
      pages.add(total);
      pages.add(page);
      pages.add(page - 1);
      pages.add(page + 1);

      if (page - 2 > 1) pages.add(page - 2);
      if (page + 2 < total) pages.add(page + 2);

      return Array.from(pages)
        .filter((p) => p >= 1 && p <= total)
        .sort((a, b) => a - b);
    }

    return [page];
  }, [totalPages, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-600 text-white border-emerald-600";
      case "inactive": return "bg-gray-600 text-white border-gray-600";
      case "pending": return "bg-amber-600 text-white border-amber-600";
      default: return "bg-gray-600 text-white border-gray-600";
    }
  };


  const handleViewCompany = (company: any) => {
    // Navigate to company profile page using companyId
    const companyId = company.companyId || company._id || company.id;
    navigate(`/dashboard/companies/${companyId}`);
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
      foundedYear: company.foundedYear || ''
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
    if (!createFormData.name || !createFormData.size || !createFormData.address?.street || !createFormData.address?.city || !createFormData.address?.zipCode || !createFormData.foundedYear || !createFormData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Company Name, Size, Company Address, City, ZIP/PIN Code, Founded Year, and Description",
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
      status: 'active',
      contacts: []
    };


    try {
      await createCompany(newCompanyData);
      setIsCreateDialogOpen(false);
      setCreateFormData({}); // Clear form
      clearAllFieldErrors(); // Clear any previous errors
      setPage(1); // Reset to first page to show the newly created company
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
            <div className="flex-1 overflow-y-auto px-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-400">
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
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-street">Company Address <span className="text-red-500">*</span></Label>
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
                    <Label htmlFor="create-zipcode">ZIP/PIN Code <span className="text-red-500">*</span></Label>
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
                disabled={createLoading}
              >
                {createLoading ? "Creating..." : "Add Company"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        {/* Companies Table */}
          <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
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
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="location">Sort by Location</SelectItem>
                    <SelectItem value="status">Sort by Status</SelectItem>
                    <SelectItem value="size">Sort by Size</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
          {companiesLoading ? (
            <div className="relative overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Company ID</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>{user?.role === 'hr' ? 'Total Jobs' : 'HR'}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-5 w-24 bg-gray-300 rounded animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-300 rounded-full animate-pulse"></div>
                          <div className="h-5 bg-gray-300 rounded w-32 animate-pulse"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-300 rounded w-28 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-300 rounded w-16 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : companies.length === 0 ? (
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
              <div className="relative overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Company ID</TableHead>
                    <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                    <TableHead>{user?.role === 'hr' ? 'Total Jobs' : 'HR'}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                  <TableRow key={company.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {company.companyId || company._id || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                      <div className="flex items-center gap-3">
                        <CompanyAvatar 
                          logoFileId={company.logoFileId}
                          companyName={company.name}
                        />
                        <div>
                          <div 
                            className="font-medium text-base cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                            onClick={() => navigate(`/dashboard/companies/${company.companyId || company.id || company._id}`)}
                          >
                            {company.name}
                          </div>
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
                        <div className="text-sm text-foreground">
                          {company.address ? (
                            [company.address.city, company.address.state].filter(Boolean).join(', ') || 'No location'
                          ) : (
                            company.location || 'No address provided'
                          )}
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
                      <TableCell>
                        {user?.role === 'hr' ? (
                          // For HR users, show Total Jobs
                          <div className="flex items-center justify-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <Badge variant="outline" className="text-xs font-semibold">
                              {company.totalJobs || 0}
                            </Badge>
                          </div>
                        ) : (
                          // For other users, show HR details
                          <div className="flex items-center gap-3">
                            {company.createdBy && (
                              <HRAvatar 
                                hr={company.createdBy}
                                onClick={() => {
                                  if (company.createdBy?.customId) {
                                    navigate(`/dashboard/hr-profile/${company.createdBy.customId}`);
                                  }
                                }}
                              />
                            )}
                            <div>
                              <p 
                                className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                onClick={() => {
                                  if (company.createdBy?.customId) {
                                    navigate(`/dashboard/hr-profile/${company.createdBy.customId}`);
                                  }
                                }}
                              >
                                {company.createdBy?.firstName} {company.createdBy?.lastName}
                              </p>
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/companies/${company.companyId || company.id || company._id}`)}>
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
              </div>
          )}
          {!companiesLoading && !companiesError && companies.length > 0 && (
            <div className="flex flex-col gap-2 border-t pt-4 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-2">
                <div className="text-sm text-muted-foreground">
                  {totalCompanies > 0 ? (
                    <>
                      Showing <span className="font-medium">{startItem}</span> to{" "}
                      <span className="font-medium">{endItem}</span> of{" "}
                      <span className="font-medium">{totalCompanies}</span> companies
                    </>
                  ) : (
                    <>No companies to display</>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage((prev) => Math.max(prev - 1, 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {totalPages ? (
                      pageIndicators.map((pageNumber, index) => {
                        const prevNumber = pageIndicators[index - 1];
                        const showEllipsis = index > 0 && prevNumber !== undefined && pageNumber - prevNumber > 1;
                        return (
                          <React.Fragment key={pageNumber}>
                            {showEllipsis && (
                              <span className="px-2 text-sm text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={page === pageNumber ? "default" : "outline"}
                              size="sm"
                              className="w-9"
                              onClick={() => {
                                setPage(pageNumber);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              {pageNumber}
                            </Button>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <Button variant="default" size="sm" className="w-9">
                        {page}
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage((prev) => prev + 1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={!canGoNext}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
            </CardContent>
          </Card>


      {/* Edit Company Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Edit Company: {selectedCompany?.name}</DialogTitle>
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
    </div>
  );
}