import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';

interface Banner {
  _id: string;
  mediaUrl: string;
  mediaType: 'image' | 'gif' | 'video';
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
}

export function DashboardBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await apiClient.getActiveBanner();
        setBanner(response.data);
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

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
