import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import AgentAllocation from "./pages/agents/AgentAllocation";
import AgentAssignmentDashboard from "./pages/agents/AgentAssignmentDashboard";
import AssignmentTracking from "./pages/agents/AssignmentTracking";
import JobManagement from "./pages/jobs/JobManagementIntegrated";
import JobDetailsPage from "./pages/jobs/JobDetailsPage";
import JobEditPage from "./pages/jobs/JobEditPage";
import SharedCandidates from "./pages/candidates/SharedCandidates";
import CandidateJobs from "./pages/candidates/CandidateJobs";
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
import LoginPage from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import HRFeatures from "./components/landingpage/hr/HRFeatures";
import CandidateFeatures from "./components/landingpage/condidate/CandidateFeatures";

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
        path="/signup" 
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage onSwitchToSignin={() => {}} />
        } 
      />
      <Route>
        <Route path="/hr-features" element={<HRFeatures />} />
        <Route path="/candidate-features" element={<CandidateFeatures />} />
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
        <Route path="assignment-tracking" element={
          <RoleProtectedRoute allowedRoles={['admin', 'agent']}>
            <AssignmentTracking />
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
          <RoleProtectedRoute allowedRoles={['admin', 'hr']}>
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
        <Route path="candidate-jobs" element={
          <RoleProtectedRoute allowedRoles={['candidate']}>
            <CandidateJobs />
          </RoleProtectedRoute>
        } />
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
        <BrowserRouter>
          <AuthProvider>
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
              }
            >
              <AppRouter />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
