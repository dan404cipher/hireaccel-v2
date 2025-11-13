import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  Users,
  Sparkles,
  Search,
  Loader2,
  UserPlus,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  useJobs, 
  useAgentCandidates,
  useMatchJobToCandidates,
  useMatchCandidateToJobs,
  useCreateCandidateAssignment,
} from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';

interface MatchResult {
  candidateId?: string;
  jobId?: string;
  matchScore: number;
  reasons: string[];
  strengths: string[];
  concerns: string[];
  candidate?: any;
  job?: any;
}

export default function AutoMatch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'job' | 'candidate'>('job');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [matchLimit, setMatchLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // For assignment dialog
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedMatchForAssignment, setSelectedMatchForAssignment] = useState<MatchResult | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assignmentPriority, setAssignmentPriority] = useState('medium');

  // API hooks
  const { 
    data: jobsResponse, 
    loading: jobsLoading, 
    refetch: refetchJobs 
  } = useJobs({
    page: 1,
    limit: 100,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Conditionally load candidates based on role
  // For agents, use agent-specific candidates; for admin/superadmin, we'll use a direct API call if needed
  // Note: The matching backend already handles role-based filtering, so this is just for the UI dropdown
  const { 
    data: candidatesResponse, 
    loading: candidatesLoading,
    refetch: refetchCandidates
  } = useAgentCandidates({
    page: 1,
    limit: 100,
    search: searchTerm || undefined,
  });

  const { mutate: matchJob, loading: matchingJob } = useMatchJobToCandidates({
    onSuccess: (data: any) => {
      setMatchResults(data?.data?.matches || []);
      toast({
        title: "Matching Complete",
        description: `Found ${data?.data?.matches?.length || 0} potential matches`,
      });
    },
    onError: () => {
      setMatchResults([]);
    }
  });

  const { mutate: matchCandidate, loading: matchingCandidate } = useMatchCandidateToJobs({
    onSuccess: (data: any) => {
      setMatchResults(data?.data?.matches || []);
      toast({
        title: "Matching Complete",
        description: `Found ${data?.data?.matches?.length || 0} potential matches`,
      });
    },
    onError: () => {
      setMatchResults([]);
    }
  });

  const { mutate: createAssignment, loading: createLoading } = useCreateCandidateAssignment({
    onSuccess: () => {
      setIsAssignDialogOpen(false);
      setSelectedMatchForAssignment(null);
      setAssignmentNotes('');
      setAssignmentPriority('medium');
      toast({
        title: "Success",
        description: "Candidate assigned successfully",
      });
      refetchJobs();
    }
  });

  const jobs = (jobsResponse as any)?.data || jobsResponse || [];
  const candidates = ((candidatesResponse as any)?.data || candidatesResponse || []);

  const filteredJobs = jobs.filter((job: any) => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCandidates = candidates.filter((candidate: any) =>
    candidate.userId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.userId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMatchJob = () => {
    if (!selectedJobId) {
      toast({
        title: "Error",
        description: "Please select a job",
        variant: "destructive",
      });
      return;
    }
    matchJob({ jobId: selectedJobId, limit: matchLimit });
  };

  const handleMatchCandidate = () => {
    if (!selectedCandidateId) {
      toast({
        title: "Error",
        description: "Please select a candidate",
        variant: "destructive",
      });
      return;
    }
    matchCandidate({ candidateId: selectedCandidateId, limit: matchLimit });
  };

  const handleAssignFromMatch = (match: MatchResult) => {
    if (!match.candidateId || !match.jobId) {
      toast({
        title: "Error",
        description: "Invalid match data",
        variant: "destructive",
      });
      return;
    }
    setSelectedMatchForAssignment(match);
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (!selectedMatchForAssignment?.candidateId || !selectedMatchForAssignment?.jobId) {
      return;
    }

    createAssignment({
      candidateId: selectedMatchForAssignment.candidateId,
      jobId: selectedMatchForAssignment.jobId,
      priority: assignmentPriority as any,
      notes: assignmentNotes || `AI Match Score: ${selectedMatchForAssignment.matchScore}%`,
    });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMatchScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Weak Match';
  };

  // Show skeleton loader when initial data is loading
  if (jobsLoading || candidatesLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-300 rounded w-48 animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 mb-6">
          <div className="h-10 w-48 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-300 rounded animate-pulse"></div>
        </div>

        {/* Card Skeleton */}
        <Card>
          <CardHeader>
            <div className="h-6 bg-gray-300 rounded w-64 animate-pulse mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-96 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-32 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-full animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-300 rounded w-48 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Auto Match
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'job' | 'candidate')} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="job" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Match Candidates to Job
          </TabsTrigger>
          <TabsTrigger value="candidate" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Match Jobs to Candidate
          </TabsTrigger>
        </TabsList>

        {/* Match Candidates to Job Tab */}
        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Job to Match</CardTitle>
              <CardDescription>
                Choose a job and find the best matching candidates using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label>Search Jobs</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label>Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter} className="mt-1">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Select Job</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a job..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredJobs.map((job: any) => (
                      <SelectItem key={job._id} value={job._id}>
                        {job.title} - {job.companyId?.name || 'Unknown'} ({job.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Match Limit</Label>
                  <Select value={matchLimit.toString()} onValueChange={(v) => setMatchLimit(Number(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Top 5 Matches</SelectItem>
                      <SelectItem value="10">Top 10 Matches</SelectItem>
                      <SelectItem value="20">Top 20 Matches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleMatchJob} 
                  disabled={!selectedJobId || matchingJob || jobsLoading}
                  className="mt-6"
                >
                  {matchingJob ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Matching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find Matches
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Match Results */}
          {matchResults.length > 0 && activeTab === 'job' && (
            <Card>
              <CardHeader>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>
                  AI-powered candidate matches sorted by compatibility score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchResults.map((match, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {match.candidate?.userId?.firstName} {match.candidate?.userId?.lastName}
                              </h3>
                              <Badge className={getMatchScoreColor(match.matchScore)}>
                                {match.matchScore}% Match
                              </Badge>
                              <Badge variant="outline">
                                {getMatchScoreBadge(match.matchScore)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {match.candidate?.userId?.email}
                            </p>
                            {match.candidate?.profile?.location && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {match.candidate.profile.location}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAssignFromMatch(match)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Strengths
                            </h4>
                            <ul className="text-sm space-y-1">
                              {match.strengths.map((strength, i) => (
                                <li key={i} className="text-muted-foreground">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              Reasons
                            </h4>
                            <ul className="text-sm space-y-1">
                              {match.reasons.map((reason, i) => (
                                <li key={i} className="text-muted-foreground">• {reason}</li>
                              ))}
                            </ul>
                          </div>
                          {match.concerns.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                Concerns
                              </h4>
                              <ul className="text-sm space-y-1">
                                {match.concerns.map((concern, i) => (
                                  <li key={i} className="text-muted-foreground">• {concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Match Jobs to Candidate Tab */}
        <TabsContent value="candidate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Candidate to Match</CardTitle>
              <CardDescription>
                Choose a candidate and find the best matching jobs using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Search Candidates</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Select Candidate</Label>
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a candidate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCandidates.map((candidate: any) => (
                      <SelectItem key={candidate._id} value={candidate._id}>
                        {candidate.userId?.firstName} {candidate.userId?.lastName} - {candidate.userId?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Match Limit</Label>
                  <Select value={matchLimit.toString()} onValueChange={(v) => setMatchLimit(Number(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">Top 5 Matches</SelectItem>
                      <SelectItem value="10">Top 10 Matches</SelectItem>
                      <SelectItem value="20">Top 20 Matches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleMatchCandidate} 
                  disabled={!selectedCandidateId || matchingCandidate || candidatesLoading}
                  className="mt-6"
                >
                  {matchingCandidate ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Matching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Find Matches
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Match Results */}
          {matchResults.length > 0 && activeTab === 'candidate' && (
            <Card>
              <CardHeader>
                <CardTitle>Match Results</CardTitle>
                <CardDescription>
                  AI-powered job matches sorted by compatibility score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {matchResults.map((match, index) => (
                    <Card key={index} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">
                                {match.job?.title}
                              </h3>
                              <Badge className={getMatchScoreColor(match.matchScore)}>
                                {match.matchScore}% Match
                              </Badge>
                              <Badge variant="outline">
                                {getMatchScoreBadge(match.matchScore)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                              {match.job?.companyId?.name && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {match.job.companyId.name}
                                </div>
                              )}
                              {match.job?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {match.job.location}
                                </div>
                              )}
                            </div>
                            {match.job?.salaryRange && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                {match.job.salaryRange.min?.toLocaleString()} - {match.job.salaryRange.max?.toLocaleString()} {match.job.salaryRange.currency}
                              </div>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAssignFromMatch(match)}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Assign
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              Strengths
                            </h4>
                            <ul className="text-sm space-y-1">
                              {match.strengths.map((strength, i) => (
                                <li key={i} className="text-muted-foreground">• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4 text-blue-600" />
                              Reasons
                            </h4>
                            <ul className="text-sm space-y-1">
                              {match.reasons.map((reason, i) => (
                                <li key={i} className="text-muted-foreground">• {reason}</li>
                              ))}
                            </ul>
                          </div>
                          {match.concerns.length > 0 && (
                            <div>
                              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                Concerns
                              </h4>
                              <ul className="text-sm space-y-1">
                                {match.concerns.map((concern, i) => (
                                  <li key={i} className="text-muted-foreground">• {concern}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Candidate to Job</DialogTitle>
            <DialogDescription>
              Create an assignment based on the AI match recommendation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedMatchForAssignment && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Match Score</span>
                  <Badge className={getMatchScoreColor(selectedMatchForAssignment.matchScore)}>
                    {selectedMatchForAssignment.matchScore}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedMatchForAssignment.reasons[0]}
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={assignmentPriority} onValueChange={setAssignmentPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this assignment..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmAssignment} disabled={createLoading} className="flex-1">
                {createLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  'Assign'
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

