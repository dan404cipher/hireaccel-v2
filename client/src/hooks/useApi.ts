import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, ApiResponse, ApiError } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Generic API hook for handling loading states, errors, and data
 */

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  showToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { immediate = true, showToast = true, onSuccess, onError } = options;
  const { logout } = useAuth();
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      // The API client returns the full response object, so we need to access response.data
      const actualData = response.data || response;
      
      setState(prev => {
        return { ...prev, data: actualData, loading: false };
      });
      
      if (onSuccess) {
        onSuccess(actualData);
      }
      
      return actualData;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({ ...prev, error: apiError, loading: false }));
      
      // Handle authentication errors by logging out the user
      if (apiError.status === 401 || apiError.detail?.includes('token expired')) {
        console.warn('Authentication failed, logging out user');
        logout();
        return; // Don't show toast or call onError for auth failures
      }
      
      if (showToast) {
        toast({
          title: apiError.title,
          description: apiError.detail,
          variant: 'destructive',
        });
      }
      
      if (onError) {
        onError(apiError);
      }
      
      throw error;
    }
  }, [apiCall, onSuccess, onError, showToast, logout]);

  useEffect(() => {
    if (immediate) {
      let cancelled = false;
      execute().catch(error => {
        // Only log if not cancelled (component unmounted)
        if (!cancelled) {
          // Error is already handled in execute function, but we catch to prevent unhandled rejections
          console.error('Unhandled promise rejection in useApi:', error);
        }
      });
      
      return () => {
        cancelled = true;
      };
    }
  }, [immediate, execute]);

  return {
    ...state,
    execute,
    refetch: execute,
  };
}

/**
 * Hook for mutations (create, update, delete operations)
 */
export function useMutation<T, P = any>(
  mutationFn: (params: P) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const { showToast = true, onSuccess, onError } = options;
  const { logout } = useAuth();
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await mutationFn(params);
      setState(prev => ({ ...prev, data: response.data!, loading: false }));
      
      if (showToast && response.message) {
        toast({
          title: 'Success',
          description: response.message,
        });
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (error) {
      const apiError = error as ApiError;
      setState(prev => ({ ...prev, error: apiError, loading: false }));
      
      // Handle authentication errors by logging out the user
      if (apiError.status === 401 || apiError.detail?.includes('token expired')) {
        console.warn('Authentication failed, logging out user');
        logout();
        return; // Don't show toast or call onError for auth failures
      }
      
      if (showToast) {
        toast({
          title: apiError.title,
          description: apiError.detail,
          variant: 'destructive',
        });
      }
      
      if (onError) {
        onError(apiError);
      }
      
      throw error;
    }
  }, [mutationFn, onSuccess, onError, showToast, logout]);

  return {
    ...state,
    mutate,
  };
}

/**
 * Specific hooks for common API operations
 */

// Jobs
export function useJobs(params = {}) {
  // Create stable stringified params for dependency tracking
  const paramsStr = JSON.stringify(params);
  const paramsKey = useMemo(() => paramsStr, [paramsStr]);
  
  // Only execute immediately if params are not empty (to prevent unnecessary API calls)
  const hasParams = Object.keys(params).length > 0;
  
  const memoizedCall = useCallback(() => apiClient.getJobs(params), [paramsKey]);
  return useApi(memoizedCall, { immediate: hasParams });
}

export function useJob(id: string) {
  const memoizedCall = useCallback(() => apiClient.getJob(id), [id]);
  return useApi(memoizedCall, { immediate: !!id });
}

export function useCreateJob() {
  return useMutation((jobData: any) => apiClient.createJob(jobData));
}

export function useUpdateJob() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    apiClient.updateJob(id, data)
  );
}

export function useDeleteJob() {
  return useMutation((id: string) => apiClient.deleteJob(id));
}

export function useJobStats() {
  const memoizedCall = useCallback(() => apiClient.getJobStats(), []);
  return useApi(memoizedCall, { immediate: true });
}

// Companies
export function useCompanies(params = {}) {
  // Create a stable key for the params to prevent multiple instances
  const paramsKey = JSON.stringify(params);
  const memoizedCall = useCallback(() => {
    return apiClient.getCompanies(params);
  }, [paramsKey]);
  
  const result = useApi(memoizedCall, { immediate: true });
  return result;
}

export function useCompany(id: string) {
  return useApi(() => apiClient.getCompany(id), { immediate: !!id });
}

export function useCreateCompany() {
  return useMutation((companyData: any) => apiClient.createCompany(companyData));
}

export function useUpdateCompany() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    apiClient.updateCompany(id, data)
  );
}

export function useDeleteCompany() {
  return useMutation((id: string) => apiClient.deleteCompany(id));
}

export function useCompanyStats() {
  const memoizedCall = useCallback(() => apiClient.getCompanyStats(), []);
  return useApi(memoizedCall, { immediate: true });
}

// Users
export function useUsers(params = {}) {
  const { user } = useAuth();
  const memoizedCall = useCallback(() => {
    // Check if role filter requires admin/HR access
    const role = (params as any)?.role;
    if (role === 'hr' || role === 'agent') {
      // These roles require HR/Admin access
      if (user?.role !== 'hr' && user?.role !== 'admin' && user?.role !== 'superadmin') {
        return Promise.resolve({ data: [] });
      }
    }
    return apiClient.getUsers(params);
  }, [JSON.stringify(params), user?.role]);
  return useApi(memoizedCall, { 
    immediate: true,
    showToast: false // Suppress error toasts for permission errors
  });
}

export function useUser(id: string) {
  const memoizedCall = useCallback(() => apiClient.getUser(id), [id]);
  return useApi(memoizedCall, { immediate: !!id });
}

export function useUserByCustomId(customId: string) {
  const memoizedCall = useCallback(() => apiClient.getUserByCustomId(customId), [customId]);
  return useApi(memoizedCall, { immediate: !!customId });
}

export function useCreateUser() {
  return useMutation((userData: any) => apiClient.createUser(userData));
}

export function useUpdateUser() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    apiClient.updateUser(id, data)
  );
}

export function useDeleteUser() {
  return useMutation((id: string) => apiClient.deleteUser(id));
}

export function useUserStats() {
  const memoizedCall = useCallback(() => apiClient.getUserStats(), []);
  return useApi(memoizedCall, { immediate: true });
}

// Applications
export function useApplications(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getApplications(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true });
}

export function useCreateApplication() {
  return useMutation((applicationData: any) => apiClient.createApplication(applicationData));
}

// Candidate Profile
export function useCandidateProfile<T = any>(id?: string) {
  const memoizedCall = useCallback(() => apiClient.getCandidateProfile(id), [id]);
  return useApi<T>(memoizedCall, { immediate: true });
}

export function useUpdateCandidateProfile<T = any>(options?: { onSuccess?: (data: T) => void; onError?: (error: any) => void }) {
  return useMutation<T>((profileData: any) => apiClient.updateCandidateProfile(profileData), options);
}

// File Upload
export function useResumeInfo<T = any>(options: UseApiOptions = {}) {
  const memoizedCall = useCallback(() => apiClient.getResumeInfo(), []);
  return useApi<T>(memoizedCall, { immediate: true, ...options });
}

export function useUploadResume(options?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) {
  return useMutation((file: File) => apiClient.uploadResume(file), {
    showToast: true,
    ...options
  });
}

export function useDeleteResume(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation(() => apiClient.deleteResume(), {
    showToast: true,
    ...options
  });
}

// Agent Candidates
export function useAgentCandidates(params = {}) {
  // Only include the values that should trigger a refetch
  const { page, limit, search } = params;
  const memoizedCall = useCallback(
    () => apiClient.getAgentCandidates(params),
    [page, limit, search]
  );
  return useApi(memoizedCall, { immediate: true });
}

// Agent Assignments (Admin/HR assigning resources to agents)
export function useAgentAssignmentsList() {
  const { user } = useAuth();
  const memoizedCall = useCallback(() => {
    // Only fetch if user has permission (Admin or SuperAdmin)
    if (user?.role !== 'admin' && user?.role !== 'superadmin') {
      return Promise.resolve({ data: [] });
    }
    return apiClient.getAgentAssignmentsList();
  }, [user?.role]);
  return useApi(memoizedCall, { 
    immediate: user?.role === 'admin' || user?.role === 'superadmin',
    showToast: false // Suppress error toasts
  });
}

export function useCreateAgentAssignment() {
  return useMutation((assignmentData: any) => apiClient.createAgentAssignment(assignmentData));
}

export function useAgentAssignmentDetails(agentId: string) {
  return useApi(() => apiClient.getAgentAssignmentDetails(agentId), { immediate: !!agentId });
}

export function useMyAgentAssignment() {
  const memoizedCall = useCallback(() => apiClient.getMyAgentAssignment(), []);
  return useApi(memoizedCall, { immediate: true });
}

export function useAgentDashboard() {
  const memoizedCall = useCallback(() => apiClient.getAgentDashboard(), []);
  return useApi(memoizedCall, { immediate: true });
}

export function useMyAgentAssignments(params = {}) {
  // Only include the values that should trigger a refetch
  const { page, limit, sortBy, sortOrder } = params;
  const memoizedCall = useCallback(
    () => apiClient.getMyAgentAssignments(params),
    [page, limit, sortBy, sortOrder]
  );
  return useApi(memoizedCall, { immediate: true });
}

export function useRemoveFromAgentAssignment() {
  return useMutation(({ agentId, data }: { agentId: string; data: { hrIds?: string[]; candidateIds?: string[] } }) => 
    apiClient.removeFromAgentAssignment(agentId, data)
  );
}

export function useDeleteAgentAssignment() {
  return useMutation((agentId: string) => apiClient.deleteAgentAssignment(agentId));
}

export function useAdvanceApplication() {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    apiClient.advanceApplication(id, data)
  );
}

export function useRejectApplication() {
  return useMutation(({ id, reason }: { id: string; reason: string }) => 
    apiClient.rejectApplication(id, reason)
  );
}

export function useApplicationStats() {
  const memoizedCall = useCallback(() => apiClient.getApplicationStats(), []);
  return useApi(memoizedCall, { immediate: true });
}

// Authentication
export function useCurrentUser() {
  return useApi(() => apiClient.getCurrentUser(), { 
    immediate: !!localStorage.getItem('accessToken'),
    showToast: false
  });
}

export function useLogin() {
  return useMutation(({ email, password }: { email: string; password: string }) => 
    apiClient.login(email, password)
  );
}

export function useLogout() {
  return useMutation(() => apiClient.logout());
}

// Interviews
export function useInterviews(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getInterviews(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true });
}

export function useInterview(id: string) {
  const memoizedCall = useCallback(() => apiClient.getInterview(id), [id]);
  return useApi(memoizedCall, { 
    immediate: !!id 
  });
}

export function useCreateInterview(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((data: any) => apiClient.createInterview(data), {
    showToast: true,
    ...options
  });
}

export function useUpdateInterview(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    apiClient.updateInterview(id, data), {
    showToast: true,
    ...options
  });
}

export function useDeleteInterview(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((id: string) => apiClient.deleteInterview(id), {
    showToast: true,
    ...options
  });
}

export function useInterviewStats() {
  const memoizedCall = useCallback(() => apiClient.getInterviewStats(), []);
  return useApi(memoizedCall, { 
    immediate: true,
    showToast: false  // Don't show error toasts for stats to prevent spam
  });
}

// Candidate Assignments
export function useCandidateAssignments(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getCandidateAssignments(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true });
}

export function useMyCandidateAssignments(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getMyCandidateAssignments(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true });
}

export function useCandidateAssignment(id: string) {
  const memoizedCall = useCallback(() => apiClient.getCandidateAssignment(id), [id]);
  return useApi(memoizedCall, { 
    immediate: !!id 
  });
}

export function useCreateCandidateAssignment(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((data: any) => apiClient.createCandidateAssignment(data), {
    showToast: true,
    ...options
  });
}

export function useUpdateCandidateAssignment(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation(({ id, data }: { id: string; data: any }) => 
    apiClient.updateCandidateAssignment(id, data), {
    showToast: true,
    ...options
  });
}

export function useDeleteCandidateAssignment(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((id: string) => apiClient.deleteCandidateAssignment(id), {
    showToast: true,
    ...options
  });
}

export function useCandidateAssignmentStats() {
  const memoizedCall = useCallback(() => apiClient.getCandidateAssignmentStats(), []);
  return useApi(memoizedCall, { 
    immediate: true,
    showToast: false  // Don't show error toasts for stats to prevent spam
  });
}

// Additional hooks for interview scheduling
export function useAvailableInterviewers() {
  const { user } = useAuth();
  const memoizedCall = useCallback(async () => {
    // Only fetch if user has permission (HR, Admin, or SuperAdmin)
    if (user?.role !== 'hr' && user?.role !== 'admin' && user?.role !== 'superadmin') {
      return { data: [] };
    }
    
    // Fetch HR and Admin users separately since the API doesn't support multiple roles
    try {
      const [hrResponse, adminResponse] = await Promise.all([
        apiClient.getUsers({ role: 'hr', status: 'active' }),
        apiClient.getUsers({ role: 'admin', status: 'active' })
      ]);
      
      // Extract data arrays and combine them
      const hrUsers = Array.isArray(hrResponse) ? hrResponse : (hrResponse as any)?.data || [];
      const adminUsers = Array.isArray(adminResponse) ? adminResponse : (adminResponse as any)?.data || [];
      
      // Combine and return in the same format as other API calls
      const combinedUsers = [...hrUsers, ...adminUsers];
      return { data: combinedUsers };
    } catch (error) {
      // Silently fail if user doesn't have permission
      console.log('Available interviewers not accessible:', error);
      return { data: [] };
    }
  }, [user?.role]);
  
  return useApi(memoizedCall, { 
    immediate: user?.role === 'hr' || user?.role === 'admin' || user?.role === 'superadmin',
    showToast: false // Suppress error toasts
  });
}

// Agent Interview Management
export function useMyAgentInterviews(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getMyAgentInterviews(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true });
}

export function useMyAgentInterview(id: string) {
  const memoizedCall = useCallback(() => apiClient.getMyAgentInterview(id), [id]);
  return useApi(memoizedCall, { 
    immediate: !!id 
  });
}

export function useMyAgentInterviewStats() {
  const memoizedCall = useCallback(() => apiClient.getMyAgentInterviewStats(), []);
  return useApi(memoizedCall, { 
    immediate: true,
    showToast: false  // Don't show error toasts for stats to prevent spam
  });
}

// Auto Match hooks
export function useMatchJobToCandidates(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((data: { jobId: string; limit?: number }) => 
    apiClient.matchJobToCandidates(data), {
    showToast: true,
    ...options
  });
}

export function useMatchCandidateToJobs(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((data: { candidateId: string; limit?: number }) => 
    apiClient.matchCandidateToJobs(data), {
    showToast: true,
    ...options
  });
}

export function useBatchMatch(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((data: { jobId?: string; candidateIds?: string[]; limit?: number }) => 
    apiClient.batchMatch(data), {
    showToast: true,
    ...options
  });
}

// Contact History hooks
export function useContactHistory(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getContactHistory(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true });
}

export function useContactHistoryById(id: string) {
  const memoizedCall = useCallback(() => apiClient.getContactHistoryById(id), [id]);
  return useApi(memoizedCall, { immediate: !!id });
}

export function useContactHistoryStats(params = {}) {
  const memoizedCall = useCallback(() => apiClient.getContactHistoryStats(params), [JSON.stringify(params)]);
  return useApi(memoizedCall, { immediate: true, showToast: false });
}

export function useCreateContactHistory(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((data: {
    contactType: 'hr' | 'candidate';
    contactId: string;
    contactMethod: 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other';
    subject: string;
    notes: string;
    duration?: number;
    outcome?: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
    followUpDate?: string;
    followUpNotes?: string;
    tags?: string[];
    relatedJobId?: string;
    relatedCandidateAssignmentId?: string;
  }) => apiClient.createContactHistory(data), {
    showToast: true,
    ...options
  });
}

export function useUpdateContactHistory(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation(({ id, data }: { id: string; data: Partial<{
    contactType: 'hr' | 'candidate';
    contactId: string;
    contactMethod: 'phone' | 'email' | 'meeting' | 'whatsapp' | 'other';
    subject: string;
    notes: string;
    duration?: number;
    outcome?: 'positive' | 'neutral' | 'negative' | 'follow_up_required';
    followUpDate?: string;
    followUpNotes?: string;
    tags?: string[];
    relatedJobId?: string;
    relatedCandidateAssignmentId?: string;
  }> }) => apiClient.updateContactHistory(id, data), {
    showToast: true,
    ...options
  });
}

export function useDeleteContactHistory(options?: { onSuccess?: () => void; onError?: () => void }) {
  return useMutation((id: string) => apiClient.deleteContactHistory(id), {
    showToast: true,
    ...options
  });
}
