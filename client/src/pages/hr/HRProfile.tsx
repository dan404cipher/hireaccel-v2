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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Eye,
  History,
  Plus,
  UserPlus,
  MessageSquare,
  ArrowLeft
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
import { useUserByCustomId, useJobs, useCompanies, useContactHistory } from "@/hooks/useApi";
import { formatDistanceToNow, format } from "date-fns";
import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { ProfilePhotoUploadModal } from "@/components/candidates/ProfilePhotoUploadModal";

export default function HRProfile() {
  const { user, updateAuth } = useAuth();
  const { customId } = useParams<{ customId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [photoUploadState, setPhotoUploadState] = useState<'idle' | 'uploading'>('idle');
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  
  // Fetch user data by customId if provided (for viewing other users' profiles)
  const { data: targetUser, loading: targetUserLoading, refetch: refetchTargetUser } = useUserByCustomId(customId || '');
  
  // Determine which user data to use
  const displayUser = useMemo(() => {
    return customId && targetUser ? targetUser : user;
  }, [customId, targetUser, user]);

  // Get authenticated image URL for profile photo
  const profilePhotoUrl = displayUser?.profilePhotoFileId
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/files/profile-photo/${displayUser.profilePhotoFileId}`
    : null;
  const authenticatedImageUrl = useAuthenticatedImage(profilePhotoUrl);
  
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

  // Fetch contact history for this HR user
  const { data: contactHistoryResponse, loading: contactHistoryLoading } = useContactHistory({
    contactType: 'hr',
    contactId: displayUser?.id,
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

  // Fetch timeline data (audit logs and contact history)
  useEffect(() => {
    const fetchTimelineData = async () => {
      if (!displayUser?.id) return;
      
      setTimelineLoading(true);
      try {
        // Fetch audit logs where this HR user is the actor
        const auditLogsResponse = await apiClient.getAuditLogs({
          actorId: displayUser.id,
          limit: 100
        });

        // Process contact history
        const contactHistory = Array.isArray(contactHistoryResponse) 
          ? contactHistoryResponse 
          : (contactHistoryResponse as any)?.data || [];

        // Process audit logs
        const auditLogs = Array.isArray(auditLogsResponse.data) 
          ? auditLogsResponse.data 
          : [];

        // Combine and format timeline events
        const events: any[] = [];

        // Add user creation event (from audit logs or user createdAt)
        if (displayUser.createdAt) {
          events.push({
            type: 'user_created',
            timestamp: new Date(displayUser.createdAt),
            title: 'HR User Joined',
            description: `${displayUser.firstName} ${displayUser.lastName} joined the platform`,
            icon: UserPlus,
            color: 'blue'
          });
        }

        // Add job creation events (only actual creates, not reads)
        auditLogs
          .filter((log: any) => 
            log.entityType === 'Job' && 
            log.action === 'create' &&
            !log.description?.toLowerCase().includes('retrieved') &&
            !log.description?.toLowerCase().includes('query')
          )
          .forEach((log: any) => {
            events.push({
              type: 'job_created',
              timestamp: new Date(log.timestamp),
              title: 'Job Posted',
              description: log.description || `Posted a new job`,
              icon: Briefcase,
              color: 'green',
              entityId: log.entityId?._id || log.entityId
            });
          });

        // Add candidate assignment events (only actual assignments, not queries)
        // Filter out operations that are just queries (they mention "Retrieved" or "queryType")
        auditLogs
          .filter((log: any) => {
            // Exclude all read actions - they're just browsing
            if (log.action === 'read' || log.action === 'Read') {
              return false;
            }
            
            // Only include create/update actions for CandidateAssignment
            if (log.entityType !== 'CandidateAssignment' || (log.action !== 'create' && log.action !== 'update')) {
              return false;
            }
            
            // Exclude if it's a query/read operation based on description
            const description = (log.description || '').toLowerCase();
            if (description.includes('retrieved') || 
                description.includes('querytype') || 
                description.includes('resultcount') ||
                description.includes('list') ||
                description.includes('query') ||
                description.match(/retrieved \d+ candidate assignment/i)) {
              return false;
            }
            
            // Only include if it mentions actual assignment or has an entityId
            // Must have entityId to be a real assignment (not just a query)
            return log.entityId && (
              description.includes('assigned') || 
              description.includes('assignment') ||
              description.includes('candidate') ||
              description.length > 20 // Real descriptions are usually longer
            );
          })
          .forEach((log: any) => {
            events.push({
              type: 'candidate_assigned',
              timestamp: new Date(log.timestamp),
              title: 'Candidate Assigned',
              description: log.description || `Candidate was assigned to this HR`,
              icon: UserPlus,
              color: 'purple',
              entityId: log.entityId?._id || log.entityId
            });
          });

        // Add contact history events
        contactHistory.forEach((contact: any) => {
          events.push({
            type: 'contact_log',
            timestamp: new Date(contact.createdAt),
            title: 'Contact Logged',
            description: `${contact.agentId?.firstName || 'Agent'} logged contact: ${contact.subject}`,
            icon: MessageSquare,
            color: 'orange',
            agentName: contact.agentId ? `${contact.agentId.firstName} ${contact.agentId.lastName}` : 'Unknown Agent',
            contactMethod: contact.contactMethod,
            notes: contact.notes
          });
        });

        // Sort events by timestamp (most recent first)
        events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setTimelineEvents(events);
      } catch (error) {
        console.error('Failed to fetch timeline data:', error);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimelineData();
  }, [displayUser?.id, contactHistoryResponse]);

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

  const handlePhotoUpload = async (file: File) => {
    setPhotoUploadState('uploading');

    try {
      const response = await apiClient.uploadProfilePhoto(file);
      if (response.data?.file?.id) {
        toast({
          title: 'Photo Uploaded',
          description: 'Profile photo has been updated successfully.',
        });
        
        // Refetch user data to get updated photo
        if (customId && refetchTargetUser) {
          // If viewing by customId, refetch target user
          await refetchTargetUser();
        } else {
          // Refresh current user in auth context
          try {
            const userResponse = await apiClient.getCurrentUser();
            if (userResponse.data?.user) {
              updateAuth(userResponse.data.user);
            }
          } catch (error) {
            console.error('Failed to refresh user data:', error);
          }
        }
        
        setPhotoUploadState('idle');
        setShowPhotoUploadModal(false);
      }
    } catch (error: any) {
      console.error('Photo upload error:', error);
      const errorMessage = error?.detail || error?.message || 'Failed to upload photo. Please try again.';
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setPhotoUploadState('idle');
    }
  };

  // Show loading state when fetching target user
  if (customId && targetUserLoading) {
    return (
      <div className="bg-gray-50">
        {/* Header Banner Skeleton */}
        <div className="relative h-48 bg-gray-300 animate-pulse"></div>

        <div className="px-4 md:px-6 -mt-24 relative z-10 pb-8">
          {/* Profile Header Card Skeleton */}
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6 animate-pulse">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Picture Skeleton */}
              <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
              
              {/* Basic Info Skeleton */}
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                <div className="flex flex-wrap gap-4">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-4 bg-gray-300 rounded w-28"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="mb-6">
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 w-32 bg-gray-300 rounded animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Content Card Skeleton */}
          <div className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 rounded w-40"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
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
              {/* Profile Picture */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage 
                    src={authenticatedImageUrl || ''} 
                    alt={`${profileData.firstName} ${profileData.lastName}`} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-blue-500 text-white">
                    {profileData.firstName[0]}{profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                {!isViewingOtherProfile && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => setShowPhotoUploadModal(true)}
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Jobs ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Companies ({companies.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Details
                </CardTitle>
                {!editMode && !isViewingOtherProfile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {editMode ? (
                  <>
                    {/* Edit Mode - Show Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <Input
                          id="department"
                          value={profileData.department}
                          onChange={(e) => handleInputChange('department', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input
                          id="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* View Mode - Show Data Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">First Name</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.firstName || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.lastName || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Email</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.email || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Phone</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.phone || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Location</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.location || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Department</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.department || 'Not provided'}</p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-500">Job Title</Label>
                        <p className="text-base font-medium text-gray-900">{profileData.jobTitle || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-500">Bio</Label>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">{profileData.bio || 'No bio provided'}</p>
                    </div>
                  </>
                )}

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
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Jobs Posted ({jobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
            {jobsLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted Date</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-5 bg-gray-300 rounded w-40 animate-pulse"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
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
                        <div className="h-8 w-8 bg-gray-300 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
          </TabsContent>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <Card>
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
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {timelineLoading ? (
                  <div className="flex justify-center py-8">
                    <Clock className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : timelineEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No timeline events found</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-6">
                      {timelineEvents.map((event, index) => {
                        const Icon = event.icon;
                        const colorClasses: Record<string, string> = {
                          blue: 'bg-blue-100 text-blue-600 border-blue-200',
                          green: 'bg-green-100 text-green-600 border-green-200',
                          purple: 'bg-purple-100 text-purple-600 border-purple-200',
                          orange: 'bg-orange-100 text-orange-600 border-orange-200'
                        };
                        
                        return (
                          <div key={index} className="relative flex items-start gap-4">
                            {/* Icon */}
                            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${colorClasses[event.color] || 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 pt-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                                  {event.type === 'contact_log' && (
                                    <div className="mt-2 space-y-1">
                                      <Badge variant="outline" className="text-xs">
                                        By: {event.agentName}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs ml-2">
                                        Method: {event.contactMethod}
                                      </Badge>
                                      {event.notes && (
                                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{event.notes}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {format(event.timestamp, 'PPpp')}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Photo Upload Modal */}
      <ProfilePhotoUploadModal
        isOpen={showPhotoUploadModal}
        onClose={() => setShowPhotoUploadModal(false)}
        onUpload={handlePhotoUpload}
        isUploading={photoUploadState === 'uploading'}
      />
    </div>
  );
}
