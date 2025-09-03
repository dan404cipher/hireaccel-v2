import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Linkedin, 
  DollarSign,
  Calendar as CalendarIcon,
  Plus,
  X,
  Edit2,
  Save,
  Upload,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  Star,
  Eye,
  Download,
  Languages,
  Trophy,
  Users,
  Target,
  Clock,
  CheckCircle,
  Building2,
  Code,
  Github,
  Link
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCandidateProfile, useUpdateCandidateProfile, useResumeInfo, useUploadResume, useDeleteResume } from '@/hooks/useApi';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PDFViewer from '@/components/ui/pdf-viewer';

interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
}

interface Education {
  degree: string;
  field: string;
  institution: string;
  graduationYear: number;
  gpa?: number;
}

interface Certification {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  startDate: Date;
  endDate?: Date;
  current: boolean;
  projectUrl?: string;
  githubUrl?: string;
  role?: string;
}

interface CandidateProfile {
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  summary: string;
  location: string;
  phoneNumber: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  preferredSalaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  availability: {
    startDate: Date;
    remote: boolean;
    relocation: boolean;
  };
}

const CandidateProfile: React.FC = () => {
  const { user } = useAuth();
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [newSkill, setNewSkill] = useState('');
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // API hooks
  const { data: profileData, loading, refetch } = useCandidateProfile();
  const { data: resumeInfo, refetch: refetchResumeInfo } = useResumeInfo();
  
  const uploadResume = useUploadResume({
    onSuccess: async (data) => {
      console.log('Upload successful:', data);
      toast({
        title: 'Resume Uploaded',
        description: 'Your resume has been uploaded successfully.',
      });
      setSelectedFile(null);
      // Refresh resume info to get updated data
      await refetchResumeInfo();
    },
    onError: (error: any) => {
      console.error('Resume upload error:', error);
      const errorMessage = error?.detail || error?.message || 'Failed to upload resume. Please try again.';
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const deleteResume = useDeleteResume({
    onSuccess: async () => {
      toast({
        title: 'Resume Deleted',
        description: 'Your resume has been deleted successfully.',
      });
      await refetchResumeInfo();
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete resume. Please try again.',
        variant: 'destructive',
      });
    }
  });
  
  // Debug logging for API response (can be removed in production)
  useEffect(() => {
    if (profileData) {
      console.log('Profile data loaded successfully');
    }
  }, [profileData, loading]);

  // Debug resume info
  useEffect(() => {
    console.log('Resume info state:', resumeInfo);
    console.log('Resume info JSON:', JSON.stringify(resumeInfo, null, 2));
    if (resumeInfo?.data) {
      console.log('Resume data:', resumeInfo.data);
      console.log('Resume data JSON:', JSON.stringify(resumeInfo.data, null, 2));
      console.log('Has resume:', resumeInfo.data.hasResume);
      if (resumeInfo.data.file) {
        console.log('File info:', resumeInfo.data.file);
      }
    }
    if (resumeInfo?.error) {
      console.log('Resume error:', resumeInfo.error);
    }
  }, [resumeInfo]);
  const updateProfile = useUpdateCandidateProfile({
    onSuccess: async () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      setEditingSections(new Set());
      // Force a refetch of the profile data
      await refetch();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  });

  // Profile state
  const [profile, setProfile] = useState<CandidateProfile>({
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    summary: '',
    location: '',
    phoneNumber: '',
    linkedinUrl: '',
    portfolioUrl: '',
    preferredSalaryRange: {
      min: 0,
      max: 0,
      currency: 'USD'
    },
    availability: {
      startDate: new Date(),
      remote: false,
      relocation: false
    }
  });

  // Load profile data from API
  useEffect(() => {
    if (profileData?.profile) {
      const apiProfile = profileData.profile;
      const newProfile = {
        skills: apiProfile.skills || [],
        experience: (apiProfile.experience || []).map((exp: any) => ({
          ...exp,
          startDate: new Date(exp.startDate),
          endDate: exp.endDate ? new Date(exp.endDate) : undefined
        })),
        education: apiProfile.education || [],
        certifications: (apiProfile.certifications || []).map((cert: any) => ({
          ...cert,
          issueDate: new Date(cert.issueDate),
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined
        })),
        projects: (apiProfile.projects || []).map((project: any) => ({
          ...project,
          startDate: new Date(project.startDate),
          endDate: project.endDate ? new Date(project.endDate) : undefined,
          technologies: project.technologies || []
        })),
        summary: apiProfile.summary || '',
        location: apiProfile.location || '',
        phoneNumber: apiProfile.phoneNumber || '',
        linkedinUrl: apiProfile.linkedinUrl || '',
        portfolioUrl: apiProfile.portfolioUrl || '',
        preferredSalaryRange: apiProfile.preferredSalaryRange || {
          min: 0,
          max: 0,
          currency: 'USD'
        },
        availability: {
          startDate: apiProfile.availability?.startDate ? new Date(apiProfile.availability.startDate) : new Date(),
          remote: apiProfile.availability?.remote || false,
          relocation: apiProfile.availability?.relocation || false
        }
      };

      setProfile(newProfile);
    }
  }, [profileData]);

  const toggleEdit = (section: string) => {
    const newEditingSections = new Set(editingSections);
    if (newEditingSections.has(section)) {
      newEditingSections.delete(section);
    } else {
      newEditingSections.add(section);
    }
    setEditingSections(newEditingSections);
  };

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Backend regex: /^[\+]?[1-9][\d]{0,15}$/
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  };

  // Availability date validation
  const validateAvailabilityDate = (date: Date): boolean => {
    const now = new Date();
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    return date >= now && date <= oneYearFromNow;
  };

  // File handling functions
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF or Word document (.pdf, .doc, .docx)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: 'File Too Large',
          description: 'Please upload a file smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (selectedFile) {
      await uploadResume.mutate(selectedFile);
    }
  };

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
      await deleteResume.mutate();
    }
  };

  const handleDownloadResume = async () => {
    if (resumeInfo?.file?.id) {
      try {
        const response = await fetch(`http://localhost:3002/api/v1/files/resume/${resumeInfo.file.id}/download`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = resumeInfo.file.originalName || 'resume.pdf';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          throw new Error('Download failed');
        }
      } catch (error) {
        toast({
          title: 'Download Failed',
          description: 'Failed to download resume. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      // Validate phone number if provided
      if (profile.phoneNumber && !validatePhoneNumber(profile.phoneNumber)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Phone number should contain only digits, optionally starting with +. No spaces, hyphens, or other characters allowed.',
          variant: 'destructive',
        });
        return;
      }

      // Validate availability date if provided
      if (profile.availability?.startDate && !validateAvailabilityDate(profile.availability.startDate)) {
        toast({
          title: 'Invalid Availability Date',
          description: 'Availability date must be between now and one year from now.',
          variant: 'destructive',
        });
        return;
      }

      let profileToSave;
      
      // For summary-only updates, just send the summary
      if (editingSections.has('summary')) {
        profileToSave = {
          profile: {
            summary: profile.summary || ''
          }
        };
      } else {
        // For other sections, handle the full profile update
        const updatedProfile = {
          ...profile,
          experience: profile.experience.map(exp => {
            const expData: any = {
              ...exp,
              startDate: exp.startDate.toISOString(), // Full ISO datetime
              current: exp.current
            };
            // Only include endDate if it exists and current is false
            if (!exp.current && exp.endDate) {
              expData.endDate = exp.endDate.toISOString();
            }
            return expData;
          }),
          certifications: profile.certifications.map(cert => {
            const certData: any = {
              ...cert,
              issueDate: cert.issueDate.toISOString() // Full ISO datetime
            };
            // Only include expiryDate if it exists
            if (cert.expiryDate) {
              certData.expiryDate = cert.expiryDate.toISOString();
            }
            return certData;
          }),
          projects: profile.projects.map(project => {
            const projectData: any = {
              ...project,
              startDate: project.startDate.toISOString(), // Full ISO datetime
              current: project.current
            };
            // Only include endDate if it exists and current is false
            if (!project.current && project.endDate) {
              projectData.endDate = project.endDate.toISOString();
            }
            return projectData;
          })
        };

        if (profile.availability) {
          updatedProfile.availability = {
            ...profile.availability,
            startDate: profile.availability.startDate.toISOString() // Full ISO datetime
          };
        }

        profileToSave = {
          profile: updatedProfile
        };
      }
      
      // Clean up undefined values in the profile object
      if (profileToSave.profile) {
        Object.keys(profileToSave.profile).forEach(key => {
          if (profileToSave.profile[key] === undefined) {
            delete profileToSave.profile[key];
          }
        });
      }
      
      console.log('Saving profile with data:', profileToSave);
      await updateProfile.mutate(profileToSave);
      
      // Close the edit section after successful save
      setEditingSections(new Set());
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      const errorMessage = error.issues?.map(issue => issue.message).join('\n') || 
                          error.detail || 
                          'Failed to update profile. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: new Date(),
        current: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setProfile(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, {
        degree: '',
        field: '',
        institution: '',
        graduationYear: new Date().getFullYear(),
        gpa: undefined
      }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  // Certification management functions
  const addCertification = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        issueDate: new Date(),
        expiryDate: undefined,
        credentialId: '',
        credentialUrl: ''
      }]
    }));
  };

  const updateCertification = (index: number, field: keyof Certification, value: any) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Project management functions
  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [...prev.projects, {
        title: '',
        description: '',
        technologies: [],
        startDate: new Date(),
        endDate: undefined,
        current: false,
        projectUrl: '',
        githubUrl: '',
        role: ''
      }]
    }));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (index: number) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const formatDuration = (startDate: Date, endDate?: Date) => {
    const start = format(startDate, 'MMM yyyy');
    const end = endDate ? format(endDate, 'MMM yyyy') : 'Present';
    return `${start} - ${end}`;
  };

  const calculateDuration = (startDate: Date, endDate?: Date) => {
    const end = endDate || new Date();
    const diffTime = Math.abs(end.getTime() - startDate.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    
    if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="px-4 md:px-6 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
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
      </div>

      <div className="px-4 md:px-6 -mt-24 relative z-10 pb-8">
        {/* Profile Header Card */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src="" alt={user ? `${user.firstName} ${user.lastName}` : ''} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-500 text-white">
                    {user ? `${user.firstName[0]}${user.lastName[0]}` : 'CN'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                  onClick={() => toggleEdit('photo')}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {user ? `${user.firstName} ${user.lastName}` : 'Your Name'}
                      </h1>
                      {profileData?.customId && (
                        <div className="flex items-center">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            ID: {profileData.customId}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-lg text-gray-600 mb-3">
                      {profile.summary ? profile.summary.substring(0, 120) + (profile.summary.length > 120 ? '...' : '') : 'Professional Summary'}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location || 'Location'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phoneNumber || 'Phone number'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-4">
                  {profile.linkedinUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {profile.portfolioUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Portfolio
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {/* Resume Management */}
                  <div className="flex flex-wrap gap-2">
                    {/* View Resume button - show if we have data */}
                    {resumeInfo?.hasResume ? (
                      <PDFViewer
                        fileId={resumeInfo.file.id}
                        fileName={resumeInfo.file.originalName}
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      </PDFViewer>
                    ) : (
                      /* Fallback view button - try with latest uploaded file */
                      <PDFViewer
                        fileId="68b8263e49ecb7aec95fba9a"
                        fileName="resume.pdf"
                      >
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Resume
                        </Button>
                      </PDFViewer>
                    )}
                    
                    {/* Upload/Replace Resume */}
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="resume-upload">
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {resumeInfo?.hasResume ? 'Replace Resume' : 'Upload Resume'}
                        </span>
                      </Button>
                    </label>
                    
                    {/* Download and Delete - only show if resume exists */}
                    {resumeInfo?.hasResume && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleDownloadResume}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDeleteResume}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                    
                    {/* File selection display */}
                    {selectedFile && (
                      <div className="flex items-center gap-2 w-full mt-2 p-3 bg-gray-50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 flex-1">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Button 
                          size="sm" 
                          onClick={handleUploadResume}
                          disabled={uploadResume.loading}
                        >
                          {uploadResume.loading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.experience.length}</div>
                <div className="text-sm text-gray-500">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.skills.length}</div>
                <div className="text-sm text-gray-500">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{profile.education.length}</div>
                <div className="text-sm text-gray-500">Education</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{profile.certifications.length}</div>
                <div className="text-sm text-gray-500">Certificates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{profile.projects.length}</div>
                <div className="text-sm text-gray-500">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {profile.preferredSalaryRange?.min ? `${profile.preferredSalaryRange.currency} ${(profile.preferredSalaryRange.min / 1000)}k` : '---'}
                </div>
                <div className="text-sm text-gray-500">Min Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {profile.availability.remote ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-500">Remote</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {profile.availability.relocation ? 'Yes' : 'No'}
                </div>
                <div className="text-sm text-gray-500">Relocate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Single Column Layout */}
        <div className="space-y-8">
          {/* About/Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold">About</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleEdit('summary')}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {editingSections.has('summary') ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Textarea
                      value={profile.summary}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 1000) {
                          setProfile(prev => ({ ...prev, summary: value }));
                        }
                      }}
                      rows={6}
                      placeholder="Write a brief summary of your professional background, goals, and what makes you unique..."
                      className="text-base"
                    />
                    <div className="text-sm text-muted-foreground flex justify-end">
                      {profile.summary?.length || 0}/1000 characters
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} size="sm" disabled={updateProfile.loading}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleEdit('summary')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 leading-relaxed text-lg">
                  {profile.summary || 'Add a professional summary to tell employers about your background, skills, and career goals.'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Row Grid - Contact, Skills, Availability */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">Contact Information</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('contact')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSections.has('contact') ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phoneNumber}
                        onChange={(e) => setProfile(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="+15551234567"
                        className={profile.phoneNumber && !validatePhoneNumber(profile.phoneNumber) ? 'border-red-500' : ''}
                      />
                      {profile.phoneNumber && !validatePhoneNumber(profile.phoneNumber) && (
                        <p className="text-sm text-red-500 mt-1">
                          Phone number should contain only digits, optionally starting with +. No spaces, hyphens, or other characters allowed.
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Format: +15551234567 (no spaces, hyphens, or parentheses)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn URL</Label>
                      <Input
                        id="linkedin"
                        value={profile.linkedinUrl}
                        onChange={(e) => setProfile(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div>
                      <Label htmlFor="portfolio">Portfolio URL</Label>
                      <Input
                        id="portfolio"
                        value={profile.portfolioUrl}
                        onChange={(e) => setProfile(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" disabled={updateProfile.loading}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleEdit('contact')}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profile.phoneNumber || 'Add phone number'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{profile.location || 'Add location'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{user?.email}</span>
                    </div>
                    {profile.linkedinUrl && (
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                        <a 
                          href={profile.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                    {profile.portfolioUrl && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-green-600" />
                        <a 
                          href={profile.portfolioUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 hover:underline"
                        >
                          Portfolio Website
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Skills
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('skills')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        {editingSections.has('skills') && (
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                  
                  {editingSections.has('skills') && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSave} size="sm" disabled={updateProfile.loading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => toggleEdit('skills')}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Availability & Preferences */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Availability & Preferences
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('availability')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSections.has('availability') ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Min Salary</Label>
                        <Input
                          type="number"
                          value={profile.preferredSalaryRange?.min || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            preferredSalaryRange: {
                              ...prev.preferredSalaryRange!,
                              min: parseInt(e.target.value)
                            }
                          }))}
                        />
                      </div>
                      <div>
                        <Label>Max Salary</Label>
                        <Input
                          type="number"
                          value={profile.preferredSalaryRange?.max || ''}
                          onChange={(e) => setProfile(prev => ({
                            ...prev,
                            preferredSalaryRange: {
                              ...prev.preferredSalaryRange!,
                              max: parseInt(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Currency</Label>
                      <Select
                        value={profile.preferredSalaryRange?.currency}
                        onValueChange={(value) => setProfile(prev => ({
                          ...prev,
                          preferredSalaryRange: {
                            ...prev.preferredSalaryRange!,
                            currency: value
                          }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Available Start Date</Label>
                      <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !profile.availability.startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {profile.availability.startDate ? (
                              format(profile.availability.startDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={profile.availability.startDate}
                            onSelect={(date) => {
                              if (date) {
                                setProfile(prev => ({
                                  ...prev,
                                  availability: { ...prev.availability, startDate: date }
                                }));
                              }
                              setStartDateOpen(false);
                            }}
                            disabled={(date) => {
                              const now = new Date();
                              const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
                              return date < now || date > oneYearFromNow;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {profile.availability.startDate && !validateAvailabilityDate(profile.availability.startDate) && (
                        <p className="text-sm text-red-500 mt-1">
                          Availability date must be between now and one year from now.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Open to Remote Work</Label>
                        <Switch
                          checked={profile.availability.remote}
                          onCheckedChange={(checked) => setProfile(prev => ({
                            ...prev,
                            availability: { ...prev.availability, remote: checked }
                          }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Open to Relocation</Label>
                        <Switch
                          checked={profile.availability.relocation}
                          onCheckedChange={(checked) => setProfile(prev => ({
                            ...prev,
                            availability: { ...prev.availability, relocation: checked }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleSave} size="sm" disabled={updateProfile.loading}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleEdit('availability')}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Salary Range</span>
                      <span className="text-sm text-gray-600">
                        {profile.preferredSalaryRange?.min && profile.preferredSalaryRange?.max 
                          ? `${profile.preferredSalaryRange.currency} ${profile.preferredSalaryRange.min.toLocaleString()} - ${profile.preferredSalaryRange.max.toLocaleString()}`
                          : 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Available From</span>
                      <span className="text-sm text-gray-600">
                        {format(profile.availability.startDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Remote Work</span>
                      <div className="flex items-center gap-1">
                        {profile.availability.remote ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {profile.availability.remote ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Relocation</span>
                      <div className="flex items-center gap-1">
                        {profile.availability.relocation ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {profile.availability.relocation ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Work Experience - Full Width */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experience
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('experience')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {editingSections.has('experience') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addExperience}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div key={index} className="relative">
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      {editingSections.has('experience') ? (
                        <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                              <div>
                                <Label>Position</Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                  placeholder="Job title"
                                />
                              </div>
                              <div>
                                <Label>Company</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                  placeholder="Company name"
                                />
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeExperience(index)}
                              className="ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={format(exp.startDate, 'yyyy-MM')}
                                onChange={(e) => updateExperience(index, 'startDate', new Date(e.target.value))}
                              />
                            </div>
                            {!exp.current && (
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={exp.endDate ? format(exp.endDate, 'yyyy-MM') : ''}
                                  onChange={(e) => updateExperience(index, 'endDate', new Date(e.target.value))}
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={exp.current}
                                onCheckedChange={(checked) => updateExperience(index, 'current', checked)}
                              />
                              <Label>Current Position</Label>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              rows={4}
                              placeholder="Describe your role, responsibilities, and achievements..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {exp.position || 'Position Title'}
                              </h3>
                              <p className="text-base text-gray-700 font-medium">
                                {exp.company || 'Company Name'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>{formatDuration(exp.startDate, exp.endDate)}</span>
                                <span>•</span>
                                <span>{calculateDuration(exp.startDate, exp.endDate)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-3 leading-relaxed">
                            {exp.description || 'Add a description of your role and achievements.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {profile.experience.length === 0 && !editingSections.has('experience') && (
                <div className="text-center py-12 text-gray-500">
                  <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No work experience added yet</h3>
                  <p className="text-sm mb-4">Add your work experience to showcase your professional background.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleEdit('experience')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Experience
                  </Button>
                </div>
              )}
              
              {editingSections.has('experience') && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={updateProfile.loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => toggleEdit('experience')}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education - Full Width */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('education')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {editingSections.has('education') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addEducation}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.education.map((edu, index) => (
                <div key={index} className="relative">
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      {editingSections.has('education') ? (
                        <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                              <div>
                                <Label>Degree</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                  placeholder="Bachelor of Science"
                                />
                              </div>
                              <div>
                                <Label>Field of Study</Label>
                                <Input
                                  value={edu.field}
                                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                  placeholder="Computer Science"
                                />
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeEducation(index)}
                              className="ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Institution</Label>
                              <Input
                                value={edu.institution}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                placeholder="University name"
                              />
                            </div>
                            <div>
                              <Label>Graduation Year</Label>
                              <Input
                                type="number"
                                value={edu.graduationYear}
                                onChange={(e) => updateEducation(index, 'graduationYear', parseInt(e.target.value))}
                                min={1950}
                                max={new Date().getFullYear() + 10}
                              />
                            </div>
                            <div>
                              <Label>GPA (Optional)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={edu.gpa || ''}
                                onChange={(e) => updateEducation(index, 'gpa', parseFloat(e.target.value))}
                                min={0}
                                max={4}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {edu.degree || 'Degree'} in {edu.field || 'Field of Study'}
                          </h3>
                          <p className="text-base text-gray-700 font-medium">
                            {edu.institution || 'Institution Name'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>Graduated {edu.graduationYear}</span>
                            {edu.gpa && (
                              <>
                                <span>•</span>
                                <span>GPA: {edu.gpa}/4.0</span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {profile.education.length === 0 && !editingSections.has('education') && (
                <div className="text-center py-12 text-gray-500">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No education history added yet</h3>
                  <p className="text-sm mb-4">Add your educational background to complete your profile.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleEdit('education')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your Education
                  </Button>
                </div>
              )}
              
              {editingSections.has('education') && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={updateProfile.loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => toggleEdit('education')}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications - Full Width */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('certifications')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {editingSections.has('certifications') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addCertification}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="relative">
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      {editingSections.has('certifications') ? (
                        <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                              <div>
                                <Label>Certification Name</Label>
                                <Input
                                  value={cert.name}
                                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                  placeholder="AWS Certified Solutions Architect"
                                />
                              </div>
                              <div>
                                <Label>Issuing Organization</Label>
                                <Input
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                  placeholder="Amazon Web Services"
                                />
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeCertification(index)}
                              className="ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Issue Date</Label>
                              <Input
                                type="month"
                                value={format(cert.issueDate, 'yyyy-MM')}
                                onChange={(e) => updateCertification(index, 'issueDate', new Date(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Expiry Date (Optional)</Label>
                              <Input
                                type="month"
                                value={cert.expiryDate ? format(cert.expiryDate, 'yyyy-MM') : ''}
                                onChange={(e) => updateCertification(index, 'expiryDate', e.target.value ? new Date(e.target.value) : undefined)}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Credential ID (Optional)</Label>
                              <Input
                                value={cert.credentialId || ''}
                                onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                                placeholder="ABC123DEF456"
                              />
                            </div>
                            <div>
                              <Label>Credential URL (Optional)</Label>
                              <Input
                                value={cert.credentialUrl || ''}
                                onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                                placeholder="https://www.credly.com/badges/..."
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {cert.name || 'Certification Name'}
                          </h3>
                          <p className="text-base text-gray-700 font-medium">
                            {cert.issuer || 'Issuing Organization'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span>Issued {format(cert.issueDate, 'MMM yyyy')}</span>
                            {cert.expiryDate && (
                              <>
                                <span>•</span>
                                <span>Expires {format(cert.expiryDate, 'MMM yyyy')}</span>
                              </>
                            )}
                            {cert.credentialId && (
                              <>
                                <span>•</span>
                                <span>ID: {cert.credentialId}</span>
                              </>
                            )}
                          </div>
                          {cert.credentialUrl && (
                            <div className="mt-2">
                              <a 
                                href={cert.credentialUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <Link className="w-4 h-4" />
                                View Credential
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {profile.certifications.length === 0 && !editingSections.has('certifications') && (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No certifications added yet</h3>
                  <p className="text-sm mb-4">Add your professional certifications to boost your credibility.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleEdit('certifications')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Certification
                  </Button>
                </div>
              )}
              
              {editingSections.has('certifications') && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={updateProfile.loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => toggleEdit('certifications')}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects - Full Width */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Code className="w-5 h-5" />
                Projects
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('projects')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                {editingSections.has('projects') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={addProject}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile.projects.map((project, index) => (
                <div key={index} className="relative">
                  {index > 0 && <Separator className="mb-6" />}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Code className="w-6 h-6 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      {editingSections.has('projects') ? (
                        <div className="space-y-4 border rounded-lg p-6 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                              <div>
                                <Label>Project Title</Label>
                                <Input
                                  value={project.title}
                                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                                  placeholder="E-commerce Website"
                                />
                              </div>
                              <div>
                                <Label>Role (Optional)</Label>
                                <Input
                                  value={project.role || ''}
                                  onChange={(e) => updateProject(index, 'role', e.target.value)}
                                  placeholder="Full-stack Developer"
                                />
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeProject(index)}
                              className="ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={project.description}
                              onChange={(e) => updateProject(index, 'description', e.target.value)}
                              rows={4}
                              placeholder="Describe the project, your contributions, and key achievements..."
                            />
                          </div>
                          
                          <div>
                            <Label>Technologies</Label>
                            <Input
                              value={project.technologies.join(', ')}
                              onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech))}
                              placeholder="React, Node.js, MongoDB, AWS"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="month"
                                value={format(project.startDate, 'yyyy-MM')}
                                onChange={(e) => updateProject(index, 'startDate', new Date(e.target.value))}
                              />
                            </div>
                            {!project.current && (
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  type="month"
                                  value={project.endDate ? format(project.endDate, 'yyyy-MM') : ''}
                                  onChange={(e) => updateProject(index, 'endDate', e.target.value ? new Date(e.target.value) : undefined)}
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={project.current}
                                onCheckedChange={(checked) => updateProject(index, 'current', checked)}
                              />
                              <Label>Ongoing Project</Label>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Project URL (Optional)</Label>
                              <Input
                                value={project.projectUrl || ''}
                                onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                                placeholder="https://myproject.com"
                              />
                            </div>
                            <div>
                              <Label>GitHub URL (Optional)</Label>
                              <Input
                                value={project.githubUrl || ''}
                                onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                                placeholder="https://github.com/username/project"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {project.title || 'Project Title'}
                              </h3>
                              {project.role && (
                                <p className="text-base text-gray-700 font-medium">
                                  {project.role}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <span>{formatDuration(project.startDate, project.endDate)}</span>
                                <span>•</span>
                                <span>{calculateDuration(project.startDate, project.endDate)}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 mt-3 leading-relaxed">
                            {project.description || 'Add a description of your project.'}
                          </p>
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {project.technologies.map((tech, techIndex) => (
                                <Badge key={techIndex} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-3 mt-3">
                            {project.projectUrl && (
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                              >
                                <Link className="w-4 h-4" />
                                Live Demo
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {project.githubUrl && (
                              <a 
                                href={project.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-gray-700 hover:underline"
                              >
                                <Github className="w-4 h-4" />
                                Source Code
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {profile.projects.length === 0 && !editingSections.has('projects') && (
                <div className="text-center py-12 text-gray-500">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No projects added yet</h3>
                  <p className="text-sm mb-4">Showcase your work by adding personal or professional projects.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleEdit('projects')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Project
                  </Button>
                </div>
              )}
              
              {editingSections.has('projects') && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={updateProfile.loading}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => toggleEdit('projects')}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;