import React, { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';

interface MonthYearPickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ value, onChange, minDate, maxDate }) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - 49 + i);

  const selectedYear = value.getFullYear();
  const selectedMonth = value.getMonth();

  const handleYearChange = (year: string) => {
    const newDate = new Date(value);
    newDate.setFullYear(parseInt(year));
    onChange(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(value);
    newDate.setMonth(months.indexOf(month));
    onChange(newDate);
  };

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>Year</Label>
          <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem 
                  key={year} 
                  value={year.toString()}
                  disabled={
                    (minDate && year < minDate.getFullYear()) ||
                    (maxDate && year > maxDate.getFullYear())
                  }
                >
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Month</Label>
          <Select value={months[selectedMonth]} onValueChange={handleMonthChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem 
                  key={month} 
                  value={month}
                  disabled={
                    (minDate && 
                     selectedYear === minDate.getFullYear() && 
                     months.indexOf(month) < minDate.getMonth()) ||
                    (maxDate && 
                     selectedYear === maxDate.getFullYear() && 
                     months.indexOf(month) > maxDate.getMonth())
                  }
                >
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import PDFViewer from '@/components/ui/pdf-viewer';
import { ResumePreviewModal } from '@/components/candidates/ResumePreviewModal';

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

interface ResumeInfo {
  data: {
    hasResume: boolean;
    file?: {
      id: string;
      originalName: string;
    };
  };
  error?: any;
}

interface ProfileData {
  customId: string;
  userId: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    customId: string;
  };
  resumeFileId?: string;
  profile: CandidateProfile;
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
    startDate: Date | string;
    remote: boolean;
    relocation: boolean;
  };
}

const CandidateProfile: React.FC = () => {
  const { user } = useAuth();
  const { customId, candidateId } = useParams();
  const navigate = useNavigate();
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [newSkill, setNewSkill] = useState('');
  const [newTechnology, setNewTechnology] = useState<{[key: number]: string}>({});
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedProfile, setParsedProfile] = useState<Partial<CandidateProfile> | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [showPostUpload, setShowPostUpload] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  
  // API hooks
  const { data: profileData, loading, refetch } = useCandidateProfile<ProfileData>(customId || candidateId);
  
  // Determine if this is self-view or other-view
  const isSelfView = user?.role === 'candidate' && (!candidateId || (profileData?.userId?.id === user?.id));
  
  const { data: resumeInfo, refetch: refetchResumeInfo } = useResumeInfo<ResumeInfo>({
    immediate: isSelfView // Only fetch resume info in self-view mode
  });

  // Store customId in localStorage when it's available in self-view mode
  useEffect(() => {
    if (isSelfView && profileData?.customId) {
      localStorage.setItem('candidateCustomId', profileData.customId);
      // Update URL if customId is not in URL
      if (!customId) {
        navigate(`/dashboard/candidate-profile/${profileData.customId}`, { replace: true });
      }
    }
  }, [profileData?.customId, customId, navigate, isSelfView]);
  
  const updateProfile = useUpdateCandidateProfile<ProfileData>({
    onSuccess: async () => {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      // Close any open modals and reset states
      setShowPreviewModal(false);
      setParsedProfile(null);
      setEditingSections(new Set());
      // Force a refetch of the profile data
      await refetch();
    },
    onError: (error: any) => {
      const errorMessage = error?.detail || error?.message || 'Failed to update profile. Please try again.';
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const uploadResume = useUploadResume({
    onSuccess: async (data) => {
      toast({
        title: 'Resume Uploaded',
        description: 'Your resume has been uploaded successfully.',
      });
      await Promise.all([refetchResumeInfo(), refetch()]);
      setUploadState('idle');
      setShowPostUpload(true);
    },
    onError: (error: any) => {
      console.error('Resume upload error:', error);
      const errorMessage = error?.detail || error?.message || 'Failed to upload resume. Please try again.';
      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setUploadState('idle');
      setSelectedFile(null);
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
    }
  }, [profileData, loading]);

  // Debug resume info
  useEffect(() => {
    if (resumeInfo?.data) {
      if (resumeInfo.data.file) {
      }
    }
    if (resumeInfo?.error) {
    }
  }, [resumeInfo]);

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
      currency: 'INR'
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
        availability: (() => {
          // Validate and normalize the date to ensure it's within valid range
          // Backend compares with current time (not just date), so we need to ensure date >= now
          const now = new Date();
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(now.getFullYear() + 1);
          
          let startDate: Date;
          if (apiProfile.availability?.startDate) {
            startDate = apiProfile.availability.startDate instanceof Date 
              ? apiProfile.availability.startDate 
              : new Date(apiProfile.availability.startDate);
            
            // Normalize date and validate
            // Backend validation checks: startDate >= now && startDate <= oneYearFromNow
            const dateToCheck = new Date(startDate);
            const nowStartOfDay = new Date(now);
            nowStartOfDay.setHours(0, 0, 0, 0);
            const dateStartOfDay = new Date(dateToCheck);
            dateStartOfDay.setHours(0, 0, 0, 0);
            
            // If date is invalid or outside range, set to current time + 1 minute
            if (isNaN(dateToCheck.getTime()) || dateStartOfDay < nowStartOfDay || dateStartOfDay > oneYearFromNow) {
              // Set to 1 minute from now to ensure it's > now (passes validation)
              startDate = new Date(now.getTime() + 60000);
            } else if (dateStartOfDay.getTime() === nowStartOfDay.getTime()) {
              // If date is today, set to current time + 1 minute to ensure it's > now
              startDate = new Date(now.getTime() + 60000);
            } else {
              // Future date - use start of day
              startDate = dateStartOfDay;
            }
          } else {
            // Default to 1 minute from now to ensure it's > now (passes validation)
            startDate = new Date(now.getTime() + 60000);
          }
          return {
            startDate,
            remote: apiProfile.availability?.remote || false,
            relocation: apiProfile.availability?.relocation || false
          };
        })()
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

  // Cancel handlers that restore original state
  const cancelExperience = () => {
    if (profileData?.profile?.experience) {
      const restoredExperience = profileData.profile.experience.map((exp: any) => ({
        ...exp,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : undefined
      }));
      setProfile(prev => ({
        ...prev,
        experience: restoredExperience
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        experience: []
      }));
    }
    toggleEdit('experience');
  };

  const cancelEducation = () => {
    if (profileData?.profile?.education) {
      setProfile(prev => ({
        ...prev,
        education: profileData.profile.education
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        education: []
      }));
    }
    toggleEdit('education');
  };

  const cancelCertifications = () => {
    if (profileData?.profile?.certifications) {
      const restoredCertifications = profileData.profile.certifications.map((cert: any) => ({
        ...cert,
        issueDate: new Date(cert.issueDate),
        expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined
      }));
      setProfile(prev => ({
        ...prev,
        certifications: restoredCertifications
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        certifications: []
      }));
    }
    toggleEdit('certifications');
  };

  const cancelProjects = () => {
    if (profileData?.profile?.projects) {
      const restoredProjects = profileData.profile.projects.map((project: any) => ({
        ...project,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : undefined,
        technologies: project.technologies || []
      }));
      setProfile(prev => ({
        ...prev,
        projects: restoredProjects
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        projects: []
      }));
    }
    toggleEdit('projects');
  };

  // Phone number validation function
  const validatePhoneNumber = (phone: string): boolean => {
    // Backend regex: /^[\+]?[1-9][\d]{0,15}$/
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
  };

  // Availability date validation
  const validateAvailabilityDate = (date: Date | string): boolean => {
    if (!date) return true; // Allow empty dates
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return false; // Invalid date
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of today
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    const dateToCheck = new Date(dateObj);
    dateToCheck.setHours(0, 0, 0, 0); // Set to start of day for comparison
    return dateToCheck >= now && dateToCheck <= oneYearFromNow;
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
      try {
        setUploadState('uploading');
        await uploadResume.mutate(selectedFile);
      } catch (error) {
        setUploadState('idle');
      }
    }
  };

  const handleConfirmUpdate = async () => {
    if (parsedProfile) {
      setUploadState('parsing');
      await updateProfile.mutate({ profile: parsedProfile });
      setUploadState('idle');
      setShowConfirmationDialog(false);
    }
  };

  const handleDeleteResume = async () => {
    if (window.confirm('Are you sure you want to delete your resume? This action cannot be undone.')) {
      await deleteResume.mutate(undefined);
    }
  };

  const handleDownloadResume = async () => {
    if (resumeInfo?.data?.file?.id) {
      try {
        const response = await fetch(`http://localhost:3002/api/v1/files/resume/${resumeInfo.data.file.id}/download`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = resumeInfo.data.file.originalName || 'resume.pdf';
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

  const validateExperience = (exp: WorkExperience): string[] => {
    const errors: string[] = [];
    if (!exp.position) errors.push('Position is required');
    if (!exp.company) errors.push('Company is required');
    if (!exp.startDate) errors.push('Start date is required');
    if (!exp.current && !exp.endDate) errors.push('End date is required for past positions');
    if (exp.startDate && exp.endDate && exp.startDate > exp.endDate) {
      errors.push('Start date cannot be after end date');
    }
    if (!exp.description?.trim()) errors.push('Description is required');
    return errors;
  };

  // Helper function to normalize availability date before sending to backend
  // Always ensures the date is at least 7 days from now to provide a large safety buffer
  const getValidAvailabilityDate = (): string => {
    const now = new Date();
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    
    // Always use at least 7 days from now (start of day) to ensure it's definitely > now
    // This provides a large safe buffer for network delays, clock differences, and timezone issues
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(0, 0, 0, 0);
    
    let startDate: Date = sevenDaysFromNow; // Default to safe date
    
    if (profile.availability?.startDate) {
      try {
        const dateToCheck = profile.availability.startDate instanceof Date 
          ? profile.availability.startDate 
          : new Date(profile.availability.startDate);
        
        // Check if date is valid
        if (!isNaN(dateToCheck.getTime())) {
          // Normalize to start of day for comparison
          const dateStartOfDay = new Date(dateToCheck);
          dateStartOfDay.setHours(0, 0, 0, 0);
          
          // Only use the date if it's at least 7 days in the future and within 1 year
          if (dateStartOfDay > sevenDaysFromNow && dateStartOfDay <= oneYearFromNow) {
            startDate = dateStartOfDay;
          }
        }
      } catch (e) {
        // If parsing fails, use default (sevenDaysFromNow)
        console.warn('Error parsing availability date:', e);
      }
    }
    
    // Final safety check: ensure date is definitely > now and <= oneYearFromNow
    // Add extra buffer - ensure it's at least 6 days from now
    const sixDaysFromNow = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000);
    if (startDate <= sixDaysFromNow) {
      startDate = sevenDaysFromNow;
    }
    if (startDate > oneYearFromNow) {
      const safeDate = new Date(oneYearFromNow);
      safeDate.setHours(0, 0, 0, 0);
      startDate = safeDate;
    }
    
    // Ensure we return a valid ISO string
    const isoString = startDate.toISOString();
    return isoString;
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

      // Validate availability date only if editing availability section
      if (editingSections.has('availability') && profile.availability?.startDate && !validateAvailabilityDate(profile.availability.startDate)) {
        toast({
          title: 'Invalid Availability Date',
          description: 'Availability date must be between now and one year from now.',
          variant: 'destructive',
        });
        return;
      }

      // Validate experience entries if editing experience section
      if (editingSections.has('experience')) {
        const allErrors: string[] = [];
        profile.experience.forEach((exp, index) => {
          const errors = validateExperience(exp);
          if (errors.length > 0) {
            allErrors.push(`Experience #${index + 1}:\n${errors.join('\n')}`);
          }
        });
        
        if (allErrors.length > 0) {
          toast({
            title: 'Please fix the following errors:',
            description: allErrors.join('\n\n'),
            variant: 'destructive',
          });
          return;
        }
      }

      let profileToSave;
      
      // For single section updates
      if (editingSections.has('summary')) {
        profileToSave = {
          profile: {
            summary: profile.summary || ''
          }
        };
      } else if (editingSections.has('skills')) {
        profileToSave = {
          profile: {
            skills: profile.skills
          }
        };
      } else if (editingSections.has('experience')) {
        // Save experience section and include valid availability to override invalid DB data
        profileToSave = {
          profile: {
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
            // Always include valid availability to override potentially invalid DB data
            availability: {
              startDate: getValidAvailabilityDate(),
              remote: profile.availability?.remote || false,
              relocation: profile.availability?.relocation || false
            }
          }
        };
      } else if (editingSections.has('education')) {
        // Save education section and include valid availability to override invalid DB data
        profileToSave = {
          profile: {
            education: profile.education,
            // Always include valid availability to override potentially invalid DB data
            availability: {
              startDate: getValidAvailabilityDate(),
              remote: profile.availability?.remote || false,
              relocation: profile.availability?.relocation || false
            }
          }
        };
      } else if (editingSections.has('certifications')) {
        // Save certifications section and include valid availability to override invalid DB data
        profileToSave = {
          profile: {
            certifications: profile.certifications.map(cert => {
              const certData: any = {
                name: cert.name,
                issuer: cert.issuer,
                issueDate: cert.issueDate.toISOString() // Full ISO datetime
              };
              // Only include expiryDate if it exists
              if (cert.expiryDate) {
                certData.expiryDate = cert.expiryDate.toISOString();
              }
              // Only include optional fields if they have valid values
              if (cert.credentialId && cert.credentialId.trim()) {
                certData.credentialId = cert.credentialId;
              }
              if (cert.credentialUrl && cert.credentialUrl.trim()) {
                certData.credentialUrl = cert.credentialUrl;
              }
              return certData;
            }),
            // Always include valid availability to override potentially invalid DB data
            availability: {
              startDate: getValidAvailabilityDate(),
              remote: profile.availability?.remote || false,
              relocation: profile.availability?.relocation || false
            }
          }
        };
      } else if (editingSections.has('projects')) {
        // Save projects section and include valid availability to override invalid DB data
        profileToSave = {
          profile: {
            projects: profile.projects.map(project => {
              const projectData: any = {
                title: project.title,
                description: project.description,
                technologies: project.technologies,
                startDate: project.startDate.toISOString(), // Full ISO datetime
                current: project.current
              };
              // Only include endDate if it exists and current is false
              if (!project.current && project.endDate) {
                projectData.endDate = project.endDate.toISOString();
              }
              // Only include optional URL fields if they have valid values
              if (project.role && project.role.trim()) {
                projectData.role = project.role;
              }
              if (project.projectUrl && project.projectUrl.trim()) {
                projectData.projectUrl = project.projectUrl;
              }
              if (project.githubUrl && project.githubUrl.trim()) {
                projectData.githubUrl = project.githubUrl;
              }
              return projectData;
            }),
            // Always include valid availability to override potentially invalid DB data
            availability: {
              startDate: getValidAvailabilityDate(),
              remote: profile.availability?.remote || false,
              relocation: profile.availability?.relocation || false
            }
          }
        };
      } else if (editingSections.has('contact')) {
        // Only save contact information
        profileToSave = {
          profile: {
            phoneNumber: profile.phoneNumber,
            location: profile.location,
            linkedinUrl: profile.linkedinUrl,
            portfolioUrl: profile.portfolioUrl
          }
        };
      } else if (editingSections.has('availability')) {
        // Only save availability section
        profileToSave = {
          profile: {
            availability: {
              ...profile.availability,
              startDate: getValidAvailabilityDate() // Normalized and validated date
            },
            preferredSalaryRange: profile.preferredSalaryRange
          }
        };
      } else {
        // Fallback: handle the full profile update (shouldn't normally reach here)
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
              name: cert.name,
              issuer: cert.issuer,
              issueDate: cert.issueDate.toISOString() // Full ISO datetime
            };
            // Only include expiryDate if it exists
            if (cert.expiryDate) {
              certData.expiryDate = cert.expiryDate.toISOString();
            }
            // Only include optional fields if they have valid values
            if (cert.credentialId && cert.credentialId.trim()) {
              certData.credentialId = cert.credentialId;
            }
            if (cert.credentialUrl && cert.credentialUrl.trim()) {
              certData.credentialUrl = cert.credentialUrl;
            }
            return certData;
          }),
          projects: profile.projects.map(project => {
            const projectData: any = {
              title: project.title,
              description: project.description,
              technologies: project.technologies,
              startDate: project.startDate.toISOString(), // Full ISO datetime
              current: project.current
            };
            // Only include endDate if it exists and current is false
            if (!project.current && project.endDate) {
              projectData.endDate = project.endDate.toISOString();
            }
            // Only include optional URL fields if they have valid values
            if (project.role && project.role.trim()) {
              projectData.role = project.role;
            }
            if (project.projectUrl && project.projectUrl.trim()) {
              projectData.projectUrl = project.projectUrl;
            }
            if (project.githubUrl && project.githubUrl.trim()) {
              projectData.githubUrl = project.githubUrl;
            }
            return projectData;
          })
        };

        // Only include availability if editing availability section
        if (editingSections.has('availability') && profile.availability) {
          updatedProfile.availability = {
            ...profile.availability,
            startDate: getValidAvailabilityDate() // Normalized and validated date
          };
        }

        // Clean up empty optional URL fields
        if (!updatedProfile.linkedinUrl || !updatedProfile.linkedinUrl.trim()) {
          delete updatedProfile.linkedinUrl;
        }
        if (!updatedProfile.portfolioUrl || !updatedProfile.portfolioUrl.trim()) {
          delete updatedProfile.portfolioUrl;
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
      
      await updateProfile.mutate(profileToSave);
      
      // Close the edit section after successful save
      setEditingSections(new Set());
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      } catch (error) {
        console.error('Error saving profile:', error);
        let errorMessage = 'Failed to update profile. Please try again.';
        
        if (error.issues) {
          const errorMessages = error.issues.map(issue => {
            // Extract the index from the field path for experience errors
            const match = issue.field?.match(/profile\.experience\.(\d+)\./);
            if (match) {
              const index = parseInt(match[1]);
              const field = issue.field.split('.').pop();
              return `Experience #${index + 1}: ${field} - ${issue.message}`;
            }
            return `${issue.field}: ${issue.message}`;
          });
          errorMessage = errorMessages.join('\n');
        } else if (error.detail) {
          errorMessage = error.detail;
        }
        
        toast({
          title: 'Error Saving Profile',
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
    // Enable edit mode and add experience entry synchronously
    const newExperience = {
      company: '',
      position: '',
      startDate: new Date(),
      current: false,
      description: ''
    };
    
    // Use flushSync to ensure both updates happen immediately and trigger a re-render
    flushSync(() => {
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.add('experience');
        return newSet;
      });
      setProfile(prev => ({
        ...prev,
        experience: [...prev.experience, newExperience]
      }));
    });
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
    // Enable edit mode and add education entry synchronously
    const newEducation = {
      degree: '',
      field: '',
      institution: '',
      graduationYear: new Date().getFullYear(),
      gpa: undefined
    };
    
    // Use flushSync to ensure both updates happen immediately and trigger a re-render
    flushSync(() => {
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.add('education');
        return newSet;
      });
      setProfile(prev => ({
        ...prev,
        education: [...prev.education, newEducation]
      }));
    });
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
    // Enable edit mode and add certification entry synchronously
    const newCertification = {
      name: '',
      issuer: '',
      issueDate: new Date(),
      expiryDate: undefined,
      credentialId: '',
      credentialUrl: ''
    };
    
    // Use flushSync to ensure both updates happen immediately and trigger a re-render
    flushSync(() => {
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.add('certifications');
        return newSet;
      });
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification]
      }));
    });
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
    // Enable edit mode and add project entry synchronously
    const newProject = {
      title: '',
      description: '',
      technologies: [],
      startDate: new Date(),
      endDate: undefined,
      current: false,
      projectUrl: '',
      githubUrl: '',
      role: ''
    };
    
    // Use flushSync to ensure both updates happen immediately and trigger a re-render
    flushSync(() => {
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.add('projects');
        return newSet;
      });
      setProfile(prev => ({
        ...prev,
        projects: [...prev.projects, newProject]
      }));
    });
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

  const addTechnology = (projectIndex: number) => {
    const tech = newTechnology[projectIndex]?.trim();
    if (tech && !profile.projects[projectIndex].technologies.includes(tech)) {
      setProfile(prev => ({
        ...prev,
        projects: prev.projects.map((project, i) => 
          i === projectIndex 
            ? { ...project, technologies: [...project.technologies, tech] }
            : project
        )
      }));
      setNewTechnology(prev => ({ ...prev, [projectIndex]: '' }));
    }
  };

  const removeTechnology = (projectIndex: number, techToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === projectIndex 
          ? { ...project, technologies: project.technologies.filter(tech => tech !== techToRemove) }
          : project
      )
    }));
  };

  const safeFormatDate = (date: Date | undefined | null, formatStr: string, fallback: string = ''): string => {
    if (!date) return fallback;
    const dateObj = date instanceof Date ? date : new Date(date);
    return isValid(dateObj) ? format(dateObj, formatStr) : fallback;
  };

  const formatDuration = (startDate: Date, endDate?: Date) => {
    const start = safeFormatDate(startDate, 'MMMM yyyy', 'N/A');
    const end = endDate ? safeFormatDate(endDate, 'MMMM yyyy', 'Present') : 'Present';
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
                  <AvatarImage 
                    src="" 
                    alt={isSelfView 
                      ? (user ? `${user.firstName} ${user.lastName}` : '')
                      : (profileData?.userId ? `${profileData.userId.firstName} ${profileData.userId.lastName}` : '')} 
                  />
                  <AvatarFallback className="text-2xl font-bold bg-blue-500 text-white">
                    {isSelfView
                      ? (user ? `${user.firstName[0]}${user.lastName[0]}` : 'CN')
                      : (profileData?.userId ? `${profileData.userId.firstName[0]}${profileData.userId.lastName[0]}` : 'CN')}
                  </AvatarFallback>
                </Avatar>
                {isSelfView && (
                  <Button 
                    size="sm" 
                    className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0 bg-blue-600 hover:bg-blue-700"
                    onClick={() => toggleEdit('photo')}
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isSelfView 
                          ? (user ? `${user.firstName} ${user.lastName}` : 'Your Name')
                          : (profileData?.userId ? `${profileData.userId.firstName} ${profileData.userId.lastName}` : 'Loading...')}
                      </h1>
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
                        <span>{isSelfView ? user?.email : profileData?.userId?.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phoneNumber || 'Phone number'}</span>
                      </div>
                      {(isSelfView ? user?.customId : profileData?.userId?.customId || profileData?.customId) && (
                        <Badge variant="outline" className="font-mono text-xs">
                          {isSelfView ? user?.customId : profileData?.userId?.customId || profileData?.customId}
                        </Badge>
                      )}
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
                    {/* View Resume button */}
                    {isSelfView ? (
                      // Self-view mode - use resumeInfo
                      profileData?.resumeFileId ? (
                        <PDFViewer
                          fileId={profileData.resumeFileId}
                          fileName="resume.pdf"
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Resume
                          </Button>
                        </PDFViewer>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Eye className="w-4 h-4 mr-2" />
                          No Resume
                        </Button>
                      )
                    ) : (
                      // Other-view mode - use profileData.resumeFileId
                      profileData?.resumeFileId ? (
                        <PDFViewer
                          fileId={profileData.resumeFileId}
                          fileName="resume.pdf"
                        >
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Resume
                          </Button>
                        </PDFViewer>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Eye className="w-4 h-4 mr-2" />
                          No Resume
                        </Button>
                      )
                    )}
                    
                    {/* Upload/Replace Resume - only show in self-view mode */}
                    {isSelfView && (
                      <>
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
                              {resumeInfo?.data?.hasResume ? 'Replace Resume' : 'Upload Resume'}
                            </span>
                          </Button>
                        </label>
                      </>
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
              {isSelfView && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => toggleEdit('summary')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
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
                {isSelfView && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleEdit('contact')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
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
                      <span className="text-sm">{isSelfView ? user?.email : profileData?.userId?.email}</span>
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
                {isSelfView && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleEdit('skills')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!editingSections.has('skills') ? (
                    <>
                      <div className="flex flex-wrap gap-2 max-h-24 overflow-hidden relative">
                        {profile.skills.slice(0, 4).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {skill}
                          </Badge>
                        ))}
                        {/* Gradient fade effect if there are more skills */}
                        {profile.skills.length > 4 && (
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        )}
                      </div>
                      {profile.skills.length > 4 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllSkills(true)}
                          className="w-full text-sm text-muted-foreground hover:text-foreground"
                        >
                          See more ({profile.skills.length} skills total)
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {skill}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
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
                        <Button 
                          onClick={async () => {
                            try {
                              await updateProfile.mutate({
                                profile: {
                                  skills: profile.skills
                                }
                              });
                              toggleEdit('skills');
                            } catch (error) {
                              console.error('Error saving skills:', error);
                              toast({
                                title: 'Error',
                                description: 'Failed to save skills. Please try again.',
                                variant: 'destructive',
                              });
                            }
                          }} 
                          size="sm" 
                          disabled={updateProfile.loading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Reset skills to original state
                            if (profileData?.profile) {
                              setProfile(prev => ({
                                ...prev,
                                skills: profileData.profile.skills || []
                              }));
                            }
                            toggleEdit('skills');
                          }}
                        >
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
                {isSelfView && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleEdit('availability')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                )}
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
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
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
                              safeFormatDate(profile.availability.startDate, "PPP", "Pick a date")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={profile.availability.startDate instanceof Date ? profile.availability.startDate : new Date(profile.availability.startDate)}
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
                        {safeFormatDate(profile.availability.startDate, 'MMM dd, yyyy', 'N/A')}
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
              {isSelfView && (
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
              )}
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
                                <Label className="flex items-center gap-1">
                                  Position
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  value={exp.position}
                                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                  placeholder="Job title"
                                  className={!exp.position ? "border-red-200" : ""}
                                />
                                {!exp.position && (
                                  <p className="text-sm text-red-500 mt-1">Position is required</p>
                                )}
                              </div>
                              <div>
                                <Label className="flex items-center gap-1">
                                  Company
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                  placeholder="Company name"
                                  className={!exp.company ? "border-red-200" : ""}
                                />
                                {!exp.company && (
                                  <p className="text-sm text-red-500 mt-1">Company is required</p>
                                )}
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
                              <Label className="flex items-center gap-1">
                                Start Date
                                <span className="text-red-500">*</span>
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !exp.startDate && "border-red-200 text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {exp.startDate ? safeFormatDate(exp.startDate, 'MMMM yyyy', 'Pick a date') : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <MonthYearPicker
                                    value={exp.startDate}
                                    onChange={(date) => updateExperience(index, 'startDate', date)}
                                    maxDate={new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                              {!exp.startDate && (
                                <p className="text-sm text-red-500 mt-1">Start date is required</p>
                              )}
                            </div>
                            {!exp.current && (
                              <div>
                                <Label className="flex items-center gap-1">
                                  End Date
                                  <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !exp.endDate && "border-red-200 text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {exp.endDate ? safeFormatDate(exp.endDate, 'MMMM yyyy', 'Pick a date') : <span>Pick a date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <MonthYearPicker
                                      value={exp.endDate || new Date()}
                                      onChange={(date) => updateExperience(index, 'endDate', date)}
                                      minDate={exp.startDate}
                                      maxDate={new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                                {!exp.endDate && (
                                  <p className="text-sm text-red-500 mt-1">End date is required unless this is your current position</p>
                                )}
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={exp.current}
                                onCheckedChange={(checked) => {
                                  updateExperience(index, 'current', checked);
                                  if (checked) {
                                    updateExperience(index, 'endDate', undefined);
                                  }
                                }}
                              />
                              <Label>Current Position</Label>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="flex items-center gap-1">
                              Description
                              <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              rows={4}
                              placeholder="Describe your role, responsibilities, and achievements..."
                              className={!exp.description ? "border-red-200" : ""}
                            />
                            {!exp.description && (
                              <p className="text-sm text-red-500 mt-1">Description is required</p>
                            )}
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
                    onClick={addExperience}
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
                  <Button variant="outline" onClick={cancelExperience}>
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
              {isSelfView && (
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
              )}
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
                    onClick={addEducation}
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
                  <Button variant="outline" onClick={cancelEducation}>
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
              {isSelfView && (
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
              )}
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
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !cert.issueDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {cert.issueDate ? safeFormatDate(cert.issueDate, 'MMMM yyyy', 'Pick a date') : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <MonthYearPicker
                                    value={cert.issueDate || new Date()}
                                    onChange={(date) => updateCertification(index, 'issueDate', date)}
                                    maxDate={new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label>Expiry Date (Optional)</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !cert.expiryDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {cert.expiryDate ? safeFormatDate(cert.expiryDate, 'MMMM yyyy', 'Pick a date') : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <MonthYearPicker
                                    value={cert.expiryDate || new Date()}
                                    onChange={(date) => updateCertification(index, 'expiryDate', date)}
                                    minDate={cert.issueDate}
                                  />
                                </PopoverContent>
                              </Popover>
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
                            <span>Issued {safeFormatDate(cert.issueDate, 'MMM yyyy', 'N/A')}</span>
                            {cert.expiryDate && (
                              <>
                                <span>•</span>
                                <span>Expires {safeFormatDate(cert.expiryDate, 'MMM yyyy', 'N/A')}</span>
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
                    onClick={addCertification}
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
                  <Button variant="outline" onClick={cancelCertifications}>
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
              {isSelfView && (
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
              )}
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
                            {project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {project.technologies.map((tech, techIndex) => (
                                  <Badge key={techIndex} variant="secondary" className="text-sm">
                                    {tech}
                                    <button
                                      onClick={() => removeTechnology(index, tech)}
                                      className="ml-2 hover:text-red-500"
                                      type="button"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Input
                                value={newTechnology[index] || ''}
                                onChange={(e) => setNewTechnology(prev => ({ ...prev, [index]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTechnology(index);
                                  }
                                }}
                                placeholder="e.g., React, Node.js, Python"
                              />
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm"
                                onClick={() => addTechnology(index)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Start Date</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !project.startDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {project.startDate ? safeFormatDate(project.startDate, 'MMMM yyyy', 'Pick a date') : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <MonthYearPicker
                                    value={project.startDate || new Date()}
                                    onChange={(date) => updateProject(index, 'startDate', date)}
                                    maxDate={new Date()}
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            {!project.current && (
                              <div>
                                <Label>End Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !project.endDate && "text-muted-foreground"
                                      )}
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {project.endDate ? safeFormatDate(project.endDate, 'MMMM yyyy', 'Pick a date') : <span>Pick a date</span>}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <MonthYearPicker
                                      value={project.endDate || new Date()}
                                      onChange={(date) => updateProject(index, 'endDate', date)}
                                      minDate={project.startDate}
                                      maxDate={new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={project.current}
                                onCheckedChange={(checked) => {
                                  updateProject(index, 'current', checked);
                                  if (checked) {
                                    updateProject(index, 'endDate', undefined);
                                  }
                                }}
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
                    onClick={addProject}
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
                  <Button variant="outline" onClick={cancelProjects}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resume Upload Modal */}
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Resume</DialogTitle>
              <DialogDescription>
                Upload your resume in PDF or Word format.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col gap-4 sm:flex-row">
              {!showPostUpload ? (
                // Initial upload buttons
                <>
                  <Button variant="outline" onClick={() => {
                    setSelectedFile(null);
                    setShowPostUpload(false);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUploadResume}
                    disabled={uploadState !== 'idle'}
                  >
                    {uploadState === 'uploading' ? 'Uploading...' : 'Upload Resume'}
                  </Button>
                </>
              ) : (
                // Post-upload options
                <>
                  <div className="text-sm text-muted-foreground mb-2">
                    Would you like to update your profile with information from your resume?
                  </div>
                  <div className="flex gap-2">
                  <Button variant="outline" onClick={async () => {
                    await Promise.all([refetchResumeInfo(), refetch()]);
                    setSelectedFile(null);
                    setShowPostUpload(false);
                  }}>
                    No, Just Save
                  </Button>
                    <Button 
                      onClick={async () => {
                        setUploadState('parsing');
                        try {
                          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/files/resume/parse`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                            }
                          });
                          const data = await response.json();
                          if (data.data.parsedProfile) {
                            await Promise.all([refetchResumeInfo(), refetch()]);
                            setParsedProfile(data.data.parsedProfile);
                            setShowPreviewModal(true);
                            setSelectedFile(null);
                            setShowPostUpload(false);
                          }
                        } catch (error) {
                          toast({
                            title: 'Parsing Failed',
                            description: 'Failed to parse resume. Please try again.',
                            variant: 'destructive',
                          });
                        }
                        setUploadState('idle');
                      }}
                      disabled={uploadState !== 'idle'}
                    >
                      {uploadState === 'parsing' ? 'Parsing...' : 'Yes, Update Profile'}
                    </Button>
                  </div>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Resume Preview Modal */}
        {parsedProfile && profileData && (
          <ResumePreviewModal
            isOpen={showPreviewModal}
            onClose={() => {
              setShowPreviewModal(false);
              setParsedProfile(null);
              setUploadState('idle');
            }}
            parsedProfile={parsedProfile}
            currentProfile={profileData.profile}
            onApplyChanges={handleConfirmUpdate}
            isLoading={uploadState === 'parsing'}
          />
        )}

        {/* All Skills Modal */}
        <Dialog open={showAllSkills} onOpenChange={setShowAllSkills}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                All Skills ({profile.skills.length})
              </DialogTitle>
              <DialogDescription>
                Complete list of all skills
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-wrap gap-2 py-4">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-1.5 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAllSkills(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CandidateProfile;