import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';

interface Banner {
  _id: string;
  mediaUrl: string;
  mediaType: 'image' | 'gif' | 'video';
  category: 'hr' | 'candidate';
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
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
      {banner.mediaType === 'video' ? (
        <video
          className="w-full h-[120px] object-cover"
          autoPlay
          loop
          muted
          playsInline
          controls={false}
        >
          <source src={banner.mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={banner.mediaUrl}
          alt="Dashboard Banner"
          className="w-full h-[120px] object-cover"
        />
      )}
    </Card>
  );
}
