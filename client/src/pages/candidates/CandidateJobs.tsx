import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2,
  Briefcase,
  Eye,
  Send,
  Heart,
  HeartIcon,
  BookmarkIcon,
  ExternalLink
} from 'lucide-react';
import { useJobs, useCreateApplication } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: {
    skills: string[];
    experience: string;
    education: string[];
    languages: string[];
  };
  location: string;
  type: string;
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
  companyId: {
    name: string;
    industry?: string;
    size?: string;
  };
  urgency: string;
  status: string;
  postedAt: string;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

const CandidateJobs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  const { user } = useAuth();

  // API calls
  const { data: jobsData, loading, refetch } = useJobs({
    page: currentPage,
    limit: 20,
    search: searchTerm || undefined,
    status: 'open', // Only show open jobs for candidates
    sortBy: 'postedAt',
    sortOrder: 'desc'
  });

  const createApplication = useCreateApplication({
    onSuccess: () => {
      toast({
        title: 'Application Submitted!',
        description: 'Your application has been submitted successfully.',
      });
      setIsViewDialogOpen(false);
    }
  });

  // Handle both possible response formats
  const jobs = Array.isArray(jobsData) ? jobsData : (jobsData as any)?.data || [];
  const meta = Array.isArray(jobsData) ? {} : (jobsData as any)?.meta || {};

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter((job: Job) => {
      const matchesLocation = locationFilter === 'all' || 
        job.location.toLowerCase().includes(locationFilter.toLowerCase()) ||
        (locationFilter === 'remote' && job.location.toLowerCase().includes('remote'));
      
      const matchesType = typeFilter === 'all' || job.type === typeFilter;
      
      const matchesExperience = experienceFilter === 'all' || 
        job.requirements.experience === experienceFilter;

      return matchesLocation && matchesType && matchesExperience;
    });
  }, [jobs, locationFilter, typeFilter, experienceFilter]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full_time': return 'bg-green-100 text-green-800';
      case 'part_time': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'internship': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'full_time': return 'Full Time';
      case 'part_time': return 'Part Time';
      case 'contract': return 'Contract';
      case 'internship': return 'Internship';
      default: return type;
    }
  };

  const formatSalary = (salaryRange: any) => {
    if (!salaryRange || !salaryRange.min || !salaryRange.max) return 'Salary not disclosed';
    return `${salaryRange.currency} ${salaryRange.min.toLocaleString()} - ${salaryRange.max.toLocaleString()}`;
  };

  const handleApplyToJob = (job: Job) => {
    if (!user) return;
    
    createApplication.mutate({
      candidateId: user.id,
      jobId: job._id,
      source: 'candidate_portal'
    });
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSaved = new Set(prev);
      if (newSaved.has(jobId)) {
        newSaved.delete(jobId);
        toast({ title: 'Job removed from saved jobs' });
      } else {
        newSaved.add(jobId);
        toast({ title: 'Job saved for later' });
      }
      return newSaved;
    });
  };

  const renderJobCard = (job: Job) => {
    const isJobSaved = savedJobs.has(job._id);
    
    return (
      <Card key={job._id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span className="mr-4">{job.companyId.name}</span>
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{job.location}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaveJob(job._id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  {isJobSaved ? (
                    <Heart className="w-4 h-4 fill-current text-red-500" />
                  ) : (
                    <Heart className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getTypeColor(job.type)}>
                  {formatJobType(job.type)}
                </Badge>
                <Badge className={getUrgencyColor(job.urgency)}>
                  {job.urgency}
                </Badge>
                {job.requirements.experience && (
                  <Badge variant="outline">
                    {job.requirements.experience} level
                  </Badge>
                )}
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {job.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {job.requirements.skills.slice(0, 5).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {job.requirements.skills.length > 5 && (
                  <Badge variant="secondary" className="text-xs">
                    +{job.requirements.skills.length - 5} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{formatSalary(job.salaryRange)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Posted {formatDistanceToNow(new Date(job.postedAt))} ago</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedJob(job);
                setIsViewDialogOpen(true);
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => handleApplyToJob(job)}
              disabled={createApplication.loading}
            >
              <Send className="w-4 h-4 mr-2" />
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
          <p className="text-gray-600 mt-1">
            Discover and apply to job opportunities that match your skills
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="san francisco">San Francisco</SelectItem>
                <SelectItem value="new york">New York</SelectItem>
                <SelectItem value="austin">Austin</SelectItem>
                <SelectItem value="seattle">Seattle</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full_time">Full Time</SelectItem>
                <SelectItem value="part_time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
            <Select value={experienceFilter} onValueChange={setExperienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading jobs...' : `${filteredJobs.length} jobs found`}
        </p>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-2">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">No jobs found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search criteria to find more opportunities.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map(renderJobCard)}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm">
            Page {currentPage} of {meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Job Details Dialog */}
      {selectedJob && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{selectedJob.title}</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center gap-4 -mt-2 mb-6">
              <div className="flex items-center text-gray-600">
                <Building2 className="w-4 h-4 mr-1" />
                {selectedJob.companyId.name}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                {selectedJob.location}
              </div>
              <Badge className={getTypeColor(selectedJob.type)}>
                {formatJobType(selectedJob.type)}
              </Badge>
            </div>
            
            <div className="space-y-6">
              {/* Job Overview */}
              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="text-gray-600 whitespace-pre-line">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold mb-2">Requirements</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Skills:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedJob.requirements.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Experience Level:</span>
                    <span className="ml-2">{selectedJob.requirements.experience}</span>
                  </div>
                  {selectedJob.requirements.education.length > 0 && (
                    <div>
                      <span className="font-medium">Education:</span>
                      <ul className="ml-2 list-disc list-inside">
                        {selectedJob.requirements.education.map((edu, index) => (
                          <li key={index}>{edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Compensation */}
              <div>
                <h4 className="font-semibold mb-2">Compensation</h4>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{formatSalary(selectedJob.salaryRange)}</span>
                </div>
              </div>

              {/* Company Info */}
              <div>
                <h4 className="font-semibold mb-2">About the Company</h4>
                <div className="space-y-1">
                  <div><strong>Industry:</strong> {selectedJob.companyId.industry || 'Not specified'}</div>
                  <div><strong>Company Size:</strong> {selectedJob.companyId.size || 'Not specified'}</div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => toggleSaveJob(selectedJob._id)}
                >
                  {savedJobs.has(selectedJob._id) ? (
                    <>
                      <Heart className="w-4 h-4 mr-2 fill-current text-red-500" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Save Job
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleApplyToJob(selectedJob)}
                  disabled={createApplication.loading}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CandidateJobs;
