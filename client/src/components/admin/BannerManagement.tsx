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
  category: 'hr' | 'candidate';
  isActive: boolean;
  createdBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export function BannerManagement() {
  const [hrBanners, setHrBanners] = useState<Banner[]>([]);
  const [candidateBanners, setCandidateBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'hr' | 'candidate'>('hr');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    console.log('=== FRONTEND: FETCHING BANNERS ===');
    try {
      // Fetch HR banners
      console.log('Fetching HR banners...');
      const hrResponse = await apiClient.getBanners('hr');
      console.log('HR banners response:', hrResponse);
      // The API returns banners directly, not wrapped in a data property
      const hrBannersData = Array.isArray(hrResponse) ? hrResponse : [];
      console.log('HR banners data:', hrBannersData);
      setHrBanners(hrBannersData);

      // Fetch Candidate banners
      console.log('Fetching Candidate banners...');
      const candidateResponse = await apiClient.getBanners('candidate');
      console.log('Candidate banners response:', candidateResponse);
      // The API returns banners directly, not wrapped in a data property
      const candidateBannersData = Array.isArray(candidateResponse) ? candidateResponse : [];
      console.log('Candidate banners data:', candidateBannersData);
      setCandidateBanners(candidateBannersData);
      
      console.log('=== FRONTEND: BANNERS FETCHED SUCCESSFULLY ===');
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

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size too large. Maximum size is 50MB');
      return;
    }

    setUploading(true);
    console.log('=== FRONTEND: UPLOADING BANNER ===');
    console.log('File:', file);
    console.log('Selected category:', selectedCategory);
    
    try {
      const result = await apiClient.uploadBanner(file, selectedCategory);
      console.log('Upload result:', result);
      toast.success(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} banner uploaded successfully`);
      console.log('Refreshing banners...');
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

  const currentBanners = selectedCategory === 'hr' ? hrBanners : candidateBanners;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Management</CardTitle>
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={selectedCategory === 'hr' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('hr')}
            className="relative"
          >
            HR Ads
          </Button>
          <Button
            variant={selectedCategory === 'candidate' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('candidate')}
            className="relative"
          >
            Candidate Ads
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Banner Specifications */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Banner Design Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">Dimensions</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• <strong>Height:</strong> 120px (fixed)</li>
                  <li>• <strong>Width:</strong> Full container width (responsive)</li>
                  <li>• <strong>Aspect Ratio:</strong> Flexible (16:9 recommended)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">File Requirements</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• <strong>Formats:</strong> JPG, PNG, GIF, MP4</li>
                  <li>• <strong>Max Size:</strong> 50MB</li>
                  <li>• <strong>Quality:</strong> High resolution recommended</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-700">Design Tips</h4>
                <ul className="space-y-1 text-blue-600">
                  <li>• Keep text readable at small sizes</li>
                  <li>• Use high contrast colors</li>
                  <li>• Test on different screen sizes</li>
                  <li>• Consider mobile responsiveness</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Recommended dimensions for best results:</strong> 1920×120px, 1600×120px, or 1200×120px
              </p>
            </div>
          </div>

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
              {uploading ? 'Uploading...' : `Upload New ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Banner`}
            </Button>
            <p className="text-sm text-muted-foreground">
              Upload an image (JPG, PNG, GIF) or video (MP4). Max size: 50MB
            </p>
          </div>

          {/* Current Active Banner */}
          {(() => {
            const activeBanner = currentBanners.find(banner => banner.isActive);
            if (activeBanner) {
              return (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-3">
                    Current Active {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Banner
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 rounded-lg overflow-hidden">
                      {activeBanner.mediaType === 'video' ? (
                        <video
                          src={activeBanner.mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                        />
                      ) : (
                        <img
                          src={activeBanner.mediaUrl}
                          alt="Active Banner"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-green-800">
                        {activeBanner.mediaType.charAt(0).toUpperCase() + activeBanner.mediaType.slice(1)}
                      </p>
                      <p className="text-sm text-green-600">
                        <strong>Display Size:</strong> Full width × 120px
                      </p>
                      <p className="text-sm text-green-600">
                        Uploaded by {activeBanner.createdBy.firstName} {activeBanner.createdBy.lastName}
                      </p>
                      <p className="text-sm text-green-600">
                        {new Date(activeBanner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* All Banners List */}
          <div className="space-y-4">
            <h3 className="font-medium">
              All {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Banners
            </h3>
            {currentBanners.map((banner) => (
              <div
                key={banner._id}
                className={`border rounded-lg p-4 flex items-center justify-between ${
                  banner.isActive ? 'border-green-200 bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                    {banner.mediaType === 'video' ? (
                      <video
                        src={banner.mediaUrl}
                        className="w-full h-full object-cover"
                        muted
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
                      {banner.isActive && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Display Size:</strong> Full width × 120px
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

            {currentBanners.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No {selectedCategory} banners uploaded yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
