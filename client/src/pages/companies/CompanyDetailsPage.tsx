import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  MapPin,
  Building2,
  Users,
  Globe,
  Phone,
  Mail,
  Calendar,
  Edit,
  Trash2,
  MoreHorizontal,
  Briefcase,
  Star,
  TrendingUp,
  Award,
  FileText
} from "lucide-react";
import { useCompany, useDeleteCompany, useUpdateCompany, useJobs } from "@/hooks/useApi";
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

// Stable empty object to prevent infinite loops
const EMPTY_JOBS_PARAMS = {};

export default function CompanyDetailsPage() {
  const { companyId: companyIdParam } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  const { data: companyResponse, loading, error, refetch: refetchCompany } = useCompany(companyIdParam || '');
  
  // Extract company data for display
  const company = (companyResponse as any)?.data || companyResponse;
  
  // Extract company ID - memoize based on actual ID values (primitives)
  // This ensures we only recalculate when the ID value actually changes
  const extractedId = useMemo(() => {
    return company?.id || company?._id;
  }, [company?.id, company?._id]);
  
  const companyId = extractedId;

  // Only create jobs params when we have a valid companyId
  // Use extractedId (primitive) as dependency - it only changes when ID value changes
  const jobsParams = useMemo(() => {
    if (!extractedId) {
      return EMPTY_JOBS_PARAMS;
    }
    return { companyId: extractedId, limit: 100 };
  }, [extractedId]); // Depend on extracted primitive value
  
  // Call useJobs - it will only execute if params are not empty
  const { data: jobsResponse } = useJobs(jobsParams);
  const companyJobs = Array.isArray(jobsResponse) 
    ? jobsResponse 
    : (jobsResponse as any)?.data || [];

  const { mutate: deleteCompany, loading: deleteLoading } = useDeleteCompany();

  const { mutate: updateCompany, loading: updateLoading } = useUpdateCompany();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success text-success-foreground";
      case "inactive": return "bg-muted text-muted-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "suspended": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openEditDialog = () => {
    if (!company) return;
    setEditFormData({
      name: company.name || '',
      description: company.description || '',
      industry: company.industry || '',
      size: company.size || '',
      location: company.location || '',
      address: company.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      website: company.website || '',
      foundedYear: company.foundedYear || new Date().getFullYear(),
      status: company.status || 'active',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCompany = async () => {
    if (!company) return;

    const updateData = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      industry: editFormData.industry,
      size: editFormData.size,
      location: editFormData.location,
      address: {
        street: editFormData.address?.street?.trim() || '',
        city: editFormData.address?.city?.trim() || '',
        state: editFormData.address?.state?.trim() || '',
        zipCode: editFormData.address?.zipCode?.trim() || '',
        country: editFormData.address?.country?.trim() || 'India'
      },
      website: editFormData.website?.trim() || undefined,
      foundedYear: parseInt(editFormData.foundedYear) || new Date().getFullYear(),
      status: editFormData.status,
    };

    try {
      await updateCompany({ id: company.id || company._id, data: updateData });
      toast({ title: "Success", description: "Company updated successfully" });
      setIsEditDialogOpen(false);
      refetchCompany();
    } catch (error) {
      console.error('Update company error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Company Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/dashboard/companies")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
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
                  {company.logoUrl ? (
                    <img 
                      src={company.logoUrl} 
                      alt={`${company.name} logo`}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Building2 className={`w-16 h-16 text-blue-600 p-3 rounded-lg border-2 border-slate-200 bg-slate-50 ${company.logoUrl ? 'hidden' : ''}`} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">{company.name}</h1>
                  {company.companyId && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Company ID: <Badge variant="outline" className="font-mono text-xs">{company.companyId}</Badge>
                    </p>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard/companies")}
                  className="hover:bg-blue-50 text-blue-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Companies
                </Button>
                {(user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="border-blue-200 hover:bg-blue-50 hover:border-blue-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={openEditDialog}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Company
                      </DropdownMenuItem>
                      {(user?.role === 'admin' || user?.role === 'superadmin') && (
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Company
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Company Overview */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Company Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-slate-700">Industry:</span>
                      <span className="text-slate-600">{company.industry || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-slate-700">Size:</span>
                      <span className="text-slate-600">{company.size || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="font-medium text-slate-700">Location:</span>
                      <span className="text-slate-600">{company.location || 'N/A'}</span>
                    </div>
                    {company.foundedYear && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-600" />
                        <span className="font-medium text-slate-700">Founded:</span>
                        <span className="text-slate-600">{company.foundedYear}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-slate-700">Website:</span>
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-slate-700">Status:</span>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status || 'active'}
                      </Badge>
                    </div>
                  </div>

                  {company.address && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-slate-700 mb-2">Address</h3>
                      <div className="text-sm text-slate-600 space-y-1">
                        {company.address.street && <div>{company.address.street}</div>}
                        <div>
                          {[
                            company.address.city,
                            company.address.state,
                            company.address.zipCode
                          ].filter(Boolean).join(', ')}
                        </div>
                        {company.address.country && <div>{company.address.country}</div>}
                      </div>
                    </div>
                  )}

                  {company.description && (
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-slate-700 mb-2">Description</h3>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {company.description}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              {company.contacts && company.contacts.length > 0 && (
                <Card className="shadow-lg bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-700">
                      <Users className="w-5 h-5 text-purple-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {company.contacts.map((contact: any, index: number) => (
                        <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <h4 className="font-semibold text-slate-700 mb-2">{contact.name}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {contact.position && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-muted-foreground" />
                                <span className="text-slate-600">{contact.position}</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                                  {contact.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Company Jobs */}
              {companyJobs.length > 0 && (
                <Card className="shadow-lg bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-700">
                      <Briefcase className="w-5 h-5 text-indigo-600" />
                      Active Jobs ({companyJobs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {companyJobs.slice(0, 10).map((job: any) => (
                        <div 
                          key={job.id || job._id} 
                          className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/dashboard/jobs/${job.id || job._id}`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-700 mb-1">{job.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-3 h-3" />
                                  {job.type}
                                </span>
                                <Badge variant="outline" className={getStatusColor(job.status)}>
                                  {job.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {companyJobs.length > 10 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/dashboard/jobs?companyId=${company.id || company._id}`)}
                        >
                          View All {companyJobs.length} Jobs
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Stats */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-700">Company Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-slate-800">{companyJobs.length}</div>
                    <div className="text-sm text-muted-foreground">Active Jobs</div>
                  </div>
                  {company.totalHires !== undefined && (
                    <div>
                      <div className="text-2xl font-bold text-slate-800">{company.totalHires}</div>
                      <div className="text-sm text-muted-foreground">Total Hires</div>
                    </div>
                  )}
                  {company.rating !== undefined && (
                    <div>
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-2xl font-bold text-slate-800">{company.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Partnership Info */}
              {company.partnership && (
                <Card className="shadow-lg bg-white border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-slate-700">Partnership</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className="text-lg py-2 px-4">
                      {company.partnership.charAt(0).toUpperCase() + company.partnership.slice(1)}
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Important Dates */}
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-700">Important Dates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.createdAt && (
                    <div>
                      <span className="text-sm text-slate-600 font-medium">Created</span>
                      <div className="mt-1 font-medium text-slate-700">{formatDate(company.createdAt)}</div>
                    </div>
                  )}
                  {company.updatedAt && (
                    <div>
                      <span className="text-sm text-slate-600 font-medium">Last Updated</span>
                      <div className="mt-1 font-medium text-slate-700">{formatDate(company.updatedAt)}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Company Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input
                    id="edit-industry"
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Company Size <span className="text-red-500">*</span></Label>
                  <Select
                    value={editFormData.size}
                    onValueChange={(value) => setEditFormData({ ...editFormData, size: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1001-5000">1001-5000</SelectItem>
                      <SelectItem value="5000+">5000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-website">Website</Label>
                  <Input
                    id="edit-website"
                    type="url"
                    value={editFormData.website}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    placeholder="https://www.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-founded">Founded Year</Label>
                  <Input
                    id="edit-founded"
                    type="number"
                    value={editFormData.foundedYear}
                    onChange={(e) => setEditFormData({ ...editFormData, foundedYear: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description <span className="text-red-500">*</span></Label>
                <Textarea
                  id="edit-description"
                  className="min-h-[120px]"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-street">Street</Label>
                  <Input
                    id="edit-street"
                    placeholder="Street"
                    value={editFormData.address?.street || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      address: { ...editFormData.address, street: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    placeholder="City"
                    value={editFormData.address?.city || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      address: { ...editFormData.address, city: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    placeholder="State"
                    value={editFormData.address?.state || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      address: { ...editFormData.address, state: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-zip">ZIP/PIN</Label>
                  <Input
                    id="edit-zip"
                    placeholder="ZIP/PIN"
                    value={editFormData.address?.zipCode || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      address: { ...editFormData.address, zipCode: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    placeholder="Country"
                    value={editFormData.address?.country || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      address: { ...editFormData.address, country: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={updateLoading}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCompany} disabled={updateLoading}>
              {updateLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {company.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                try {
                  await deleteCompany(company.id || company._id);
                  toast({
                    title: "Success",
                    description: "Company deleted successfully"
                  });
                  setShowDeleteDialog(false);
                  navigate("/dashboard/companies");
                } catch (error) {
                  console.error('Delete company error:', error);
                }
              }} 
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
