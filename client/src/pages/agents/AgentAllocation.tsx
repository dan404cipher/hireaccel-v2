// 🔥 FORCE REFRESH - UPDATED CODE VERSION 🔥
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  UserPlus, 
  Edit, 
  Eye, 
  Users, 
  UserCheck, 
  Mail,
  CheckSquare,
  Save,
  Trash2,
  MoreHorizontal,
  ArrowUpDown
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useUsers, useAgentAssignmentsList, useCreateAgentAssignment, useRemoveFromAgentAssignment } from '../../hooks/useApi';
import { User } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface ExtendedUser extends User {
  _id: string; // MongoDB ObjectId as string
  candidateId?: string; // The ID of the candidate document for users with role 'candidate'
}
import { useToast } from '../../hooks/use-toast';

// Helper function to format last login
const formatLastLogin = (lastLogin: string | null) => {
  if (!lastLogin) return 'Never';
  return new Date(lastLogin).toLocaleDateString();
};

// Sort options
type SortOption = 'name-asc' | 'name-desc' | 'email-asc' | 'email-desc' | 'login-newest' | 'login-oldest';

// Consistent resource sorting
const sortResources = <T extends { firstName: string; lastName: string; email: string; lastLoginAt?: string | null; _id?: string }>(
  items: T[],
  sortOption: SortOption = 'name-asc'
): T[] => {
  return [...items].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        const firstAsc = a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' });
        if (firstAsc !== 0) return firstAsc;
        const lastAsc = a.lastName.localeCompare(b.lastName, undefined, { sensitivity: 'base' });
        if (lastAsc !== 0) return lastAsc;
        return a.email.localeCompare(b.email, undefined, { sensitivity: 'base' });
      
      case 'name-desc':
        const firstDesc = b.firstName.localeCompare(a.firstName, undefined, { sensitivity: 'base' });
        if (firstDesc !== 0) return firstDesc;
        const lastDesc = b.lastName.localeCompare(a.lastName, undefined, { sensitivity: 'base' });
        if (lastDesc !== 0) return lastDesc;
        return b.email.localeCompare(a.email, undefined, { sensitivity: 'base' });
      
      case 'email-asc':
        return a.email.localeCompare(b.email, undefined, { sensitivity: 'base' });
      
      case 'email-desc':
        return b.email.localeCompare(a.email, undefined, { sensitivity: 'base' });
      
      case 'login-newest':
        const aTime = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const bTime = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return bTime - aTime;
      
      case 'login-oldest':
        const aTimeOld = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
        const bTimeOld = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
        return aTimeOld - bTimeOld;
      
      default:
        return 0;
    }
  });
};

interface AgentAssignment {
  _id: string;
  agentId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedHRs: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  assignedCandidates: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  notes?: string;
}

export default function AgentAllocation(): React.JSX.Element {
  // AgentAllocation component rendering
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'hr' | 'candidate'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [allocationTab, setAllocationTab] = useState<'allocated' | 'not-allocated'>('not-allocated');
  const [selectedResource, setSelectedResource] = useState<ExtendedUser | null>(null);
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const { toast } = useToast();

  // Fetch users data - only active users
  const { 
    data: usersResponse, 
    loading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useUsers({
    limit: 100,
    status: 'active', // Only fetch active users
  });

  // Fetch agent assignments
  const {
    data: assignmentsResponse,
    loading: assignmentsLoading,
    error: assignmentsError,
    refetch: refetchAssignments
  } = useAgentAssignmentsList();


  // API hooks for assignment operations
  const { mutate: createAgentAssignment } = useCreateAgentAssignment();

  const { mutate: removeFromAgentAssignment } = useRemoveFromAgentAssignment();

  // Handle response format
  const users = Array.isArray(usersResponse) ? usersResponse : ((usersResponse as any)?.data || []);
  const assignments = Array.isArray(assignmentsResponse) ? assignmentsResponse : ((assignmentsResponse as any)?.data || []);

  // Filter users by role - cast to ExtendedUser[] since users from API have _id
  const agents = sortResources((users.filter(user => user.role === 'agent' && user.status === 'active') as ExtendedUser[]));
  const hrUsers = users.filter(user => user.role === 'hr' && user.status === 'active') as ExtendedUser[];
  const candidates = users.filter(user => user.role === 'candidate' && user.status === 'active') as ExtendedUser[];
  
  // Combine HR users and candidates into a single resources list (unsorted here)
  const allResources = [...hrUsers, ...candidates];

  // Clear selections when switching allocation tabs
  useEffect(() => {
    setSelectedResources(new Set());
    setSelectAll(false);
  }, [allocationTab]);

  // Get current agent assignment for a resource
  const getCurrentAgent = (resourceId: string, resourceType: 'hr' | 'candidate') => {
    if (!assignments || !Array.isArray(assignments)) return null;
    
    const assignment = assignments.find((a: any) => {
      if (resourceType === 'hr') {
        return a.assignedHRs?.some((hr: any) => hr._id === resourceId);
        } else {
          // For candidates, we need to check the candidate ID
          return a.assignedCandidates?.some((c: any) => {
            // If we have a populated candidate with userId
            if (c.userId) {
              return c.userId._id === resourceId;
            }
            // If we have an unpopulated candidate ID
            return c === resourceId;
          });
        }
    });


    return assignment?.agentId || null;
  };

  // Filter resources based on search and allocation status
  const getFilteredResources = () => {
    if (!allResources || !assignments) return [];
    
    
    const searchFiltered = allResources.filter(resource =>
      resource.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply role filter
    const roleFiltered = roleFilter === 'all' 
      ? searchFiltered 
      : searchFiltered.filter(resource => resource.role === roleFilter);

    const filtered = roleFiltered.filter(resource => {
      const resourceType = resource.role === 'hr' ? 'hr' : 'candidate';
      const currentAgent = getCurrentAgent(resource._id, resourceType);
      const isAllocated = !!currentAgent;


      return allocationTab === 'allocated' ? isAllocated : !isAllocated;
    });

    // Apply consistent sort before returning
    return sortResources(filtered, sortOption);
  };

  const filteredResources = getFilteredResources();

  // Count allocated and unallocated resources
  const getAllocatedCount = () => {
    if (!allResources || !assignments) return 0;
    return allResources.filter(resource => {
      const resourceType = resource.role === 'hr' ? 'hr' : 'candidate';
      return getCurrentAgent(resource._id, resourceType);
    }).length;
  };

  const getUnallocatedCount = () => {
    if (!allResources || !assignments) return 0;
    return allResources.filter(resource => {
      const resourceType = resource.role === 'hr' ? 'hr' : 'candidate';
      return !getCurrentAgent(resource._id, resourceType);
    }).length;
  };

  const openAllocationDialog = (resource: User) => {
    setSelectedResource(resource as ExtendedUser);
    setSelectedAgent('');
    setAssignmentNotes('');
    setIsAllocationDialogOpen(true);
  };

  // Bulk selection functions for resources
  const handleResourceSelection = (resourceId: string) => {
    const newSelected = new Set(selectedResources);
    if (newSelected.has(resourceId)) {
      newSelected.delete(resourceId);
    } else {
      newSelected.add(resourceId);
    }
    setSelectedResources(newSelected);
    setSelectAll(newSelected.size === filteredResources.length && filteredResources.length > 0);
  };

  const handleSelectAllResources = () => {
    if (selectAll) {
      setSelectedResources(new Set());
      setSelectAll(false);
    } else {
      setSelectedResources(new Set(filteredResources.map(resource => resource._id)));
      setSelectAll(true);
    }
  };

  // Bulk allocation function
  const handleBulkAllocation = async () => {
    if (!selectedAgent) {
      return;
    }
    if (selectedResources.size === 0) {
      return;
    }

    setLoading(true);
    try {
      // Find existing assignment for the selected agent
      const existingAssignment = assignments.find((a: any) => a.agentId?._id === selectedAgent);
      
      // Separate selected resources by type
      const selectedHRIds: string[] = [];
      const selectedCandidateIds: string[] = [];
      
      selectedResources.forEach(resourceId => {
        const resource = allResources.find(r => r._id === resourceId);
        if (resource) {
          if (resource.role === 'hr') {
            selectedHRIds.push(resourceId);
          } else if (resource.role === 'candidate') {
            // For candidates, we need to pass the user ID (not the candidate document ID)
            // The backend will convert it to the candidate document ID
            selectedCandidateIds.push(resourceId);
          }
        }
      });
      
      const existingHRs = existingAssignment?.assignedHRs?.map((hr: any) => hr._id) || [];
      // For existing candidates, we need to get their user IDs, not candidate document IDs
      const existingCandidates = existingAssignment?.assignedCandidates?.map((c: any) => {
        // If the candidate has a userId field (populated), use that
        if (c.userId) {
          return c.userId._id;
        }
        // If it's just an ID, we need to find the user ID for this candidate
        // For now, we'll handle this in the backend
        return c._id || c;
      }) || [];
      
      
      // Determine if we're working with candidates or just HR users
      const isWorkingWithCandidates = selectedCandidateIds.length > 0;
      
      const assignmentData = {
        agentId: selectedAgent,
        hrIds: [...new Set([...existingHRs, ...selectedHRIds])],
        // Only include candidates if we're actually working with candidates
        candidateIds: isWorkingWithCandidates 
          ? [...new Set([...existingCandidates, ...selectedCandidateIds])]
          : undefined, // Don't send candidateIds if we're only working with HR users
        notes: assignmentNotes,
      };

      const result = await createAgentAssignment(assignmentData);
      
      // Refresh the data
      await refetchAssignments();
      await refetchUsers();
      
      const agentName = agents.find(a => a._id === selectedAgent);
      const totalAssigned = selectedHRIds.length + selectedCandidateIds.length;
      toast({
        title: "Success",
        description: `Assigned ${totalAssigned} active resource${totalAssigned !== 1 ? 's' : ''} to ${agentName?.firstName} ${agentName?.lastName}`,
      });

      // Clear selections
      setSelectedResources(new Set());
      setSelectAll(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save bulk allocation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Bulk deallocation function
  const handleBulkDeallocation = async () => {
    if (selectedResources.size === 0) return;

    setLoading(true);
    try {
      // Group resources by their current agent
      const resourcesByAgent: { [agentId: string]: { hrIds: string[], candidateIds: string[] } } = {};
      
      for (const resourceId of selectedResources) {
        const resource = allResources.find(r => r._id === resourceId);
        const resourceType = resource?.role === 'hr' ? 'hr' : 'candidate';
        const currentAgent = getCurrentAgent(resourceId, resourceType);
        
        if (currentAgent) {
          if (!resourcesByAgent[currentAgent._id]) {
            resourcesByAgent[currentAgent._id] = { hrIds: [], candidateIds: [] };
          }
          
          if (resourceType === 'hr') {
            resourcesByAgent[currentAgent._id].hrIds.push(resourceId);
          } else {
            resourcesByAgent[currentAgent._id].candidateIds.push(resourceId);
          }
        }
      }

      // Remove resources from each agent assignment
      for (const [agentId, resources] of Object.entries(resourcesByAgent)) {
        await removeFromAgentAssignment({
          agentId,
          data: {
            hrIds: resources.hrIds.length > 0 ? resources.hrIds : undefined,
            candidateIds: resources.candidateIds.length > 0 ? resources.candidateIds : undefined,
          }
        });
      }
      
      toast({
        title: "Success",
        description: `Removed ${selectedResources.size} resource${selectedResources.size !== 1 ? 's' : ''} from their agent assignments`,
      });

      // Clear selections
      setSelectedResources(new Set());
      setSelectAll(false);
      
      // Explicitly refresh data to show immediate update
      await refetchAssignments();
      await refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove allocations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Individual resource removal function
  const handleRemoveResource = async (resourceId: string) => {
    const resource = allResources.find(r => r._id === resourceId);
    if (!resource) return;

    const resourceType = resource.role === 'hr' ? 'hr' : 'candidate';
    const currentAgent = getCurrentAgent(resourceId, resourceType);
    
    if (!currentAgent) {
      toast({
        title: "Error",
        description: "No agent assignment found for this resource",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const removeData = {
        agentId: currentAgent._id,
        data: resourceType === 'hr' 
          ? { hrIds: [resourceId] }
          : { candidateIds: [resourceId] }
      };

      await removeFromAgentAssignment(removeData);
      
      // Explicitly refresh data to show immediate update
      await refetchAssignments();
      await refetchUsers();
      
      toast({
        title: "Success",
        description: `Removed ${resource.firstName} ${resource.lastName} from ${currentAgent.firstName} ${currentAgent.lastName}'s assignment`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove resource from assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllocation = async () => {
    if (!selectedResource || !selectedAgent) return;

    setLoading(true);
    try {
      // Find existing assignment for the selected agent
      const existingAssignment = assignments.find((a: any) => a.agentId?._id === selectedAgent);
      
      let assignmentData;
      if (selectedResource.role === 'hr') {
        const existingHRs = existingAssignment?.assignedHRs?.map((hr: any) => hr._id) || [];
        
        assignmentData = {
          agentId: selectedAgent,
          hrIds: [...new Set([...existingHRs, selectedResource._id])],
          // Don't include candidateIds when assigning HR users
          candidateIds: undefined,
          notes: assignmentNotes,
        };
      } else {
        const existingHRs = existingAssignment?.assignedHRs?.map((hr: any) => hr._id) || [];
        // For existing candidates, we need to get their user IDs, not candidate document IDs
        const existingCandidates = existingAssignment?.assignedCandidates?.map((c: any) => {
          // If the candidate has a userId field (populated), use that
          if (c.userId) {
            return c.userId._id;
          }
          // If it's just an ID, we need to find the user ID for this candidate
          // For now, we'll handle this in the backend
          return c._id || c;
        }) || [];
        
        
        assignmentData = {
          agentId: selectedAgent,
          hrIds: existingHRs,
          // For candidates, we need to pass the user ID (not the candidate document ID)
          // The backend will convert it to the candidate document ID
          candidateIds: [...new Set([...existingCandidates, selectedResource._id])],
          notes: assignmentNotes,
        };
      }

      const result = await createAgentAssignment(assignmentData);
      
      // Refresh the data
      await refetchAssignments();
      await refetchUsers();
      
      const agentName = agents.find(a => a._id === selectedAgent);
      toast({
        title: "Success",
        description: `Successfully allocated ${selectedResource.firstName} ${selectedResource.lastName} to ${agentName?.firstName} ${agentName?.lastName}`,
      });

      setIsAllocationDialogOpen(false);
      setSelectedResource(null);
      setSelectedAgent('');
      setAssignmentNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save allocation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Allocation</h1>
          <p className="text-muted-foreground">Manage agent assignments for HR users and candidates</p>
        </div>
      </div>

      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
        <Tabs value={allocationTab} onValueChange={(value) => setAllocationTab(value as 'allocated' | 'not-allocated')}>
            <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
            <div className="flex items-center justify-between">
              {/* Allocation Status Tabs */}
              <TabsList className="bg-white">
                <TabsTrigger value="not-allocated" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Not Allocated ({getUnallocatedCount()})
                </TabsTrigger>
                <TabsTrigger value="allocated" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  Allocated ({getAllocatedCount()})
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                  <Input
                    placeholder="Search HR users and candidates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-80 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(value: 'all' | 'hr' | 'candidate') => setRoleFilter(value)}>
                  <SelectTrigger className="w-[180px] border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="hr">HR Only</SelectItem>
                    <SelectItem value="candidate">Candidates Only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
                  <SelectTrigger className="w-[180px] border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Name (A-Z)
                      </div>
                    </SelectItem>
                    <SelectItem value="name-desc">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4" />
                        Name (Z-A)
                      </div>
                    </SelectItem>
                    <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                    <SelectItem value="email-desc">Email (Z-A)</SelectItem>
                    <SelectItem value="login-newest">Last Login (Newest)</SelectItem>
                    <SelectItem value="login-oldest">Last Login (Oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            <TabsContent value="not-allocated" className="mt-6">
              {/* Bulk Actions Toolbar */}
              {selectedResources.size > 0 && (
                <div className="border-b border-blue-200 bg-blue-50 p-4 mb-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        {selectedResources.size} resource{selectedResources.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                        <SelectTrigger className="w-48 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
                          <SelectValue placeholder="Select agent..." />
                        </SelectTrigger>
                        <SelectContent>
                          {agents.map((agent) => (
                            <SelectItem key={agent._id} value={agent._id}>
                              {agent.firstName} {agent.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        onClick={() => {
                          handleBulkAllocation();
                        }}
                        disabled={!selectedAgent || loading}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                      >
                        {loading ? <LoadingSpinner /> : 'Allocate Selected'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedResources(new Set());
                          setSelectAll(false);
                        }}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAllResources}
                        aria-label="Select all resources"
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedResources.has(resource._id)}
                          onCheckedChange={() => handleResourceSelection(resource._id)}
                          aria-label={`Select ${resource.firstName} ${resource.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {resource.customId || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            resource.role === 'hr' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {resource.role === 'hr' ? (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <Users className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-base">{resource.firstName} {resource.lastName}</p>
                            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 mt-1 ${resource.role === 'hr' ? 'text-green-600 border-green-200' : 'text-purple-600 border-purple-200'}`}>
                              {resource.role === 'hr' ? 'HR User' : 'Candidate'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-base">
                          <Mail className="h-4 w-4 text-blue-600" />
                          {resource.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-base">{formatLastLogin(resource.lastLoginAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAllocationDialog(resource)}
                            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Allocate
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => {
                              if (resource.role === 'candidate') {
                                navigate(`/dashboard/candidates/${resource.customId}`);
                              } else if (resource.role === 'hr') {
                                navigate(`/dashboard/hr-profile/${resource.customId}`);
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </TabsContent>

            <TabsContent value="allocated" className="mt-6">
              {/* Bulk Actions Toolbar for Allocated */}
              {selectedResources.size > 0 && (
                <div className="border-b border-red-200 bg-red-50 p-4 mb-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">
                        {selectedResources.size} resource{selectedResources.size !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleBulkDeallocation}
                        disabled={loading}
                        size="sm"
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                      >
                        {loading ? <LoadingSpinner /> : 'Remove Selected'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setSelectedResources(new Set());
                          setSelectAll(false);
                        }}
                        className="text-red-600 hover:bg-red-100"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAllResources}
                          aria-label="Select all resources"
                        />
                      </TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Current Agent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResources.map((resource) => {
                      const resourceType = resource.role === 'hr' ? 'hr' : 'candidate';
                      const currentAgent = getCurrentAgent(resource._id, resourceType);
                      const agentInfo = currentAgent ? agents.find(a => a._id === currentAgent._id) : null;
                  
                      return (
                        <TableRow key={resource._id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedResources.has(resource._id)}
                              onCheckedChange={() => handleResourceSelection(resource._id)}
                              aria-label={`Select ${resource.firstName} ${resource.lastName}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {resource.customId || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                                resource.role === 'hr' ? 'bg-green-100' : 'bg-purple-100'
                              }`}>
                                {resource.role === 'hr' ? (
                                  <UserCheck className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Users className="w-4 h-4 text-purple-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-base">{resource.firstName} {resource.lastName}</p>
                                <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${resource.role === 'hr' ? 'text-green-600 border-green-200' : 'text-purple-600 border-purple-200'}`}>
                                  {resource.role === 'hr' ? 'HR User' : 'Candidate'}
                                </Badge>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-base">
                              <Mail className="h-4 w-4 text-blue-600" />
                              {resource.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-base">{formatLastLogin(resource.lastLoginAt)}</TableCell>
                          <TableCell>
                            {agentInfo ? (
                              <Badge variant="outline" className="text-blue-600 border-blue-200">
                                {agentInfo.firstName} {agentInfo.lastName}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500 border-gray-200">
                                Unassigned
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openAllocationDialog(resource)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Reassign
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  if (resource.role === 'candidate') {
                                    navigate(`/dashboard/candidates/${resource.customId}`);
                                  } else if (resource.role === 'hr') {
                                    navigate(`/dashboard/hr-profile/${resource.customId}`);
                                  }
                                }}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleRemoveResource(resource._id)}
                                  disabled={loading}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
                        </TabsContent>
              </CardContent>
        </Tabs>
            </Card>

      {/* Allocation Dialog */}
      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {allocationTab === 'not-allocated' ? 'Allocate' : 'Reassign'} {selectedResource?.firstName} {selectedResource?.lastName}
            </DialogTitle>
            <DialogDescription>
              Select an agent to {allocationTab === 'not-allocated' ? 'assign' : 'reassign'} this {selectedResource?.role === 'hr' ? 'HR user' : 'candidate'} to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agent-select">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent._id} value={agent._id}>
                      {agent.firstName} {agent.lastName} ({agent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Assignment Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this allocation..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAllocation} 
              disabled={loading || !selectedAgent}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
            >
              {loading ? <LoadingSpinner /> : <Save className="h-4 w-4 mr-2" />}
              {loading ? 'Allocating...' : 'Allocate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}