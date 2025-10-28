/**
 * API Client Service
 * Handles all communication with the backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '@/constants/config';
import type {
  ApiResponse,
  ApiError,
  User,
  AuthResponse,
  Job,
  Company,
  Application,
  Interview,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
    this.loadToken();
  }

  private async loadToken() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        this.token = token;
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/login')) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshPromise = this.refreshAccessToken()
              .then((token) => {
                this.isRefreshing = false;
                this.onTokenRefreshed(token);
                return token;
              })
              .catch((err) => {
                this.isRefreshing = false;
                this.clearToken();
                throw err;
              });
          }

          if (this.refreshPromise) {
            return new Promise((resolve, reject) => {
              this.addRefreshSubscriber(async (token) => {
                try {
                  originalRequest.headers!.Authorization = `Bearer ${token}`;
                  const response = await this.client.request(originalRequest);
                  resolve(response);
                } catch (error) {
                  reject(error);
                }
              });
            });
          }
        }

        // Transform error to ApiError format
        const apiError: ApiError = error.response?.data || {
          type: 'network_error',
          title: 'Network Error',
          status: error.response?.status || 0,
          detail: error.message || 'An unexpected error occurred',
        };

        return Promise.reject(apiError);
      }
    );
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/refresh');
      const { accessToken } = response.data.data!;
      await this.setToken(accessToken);
      return accessToken;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }

  async setToken(token: string) {
    this.token = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  async clearToken() {
    this.token = null;
    delete this.client.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    if (response.data.data?.accessToken) {
      await this.setToken(response.data.data.accessToken);
    }
    return response.data;
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
    source?: string;
  }): Promise<ApiResponse<{ requiresOTP?: boolean; email: string; message: string }>> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async verifyOTP(email: string, otp: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/verify-otp', {
      email,
      otp,
    });
    if (response.data.data?.accessToken) {
      await this.setToken(response.data.data.accessToken);
    }
    return response.data;
  }

  async resendOTP(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/resend-otp', { email });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      await this.clearToken();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
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
  } = {}): Promise<ApiResponse<Job[]>> {
    const response = await this.client.get<ApiResponse<Job[]>>('/api/v1/jobs', { params });
    return response.data;
  }

  async getJob(id: string): Promise<ApiResponse<Job>> {
    const response = await this.client.get<ApiResponse<Job>>(`/api/v1/jobs/${id}`);
    return response.data;
  }

  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    const response = await this.client.post<ApiResponse<Job>>('/api/v1/jobs', jobData);
    return response.data;
  }

  async updateJob(id: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    const response = await this.client.put<ApiResponse<Job>>(`/api/v1/jobs/${id}`, jobData);
    return response.data;
  }

  async deleteJob(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/api/v1/jobs/${id}`);
    return response.data;
  }

  // Application methods
  async getApplications(params: {
    page?: number;
    limit?: number;
    status?: string;
    candidateId?: string;
    jobId?: string;
  } = {}): Promise<ApiResponse<Application[]>> {
    const response = await this.client.get<ApiResponse<Application[]>>('/api/v1/applications', {
      params,
    });
    return response.data;
  }

  async createApplication(data: {
    candidateId: string;
    jobId: string;
    source?: string;
  }): Promise<ApiResponse<Application>> {
    const response = await this.client.post<ApiResponse<Application>>('/api/v1/applications', data);
    return response.data;
  }

  async advanceApplication(
    id: string,
    data: { newStage: string; newStatus: string; note?: string }
  ): Promise<ApiResponse<Application>> {
    const response = await this.client.post<ApiResponse<Application>>(
      `/api/v1/applications/${id}/advance`,
      data
    );
    return response.data;
  }

  // Interview methods
  async getInterviews(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<Interview[]>> {
    const response = await this.client.get<ApiResponse<Interview[]>>('/api/v1/interviews', {
      params,
    });
    return response.data;
  }

  async createInterview(data: {
    applicationId?: string;
    candidateId?: string;
    type: string;
    round: string;
    scheduledAt: string;
    duration: number;
    location?: string;
    interviewers?: string[];
    notes?: string;
  }): Promise<ApiResponse<Interview>> {
    const response = await this.client.post<ApiResponse<Interview>>('/api/v1/interviews', data);
    return response.data;
  }

  async updateInterview(id: string, data: Partial<Interview>): Promise<ApiResponse<Interview>> {
    const response = await this.client.put<ApiResponse<Interview>>(
      `/api/v1/interviews/${id}`,
      data
    );
    return response.data;
  }

  // Company methods
  async getCompanies(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<Company[]>> {
    const response = await this.client.get<ApiResponse<Company[]>>('/api/v1/companies', {
      params,
    });
    return response.data;
  }

  async getCompany(id: string): Promise<ApiResponse<Company>> {
    const response = await this.client.get<ApiResponse<Company>>(`/api/v1/companies/${id}`);
    return response.data;
  }

  async createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    const response = await this.client.post<ApiResponse<Company>>('/api/v1/companies', companyData);
    return response.data;
  }

  async updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    const response = await this.client.put<ApiResponse<Company>>(`/api/v1/companies/${id}`, companyData);
    return response.data;
  }

  async deleteCompany(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/api/v1/companies/${id}`);
    return response.data;
  }

  // User methods
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  } = {}): Promise<ApiResponse<User[]>> {
    const response = await this.client.get<ApiResponse<User[]>>('/api/v1/users', { params });
    return response.data;
  }

  // Candidate Profile methods
  async getCandidateProfile(id?: string): Promise<ApiResponse> {
    const url = id ? `/api/v1/candidates/${id}` : '/api/v1/candidates/profile';
    const response = await this.client.get(url);
    return response.data;
  }

  async updateCandidateProfile(profileData: any): Promise<ApiResponse> {
    const response = await this.client.put('/api/v1/candidates/profile', profileData);
    return response.data;
  }

  // File upload methods
  async uploadResume(uri: string, fileName: string): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('resume', {
      uri,
      name: fileName,
      type: 'application/pdf',
    } as any);
    formData.append('fileType', 'resume');
    formData.append('entity', 'resumes');

    const response = await this.client.post('/api/v1/files/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Dashboard stats - Aggregates multiple endpoints
  async getDashboardStats(): Promise<ApiResponse> {
    try {
      // Fetch stats from multiple endpoints and aggregate
      const [jobsStats, companiesStats, applicationsStats, interviewsStats] = await Promise.all([
        this.client.get('/api/v1/jobs/stats').catch(() => ({ data: { data: {} } })),
        this.client.get('/api/v1/companies/stats').catch(() => ({ data: { data: {} } })),
        this.client.get('/api/v1/applications/stats').catch(() => ({ data: { data: {} } })),
        this.client.get('/api/v1/interviews/stats').catch(() => ({ data: { data: {} } })),
      ]);

      return {
        success: true,
        data: {
          totalJobs: jobsStats.data.data?.total || 0,
          totalCompanies: companiesStats.data.data?.total || 0,
          totalCandidates: applicationsStats.data.data?.total || 0,
          totalApplications: applicationsStats.data.data?.total || 0,
          activeApplications: applicationsStats.data.data?.active || 0,
          scheduledInterviews: interviewsStats.data.data?.scheduled || 0,
          ...jobsStats.data.data,
          ...companiesStats.data.data,
          ...applicationsStats.data.data,
          ...interviewsStats.data.data,
        },
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return {
        success: false,
        data: {},
      };
    }
  }

  // Agent methods
  async getAgentDashboard(): Promise<ApiResponse> {
    const response = await this.client.get('/api/v1/agents/me/dashboard');
    return response.data;
  }

  async getAgentJobs(params?: any): Promise<ApiResponse<Job[]>> {
    const response = await this.client.get<ApiResponse<Job[]>>('/api/v1/agents/me/jobs', {
      params,
    });
    return response.data;
  }

  async getAgentCandidates(params?: any): Promise<ApiResponse> {
    const response = await this.client.get('/api/v1/agents/me/candidates', { params });
    return response.data;
  }
}

export const apiClient = new ApiClient();

