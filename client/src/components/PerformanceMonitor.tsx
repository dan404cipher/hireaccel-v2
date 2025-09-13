import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
}

export const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Monitor performance metrics in development
    if (import.meta.env.DEV) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const metrics = {
              'DOM Content Loaded': navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              'Page Load Complete': navEntry.loadEventEnd - navEntry.loadEventStart,
              'Total Load Time': navEntry.loadEventEnd - navEntry.fetchStart,
              'Time to First Byte': navEntry.responseStart - navEntry.fetchStart,
              'DOM Processing': navEntry.domComplete - navEntry.domLoading,
            };
            
            // Filter out invalid values
            const validMetrics = Object.fromEntries(
              Object.entries(metrics).filter(([_, value]) => !isNaN(value) && isFinite(value))
            );
            
            console.log('🚀 Performance Metrics:', validMetrics);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });

      // Monitor bundle size
      const scripts = document.querySelectorAll('script[src]');
      let totalSize = 0;
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && src.includes('assets')) {
          // This is a rough estimate - in production you'd want to measure actual sizes
          console.log('📦 Script loaded:', src);
        }
      });

      return () => observer.disconnect();
    }
  }, []);

  return null; // This component doesn't render anything
};

// Hook to measure component render performance
export const usePerformanceMeasure = (componentName: string) => {
  useEffect(() => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      console.log(`⚡ ${componentName} render time: ${(end - start).toFixed(2)}ms`);
    };
  }, [componentName]);
};
