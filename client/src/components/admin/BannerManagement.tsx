import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Upload, Trash2 } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

interface Banner {
  _id: string;
  mediaUrl: string;
  mediaType: 'image' | 'gif' | 'video';
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await apiClient.getBanners();
      // Ensure response.data is an array
      const bannersData = Array.isArray(response.data) ? response.data : [];
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload an image (JPG, PNG, GIF) or video (MP4)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 10MB');
      return;
    }

    setUploading(true);
    try {
      await apiClient.uploadBanner(file);
      toast.success('Banner uploaded successfully');
      fetchBanners();
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      await apiClient.updateBannerStatus(bannerId, !currentStatus);
      fetchBanners();
      toast.success('Banner status updated');
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const deleteBanner = async (bannerId: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      await apiClient.deleteBanner(bannerId);
      fetchBanners();
      toast.success('Banner deleted successfully');
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="relative"
              disabled={uploading}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                accept="image/jpeg,image/png,image/gif,video/mp4"
              />
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload New Banner'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Upload an image (JPG, PNG, GIF) or video (MP4). Max size: 10MB
            </p>
          </div>

          {/* Banners List */}
          <div className="space-y-4">
            {banners.map((banner) => (
              <div
                key={banner._id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    {banner.mediaType === 'video' ? (
                      <video
                        src={banner.mediaUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={banner.mediaUrl}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-medium">
                      {banner.mediaType.charAt(0).toUpperCase() + banner.mediaType.slice(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Uploaded by {banner.createdBy.firstName} {banner.createdBy.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={banner.isActive}
                      onCheckedChange={() => toggleBannerStatus(banner._id, banner.isActive)}
                    />
                    <span className="text-sm">
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBanner(banner._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No banners uploaded yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
