import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppLayout } from "./components/layout/AppLayout";
import { PageLoadingSpinner } from "./components/ui/LoadingSpinner";
import { useRoutePreloader } from "./hooks/useRoutePreloader";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load all page components for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AgentAllocation = lazy(() => import("./pages/agents/AgentAllocation"));
const AgentAssignmentDashboard = lazy(() => import("./pages/agents/AgentAssignmentDashboard"));
const JobManagement = lazy(() => import("./pages/jobs/JobManagementIntegrated"));
const JobDetailsPage = lazy(() => import("./pages/jobs/JobDetailsPage"));
const JobEditPage = lazy(() => import("./pages/jobs/JobEditPage"));
const SharedCandidates = lazy(() => import("./pages/candidates/SharedCandidates"));
const CandidateApplications = lazy(() => import("./pages/candidates/CandidateApplications"));
const CandidateProfile = lazy(() => import("./pages/candidates/CandidateProfile"));
const CandidateDashboard = lazy(() => import("./pages/dashboards/CandidateDashboard"));
const HRDashboard = lazy(() => import("./pages/dashboards/HRDashboard"));
const AgentDashboard = lazy(() => import("./pages/dashboards/AgentDashboard"));
const InterviewManagement = lazy(() => import("./pages/interviews/InterviewManagement"));
const CompanyManagement = lazy(() => import("./pages/companies/CompanyManagement"));
const UserManagement = lazy(() => import("./pages/users/UserManagement"));
const AdminDashboard = lazy(() => import("./pages/dashboards/AdminDashboard"));
const AnalyticsReports = lazy(() => import("./pages/admin/AnalyticsReports"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const BannerManagement = lazy(() => import("./pages/admin/BannerManagement"));
const HRProfile = lazy(() => import("./pages/hr/HRProfile"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage").then(module => ({ default: module.SignupPage })));
const OTPVerificationPage = lazy(() => import("./pages/auth/OTPVerificationPage").then(module => ({ default: module.OTPVerificationPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const HRProfessionals = lazy(() => import("./components/landingpage/hr/HRFeatures").then(module => ({ default: module.HRProfessionals })));
const JobCandidates = lazy(() => import("./components/landingpage/condidate/CandidateFeatures").then(module => ({ default: module.JobCandidates })));
const ForgetPasswordPage = lazy(() => import("./pages/auth/ForgetPasswordPage").then(module => ({ default: module.ForgetPasswordPage })));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage").then(module => ({ default: module.ResetPasswordPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingSpinner text="Authenticating..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Role-based Route Protection Component
function RoleProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <PageLoadingSpinner text="Authenticating..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!user?.role || !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have access
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

// Dashboard Router - Shows appropriate dashboard based on user role
function DashboardRouter() {
  const { user } = useAuth();
  
  if (user?.role === 'candidate') {
    return <CandidateDashboard />;
  }
  
  if (user?.role === 'hr') {
    return <HRDashboard />;
  }
  
  if (user?.role === 'agent') {
    return <AgentDashboard />;
  }
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <Dashboard />;
}

// App Router Component (needs to be inside AuthProvider)
function AppRouter() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  // Enable route preloading for better performance
  useRoutePreloader();
  if (loading) {
    return <PageLoadingSpinner text="Authenticating..." />;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
        } 
      />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } 
      />
      <Route 
        path="/forget-password" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgetPasswordPage onBackToSignin={() => {navigate('/login')}} onContinueToResetPassword={() => {navigate('/reset-password')}} />
        } 
      />
      <Route 
        path="/reset-password" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <ResetPasswordPage />
        } 
      />
      <Route 
        path="/signup" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/signup/hr" replace />
        } 
      />
      <Route 
        path="/signup/hr" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage onSwitchToSignin={() => {}} />
        } 
      />
      <Route 
        path="/signup/candidate" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage onSwitchToSignin={() => {}} />
        } 
      />
      <Route 
        path="/auth/verify-otp" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <OTPVerificationPage />
        } 
      />
      <Route>
        <Route path="/hr" element={<HRProfessionals />} />
        <Route path="/candidate" element={<JobCandidates />} />
      </Route>
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardRouter />} />
        <Route path="agents" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AgentAllocation />
          </RoleProtectedRoute>
        } />
        <Route path="assignment-management" element={
          <RoleProtectedRoute allowedRoles={['agent']}>
            <AgentAssignmentDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="agent-interviews" element={
          <RoleProtectedRoute allowedRoles={['agent']}>
            <InterviewManagement />
          </RoleProtectedRoute>
        } />
        <Route path="jobs" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
            <JobManagement />
          </RoleProtectedRoute>
        } />
        <Route path="jobs/:jobId" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
            <JobDetailsPage />
          </RoleProtectedRoute>
        } />
        <Route path="jobs/:jobId/edit" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
            <JobEditPage />
          </RoleProtectedRoute>
        } />
        <Route path="shared-candidates" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'agent']}>
            <SharedCandidates />
          </RoleProtectedRoute>
        } />
        <Route path="interviews" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'agent']}>
            <InterviewManagement />
          </RoleProtectedRoute>
        } />
        <Route path="candidate-interviews" element={
          <RoleProtectedRoute allowedRoles={['candidate']}>
            <InterviewManagement />
          </RoleProtectedRoute>
        } />
        <Route path="companies" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
            <CompanyManagement />
          </RoleProtectedRoute>
        } />
        <Route path="users" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </RoleProtectedRoute>
        } />
        
        {/* Candidate Routes */}
        <Route path="candidate-applications" element={
          <RoleProtectedRoute allowedRoles={['candidate']}>
            <CandidateApplications />
          </RoleProtectedRoute>
        } />
        {/* Candidate Profile Routes */}
        <Route path="candidate-profile/:customId?" element={
          <RoleProtectedRoute allowedRoles={['candidate']}>
            <CandidateProfile />
          </RoleProtectedRoute>
        } />
        <Route path="candidates/:candidateId" element={
          <RoleProtectedRoute allowedRoles={['admin', 'hr', 'agent']}>
            <CandidateProfile />
          </RoleProtectedRoute>
        } />
        
        {/* HR Routes */}
        <Route path="hr-profile/:customId?" element={
          <RoleProtectedRoute allowedRoles={['hr', 'admin']}>
            <HRProfile />
          </RoleProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="analytics" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AnalyticsReports />
          </RoleProtectedRoute>
        } />
        <Route path="admin-profile" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <AdminProfile />
          </RoleProtectedRoute>
        } />
        <Route path="post-ads" element={
          <RoleProtectedRoute allowedRoles={['admin']}>
            <BannerManagement />
          </RoleProtectedRoute>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ErrorBoundary>
            <Suspense fallback={<PageLoadingSpinner text="Loading application..." />}>
              <AuthProvider>
                <NotificationProvider>
                  <PerformanceMonitor />
                  <AppRouter />
                </NotificationProvider>
              </AuthProvider>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
