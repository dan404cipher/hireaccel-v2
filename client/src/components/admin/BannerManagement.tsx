import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomSelect } from '@/components/ui/custom-select';
import { TextAdPreview } from '@/components/TextAdPreview';
import { Upload, Trash2, Plus, X, Edit } from 'lucide-react';
import { apiClient } from '@/services/api';
import { toast } from 'sonner';

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
  createdAt: string;
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

export function BannerManagement() {
  const [hrBanners, setHrBanners] = useState<Banner[]>([]);
  const [candidateBanners, setCandidateBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'hr' | 'candidate'>('hr');
  
  // Text ad form state
  const [showTextAdForm, setShowTextAdForm] = useState(false);
  const [editingTextAd, setEditingTextAd] = useState<Banner | null>(null);
  const [textAdForm, setTextAdForm] = useState({
    title: '',
    subtitle: '',
    content: '',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    titleColor: '#000000',
    subtitleColor: '#666666',
    titleSize: 'large' as 'small' | 'medium' | 'large' | 'xlarge',
    subtitleSize: 'medium' as 'small' | 'medium' | 'large',
    contentSize: 'small' as 'small' | 'medium' | 'large',
    textAlignment: 'center' as 'left' | 'center' | 'right',
    backgroundMedia: null as File | null,
  });
  const [creatingTextAd, setCreatingTextAd] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      // Fetch HR banners
      const hrResponse = await apiClient.getBanners('hr');
      // The API returns banners directly, not wrapped in a data property
      const hrBannersData = Array.isArray(hrResponse) ? hrResponse : [];
      setHrBanners(hrBannersData);

      // Fetch Candidate banners
      const candidateResponse = await apiClient.getBanners('candidate');
      // The API returns banners directly, not wrapped in a data property
      const candidateBannersData = Array.isArray(candidateResponse) ? candidateResponse : [];
      setCandidateBanners(candidateBannersData);
      
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
    
    try {
      const result = await apiClient.uploadBanner(file, selectedCategory);
      toast.success(`${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} banner uploaded successfully`);
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

  const handleTextAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!textAdForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (editingTextAd) {
      await handleUpdateTextAd(e);
      return;
    }

    setCreatingTextAd(true);
    
    try {
      await apiClient.createTextAd({
        category: selectedCategory,
        title: textAdForm.title,
        subtitle: textAdForm.subtitle,
        content: textAdForm.content,
        textColor: textAdForm.textColor,
        backgroundColor: textAdForm.backgroundColor,
        titleColor: textAdForm.titleColor,
        subtitleColor: textAdForm.subtitleColor,
        titleSize: textAdForm.titleSize,
        subtitleSize: textAdForm.subtitleSize,
        contentSize: textAdForm.contentSize,
        textAlignment: textAdForm.textAlignment,
        backgroundMedia: textAdForm.backgroundMedia || undefined,
      });
      
      toast.success('Text ad created successfully');
      setShowTextAdForm(false);
      setTextAdForm({
        title: '',
        subtitle: '',
        content: '',
        textColor: '#000000',
        backgroundColor: '#ffffff',
        titleColor: '#000000',
        subtitleColor: '#666666',
        titleSize: 'large',
        subtitleSize: 'medium',
        contentSize: 'small',
        textAlignment: 'center',
        backgroundMedia: null,
      });
      fetchBanners();
    } catch (error) {
      console.error('Error creating text ad:', error);
      toast.error('Failed to create text ad');
    } finally {
      setCreatingTextAd(false);
    }
  };

  const handleBackgroundMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      setTextAdForm(prev => ({ ...prev, backgroundMedia: file }));
    }
  };

  const handleEditTextAd = (banner: Banner) => {
    setEditingTextAd(banner);
    setTextAdForm({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      content: banner.content || '',
      textColor: banner.textColor || '#000000',
      backgroundColor: banner.backgroundColor || '#ffffff',
      titleColor: banner.titleColor || '#000000',
      subtitleColor: banner.subtitleColor || '#666666',
      titleSize: banner.titleSize || 'large',
      subtitleSize: banner.subtitleSize || 'medium',
      contentSize: banner.contentSize || 'small',
      textAlignment: banner.textAlignment || 'center',
      backgroundMedia: null,
    });
    setShowTextAdForm(true);
  };

  const handleUpdateTextAd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTextAd) return;
    
    if (!textAdForm.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setCreatingTextAd(true);
    
    try {
      await apiClient.updateTextAd(editingTextAd._id, {
        title: textAdForm.title,
        subtitle: textAdForm.subtitle,
        content: textAdForm.content,
        textColor: textAdForm.textColor,
        backgroundColor: textAdForm.backgroundColor,
        titleColor: textAdForm.titleColor,
        subtitleColor: textAdForm.subtitleColor,
        titleSize: textAdForm.titleSize,
        subtitleSize: textAdForm.subtitleSize,
        contentSize: textAdForm.contentSize,
        textAlignment: textAdForm.textAlignment,
        backgroundMedia: textAdForm.backgroundMedia || undefined,
      });
      
      toast.success('Text ad updated successfully');
      setShowTextAdForm(false);
      setEditingTextAd(null);
      setTextAdForm({
        title: '',
        subtitle: '',
        content: '',
        textColor: '#000000',
        backgroundColor: '#ffffff',
        titleColor: '#000000',
        subtitleColor: '#666666',
        titleSize: 'large',
        subtitleSize: 'medium',
        contentSize: 'small',
        textAlignment: 'center',
        backgroundMedia: null,
      });
      fetchBanners();
    } catch (error) {
      console.error('Error updating text ad:', error);
      toast.error('Failed to update text ad');
    } finally {
      setCreatingTextAd(false);
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
            <Button
              variant="outline"
              onClick={() => setShowTextAdForm(!showTextAdForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Text Ad
            </Button>
            <p className="text-sm text-muted-foreground">
              Upload an image/video or create a text-based ad
            </p>
          </div>

          {/* Text Ad Creation Form */}
          {showTextAdForm && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {editingTextAd ? 'Edit Text-Based Ad' : 'Create Text-Based Ad'}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowTextAdForm(false);
                      setEditingTextAd(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleTextAdSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={textAdForm.title}
                        onChange={(e) => setTextAdForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter ad title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={textAdForm.subtitle}
                        onChange={(e) => setTextAdForm(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="Enter subtitle (optional)"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={textAdForm.content}
                      onChange={(e) => setTextAdForm(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter ad content (optional)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundMedia">Background Media (Optional)</Label>
                    <Input
                      id="backgroundMedia"
                      type="file"
                      onChange={handleBackgroundMediaChange}
                      accept="image/jpeg,image/png,image/gif,video/mp4"
                      className="cursor-pointer"
                    />
                    {textAdForm.backgroundMedia && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {textAdForm.backgroundMedia.name}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleColor">Title Color</Label>
                      <Input
                        id="titleColor"
                        type="color"
                        value={textAdForm.titleColor}
                        onChange={(e) => setTextAdForm(prev => ({ ...prev, titleColor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitleColor">Subtitle Color</Label>
                      <Input
                        id="subtitleColor"
                        type="color"
                        value={textAdForm.subtitleColor}
                        onChange={(e) => setTextAdForm(prev => ({ ...prev, subtitleColor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <Input
                        id="textColor"
                        type="color"
                        value={textAdForm.textColor}
                        onChange={(e) => setTextAdForm(prev => ({ ...prev, textColor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={textAdForm.backgroundColor}
                        onChange={(e) => setTextAdForm(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Text Sizing Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titleSize">Title Size</Label>
                      <CustomSelect
                        value={textAdForm.titleSize}
                        onChange={(value) => setTextAdForm(prev => ({ ...prev, titleSize: value as 'small' | 'medium' | 'large' | 'xlarge' }))}
                        options={[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' },
                          { value: 'xlarge', label: 'Extra Large' }
                        ]}
                        placeholder="Select title size"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitleSize">Subtitle Size</Label>
                      <CustomSelect
                        value={textAdForm.subtitleSize}
                        onChange={(value) => setTextAdForm(prev => ({ ...prev, subtitleSize: value as 'small' | 'medium' | 'large' }))}
                        options={[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' }
                        ]}
                        placeholder="Select subtitle size"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contentSize">Content Size</Label>
                      <CustomSelect
                        value={textAdForm.contentSize}
                        onChange={(value) => setTextAdForm(prev => ({ ...prev, contentSize: value as 'small' | 'medium' | 'large' }))}
                        options={[
                          { value: 'small', label: 'Small' },
                          { value: 'medium', label: 'Medium' },
                          { value: 'large', label: 'Large' }
                        ]}
                        placeholder="Select content size"
                      />
                    </div>
                  </div>

                  {/* Text Alignment Control */}
                  <div className="space-y-2">
                    <Label htmlFor="textAlignment">Text Alignment</Label>
                    <CustomSelect
                      value={textAdForm.textAlignment}
                      onChange={(value) => setTextAdForm(prev => ({ ...prev, textAlignment: value as 'left' | 'center' | 'right' }))}
                      options={[
                        { value: 'left', label: 'Left' },
                        { value: 'center', label: 'Center' },
                        { value: 'right', label: 'Right' }
                      ]}
                      placeholder="Select text alignment"
                    />
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-2">
                    <Label>Live Preview</Label>
                    <TextAdPreview
                      title={textAdForm.title}
                      subtitle={textAdForm.subtitle}
                      content={textAdForm.content}
                      backgroundColor={textAdForm.backgroundColor}
                      textColor={textAdForm.textColor}
                      titleColor={textAdForm.titleColor}
                      subtitleColor={textAdForm.subtitleColor}
                      titleSize={textAdForm.titleSize}
                      subtitleSize={textAdForm.subtitleSize}
                      contentSize={textAdForm.contentSize}
                      textAlignment={textAdForm.textAlignment}
                      backgroundMedia={textAdForm.backgroundMedia}
                      backgroundMediaUrl={editingTextAd?.backgroundMediaUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/banners/${editingTextAd._id}/background` : undefined}
                      backgroundMediaType={editingTextAd?.backgroundMediaType}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTextAdForm(false);
                        setEditingTextAd(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={creatingTextAd}
                    >
                      {creatingTextAd ? (editingTextAd ? 'Updating...' : 'Creating...') : (editingTextAd ? 'Update Text Ad' : 'Create Text Ad')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

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
                    {activeBanner.adType === 'text' ? (
                      <div className="w-32 h-20 rounded-lg overflow-hidden border" 
                           style={{ 
                             backgroundColor: activeBanner.backgroundColor,
                             color: activeBanner.textColor 
                           }}>
                        <div className="p-2 h-full flex flex-col justify-center">
                          <h4 className="font-bold text-sm truncate" 
                              style={{ color: activeBanner.titleColor }}>
                            {activeBanner.title}
                          </h4>
                          {activeBanner.subtitle && (
                            <p className="text-xs truncate" 
                               style={{ color: activeBanner.subtitleColor }}>
                              {activeBanner.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-20 rounded-lg overflow-hidden">
                        {activeBanner.mediaType === 'video' ? (
                          <video
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/banners/${activeBanner._id}/media`}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            autoPlay
                          />
                        ) : (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/banners/${activeBanner._id}/media`}
                            alt="Active Banner"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-green-800">
                        {activeBanner.adType === 'text' ? 'Text Ad' : 
                         activeBanner.mediaType?.charAt(0).toUpperCase() + activeBanner.mediaType?.slice(1)}
                      </p>
                      <p className="text-sm text-green-600">
                        <strong>Display Size:</strong> Full width × 120px
                      </p>
                      <p className="text-sm text-green-600">
                        Created by {typeof activeBanner.createdBy === 'object' && activeBanner.createdBy ? `${(activeBanner.createdBy as any).firstName} ${(activeBanner.createdBy as any).lastName}` : 'Unknown'}
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
                    {banner.adType === 'text' ? (
                      <div className="w-full h-full border flex items-center justify-center"
                           style={{ 
                             backgroundColor: banner.backgroundColor,
                             color: banner.textColor 
                           }}>
                        <div className="text-center p-1">
                          <h4 className="font-bold text-xs truncate" 
                              style={{ color: banner.titleColor }}>
                            {banner.title}
                          </h4>
                          {banner.subtitle && (
                            <p className="text-xs truncate" 
                               style={{ color: banner.subtitleColor }}>
                              {banner.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {banner.mediaType === 'video' ? (
                          <video
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/banners/${banner._id}/media`}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/v1/banners/${banner._id}/media`}
                            alt="Banner"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-medium">
                      {banner.adType === 'text' ? 'Text Ad' : 
                       banner.mediaType?.charAt(0).toUpperCase() + banner.mediaType?.slice(1)}
                      {banner.isActive && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Display Size:</strong> Full width × 120px
                    </p>
                    {banner.adType === 'text' && banner.title && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Title:</strong> {banner.title}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Created by {typeof banner.createdBy === 'object' && banner.createdBy ? `${(banner.createdBy as any).firstName} ${(banner.createdBy as any).lastName}` : 'Unknown'}
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
                  {banner.adType === 'text' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditTextAd(banner)}
                      title="Edit text ad"
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBanner(banner._id)}
                    title="Delete banner"
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
