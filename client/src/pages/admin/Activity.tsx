import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Activity, 
  Search, 
  Filter,
  Calendar,
  User,
  FileText,
  Building2,
  Briefcase,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface AuditLog {
  _id: string;
  actor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    customId?: string;
  };
  after?: any;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  description?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
  businessProcess?: string;
}

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-800 border-green-200',
  update: 'bg-blue-100 text-blue-800 border-blue-200',
  delete: 'bg-red-100 text-red-800 border-red-200',
  read: 'bg-gray-100 text-gray-800 border-gray-200',
  login: 'bg-purple-100 text-purple-800 border-purple-200',
  logout: 'bg-orange-100 text-orange-800 border-orange-200',
  assign: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  upload: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  download: 'bg-teal-100 text-teal-800 border-teal-200',
  approve: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  reject: 'bg-rose-100 text-rose-800 border-rose-200',
  advance: 'bg-amber-100 text-amber-800 border-amber-200',
};

const entityIcons: Record<string, any> = {
  Job: Briefcase,
  User: User,
  Company: Building2,
  Candidate: Users,
  Application: FileText,
  Interview: Calendar,
  AgentAssignment: Users,
  CandidateAssignment: FileText,
};

const riskColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

export default function ActivityPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('all');
  
  const isHRUser = user?.role === 'hr';
  const isSuperAdmin = user?.role === 'superadmin';

  const navigateToUserProfile = (actorId: string, actorRole: string, customId?: string) => {
    switch (actorRole?.toLowerCase()) {
      case 'admin':
      case 'superadmin':
        navigate('/dashboard/admin-profile');
        break;
      case 'hr':
        navigate(`/dashboard/hr-profile/${customId || actorId}`);
        break;
      case 'candidate':
        navigate(`/dashboard/candidate-profile/${customId || actorId}`);
        break;
      case 'agent':
        // Agents might not have a dedicated profile page, navigate to dashboard
        navigate('/dashboard');
        break;
      default:
        // Try user management for other roles
        navigate('/dashboard/users');
    }
  };

  const navigateToJobDetails = (jobId: string, entityId: string) => {
    // Use jobId (like JOB00068) if available, otherwise use entityId
    const jobIdentifier = jobId || entityId;
    navigate(`/dashboard/jobs/${jobIdentifier}`);
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [page, entityTypeFilter, actionFilter, riskLevelFilter]);

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: page.toString(),
        limit: '100', // Fetch more to ensure we get major activities
      };

      // We don't filter on backend when "all" is selected
      // We'll filter on frontend to only show major CRUD operations

      if (riskLevelFilter !== 'all') {
        params.riskLevel = riskLevelFilter;
      }

      const response = await apiClient.getAuditLogs(params);
      
      if (response.data && Array.isArray(response.data)) {
        let filteredData = response.data;
        
        // For HR users, filter to only show relevant entity types
        if (isHRUser) {
          // HR users should only see: Job, Interview, CandidateAssignment, and Company (if they created it)
          const allowedEntityTypes = ['Job', 'Interview', 'CandidateAssignment', 'Company'];
          filteredData = filteredData.filter((log: AuditLog) => 
            allowedEntityTypes.includes(log.entityType)
          );
        }
        
        // For superadmin, show all activities without restrictive filtering
        if (isSuperAdmin) {
          // Apply entity type filter if specified
          if (entityTypeFilter !== 'all') {
            filteredData = filteredData.filter((log: AuditLog) => log.entityType === entityTypeFilter);
          }
          
          // Apply action filter if specified
          if (actionFilter !== 'all') {
            const actionLower = actionFilter.toLowerCase();
            filteredData = filteredData.filter((log: AuditLog) => log.action?.toLowerCase() === actionLower);
          }
          
          // Superadmin sees all activities, no further filtering needed
        } else {
          // For admin and other roles, filter to only major CRUD operations on important entities
          const majorEntities = ['Job', 'Company', 'Interview', 'Candidate', 'Application', 'User', 'AgentAssignment', 'CandidateAssignment'];
          const majorActions = ['create', 'update', 'delete']; // Use lowercase to match AuditAction enum values
          
          // Apply entity type filter if specified
          let entityFiltered = filteredData;
          if (entityTypeFilter !== 'all' && majorEntities.includes(entityTypeFilter)) {
            entityFiltered = filteredData.filter((log: AuditLog) => log.entityType === entityTypeFilter);
          } else {
            entityFiltered = filteredData.filter((log: AuditLog) => majorEntities.includes(log.entityType));
          }
          
          // For CandidateAssignment, only show when candidate status changed (filter out CREATE and other updates without status change)
          entityFiltered = entityFiltered.filter((log: AuditLog) => {
            if (log.entityType === 'CandidateAssignment') {
              // Only show if candidate status was changed (exclude CREATE and other updates)
              return log.metadata?.candidateStatusChanged === true;
            }
            return true;
          });
          
          // Apply action filter if specified (convert to lowercase)
          if (actionFilter !== 'all') {
            const actionLower = actionFilter.toLowerCase();
            filteredData = entityFiltered.filter((log: AuditLog) => log.action?.toLowerCase() === actionLower);
          } else {
            filteredData = entityFiltered.filter((log: AuditLog) => 
              log.action && majorActions.includes(log.action.toLowerCase())
            );
          }
        }
        
        setLogs(filteredData);
        // Recalculate pagination based on filtered results
        // Note: This is approximate since we're filtering client-side
        // A better solution would be to pass filters to backend for accurate counts
        setTotalPages(Math.max(1, Math.ceil(filteredData.length / 50)));
        setTotal(filteredData.length);
      } else {
        setLogs([]);
        setTotalPages(1);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      toast({
        title: "Error",
        description: error.message || error.detail || "Failed to fetch activity logs",
        variant: "destructive",
      });
      setLogs([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.actor?.firstName?.toLowerCase().includes(searchLower) ||
      log.actor?.lastName?.toLowerCase().includes(searchLower) ||
      log.actor?.email?.toLowerCase().includes(searchLower) ||
      log.entityType?.toLowerCase().includes(searchLower) ||
      log.description?.toLowerCase().includes(searchLower) ||
      log.businessProcess?.toLowerCase().includes(searchLower)
    );
  });

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  const getActionLabel = (action: string) => {
    if (!action) return '';
    return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
  };

  const getFormattedDescription = (log: AuditLog): React.ReactNode => {
    // Generate description based on entity type and metadata
    const actorName = log.actor?.firstName ? `${log.actor.firstName}${log.actor.lastName ? ' ' + log.actor.lastName : ''}` : 'User';
    const actionLabel = getActionLabel(log.action);
    
    switch (log.entityType) {
      case 'Job': {
        const jobTitle = log.metadata?.jobTitle || log.after?.title || 'a job';
        const jobId = log.metadata?.jobId || log.after?.jobId || '';
        const userCustomId = log.actor?.customId || '';
        const actorId = log.actor?._id || '';
        const actorRole = log.actor?.role || '';
        const actionVerb = log.action === 'create' ? 'created' : log.action === 'update' ? 'updated' : log.action === 'delete' ? 'deleted' : actionLabel;
        
        return (
          <>
            <span 
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" 
              onClick={() => navigateToUserProfile(actorId, actorRole, userCustomId)}
              title={`View ${actorName}'s profile`}
            >
              {actorName}
            </span>
            {userCustomId && (
              <span className="text-gray-500 ml-1">({userCustomId})</span>
            )}
            <span className="text-gray-700 ml-1">{actionVerb}</span>
            <span className="text-gray-700 ml-1">job</span>
            <span 
              className="font-semibold text-emerald-600 ml-1 hover:text-emerald-800 hover:underline cursor-pointer" 
              onClick={() => navigateToJobDetails(jobId, log.entityId)}
              title={`View job details: ${jobTitle}`}
            >
              "{jobTitle}"
            </span>
            {jobId && (
              <>
                <span className="text-gray-700 ml-1">(</span>
                <span className="text-purple-600 font-medium ml-1">Job ID:</span>
                <span 
                  className="text-purple-600 font-semibold ml-1 hover:text-purple-800 hover:underline cursor-pointer"
                  onClick={() => navigateToJobDetails(jobId, log.entityId)}
                  title={`View job details: ${jobId}`}
                >
                  {jobId}
                </span>
                <span className="text-gray-700">)</span>
              </>
            )}
          </>
        );
      }
        
      case 'Company': {
        const companyName = log.metadata?.companyName || log.after?.name || 'a company';
        return (
          <>
            <span className="font-semibold text-blue-600">{actorName}</span>
            <span className="text-gray-700 ml-1">{actionLabel}</span>
            <span className="text-gray-700 ml-1">company</span>
            <span className="font-semibold text-emerald-600 ml-1">"{companyName}"</span>
          </>
        );
      }
        
      case 'Interview': {
        const candidateName = log.metadata?.candidateName || 'a candidate';
        const candidateCustomId = log.metadata?.candidateCustomId || '';
        const jobTitle = log.metadata?.jobTitle || '';
        const jobId = log.metadata?.jobCustomId || '';
        const interviewType = log.metadata?.interviewType || log.after?.type || 'interview';
        const interviewRound = log.metadata?.interviewRound;
        const oldStatus = log.metadata?.oldStatus || '';
        const newStatus = log.metadata?.newStatus || '';
        const statusChanged = log.metadata?.statusChanged || false;
        const oldScheduledAt = log.metadata?.oldScheduledAt;
        const newScheduledAt = log.metadata?.newScheduledAt;
        const scheduledAtChanged = log.metadata?.scheduledAtChanged || false;
        const actorId = log.actor?._id || '';
        const actorRole = log.actor?.role || '';
        const userCustomId = log.actor?.customId || '';
        
        // Determine action verb based on what happened
        let actionVerb = actionLabel.toLowerCase();
        if (log.action === 'create') {
          actionVerb = 'scheduled';
        } else if (statusChanged) {
          actionVerb = 'changed status of';
        } else if (scheduledAtChanged) {
          actionVerb = 'rescheduled';
        } else if (log.action === 'delete') {
          actionVerb = 'deleted';
        }
        
        return (
          <>
            <span 
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" 
              onClick={() => navigateToUserProfile(actorId, actorRole, userCustomId)}
              title={`View ${actorName}'s profile`}
            >
              {actorName}
            </span>
            {userCustomId && (
              <span className="text-gray-500 ml-1">({userCustomId})</span>
            )}
            <span className="text-gray-700 ml-1">{actionVerb}</span>
            <span className="text-gray-700 ml-1">{interviewType}</span>
            {interviewRound && (
              <span className="text-gray-700 ml-1">(Round {interviewRound})</span>
            )}
            <span className="text-gray-700 ml-1">interview for candidate</span>
            <span 
              className="font-semibold text-emerald-600 ml-1 hover:text-emerald-800 hover:underline cursor-pointer"
              onClick={() => {
                if (candidateCustomId) {
                  navigate(`/dashboard/candidates/${candidateCustomId}`);
                } else if (log.metadata?.candidateId) {
                  navigate(`/dashboard/candidates/${log.metadata.candidateId}`);
                }
              }}
              title={`View ${candidateName}'s profile`}
            >
              {candidateName}
            </span>
            {candidateCustomId && (
              <span className="text-gray-500 ml-1">({candidateCustomId})</span>
            )}
            {statusChanged && (
              <>
                <span className="text-gray-700 ml-1">status from</span>
                <span className="text-orange-600 font-medium ml-1">"{oldStatus}"</span>
                <span className="text-gray-700 ml-1">to</span>
                <span className="text-green-600 font-medium ml-1">"{newStatus}"</span>
              </>
            )}
            {scheduledAtChanged && oldScheduledAt && newScheduledAt && (
              <>
                <span className="text-gray-700 ml-1">from</span>
                <span className="text-purple-600 font-medium ml-1">{new Date(oldScheduledAt).toLocaleString()}</span>
                <span className="text-gray-700 ml-1">to</span>
                <span className="text-purple-600 font-medium ml-1">{new Date(newScheduledAt).toLocaleString()}</span>
              </>
            )}
            {jobTitle && jobTitle !== 'N/A' && (
              <>
                <span className="text-gray-700 ml-1">for job</span>
                <span 
                  className="font-semibold text-purple-600 ml-1 hover:text-purple-800 hover:underline cursor-pointer"
                  onClick={() => navigateToJobDetails(jobId, log.metadata?.jobId)}
                  title={`View job: ${jobTitle}`}
                >
                  "{jobTitle}"
                </span>
                {jobId && (
                  <span className="text-gray-500 ml-1">({jobId})</span>
                )}
              </>
            )}
          </>
        );
      }
        
      case 'Candidate': {
        const candidateName = log.metadata?.candidateName || log.after?.userId?.firstName || 'a candidate';
        return (
          <>
            <span className="font-semibold text-blue-600">{actorName}</span>
            <span className="text-gray-700 ml-1">{actionLabel}</span>
            <span className="text-gray-700 ml-1">candidate</span>
            <span className="font-semibold text-emerald-600 ml-1">"{candidateName}"</span>
          </>
        );
      }
        
      case 'User': {
        const userName = log.metadata?.userName || log.after?.firstName || 'a user';
        return (
          <>
            <span className="font-semibold text-blue-600">{actorName}</span>
            <span className="text-gray-700 ml-1">{actionLabel}</span>
            <span className="text-gray-700 ml-1">user</span>
            <span className="font-semibold text-emerald-600 ml-1">"{userName}"</span>
          </>
        );
      }
        
      case 'AgentAssignment': {
        const agentName = log.metadata?.agentName || 'an agent';
        const agentCustomId = log.metadata?.agentCustomId || '';
        const assignedByName = log.metadata?.assignedByName || actorName;
        const assignedByCustomId = log.metadata?.assignedByCustomId || log.actor?.customId || '';
        
        // Determine what to display based on action
        const isUpdate = log.action === 'update';
        const isDelete = log.action === 'delete';
        const isRemoval = isUpdate && (log.metadata?.removedHRIds?.length > 0 || log.metadata?.removedCandidateIds?.length > 0);
        
        // For removal (UPDATE with removed items), show removed ones
        // For UPDATE with new assignments, show newly assigned ones
        // For CREATE actions, show all assigned ones (since everything is new)
        const hrCount = isRemoval 
          ? (log.metadata?.removedHRIds?.length || 0)
          : isUpdate 
            ? (log.metadata?.newHRCount || 0) 
            : (log.metadata?.hrCount || log.metadata?.totalHRCount || 0);
        const candidateCount = isRemoval 
          ? (log.metadata?.removedCandidateIds?.length || 0)
          : isUpdate 
            ? (log.metadata?.newCandidateCount || 0) 
            : (log.metadata?.candidateCount || log.metadata?.totalCandidateCount || 0);
        
        const hrNames = isRemoval ? (log.metadata?.removedHRNames || '') : (log.metadata?.hrNames || '');
        const candidateNames = isRemoval ? (log.metadata?.removedCandidateNames || '') : (log.metadata?.candidateNames || '');
        
        let actionVerb = 'updated assignment for';
        if (log.action === 'create') {
          actionVerb = 'assigned';
        } else if (isDelete) {
          actionVerb = 'deleted assignment for';
        } else if (isRemoval) {
          actionVerb = 'removed';
        } else if (isUpdate) {
          actionVerb = 'updated assignment for';
        }
        const actorId = log.actor?._id || '';
        const actorRole = log.actor?.role || '';
        const userCustomId = log.actor?.customId || '';
        
        return (
          <>
            <span 
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" 
              onClick={() => navigateToUserProfile(actorId, actorRole, userCustomId)}
              title={`View ${assignedByName}'s profile`}
            >
              {assignedByName}
            </span>
            {assignedByCustomId && (
              <span className="text-gray-500 ml-1">({assignedByCustomId})</span>
            )}
            <span className="text-gray-700 ml-1">{actionVerb}</span>
            {!isRemoval && (
              <>
                <span className="text-gray-700 ml-1">agent</span>
                <span 
                  className="font-semibold text-emerald-600 ml-1 hover:text-emerald-800 hover:underline cursor-pointer"
                  onClick={() => {
                    const agentId = log.metadata?.agentId;
                    if (agentId) {
                      navigate(`/dashboard/users/${agentId}`);
                    }
                  }}
                  title={`View agent profile: ${agentName}`}
                >
                  {agentName}
                </span>
                {agentCustomId && (
                  <span className="text-gray-500 ml-1">({agentCustomId})</span>
                )}
                <span className="text-gray-700 ml-1">-</span>
              </>
            )}
            {(hrCount > 0 || candidateCount > 0) && (
              <>
                {hrCount > 0 && (
                  <span className="text-purple-600 font-medium ml-1">
                    HR: {' '}
                    {(() => {
                      // For removals, use removedHRDetails, otherwise use hrDetails
                      const hrDetails = isRemoval 
                        ? (log.metadata?.removedHRDetails || [])
                        : (log.metadata?.hrDetails || []);
                      if (hrDetails.length > 0) {
                        return hrDetails.map((hr: any, index: number) => (
                          <span key={hr.id || index}>
                            <span 
                              className="text-purple-700 hover:text-purple-900 hover:underline cursor-pointer font-semibold"
                              onClick={() => {
                                // Navigate to HR profile using customId if available, otherwise use ID
                                if (hr.customId) {
                                  navigate(`/dashboard/hr-profile/${hr.customId}`);
                                } else if (hr.id) {
                                  navigate(`/dashboard/hr-profile/${hr.id}`);
                                }
                              }}
                              title={`View ${hr.name}'s profile`}
                            >
                              {hr.name}
                            </span>
                            {hr.customId && (
                              <span className="text-gray-500 ml-1">({hr.customId})</span>
                            )}
                            {index < hrDetails.length - 1 && <span className="text-gray-700">, </span>}
                          </span>
                        ));
                      } else if (hrNames) {
                        // Fallback to comma-separated names if hrDetails not available
                        return <span className="text-purple-700">{hrNames}</span>;
                      }
                      return null;
                    })()}
                  </span>
                )}
                {hrCount > 0 && candidateCount > 0 && (
                  <span className="text-gray-700 ml-1">,</span>
                )}
                {candidateCount > 0 && (
                  <span className="text-indigo-600 font-medium ml-1">
                    Candidates: {' '}
                    {(() => {
                      // For removals, use removedCandidateDetails, otherwise use candidateDetails
                      const candidateDetails = isRemoval 
                        ? (log.metadata?.removedCandidateDetails || [])
                        : (log.metadata?.candidateDetails || []);
                      if (candidateDetails.length > 0) {
                        return candidateDetails.map((candidate: any, index: number) => (
                          <span key={candidate.id || index}>
                            <span 
                              className="text-indigo-700 hover:text-indigo-900 hover:underline cursor-pointer font-semibold"
                              onClick={() => {
                                // Navigate to candidate profile using customId if available, otherwise use ID
                                if (candidate.customId) {
                                  navigate(`/dashboard/candidates/${candidate.customId}`);
                                } else if (candidate.id) {
                                  navigate(`/dashboard/candidates/${candidate.id}`);
                                }
                              }}
                              title={`View ${candidate.name}'s profile`}
                            >
                              {candidate.name}
                            </span>
                            {candidate.customId && (
                              <span className="text-gray-500 ml-1">({candidate.customId})</span>
                            )}
                            {index < candidateDetails.length - 1 && <span className="text-gray-700">, </span>}
                          </span>
                        ));
                      } else if (candidateNames) {
                        // Fallback to comma-separated names if candidateDetails not available
                        return <span className="text-indigo-700">{candidateNames}</span>;
                      }
                      return null;
                    })()}
                  </span>
                )}
                {isRemoval && (
                  <>
                    <span className="text-gray-700 ml-1">from agent</span>
                    <span 
                      className="font-semibold text-emerald-600 ml-1 hover:text-emerald-800 hover:underline cursor-pointer"
                      onClick={() => {
                        const agentId = log.metadata?.agentId;
                        if (agentId) {
                          navigate(`/dashboard/users/${agentId}`);
                        }
                      }}
                      title={`View agent profile: ${agentName}`}
                    >
                      {agentName}
                    </span>
                    {agentCustomId && (
                      <span className="text-gray-500 ml-1">({agentCustomId})</span>
                    )}
                  </>
                )}
              </>
            )}
            {isRemoval && hrCount === 0 && candidateCount === 0 && (
              <>
                <span className="text-gray-700 ml-1">from agent</span>
                <span 
                  className="font-semibold text-emerald-600 ml-1 hover:text-emerald-800 hover:underline cursor-pointer"
                  onClick={() => {
                    const agentId = log.metadata?.agentId;
                    if (agentId) {
                      navigate(`/dashboard/users/${agentId}`);
                    }
                  }}
                  title={`View agent profile: ${agentName}`}
                >
                  {agentName}
                </span>
                {agentCustomId && (
                  <span className="text-gray-500 ml-1">({agentCustomId})</span>
                )}
              </>
            )}
          </>
        );
      }

      case 'CandidateAssignment': {
        const candidateName = log.metadata?.candidateName || 'a candidate';
        const candidateCustomId = log.metadata?.candidateCustomId || '';
        const jobTitle = log.metadata?.jobTitle || '';
        const jobId = log.metadata?.jobCustomId || '';
        const oldCandidateStatus = log.metadata?.oldCandidateStatus || '';
        const newCandidateStatus = log.metadata?.newCandidateStatus || '';
        const candidateStatusChanged = log.metadata?.candidateStatusChanged || false;
        const oldStatus = log.metadata?.oldStatus || '';
        const newStatus = log.metadata?.newStatus || '';
        const statusChanged = log.metadata?.statusChanged || false;
        const actorId = log.actor?._id || '';
        const actorRole = log.actor?.role || '';
        const userCustomId = log.actor?.customId || '';
        
        return (
          <>
            <span 
              className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer" 
              onClick={() => navigateToUserProfile(actorId, actorRole, userCustomId)}
              title={`View ${actorName}'s profile`}
            >
              {actorName}
            </span>
            {userCustomId && (
              <span className="text-gray-500 ml-1">({userCustomId})</span>
            )}
            <span className="text-gray-700 ml-1">
              {candidateStatusChanged ? 'changed' : statusChanged ? 'updated' : actionLabel.toLowerCase()}
            </span>
            <span className="text-gray-700 ml-1">candidate</span>
            <span 
              className="font-semibold text-emerald-600 ml-1 hover:text-emerald-800 hover:underline cursor-pointer"
              onClick={() => {
                if (candidateCustomId) {
                  navigate(`/dashboard/candidates/${candidateCustomId}`);
                } else if (log.metadata?.candidateId) {
                  navigate(`/dashboard/candidates/${log.metadata.candidateId}`);
                }
              }}
              title={`View ${candidateName}'s profile`}
            >
              {candidateName}
            </span>
            {candidateCustomId && (
              <span className="text-gray-500 ml-1">({candidateCustomId})</span>
            )}
            {candidateStatusChanged && (
              <>
                <span className="text-gray-700 ml-1">status from</span>
                <span className="text-orange-600 font-medium ml-1">"{oldCandidateStatus}"</span>
                <span className="text-gray-700 ml-1">to</span>
                <span className="text-green-600 font-medium ml-1">"{newCandidateStatus}"</span>
              </>
            )}
            {jobTitle && jobTitle !== 'N/A' && (
              <>
                <span className="text-gray-700 ml-1">for job</span>
                <span 
                  className="font-semibold text-purple-600 ml-1 hover:text-purple-800 hover:underline cursor-pointer"
                  onClick={() => navigateToJobDetails(jobId, log.metadata?.jobId)}
                  title={`View job: ${jobTitle}`}
                >
                  "{jobTitle}"
                </span>
                {jobId && (
                  <span className="text-gray-500 ml-1">({jobId})</span>
                )}
              </>
            )}
          </>
        );
      }
        
      default: {
        return (
          <>
            <span className="font-semibold text-blue-600">{actorName}</span>
            <span className="text-gray-700 ml-1">{actionLabel}</span>
            <span className="text-gray-700 ml-1">{log.entityType}</span>
          </>
        );
      }
    }
  };

  const EntityIcon = ({ entityType }: { entityType: string }) => {
    const Icon = entityIcons[entityType] || Info;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
        <CardContent className="p-0">
          {/* Filters */}
          <div className="p-6 border-b bg-gradient-to-r from-slate-100 to-gray-100">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">{isSuperAdmin ? "Filter Activities" : "Filter Major Activities"}</h3>
              </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                      <Input
                        placeholder="Search activities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                      <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                        <SelectValue placeholder="Entity Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Entity Types</SelectItem>
                        <SelectItem value="Job">Job</SelectItem>
                        {!isHRUser && <SelectItem value="User">User</SelectItem>}
                        <SelectItem value="Company">Company</SelectItem>
                        {!isHRUser && <SelectItem value="Candidate">Candidate</SelectItem>}
                        {!isHRUser && <SelectItem value="Application">Application</SelectItem>}
                        <SelectItem value="Interview">Interview</SelectItem>
                        {!isHRUser && <SelectItem value="AgentAssignment">Agent Assignment</SelectItem>}
                        <SelectItem value="CandidateAssignment">Candidate Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                        <SelectValue placeholder="Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        {isSuperAdmin && (
                          <>
                            <SelectItem value="read">Read</SelectItem>
                            <SelectItem value="login">Login</SelectItem>
                            <SelectItem value="logout">Logout</SelectItem>
                            <SelectItem value="upload">Upload</SelectItem>
                            <SelectItem value="download">Download</SelectItem>
                            <SelectItem value="approve">Approve</SelectItem>
                            <SelectItem value="reject">Reject</SelectItem>
                            <SelectItem value="assign">Assign</SelectItem>
                            <SelectItem value="advance">Advance</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setEntityTypeFilter('all');
                        setActionFilter('all');
                      }}
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      Clear Filters
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                    <Info className="h-4 w-4 inline mr-2" />
                    {isHRUser 
                      ? "Showing your major activities: Jobs you created/updated, Interviews you scheduled, and related activities."
                      : isSuperAdmin
                      ? "Showing all activities: Complete audit trail of all system activities including all entity types and actions."
                      : "Showing major activities: Job creation/updates, Interview scheduling, User management, Company changes, and Application updates."}
                  </div>
                </div>
              </div>

              {/* Activity Table */}
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="relative overflow-x-auto">
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredLogs.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                No major activities found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredLogs.map((log) => (
                              <TableRow key={log._id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{formatTimestamp(log.timestamp)}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <div className="font-medium">
                                        {log.actor?.firstName} {log.actor?.lastName}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {log.actor?.email}
                                      </div>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {log.actor?.role}
                                      </Badge>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={actionColors[log.action?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800'}>
                                    {getActionLabel(log.action)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <EntityIcon entityType={log.entityType} />
                                    <span className="font-medium">{log.entityType}</span>
                                  </div>
                                  {log.businessProcess && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {log.businessProcess}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-md flex items-center flex-wrap gap-1">
                                    {getFormattedDescription(log)}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1 || loading}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-4">
                          Page {page} of {totalPages} • Showing {filteredLogs.length} of {total} activities
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages || loading}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
        </CardContent>
      </Card>
    </div>
  );
}

