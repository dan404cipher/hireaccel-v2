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
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from "@/hooks/useApi";
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
  const [page, setPage] = useState(1);

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

  const { mutate: createCompany, loading: createLoading } = useCreateCompany();

  const { mutate: updateCompany, loading: updateLoading } = useUpdateCompany();

  const { mutate: deleteCompany, loading: deleteLoading } = useDeleteCompany();

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

  const handleCreateCompany = async () => {
    if (!createFormData.name) return;
    
    const newCompanyData = {
      name: createFormData.name,
      industry: createFormData.industry,
      location: createFormData.location,
      website: createFormData.website,
      description: createFormData.description,
      employees: parseInt(createFormData.employees) || 0,
      foundedYear: parseInt(createFormData.foundedYear) || new Date().getFullYear(),
      partnership: createFormData.partnership || 'basic',
      status: 'active'
    };

    try {
      await createCompany(newCompanyData);
      setIsCreateDialogOpen(false);
      setCreateFormData({}); // Clear form
      refetchCompanies();
      toast({
        title: "Success",
        description: "Company created successfully"
      });
    } catch (error) {
      console.error('Failed to create company:', error);
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
      refetchCompanies();
      toast({
        title: "Success",
        description: "Company updated successfully"
      });
    } catch (error) {
      console.error('Failed to update company:', error);
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
      } catch (error) {
        console.error('Failed to delete company:', error);
      }
    }
  };

  const formatEmployeeCount = (count: number) => {
    if (!count) return 'N/A';
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
                  <Label htmlFor="create-name">Company Name</Label>
                  <Input 
                    id="create-name" 
                    value={createFormData.name || ''}
                    onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                    placeholder="e.g. TechCorp Inc." 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-industry">Industry</Label>
                  <Select 
                    value={createFormData.industry || ''} 
                    onValueChange={(value) => setCreateFormData({...createFormData, industry: value})}
                  >
                    <SelectTrigger>
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
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-location">Location</Label>
                  <Input 
                    id="create-location" 
                    value={createFormData.location || ''}
                    onChange={(e) => setCreateFormData({...createFormData, location: e.target.value})}
                    placeholder="e.g. San Francisco, CA" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-website">Website</Label>
                  <Input 
                    id="create-website" 
                    value={createFormData.website || ''}
                    onChange={(e) => setCreateFormData({...createFormData, website: e.target.value})}
                    placeholder="e.g. www.company.com" 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-employees">Employee Count</Label>
                  <Input 
                    id="create-employees" 
                    type="number"
                    value={createFormData.employees || ''}
                    onChange={(e) => setCreateFormData({...createFormData, employees: e.target.value})}
                    placeholder="e.g. 500" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-founded">Founded Year</Label>
                  <Input 
                    id="create-founded" 
                    type="number"
                    value={createFormData.foundedYear || ''}
                    onChange={(e) => setCreateFormData({...createFormData, foundedYear: e.target.value})}
                    placeholder="e.g. 2010" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-partnership">Partnership Level</Label>
                  <Select 
                    value={createFormData.partnership || 'basic'} 
                    onValueChange={(value) => setCreateFormData({...createFormData, partnership: value})}
                  >
                  <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="create-description">Company Description</Label>
                <Textarea 
                  id="create-description" 
                  value={createFormData.description || ''}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  placeholder="Brief description of the company..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setCreateFormData({});
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCompany} 
                disabled={createLoading || !createFormData.name}
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
                <Label htmlFor="edit-name">Company Name</Label>
                <Input 
                  id="edit-name" 
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  placeholder="e.g. TechCorp Inc." 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-industry">Industry</Label>
                <Select 
                  value={editFormData.industry || ''} 
                  onValueChange={(value) => setEditFormData({...editFormData, industry: value})}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input 
                  id="edit-location" 
                  value={editFormData.location || ''}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  placeholder="e.g. San Francisco, CA" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input 
                  id="edit-website" 
                  value={editFormData.website || ''}
                  onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                  placeholder="e.g. www.company.com" 
                />
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
                  onChange={(e) => setEditFormData({...editFormData, employees: e.target.value})}
                  placeholder="e.g. 500" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-founded">Founded Year</Label>
                <Input 
                  id="edit-founded" 
                  type="number"
                  value={editFormData.foundedYear || ''}
                  onChange={(e) => setEditFormData({...editFormData, foundedYear: e.target.value})}
                  placeholder="e.g. 2010" 
                />
              </div>
            </div>

            <div className="space-y-2">
                              <Label htmlFor="edit-partnership">Partnership Level</Label>
                <Select 
                  value={editFormData.partnership || 'basic'} 
                  onValueChange={(value) => setEditFormData({...editFormData, partnership: value})}
                >
                <SelectTrigger>
                  <SelectValue placeholder="Select partnership level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Company Description</Label>
              <Textarea 
                id="edit-description" 
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Brief description of the company..."
                className="min-h-[100px]"
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