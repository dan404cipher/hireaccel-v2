import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft,
  Save,
  X,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  UserCheck,
  Award,
  Calendar,
  Globe,
  GraduationCap,
  Languages
} from "lucide-react";
import { useJob, useUpdateJob } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function JobEditPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editFormData, setEditFormData] = useState<any>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});

  const { data: jobResponse, loading, error } = useJob(jobId!);
  const job = jobResponse?.data || jobResponse;

  const { mutate: updateJob, loading: updateLoading } = useUpdateJob({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job updated successfully"
      });
      navigate(`/dashboard/jobs/${jobId}`);
    },
    onError: (error: any) => {
      if (error.issues && Array.isArray(error.issues)) {
        const backendErrors: Record<string, string> = {};
        error.issues.forEach((issue: any) => {
          backendErrors[issue.field] = issue.message;
        });
        setEditFormErrors(backendErrors);
      } else {
        toast({
          title: "Error",
          description: error.detail || "Failed to update job",
          variant: "destructive"
        });
      }
    }
  });

  // Populate form when job data loads
  useEffect(() => {
    if (job) {
      setEditFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        type: job.type || 'full-time',
        urgency: job.urgency || 'medium',
        salaryMin: job.salaryRange?.min || '',
        salaryMax: job.salaryRange?.max || '',
        currency: job.salaryRange?.currency || 'USD',
        skills: job.requirements?.skills?.join(', ') || '',
        experienceMin: job.requirements?.experienceMin !== undefined ? String(job.requirements.experienceMin) : '',
        experienceMax: job.requirements?.experienceMax !== undefined ? String(job.requirements.experienceMax) : '',
        education: job.requirements?.education?.join(', ') || '',
        languages: job.requirements?.languages?.join(', ') || 'English',
        isRemote: job.isRemote || false,
        benefits: job.benefits?.join(', ') || '',
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        interviewRounds: job.interviewProcess?.rounds || 2,
        estimatedDuration: job.interviewProcess?.estimatedDuration || '2-3 weeks',
        status: job.status || 'open'
      });
      setEditFormErrors({});
    }
  }, [job]);

  const validateEditForm = () => {
    const errors: Record<string, string> = {};

    if (!editFormData.title?.trim()) {
      errors.title = 'Job title is required';
    } else if (editFormData.title.length > 200) {
      errors.title = 'Job title cannot exceed 200 characters';
    }

    if (!editFormData.description?.trim()) {
      errors.description = 'Job description is required';
    } else if (editFormData.description.length > 5000) {
      errors.description = 'Job description cannot exceed 5000 characters';
    }

    if (!editFormData.location?.trim()) {
      errors.location = 'Location is required';
    } else if (editFormData.location.length > 200) {
      errors.location = 'Location cannot exceed 200 characters';
    }

    if (!editFormData.skills?.trim()) {
      errors.skills = 'Required skills are needed';
    }

    if (editFormData.salaryMin && editFormData.salaryMax) {
      const min = parseInt(editFormData.salaryMin);
      const max = parseInt(editFormData.salaryMax);
      if (min > max) {
        errors.salaryMax = 'Maximum salary must be greater than minimum salary';
      }
    }

    if (editFormData.applicationDeadline) {
      const deadline = new Date(editFormData.applicationDeadline);
      const today = new Date();
      if (deadline <= today) {
        errors.applicationDeadline = 'Application deadline must be in the future';
      }
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateJob = () => {
    if (!validateEditForm()) {
      return;
    }

    const updateData = {
      title: editFormData.title.trim(),
      description: editFormData.description.trim(),
      location: editFormData.location.trim(),
      type: editFormData.type,
      urgency: editFormData.urgency,
      status: editFormData.status,
      salaryRange: {
        min: parseInt(editFormData.salaryMin) || 0,
        max: parseInt(editFormData.salaryMax) || 0,
        currency: editFormData.currency
      },
      requirements: {
        skills: editFormData.skills.split(',').map((s: string) => s.trim()).filter(Boolean),
        experienceMin: parseInt(editFormData.experienceMin) || 0,
        experienceMax: parseInt(editFormData.experienceMax) || 0,
        education: editFormData.education.split(',').map((s: string) => s.trim()).filter(Boolean),
        languages: editFormData.languages.split(',').map((s: string) => s.trim()).filter(Boolean)
      },
      isRemote: editFormData.isRemote,
      benefits: editFormData.benefits.split(',').map((s: string) => s.trim()).filter(Boolean),
      applicationDeadline: editFormData.applicationDeadline ? new Date(editFormData.applicationDeadline) : undefined,
      interviewProcess: {
        rounds: editFormData.interviewRounds,
        estimatedDuration: editFormData.estimatedDuration
      }
    };

    updateJob({ id: jobId!, data: updateData });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/dashboard/jobs/${jobId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Edit Job</h1>
                <p className="text-muted-foreground">{job.title}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/jobs/${jobId}`)}
                disabled={updateLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdateJob}
                disabled={updateLoading || !editFormData.title || !editFormData.description || !editFormData.location}
              >
                <Save className="w-4 h-4 mr-2" />
                {updateLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Job Title *</Label>
                    <Input 
                      id="edit-title" 
                      placeholder="e.g. Senior React Developer"
                      value={editFormData.title || ''}
                      onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                      className={editFormErrors.title ? "border-red-500" : ""}
                    />
                    {editFormErrors.title && (
                      <p className="text-sm text-red-500">{editFormErrors.title}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location *</Label>
                    <Input 
                      id="edit-location" 
                      placeholder="e.g. Remote, New York, NY"
                      value={editFormData.location || ''}
                      onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      className={editFormErrors.location ? "border-red-500" : ""}
                    />
                    {editFormErrors.location && (
                      <p className="text-sm text-red-500">{editFormErrors.location}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Job Type *</Label>
                    <Select 
                      value={editFormData.type || 'full-time'} 
                      onValueChange={(value) => setEditFormData({...editFormData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-urgency">Urgency Level</Label>
                    <Select 
                      value={editFormData.urgency || 'medium'} 
                      onValueChange={(value) => setEditFormData({...editFormData, urgency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      value={editFormData.status || 'open'} 
                      onValueChange={(value) => setEditFormData({...editFormData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Detailed Description *</Label>
                  <Textarea 
                    id="edit-description" 
                    placeholder="Enter detailed job description, responsibilities, and expectations..."
                    className={`min-h-[120px] ${editFormErrors.description ? "border-red-500" : ""}`}
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  />
                  {editFormErrors.description && (
                    <p className="text-sm text-red-500">{editFormErrors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-skills">Required Skills *</Label>
                    <Input 
                      id="edit-skills" 
                      placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                      value={editFormData.skills || ''}
                      onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})}
                      className={editFormErrors.skills ? "border-red-500" : ""}
                    />
                    {editFormErrors.skills && (
                      <p className="text-sm text-red-500">{editFormErrors.skills}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-experienceMin">Min Experience (years) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-experienceMin" 
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      value={editFormData.experienceMin || ''}
                      onChange={(e) => setEditFormData({...editFormData, experienceMin: e.target.value})}
                      className={editFormErrors.experienceMin ? "border-red-500" : ""}
                    />
                    {editFormErrors.experienceMin && (
                      <p className="text-sm text-red-500">{editFormErrors.experienceMin}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-experienceMax">Max Experience (years) <span className="text-red-500">*</span></Label>
                    <Input 
                      id="edit-experienceMax" 
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={editFormData.experienceMax || ''}
                      onChange={(e) => setEditFormData({...editFormData, experienceMax: e.target.value})}
                      className={editFormErrors.experienceMax ? "border-red-500" : ""}
                    />
                    {editFormErrors.experienceMax && (
                      <p className="text-sm text-red-500">{editFormErrors.experienceMax}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-education">Education Requirements</Label>
                    <Input 
                      id="edit-education" 
                      placeholder="e.g. Bachelor's in Computer Science (comma separated)"
                      value={editFormData.education || ''}
                      onChange={(e) => setEditFormData({...editFormData, education: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-languages">Languages</Label>
                    <Input 
                      id="edit-languages" 
                      placeholder="e.g. English, Spanish (comma separated)"
                      value={editFormData.languages || ''}
                      onChange={(e) => setEditFormData({...editFormData, languages: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compensation & Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Compensation & Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-salary-min">Minimum Salary</Label>
                    <Input 
                      id="edit-salary-min" 
                      type="number"
                      placeholder="e.g. 80000"
                      value={editFormData.salaryMin || ''}
                      onChange={(e) => setEditFormData({...editFormData, salaryMin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salary-max">Maximum Salary</Label>
                    <Input 
                      id="edit-salary-max" 
                      type="number"
                      placeholder="e.g. 120000"
                      value={editFormData.salaryMax || ''}
                      onChange={(e) => setEditFormData({...editFormData, salaryMax: e.target.value})}
                      className={editFormErrors.salaryMax ? "border-red-500" : ""}
                    />
                    {editFormErrors.salaryMax && (
                      <p className="text-sm text-red-500">{editFormErrors.salaryMax}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-currency">Currency</Label>
                    <Select value={editFormData.currency || 'USD'} onValueChange={(value) => setEditFormData({...editFormData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-benefits">Benefits & Perks</Label>
                  <Input 
                    id="edit-benefits" 
                    placeholder="e.g. Health insurance, 401k, Remote work, Flexible hours (comma separated)"
                    value={editFormData.benefits || ''}
                    onChange={(e) => setEditFormData({...editFormData, benefits: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Additional Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-application-deadline">Application Deadline</Label>
                    <Input 
                      id="edit-application-deadline" 
                      type="date"
                      value={editFormData.applicationDeadline || ''}
                      onChange={(e) => setEditFormData({...editFormData, applicationDeadline: e.target.value})}
                      className={editFormErrors.applicationDeadline ? "border-red-500" : ""}
                    />
                    {editFormErrors.applicationDeadline && (
                      <p className="text-sm text-red-500">{editFormErrors.applicationDeadline}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-interview-rounds">Interview Rounds</Label>
                    <Select value={(editFormData.interviewRounds || 2).toString()} onValueChange={(value) => setEditFormData({...editFormData, interviewRounds: parseInt(value)})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rounds" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Round</SelectItem>
                        <SelectItem value="2">2 Rounds</SelectItem>
                        <SelectItem value="3">3 Rounds</SelectItem>
                        <SelectItem value="4">4+ Rounds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estimated-duration">Estimated Hiring Timeline</Label>
                  <Select value={editFormData.estimatedDuration || '2-3 weeks'} onValueChange={(value) => setEditFormData({...editFormData, estimatedDuration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                      <SelectItem value="2-3 weeks">2-3 weeks</SelectItem>
                      <SelectItem value="3-4 weeks">3-4 weeks</SelectItem>
                      <SelectItem value="1-2 months">1-2 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-is-remote"
                    checked={editFormData.isRemote || false}
                    onChange={(e) => setEditFormData({...editFormData, isRemote: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="edit-is-remote">Remote work available</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{editFormData.title || 'Job Title'}</h3>
                  <p className="text-sm text-muted-foreground">{editFormData.location || 'Location'}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">{editFormData.type || 'Type'}</Badge>
                  <Badge variant="outline" className="capitalize">{editFormData.urgency || 'Urgency'}</Badge>
                  <Badge variant="outline" className="capitalize">{editFormData.status || 'Status'}</Badge>
                </div>
                {editFormData.skills && (
                  <div>
                    <p className="text-sm font-medium mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {editFormData.skills.split(',').slice(0, 3).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                      {editFormData.skills.split(',').length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{editFormData.skills.split(',').length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
