import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail,
  Phone,
  MapPin,
  Save,
  Edit,
  Clock,
  Briefcase,
  Building2,
  MapPinIcon,
  DollarSign,
  Calendar,
  Eye
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useUserByCustomId, useJobs, useCompanies } from "@/hooks/useApi";

export default function HRProfile() {
  const { user, updateAuth } = useAuth();
  const { customId } = useParams<{ customId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Fetch user data by customId if provided (for viewing other users' profiles)
  const { data: targetUser, loading: targetUserLoading } = useUserByCustomId(customId || '');
  
  // Determine which user data to use
  const displayUser = useMemo(() => {
    return customId && targetUser ? targetUser : user;
  }, [customId, targetUser, user]);
  
  const isViewingOtherProfile = useMemo(() => {
    return customId && targetUser && targetUser.id !== user?.id;
  }, [customId, targetUser, user?.id]);
  
  // Fetch jobs posted by this HR user
  const { data: jobsResponse, loading: jobsLoading } = useJobs({
    createdBy: displayUser?.id,
    limit: 100
  });
  
  // Fetch companies created/managed by this HR user
  const { data: companiesResponse, loading: companiesLoading } = useCompanies({
    limit: 100
  });
  
  // Process data
  const jobs = Array.isArray(jobsResponse) ? jobsResponse : (jobsResponse as any)?.data || [];
  const allCompanies = Array.isArray(companiesResponse) ? companiesResponse : (companiesResponse as any)?.data || [];
  
  // Filter companies to show only those created by this specific HR user
  const companies = useMemo(() => {
    if (!displayUser?.id) return [];
    return allCompanies.filter((company: any) => {
      // Check if company was created by this HR user
      const companyCreatedBy = company.createdBy?._id || company.createdBy;
      return companyCreatedBy === displayUser.id;
    });
  }, [allCompanies, displayUser?.id]);
  
  // Auto-navigate to include customId in URL for HR users
  useEffect(() => {
    if (user?.role === 'hr' && user?.customId && !customId) {
      navigate(`/dashboard/hr-profile/${user.customId}`, { replace: true });
    }
  }, [user?.customId, customId, navigate, user?.role]);

  // Update form data when user data changes
  useEffect(() => {
    if (displayUser) {
      setProfileData(prev => ({
        ...prev,
        firstName: displayUser.firstName || "",
        lastName: displayUser.lastName || "",
        email: displayUser.email || "",
        customId: displayUser.customId || "",
        phone: displayUser.phoneNumber || "",
      }));
    }
  }, [displayUser]);

  // Simple profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    customId: user?.customId || "",
    phone: user?.phoneNumber || "",
    location: "",
    department: "Human Resources",
    jobTitle: "HR Manager",
    bio: "Experienced HR professional with expertise in talent acquisition and employee relations."
  });

  const handleSave = async () => {
    
    if (isViewingOtherProfile) {
      toast({
        title: "Cannot Edit",
        description: "You can only edit your own profile.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User information not available. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone,
      };
      
      const response = await apiClient.updateUser(user.id, updateData);
      
      // Update the user context to reflect changes
      updateAuth({
        ...user,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phone,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your HR profile has been successfully updated.",
      });
      
      setEditMode(false);
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error.detail || error.message || "Failed to update profile. Please try again.";
      
      // If it's an auth error, show a login prompt
      if (error.status === 401) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        // Redirect to login
        navigate('/login');
        return;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Show loading state when fetching target user
  if (customId && targetUserLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      
      {/* Header Banner */}
      <div className="relative h-48 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
      </div>

      <div className="px-4 md:px-6 -mt-24 relative z-10 pb-8">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src="" 
                    alt={`${profileData.firstName} ${profileData.lastName}`} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-blue-500 text-white">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profileData.firstName} {profileData.lastName}
                    </h1>
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="text-blue-600 border-blue-200 font-mono">
                        {profileData.customId}
                      </Badge>
                      <Badge variant="secondary">HR Manager</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{profileData.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{profileData.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profileData.location}</span>
                      </div>
                    </div>
                  </div>
                  {!editMode && !isViewingOtherProfile && (
                    <Button
                      variant="default"
                      onClick={() => setEditMode(true)}
                      className="ml-4"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profileData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={profileData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                disabled={!editMode}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!editMode}
              rows={4}
            />
          </div>

            {editMode && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jobs Posted Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Jobs Posted ({jobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="flex justify-center py-8">
                <Clock className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No jobs posted yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job: any) => (
                    <TableRow key={job._id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          {job.companyId?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          {job.location || 'Remote'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.type || 'Full-time'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            job.status === 'open' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : job.status === 'closed'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/jobs/${job.customId || job._id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Companies Created Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Companies Created ({companies.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {companiesLoading ? (
              <div className="flex justify-center py-8">
                <Clock className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No companies created yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Jobs</TableHead>
                    <TableHead>Total Hires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company: any) => (
                    <TableRow key={company._id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{company.industry || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                          {company.location || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            company.status === 'active' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : company.status === 'suspended'
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }
                        >
                          {company.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          {company.totalJobs || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          {company.totalHires || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/dashboard/companies`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
