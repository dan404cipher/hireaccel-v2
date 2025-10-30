import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Users,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Clock,
  Download,
  CheckSquare,
  Square
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ApiErrorAlert } from "@/components/ui/error-boundary";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  _id: string;
  customId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'superadmin' | 'admin' | 'hr' | 'agent' | 'candidate';
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  source?: string;
  createdAt: string;
}

const roleColors = {
  superadmin: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600',
  admin: 'bg-red-600 text-white border-red-600',
  hr: 'bg-blue-600 text-white border-blue-600',
  agent: 'bg-emerald-600 text-white border-emerald-600',
  candidate: 'bg-purple-600 text-white border-purple-600',
};

const sourceColors = {
  'Email': 'bg-blue-100 text-blue-800 border-blue-200',
  'WhatsApp': 'bg-green-100 text-green-800 border-green-200',
  'Telegram': 'bg-sky-100 text-sky-800 border-sky-200',
  'Instagram': 'bg-pink-100 text-pink-800 border-pink-200',
  'Facebook': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Journals': 'bg-amber-100 text-amber-800 border-amber-200',
  'Posters': 'bg-orange-100 text-orange-800 border-orange-200',
  'Brochures': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Forums': 'bg-purple-100 text-purple-800 border-purple-200',
  'Google': 'bg-red-100 text-red-800 border-red-200',
  'Conversational AI (GPT, Gemini etc)': 'bg-violet-100 text-violet-800 border-violet-200',
  'Not specified': 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusColors = {
  active: 'bg-emerald-600 text-white border-emerald-600',
  inactive: 'bg-gray-600 text-white border-gray-600',
  suspended: 'bg-amber-600 text-white border-amber-600',
};

const roleLabels = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  hr: 'HR Manager',
  agent: 'Agent',
  candidate: 'Candidate',
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'candidate' as 'superadmin' | 'admin' | 'hr' | 'agent' | 'candidate',
    password: '',
    source: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  // Update role filter when URL changes
  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl && roleFromUrl !== roleFilter) {
      setRoleFilter(roleFromUrl);
    }
  }, [searchParams]);

  // Password validation
  const passwordValidation = {
    hasMinLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[^a-zA-Z0-9]/.test(formData.password),
    hasNoSpaces: !/\s/.test(formData.password),
    hasNoRepeated: !/(.)\1{3,}/.test(formData.password),
    hasNoCommon: !/^(password|password123|123456|123456789|qwerty|abc123|password1|admin|letmein|welcome|12345678|monkey|1234567890|dragon|master|baseball|football|basketball|superman|batman|trustno1|hello|welcome123|admin123|root|test|guest|user|demo|temp|temporary)$/i.test(formData.password)
  };

  const isPasswordValid = formData.password === '' || Object.values(passwordValidation).every(Boolean);

  // API hooks
  const { 
    data: usersResponse, 
    loading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useUsers({
    page,
    limit: 200, // Increased to show all users without pagination
    search: searchTerm || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { mutate: createUser, loading: createLoading } = useCreateUser();
  const { mutate: updateUser, loading: updateLoading } = useUpdateUser();
  const { mutate: deleteUser, loading: deleteLoading } = useDeleteUser();

  // Handle both API response formats: {data: [...], meta: {...}} or direct array
  const allUsers = Array.isArray(usersResponse) ? usersResponse : ((usersResponse as any)?.data || []);
  
  // Don't filter admins - just show all users
  // Edit/Delete actions are already disabled for admin users in the UI
  const users = useMemo(() => {
    if (!allUsers || !Array.isArray(allUsers)) return [];
    return allUsers;
  }, [allUsers]);
  
  const meta = Array.isArray(usersResponse) ? null : (usersResponse as any)?.meta;
  const totalPages = meta?.page?.total || 1;
  const totalUsers = meta?.total || users.length;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

  // Reset selections when users change
  useEffect(() => {
    setSelectedUsers(new Set());
    setSelectAll(false);
  }, [users.length]);

  // Cleanup to ensure navigation works properly
  useEffect(() => {
    const handleNavigationClick = (event: Event) => {
      const target = event.target as Element;
      if (target.closest('a[href*="/dashboard"]') || 
          target.closest('[data-sidebar]') || 
          target.closest('nav')) {
        // Close all dialogs when navigation is attempted
        setIsCreateDialogOpen(false);
        setIsEditDialogOpen(false);
        setEditingUser(null);
        setViewingUser(null);
        
        // Remove modal overlays that might block navigation
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]');
        overlays.forEach(overlay => overlay.parentNode?.removeChild(overlay));
      }
    };

    document.addEventListener('click', handleNavigationClick, true);

    return () => {
      document.removeEventListener('click', handleNavigationClick, true);
      
      // Cleanup on unmount
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setViewingUser(null);
    };
  }, []);

  // Handle individual user selection
  const handleUserSelect = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === users.length && users.length > 0);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
      setSelectAll(false);
    } else {
      setSelectedUsers(new Set(users.map(user => user._id)));
      setSelectAll(true);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      role: 'candidate',
      password: '',
      source: '',
    });
    setShowPassword(false);
  };

  const handleCreateUser = async () => {
    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate password if provided
    if (formData.password && !isPasswordValid) {
      toast({
        title: "Password Validation Error",
        description: "Please ensure the password meets all requirements",
        variant: "destructive",
      });
      return;
    }

    try {
      await createUser(formData);
      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsCreateDialogOpen(false);
      resetForm();
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    // Validate password if provided
    if (formData.password && !isPasswordValid) {
      toast({
        title: "Password Validation Error",
        description: "Please ensure the password meets all requirements",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
      };
      
      // Only include password if it was provided
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      await updateUser({ id: editingUser._id, data: updateData });
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      resetForm();
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUser({ id: userId, data: { status: newStatus } });
      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'activated' : newStatus === 'suspended' ? 'suspended' : 'deactivated'} successfully`,
      });
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete._id);
      refetchUsers();
      toast({
        title: "Success",
        description: `User ${userToDelete.firstName} ${userToDelete.lastName} deleted permanently`,
      });
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.detail || error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      password: '',
      source: user.source || '',
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Bulk actions
  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedUsers.size === 0) return;
    
    try {
      const updatePromises = Array.from(selectedUsers).map(userId =>
        updateUser({ id: userId, data: { status: newStatus } })
      );
      
      await Promise.all(updatePromises);
      
      toast({
        title: "Success",
        description: `${selectedUsers.size} users ${newStatus === 'active' ? 'activated' : newStatus === 'suspended' ? 'suspended' : 'deactivated'} successfully`,
      });
      
      setSelectedUsers(new Set());
      setSelectAll(false);
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update users",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedUsers).map(userId =>
        deleteUser(userId)
      );
      
      await Promise.all(deletePromises);
      
      toast({
        title: "Success",
        description: `${selectedUsers.size} users deleted successfully`,
      });
      
      setSelectedUsers(new Set());
      setSelectAll(false);
      refetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete users",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const selectedUserData = users.filter(user => selectedUsers.has(user._id));
    const csvContent = [
      ['source', 'firstName', 'lastName', 'email', 'phoneNumber', 'role', 'status', 'lastLoginAt', 'createdAt', 'emailVerified'].join(','),
      ...selectedUserData.map(user => [
        user.source || 'Not specified',
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber || '', // Include phone number
        user.role, // Use actual role value, not display label
        user.status,
        user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : '',
        new Date(user.createdAt).toISOString(),
        user.emailVerified || 'true' // Default to true if not present
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: `Exported ${selectedUsers.size} users to CSV`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (usersError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
        </div>
        <ApiErrorAlert error={usersError} onRetry={refetchUsers} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            User Management
          </h1>
          <p className="text-muted-foreground">Manage users, roles, and permissions across the platform</p>
        </div>
        <Button 
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>





      {/* Filters */}
      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="border-purple-200 focus:border-purple-400 focus:ring-purple-400">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="candidate">Candidate</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="hr">HR Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                {currentUser?.role === 'superadmin' && (
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="text-gray-600 hover:bg-gray-100"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-lg bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Users ({users.length}{totalUsers > users.length ? ` of ${totalUsers}` : ''})
          </CardTitle>
        </CardHeader>
        
        {/* Bulk Actions Toolbar - Inside Users Card */}
        {selectedUsers.size > 0 && (
          <div className="border-b border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                  className="flex items-center gap-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('active')}
                  className="flex items-center gap-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                >
                  <UserCheck className="h-4 w-4" />
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('inactive')}
                  className="flex items-center gap-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                >
                  <UserX className="h-4 w-4" />
                  Deactivate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleBulkStatusChange('suspended')}
                  className="flex items-center gap-1 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300"
                >
                  <UserX className="h-4 w-4" />
                  Suspend
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Selected Users</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedUsers.size} selected user{selectedUsers.size !== 1 ? 's' : ''}? 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleBulkDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? <LoadingSpinner /> : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedUsers(new Set());
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

        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="relative overflow-x-auto">
                <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all users"
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Lead Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.has(user._id)}
                          onCheckedChange={() => handleUserSelect(user._id)}
                          aria-label={`Select ${user.firstName} ${user.lastName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {user.customId}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-base">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-base">
                          <Mail className="h-4 w-4 text-blue-600" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-base">
                          <Phone className="h-4 w-4 text-emerald-600" />
                          {user.phoneNumber || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={sourceColors[user.source || 'Not specified']}>
                          {user.source || 'Not specified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[user.status]}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewingUser(user)}>
                              <Eye className="mr-2 h-4 w-4 text-blue-600" />
                              View Details
                            </DropdownMenuItem>
                            {(user.role === 'hr' || user.role === 'candidate') && (
                              <DropdownMenuItem onClick={() => {
                                if (user.role === 'candidate') {
                                  navigate(`/dashboard/candidates/${user.customId || user._id}`);
                                } else if (user.role === 'hr') {
                                  navigate(`/dashboard/hr-profile/${user.customId || user._id}`);
                                }
                              }}>
                                <Eye className="mr-2 h-4 w-4 text-purple-600" />
                                View Profile
                              </DropdownMenuItem>
                            )}
                            {/* Superadmin cannot be edited/deleted. Admin can only be deleted by superadmin */}
                            {user.role !== 'superadmin' && (
                              <>
                                {/* Edit/Status change - not for admin users */}
                                {user.role !== 'admin' && (
                                  <>
                                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                      <Edit className="mr-2 h-4 w-4 text-emerald-600" />
                                      Edit User
                                    </DropdownMenuItem>
                                    {user.status === 'active' ? (
                                      <DropdownMenuItem onClick={() => handleStatusChange(user._id, 'inactive')}>
                                        <UserX className="mr-2 h-4 w-4 text-gray-600" />
                                        Deactivate
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem onClick={() => handleStatusChange(user._id, 'active')}>
                                        <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />
                                        Activate
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                                {/* Delete - superadmin can delete anyone except other superadmins */}
                                {currentUser?.role === 'superadmin' && (
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDeleteConfirmOpen(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {totalPages} • Showing {users.length} of {totalUsers} users
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. They will receive login credentials via email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  // Only allow numbers, +, -, (, ), and spaces
                  const value = e.target.value.replace(/[^0-9+\-() ]/g, '');
                  setFormData(prev => ({ ...prev, phoneNumber: value }));
                }}
                placeholder="e.g. +1234567890"
                pattern="[0-9+\-() ]*"
                inputMode="tel"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="hr">HR Manager</SelectItem>
                  {currentUser?.role === 'superadmin' && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value: any) => setFormData(prev => ({ ...prev, source: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Telegram">Telegram</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Journals">Journals</SelectItem>
                  <SelectItem value="Posters">Posters</SelectItem>
                  <SelectItem value="Brochures">Brochures</SelectItem>
                  <SelectItem value="Forums">Forums</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Conversational AI (GPT, Gemini etc)">Conversational AI (GPT, Gemini etc)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to auto-generate"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="text-xs text-gray-600 mt-2">
                  {isPasswordValid ? (
                    <div className="text-green-600">
                      ✓ Password meets all requirements
                    </div>
                  ) : (
                    <div>
                      <div className="text-red-500 mb-1">Password requirements:</div>
                      <div className="mt-1 space-y-1">
                        {!passwordValidation.hasMinLength && (
                          <div className="text-red-500">• At least 8 characters</div>
                        )}
                        {!passwordValidation.hasUppercase && (
                          <div className="text-red-500">• Uppercase letter</div>
                        )}
                        {!passwordValidation.hasLowercase && (
                          <div className="text-red-500">• Lowercase letter</div>
                        )}
                        {!passwordValidation.hasNumber && (
                          <div className="text-red-500">• Number</div>
                        )}
                        {!passwordValidation.hasSpecialChar && (
                          <div className="text-red-500">• Special character (!@#$%^&*)</div>
                        )}
                        {!passwordValidation.hasNoSpaces && (
                          <div className="text-red-500">• No spaces</div>
                        )}
                        {!passwordValidation.hasNoRepeated && (
                          <div className="text-red-500">• No repeated characters (aaaa)</div>
                        )}
                        {!passwordValidation.hasNoCommon && (
                          <div className="text-red-500">• Not a common password</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={createLoading || !formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || (formData.password && !isPasswordValid)}
            >
              {createLoading ? <LoadingSpinner /> : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhoneNumber">Phone Number</Label>
              <Input
                id="editPhoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  // Only allow numbers, +, -, (, ), and spaces
                  const value = e.target.value.replace(/[^0-9+\-() ]/g, '');
                  setFormData(prev => ({ ...prev, phoneNumber: value }));
                }}
                placeholder="e.g. +1234567890"
                pattern="[0-9+\-() ]*"
                inputMode="tel"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPassword">New Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="editPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Leave empty to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="text-xs">
                  <div className="font-medium mb-1">Password Requirements:</div>
                  <div className="space-y-1">
                    <div className={passwordValidation.hasMinLength ? "text-green-600" : "text-red-500"}>
                      • At least 8 characters
                    </div>
                    <div className={passwordValidation.hasUppercase ? "text-green-600" : "text-red-500"}>
                      • Uppercase letter
                    </div>
                    <div className={passwordValidation.hasLowercase ? "text-green-600" : "text-red-500"}>
                      • Lowercase letter
                    </div>
                    <div className={passwordValidation.hasNumber ? "text-green-600" : "text-red-500"}>
                      • Number
                    </div>
                    <div className={passwordValidation.hasSpecialChar ? "text-green-600" : "text-red-500"}>
                      • Special character (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRole">Role</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="candidate">Candidate</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="hr">HR Manager</SelectItem>
                  {currentUser?.role === 'superadmin' && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditUser} 
              disabled={updateLoading || (formData.password && !isPasswordValid)}
            >
              {updateLoading ? <LoadingSpinner /> : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={!!viewingUser} onOpenChange={() => setViewingUser(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {viewingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Lead Source</Label>
                  <div className="mt-1">
                    <Badge className={sourceColors[viewingUser.source || 'Not specified']}>
                      {viewingUser.source || 'Not specified'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="mt-1">{viewingUser.firstName} {viewingUser.lastName}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="mt-1">{viewingUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <div className="mt-1">
                    <Badge className={roleColors[viewingUser.role]}>
                      {roleLabels[viewingUser.role]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[viewingUser.status]}>
                      {viewingUser.status.charAt(0).toUpperCase() + viewingUser.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Last Login</Label>
                  <p className="mt-1">{formatLastLogin(viewingUser.lastLoginAt)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="mt-1">{formatDate(viewingUser.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Permanently</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
              <br /><br />
              <span className="text-red-600 font-semibold">⚠️ This action cannot be undone. The user and all associated data will be permanently removed from the database.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? <LoadingSpinner /> : 'Delete Permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
