import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Trash2, 
  RefreshCw, 
  Search, 
  Building2, 
  Briefcase,
  Calendar,
  User,
  AlertCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ApiErrorAlert } from "@/components/ui/error-boundary";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/services/api";

interface DeletedJob {
  _id: string;
  jobId: string;
  title: string;
  companyId: {
    _id: string;
    name: string;
  };
  location: string;
  type: string;
  status: string;
  deletedAt: string;
  deletedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface DeletedCompany {
  _id: string;
  companyId: string;
  name: string;
  description: string;
  size: string;
  location: string;
  status: string;
  deletedAt: string;
  deletedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function RecycleBin() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'companies'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deletedJobs, setDeletedJobs] = useState<DeletedJob[]>([]);
  const [deletedCompanies, setDeletedCompanies] = useState<DeletedCompany[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Check if user is superadmin
  if (user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Only superadmin can access the Recycle Bin.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    fetchDeletedItems();
  }, [activeTab]);

  const fetchDeletedItems = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'jobs') {
        const response = await apiClient.get('/api/v1/jobs/deleted');
        console.log('Deleted jobs response:', response);
        const jobs = response.data?.data || response.data || [];
        console.log('Deleted jobs:', jobs);
        setDeletedJobs(jobs);
      } else {
        const response = await apiClient.get('/api/v1/companies/deleted');
        console.log('Deleted companies response:', response);
        const companies = response.data?.data || response.data || [];
        console.log('Deleted companies:', companies);
        setDeletedCompanies(companies);
      }
    } catch (err: any) {
      console.error('Error fetching deleted items:', err);
      setError(err);
      toast({
        title: "Error",
        description: err.detail || err.message || "Failed to fetch deleted items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, type: 'job' | 'company') => {
    setRestoringId(id);
    try {
      const endpoint = type === 'job' ? `/api/v1/jobs/${id}/restore` : `/api/v1/companies/${id}/restore`;
      await apiClient.post(endpoint);
      
      toast({
        title: "Success",
        description: `${type === 'job' ? 'Job' : 'Company'} restored successfully`,
      });
      
      // Refresh the list
      fetchDeletedItems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || `Failed to restore ${type}`,
        variant: "destructive",
      });
    } finally {
      setRestoringId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredJobs = deletedJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCompanies = deletedCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Recycle Bin</h1>
        </div>
        <ApiErrorAlert error={error} onRetry={fetchDeletedItems} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trash2 className="h-8 w-8 text-red-600" />
            Recycle Bin
          </h1>
          <p className="text-muted-foreground">Restore deleted jobs and companies</p>
        </div>
        <Button 
          onClick={fetchDeletedItems}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'jobs' | 'companies')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Jobs ({deletedJobs.length})
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Companies ({deletedCompanies.length})
          </TabsTrigger>
        </TabsList>

        {/* Search */}
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Deleted Jobs ({filteredJobs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                        <div className="h-4 w-32 bg-gray-300 rounded"></div>
                        <div className="h-10 w-24 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No deleted jobs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Deleted By</TableHead>
                        <TableHead>Deleted At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job._id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {job.jobId}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.companyId?.name || 'N/A'}</TableCell>
                          <TableCell>{job.location}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{job.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {job.deletedBy?.firstName} {job.deletedBy?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {job.deletedBy?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {formatDate(job.deletedAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  disabled={restoringId === job._id}
                                >
                                  {restoringId === job._id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Restore
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore Job</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to restore "{job.title}"? 
                                    This will make the job visible and active again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRestore(job._id, 'job')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Restore
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Deleted Companies ({filteredCompanies.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No deleted companies found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Deleted By</TableHead>
                        <TableHead>Deleted At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCompanies.map((company) => (
                        <TableRow key={company._id}>
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {company.companyId}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{company.size}</Badge>
                          </TableCell>
                          <TableCell>{company.location || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium">
                                  {company.deletedBy?.firstName} {company.deletedBy?.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {company.deletedBy?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {formatDate(company.deletedAt)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  disabled={restoringId === company._id}
                                >
                                  {restoringId === company._id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-1" />
                                      Restore
                                    </>
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore Company</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to restore "{company.name}"? 
                                    This will make the company visible and active again.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRestore(company._id, 'company')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Restore
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

