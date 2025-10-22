import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';
import { BannerDisplay } from '@/components/BannerDisplay';

interface Banner {
  _id: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'gif' | 'video';
  category: 'hr' | 'candidate';
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  // Text-based ad fields
  adType: 'media' | 'text';
  title?: string;
  subtitle?: string;
  content?: string;
  backgroundMediaUrl?: string;
  backgroundMediaType?: 'image' | 'gif' | 'video';
  textColor?: string;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  // Text sizing options
  titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleSize?: 'small' | 'medium' | 'large';
  contentSize?: 'small' | 'medium' | 'large';
  // Text alignment
  textAlignment?: 'left' | 'center' | 'right';
}

interface DashboardBannerProps {
  category: 'hr' | 'candidate';
}

export function DashboardBanner({ category }: DashboardBannerProps) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await apiClient.getActiveBanner(category);
        setBanner(response);
      } catch (error) {
        console.error('Error fetching banner:', error);
        // Don't show error toast for missing banners, just don't display anything
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [category]);

  if (loading || !banner) return null;

  return (
    <Card className="overflow-hidden mb-6">
      <BannerDisplay 
        banner={banner} 
        className="h-[120px]" 
      />
    </Card>
  );
}
