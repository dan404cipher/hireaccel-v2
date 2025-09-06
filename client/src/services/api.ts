/**
 * API Client Service
 * Handles all communication with the backend API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: {
      current: number;
      total: number;
      hasMore: boolean;
    };
    total?: number;
    limit?: number;
  };
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  issues?: Array<{ field: string; message: string; code: string }>;
}

export interface Job {
  id: string;
  jobId?: string;
  title: string;
  description: string;
  company: string;
  companyId: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'open' | 'assigned' | 'interview' | 'closed' | 'cancelled';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  applicants: number;
  posted: string;
  agent?: string;
  assignedAgentId?: string;
  requirements?: {
    skills: string[];
    experience: string;
    education: string[];
  };
  benefits?: string[];
  isRemote?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  customId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'candidate' | 'agent' | 'hr' | 'partner' | 'admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  companyId?: string;
  name: string;
  description: string;
  industry: string;
  size: string;
  location: string;
  website?: string;
  partnership: 'basic' | 'standard' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  rating: number;
  totalJobs: number;
  totalHires: number;
  contacts: Array<{
    name: string;
    email: string;
    phone: string;
    position: string;
  }>;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: string;
  stage: string;
  appliedAt: string;
  candidate?: any;
  job?: any;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
    this.token = localStorage.getItem('accessToken');
  }

  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      console.log('Refreshing access token...');
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.log('Token refresh failed:', data);
        this.clearToken();
        console.error('Token refresh failed:', response.status);
        throw new Error('Token refresh failed');
      }
      
      console.log('Token refresh response:', data);
      
      if (!data.data?.accessToken) {
        console.error('No access token in response');
        throw new Error('Invalid token refresh response');
      }

      const { accessToken } = data.data;
      this.setToken(accessToken);
      return accessToken;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      // Handle 401 errors - but only for authenticated requests, not for login
      if (response.status === 401 && endpoint !== '/auth/login') {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshPromise = this.refreshAccessToken()
            .then(token => {
              this.isRefreshing = false;
              this.onTokenRefreshed(token);
            })
            .catch(error => {
              this.isRefreshing = false;
              throw error;
            });
        }

        if (this.refreshPromise) {
          return new Promise((resolve, reject) => {
            this.addRefreshSubscriber(async (token) => {
              try {
                // Retry the original request with new token
                const newHeaders = {
                  ...headers,
                  Authorization: `Bearer ${token}`,
                };
                const retryResponse = await fetch(url, {
                  ...options,
                  headers: newHeaders,
                  credentials: 'include',
                });
                const retryData = await retryResponse.json();
                resolve(retryData);
              } catch (error) {
                reject(error);
              }
            });
          });
        }
      }

      if (!response.ok) {
        console.log('API Error Response:', data);
        console.log('Response Status:', response.status);
        throw data as ApiError;
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw {
          type: 'network_error',
          title: 'Network Error',
          status: 0,
          detail: error.message,
        } as ApiError;
      }
      throw error;
    }
  }

  // Authentication methods
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('accessToken');
  }

  // Convenience methods
  async get(url: string, options?: Omit<RequestInit, 'method'>) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(url: string, data?: any, options?: Omit<RequestInit, 'method' | 'body'>) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(url: string, options?: Omit<RequestInit, 'method'>) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  async login(data: { email: string; password: string }) {
    console.log('API Client login called with:', data);
    try {
      const result = await this.request<{ user: User; accessToken: string; expiresIn: number }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('API Client login success:', result);
      return result;
    } catch (error) {
      console.log('API Client login error:', error);
      throw error;
    }
  }

  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'hr' | 'candidate';
    department?: string;
    currentLocation?: string;
    yearsOfExperience?: string;
  }) {
    console.log('API Client signup called with:', data);
    try {
      const result = await this.request<{ requiresOTP?: boolean; email: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      console.log('API Client signup success:', result);
      return result;
    } catch (error) {
      console.log('API Client signup error:', error);
      throw error;
    }
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    this.clearToken();
    return result;
  }
  async getCurrentUser() {
    return this.request<{ user: User }>('/auth/me');
  }

  async refreshToken() {
    return this.request<{ accessToken: string; expiresIn: number }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Job methods
  async getJobs(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
    urgency?: string;
    companyId?: string;
    createdBy?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request<Job[]>(`/api/v1/jobs?${queryParams.toString()}`);
  }

  async getJob(id: string) {
    return this.request<Job>(`/api/v1/jobs/${id}`);
  }

  async createJob(jobData: Partial<Job>) {
    return this.request<Job>('/api/v1/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, jobData: Partial<Job>) {
    return this.request<Job>(`/api/v1/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/api/v1/jobs/${id}`, { method: 'DELETE' });
  }

  async assignJobAgent(id: string, agentId: string) {
    return this.request<Job>(`/api/v1/jobs/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  }

  async closeJob(id: string, reason?: string) {
    return this.request<Job>(`/api/v1/jobs/${id}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getJobStats() {
    return this.request('/api/v1/jobs/stats');
  }

  // Company methods
  async getCompanies(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    industry?: string;
    partnership?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request<Company[]>(`/api/v1/companies?${queryParams.toString()}`);
  }

  async getCompany(id: string) {
    return this.request<Company>(`/api/v1/companies/${id}`);
  }

  async createCompany(companyData: Partial<Company>) {
    return this.request<Company>('/api/v1/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id: string, companyData: Partial<Company>) {
    return this.request<Company>(`/api/v1/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(id: string) {
    return this.request(`/api/v1/companies/${id}`, { method: 'DELETE' });
  }

  async getCompanyStats() {
    return this.request('/api/v1/companies/stats');
  }

  // User methods
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request<User[]>(`/api/v1/users?${queryParams.toString()}`);
  }

  async getUser(id: string) {
    return this.request<User>(`/api/v1/users/${id}`);
  }

  async createUser(userData: Partial<User> & { password?: string }) {
    return this.request<User>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.request<User>(`/api/v1/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/v1/users/${id}`, { method: 'DELETE' });
  }

  async getUserStats() {
    return this.request('/api/v1/users/stats');
  }

  // Application methods
  async getApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
    stage?: string;
    candidateId?: string;
    jobId?: string;
    userId?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request<Application[]>(`/api/v1/applications?${queryParams.toString()}`);
  }

  // Candidate Profile methods
  async getCandidateProfile(id?: string) {
    if (id) {
      return this.request(`/api/v1/candidates/${id}`);
    }
    return this.request('/api/v1/candidates/profile');
  }

  async updateCandidateProfile(profileData: any) {
    try {
      console.log('Raw profile data received:', profileData);
      
      // Send the data as-is since it's already wrapped in a profile object
      console.log('Sending profile update request with data:', profileData);
      const response = await this.request('/api/v1/candidates/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      console.log('Profile update response:', response);
      return response;
    } catch (error) {
      console.error('Profile update error:', error);
      // If the error has issues, pass them through
      if (error.issues) {
        throw error;
      }
      // Otherwise, create a standardized error object
      throw {
        type: 'validation_error',
        title: 'Validation Error',
        status: 400,
        detail: error.message || 'Failed to update profile',
        issues: [{ message: error.message || 'Failed to update profile' }]
      };
    }
  }

  // File Upload methods
  async uploadResume(file: File) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('fileType', 'resume');
    formData.append('entity', 'resumes');

    // Use fetch directly for file uploads to avoid Content-Type header issues
    const url = `${this.baseURL}/api/v1/files/resume`;
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  }

  async getResumeInfo() {
    return this.request('/api/v1/files/resume');
  }

  async downloadResume(fileId: string) {
    const url = `${this.baseURL}/api/v1/files/resume/${fileId}`;
    const headers: HeadersInit = {};
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error('Failed to download resume');
    }
    
    return response.blob();
  }

  async deleteResume() {
    return this.request('/api/v1/files/resume', {
      method: 'DELETE',
    });
  }

  async createApplication(applicationData: { candidateId: string; jobId: string; source?: string }) {
    return this.request<Application>('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async advanceApplication(id: string, data: { newStage: string; newStatus: string; note?: string }) {
    return this.request<Application>(`/api/v1/applications/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async rejectApplication(id: string, reason: string) {
    return this.request<Application>(`/api/v1/applications/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getApplicationStats() {
    return this.request('/api/v1/applications/stats');
  }

  // Interview methods
  async getInterviews(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
    round?: string;
    dateFrom?: string;
    dateTo?: string;
    interviewer?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request<any[]>(`/api/v1/interviews?${queryParams.toString()}`);
  }

  async getInterview(id: string) {
    return this.request<any>(`/api/v1/interviews/${id}`);
  }

  async createInterview(interviewData: {
    applicationId?: string;
    candidateId?: string;
    type: string;
    round: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
  }) {
    return this.request<any>('/api/v1/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  }

  async updateInterview(id: string, interviewData: Partial<{
    type: string;
    round: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    interviewers: string[];
    notes?: string;
    status?: string;
  }>) {
    return this.request<any>(`/api/v1/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    });
  }

  async deleteInterview(id: string) {
    return this.request(`/api/v1/interviews/${id}`, {
      method: 'DELETE',
    });
  }

  async getInterviewStats() {
    return this.request('/api/v1/interviews/stats');
  }

  // Candidate Assignment methods
  async getCandidateAssignments(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    jobId?: string;
    assignedTo?: string;
    assignedBy?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request(`/api/v1/candidate-assignments?${queryParams.toString()}`);
  }

  async getCandidateAssignment(id: string) {
    return this.request(`/api/v1/candidate-assignments/${id}`);
  }

  async createCandidateAssignment(assignmentData: {
    candidateId: string;
    assignedTo: string;
    jobId?: string;
    priority?: string;
    notes?: string;
    dueDate?: string;
  }) {
    return this.request('/api/v1/candidate-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async updateCandidateAssignment(id: string, assignmentData: {
    status?: string;
    priority?: string;
    notes?: string;
    dueDate?: string;
    feedback?: string;
    candidateStatus?: string;
  }) {
    return this.request(`/api/v1/candidate-assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteCandidateAssignment(id: string) {
    return this.request(`/api/v1/candidate-assignments/${id}`, { method: 'DELETE' });
  }

  async getMyCandidateAssignments(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    jobId?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return this.request(`/api/v1/candidates/me/assignments?${queryParams.toString()}`);
  }

  async getCandidateAssignmentStats() {
    return this.request('/api/v1/candidate-assignments/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Agent endpoints
  async getAgentDashboard() {
    return this.request<{
      assignedHRs: number;
      assignedCandidates: number;
      availableJobs: number;
      activeAssignments: number;
      completedAssignments: number;
      pendingAssignments: number;
    }>('/api/v1/agents/me/dashboard');
  }

  async getAgentAssignment() {
    return this.request('/api/v1/agents/me/assignment');
  }

  async getMyAgentAssignments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/api/v1/agents/me/assignments${queryString ? `?${queryString}` : ''}`);
  }

  async getAgentJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    urgency?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<Job[]>(`/api/v1/agents/me/jobs${queryString ? `?${queryString}` : ''}`);
  }

  async getAgentCandidates(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/api/v1/agents/me/candidates${queryString ? `?${queryString}` : ''}`);
  }

  async getAgentAssignments(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/api/v1/agents/me/assignments${queryString ? `?${queryString}` : ''}`);
  }

  async assignCandidateToJob(data: {
    candidateId: string;
    jobId: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
    dueDate?: string;
  }) {
    return this.request('/api/v1/agents/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Admin agent assignment management
  async getAgentAssignmentsList() {
    return this.request('/api/v1/users/agent-assignments');
  }

  async createAgentAssignment(data: {
    agentId: string;
    hrIds?: string[];
    candidateIds?: string[];
    notes?: string;
  }) {
    return this.request('/api/v1/users/agent-assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAgentAssignmentDetails(agentId: string) {
    return this.request(`/api/v1/users/agent-assignments/${agentId}`);
  }

  async getMyAgentAssignment() {
    return this.request('/api/v1/users/agent-assignments/me');
  }

  async deleteAgentAssignment(agentId: string) {
    return this.request(`/api/v1/users/agent-assignments/${agentId}`, {
      method: 'DELETE',
    });
  }

  // Authentication methods
  async verifyOTP(data: { email: string; otp: string }) {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: { email: string }) {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  async forgotPassword(data: { email: string }) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: { token: string; newPassword: string }) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

}

export const apiClient = new ApiClient();
