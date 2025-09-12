import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AgentAllocation from "./pages/agents/AgentAllocation";
import AgentAssignmentDashboard from "./pages/agents/AgentAssignmentDashboard";
import JobManagement from "./pages/jobs/JobManagementIntegrated";
import JobDetailsPage from "./pages/jobs/JobDetailsPage";
import JobEditPage from "./pages/jobs/JobEditPage";
import SharedCandidates from "./pages/candidates/SharedCandidates";
import CandidateApplications from "./pages/candidates/CandidateApplications";
import CandidateProfile from "./pages/candidates/CandidateProfile";
import CandidateDashboard from "./pages/dashboards/CandidateDashboard";
import HRDashboard from "./pages/dashboards/HRDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import InterviewManagement from "./pages/interviews/InterviewManagement";
import CompanyManagement from "./pages/companies/CompanyManagement";
import UserManagement from "./pages/users/UserManagement";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import AnalyticsReports from "./pages/admin/AnalyticsReports";
import AdminProfile from "./pages/admin/AdminProfile";
import BannerManagement from "./pages/admin/BannerManagement";
import HRProfile from "./pages/hr/HRProfile";
import LoginPage from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { OTPVerificationPage } from "./pages/auth/OTPVerificationPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import { HRProfessionals }  from "./components/landingpage/hr/HRFeatures";
  import {JobCandidates} from "./components/landingpage/condidate/CandidateFeatures";
import { ForgetPasswordPage } from "./pages/auth/ForgetPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
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
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
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
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
              </div>
            }
          >
            <AuthProvider>
              <NotificationProvider>
                <AppRouter />
              </NotificationProvider>
            </AuthProvider>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
