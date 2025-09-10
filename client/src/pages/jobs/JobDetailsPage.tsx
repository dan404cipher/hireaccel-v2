import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Users,
  Briefcase,
  Calendar,
  Globe,
  GraduationCap,
  Languages,
  Award,
  Clock3,
  UserCheck,
  Edit,
  Trash2
} from "lucide-react";
import { useJob, useDeleteJob } from "@/hooks/useApi";
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

export default function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: jobResponse, loading, error } = useJob(jobId!);
  const job = jobResponse?.data || jobResponse;

  const { mutate: deleteJob, loading: deleteLoading } = useDeleteJob({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Job deleted successfully"
      });
      navigate("/dashboard/jobs");
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-success text-success-foreground";
      case "assigned": return "bg-info text-info-foreground";
      case "interview": return "bg-warning text-warning-foreground";
      case "closed": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      case "urgent": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatSalary = (job: any) => {
    if (job.salaryRange?.min && job.salaryRange?.max) {
      const currency = job.salaryRange.currency || 'USD';
      const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
      return `${symbol}${(job.salaryRange.min / 1000).toFixed(0)}k - ${symbol}${(job.salaryRange.max / 1000).toFixed(0)}k`;
    }
    return "Salary TBD";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      <div className="border-b bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="container mx-auto px-2 py-3 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {job.companyId?.logoUrl ? (
                  <img 
                    src={job.companyId.logoUrl} 
                    alt={`${job.companyId.name} logo`}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Building2 className={`w-16 h-16 text-blue-600 p-3 rounded-lg border-2 border-slate-200 bg-slate-50 ${job.companyId?.logoUrl ? 'hidden' : ''}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{job.title}</h1>
                <p className="text-blue-600 font-mono text-sm">{job.jobId || job._id || job.id}</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/jobs")}
                className="hover:bg-blue-50 text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/dashboard/jobs/${job.jobId || jobId}/edit`)}
                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Job
              </Button>
              {user?.role === 'hr' && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Job
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Overview */}
            <Card className="shadow-lg bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Job Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-700">Company:</span>
                    <span className="text-slate-600">{job.companyId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-700">Location:</span>
                    <span className="text-slate-600">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="font-medium text-slate-700">Type:</span>
                    <span className="capitalize text-slate-600">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-slate-700">Salary:</span>
                    <span className="text-slate-600">{formatSalary(job)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-700">Remote Work:</span>
                    <Badge variant={job.isRemote ? "default" : "secondary"} className={job.isRemote ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                      {job.isRemote ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  {job.applicationDeadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      <span className="font-medium text-slate-700">Deadline:</span>
                      <span className="text-slate-600">{formatDate(job.applicationDeadline)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card className="shadow-lg bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-700">Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {job.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status & Priority */}
            <Card className="shadow-lg bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-700">Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-slate-600 font-medium">Status</span>
                  <div className="mt-1">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 font-medium">Urgency</span>
                  <div className="mt-1">
                    <Badge className={getUrgencyColor(job.urgency)} variant="outline">
                      {job.urgency}
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 font-medium">Applications</span>
                  <div className="mt-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-slate-700">{job.applications || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Benefits & Perks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit: string, index: number) => (
                      <Badge key={index} variant="outline" className="border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <Card className="shadow-lg bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-700">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Experience Level */}
                <div>
                  <h4 className="font-semibold mb-2 text-slate-700">Experience Level</h4>
                  <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800 border-blue-200">
                    {job.requirements?.experience || 'N/A'}
                  </Badge>
                </div>

                {/* Skills */}
                {job.requirements?.skills && job.requirements.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-slate-700">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {job.requirements?.education && job.requirements.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      Education Requirements
                    </h4>
                    <ul className="space-y-1">
                      {job.requirements.education.map((edu: string, index: number) => (
                        <li key={index} className="text-sm text-slate-600">• {edu}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {job.requirements?.languages && job.requirements.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-700">
                      <Languages className="w-4 h-4 text-orange-600" />
                      Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.languages.map((language: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>


            {/* Interview Process */}
            {job.interviewProcess && (
              <Card className="shadow-lg bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Clock3 className="w-5 h-5 text-indigo-600" />
                    Interview Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-sm text-slate-600 font-medium">Rounds</span>
                    <div className="mt-1 font-medium text-slate-700">{job.interviewProcess.rounds}</div>
                  </div>
                  {job.interviewProcess.estimatedDuration && (
                    <div>
                      <span className="text-sm text-slate-600 font-medium">Timeline</span>
                      <div className="mt-1 font-medium text-slate-700">{job.interviewProcess.estimatedDuration}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dates */}
            <Card className="shadow-lg bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-700">Important Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600 font-medium">Posted</span>
                  <div className="mt-1 font-medium text-slate-700">
                    {job.postedAt ? formatDate(job.postedAt) : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 font-medium">Created</span>
                  <div className="mt-1 font-medium text-slate-700">
                    {job.createdAt ? formatDate(job.createdAt) : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 font-medium">Last Updated</span>
                  <div className="mt-1 font-medium text-slate-700">
                    {job.updatedAt ? formatDate(job.updatedAt) : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteJob(jobId!);
                setShowDeleteDialog(false);
              }}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
