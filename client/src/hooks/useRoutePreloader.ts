import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Route preloading hook for better UX
export const useRoutePreloader = () => {
  const location = useLocation();

  useEffect(() => {
    // Preload common routes based on current location
    const preloadRoutes = () => {
      // Preload dashboard routes
      if (location.pathname.startsWith('/dashboard')) {
        // Preload common dashboard components
        import('../pages/dashboards/HRDashboard');
        import('../pages/dashboards/AdminDashboard');
        import('../pages/dashboards/AgentDashboard');
        import('../pages/dashboards/CandidateDashboard');
      }

      // Preload job management routes
      if (location.pathname.includes('jobs')) {
        import('../pages/jobs/JobDetailsPage');
        import('../pages/jobs/JobEditPage');
      }

      // Preload candidate routes
      if (location.pathname.includes('candidate')) {
        import('../pages/candidates/CandidateProfile');
        import('../pages/candidates/CandidateApplications');
      }

      // Preload company routes
      if (location.pathname.includes('companies')) {
        import('../pages/companies/CompanyManagement');
      }
    };

    // Delay preloading to not interfere with current page load
    const timeoutId = setTimeout(preloadRoutes, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);
};

// Hook to preload specific components on hover
export const useHoverPreload = (preloadFn: () => void) => {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      timeoutId = setTimeout(preloadFn, 200); // Preload after 200ms hover
    };
    
    const handleMouseLeave = () => {
      clearTimeout(timeoutId);
    };

    return () => {
      clearTimeout(timeoutId);
    };
  }, [preloadFn]);
};
