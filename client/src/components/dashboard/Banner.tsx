import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { BannerDisplay } from '@/components/BannerDisplay';
import { useBannerContext } from '@/contexts/BannerContext';

interface DashboardBannerProps {
  category: 'hr' | 'candidate';
}

/**
 * Dashboard Banner Component with Global Caching
 * 
 * Features:
 * - Global state (persists across route changes)
 * - localStorage cache (24 hours)
 * - Memoized to prevent re-renders
 * - Never re-fetches on route navigation
 */
export const DashboardBanner = memo(function DashboardBanner({ category }: DashboardBannerProps) {
  const { hrBanner, candidateBanner, loading } = useBannerContext();
  
  const banner = category === 'hr' ? hrBanner : candidateBanner;

  if (loading || !banner) return null;

  return (
    <Card className="overflow-hidden mb-6">
      <BannerDisplay 
        banner={banner} 
        className="h-[120px]" 
      />
    </Card>
  );
});
