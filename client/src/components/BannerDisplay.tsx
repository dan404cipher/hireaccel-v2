import React, { memo } from 'react';
import { TextAdDisplay } from './TextAdDisplay';

interface Banner {
  _id: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'gif' | 'video';
  category: 'hr' | 'candidate';
  isActive: boolean;
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

interface BannerDisplayProps {
  banner: Banner;
  className?: string;
}

/**
 * Memoized Banner Display Component
 * Only re-renders when banner ID or className changes
 */
export const BannerDisplay = memo(function BannerDisplay({ banner, className = '' }: BannerDisplayProps) {
  // Get API URL from environment
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  
  console.log('🎬 BannerDisplay - Banner Data:', {
    bannerId: banner._id,
    adType: banner.adType,
    mediaUrl: banner.mediaUrl,
    mediaType: banner.mediaType,
    backgroundMediaUrl: banner.backgroundMediaUrl,
    apiUrl
  });
  
  if (banner.adType === 'text') {
    // For text ads, we need to proxy the background media URL if it exists
    const proxiedBackgroundUrl = banner.backgroundMediaUrl 
      ? `${apiUrl}/api/v1/banners/${banner._id}/background`
      : undefined;
    
    console.log('📄 Text Ad - Proxied Background URL:', proxiedBackgroundUrl);
      
    return (
      <TextAdDisplay
        title={banner.title!}
        subtitle={banner.subtitle}
        content={banner.content}
        backgroundColor={banner.backgroundColor}
        textColor={banner.textColor}
        titleColor={banner.titleColor}
        subtitleColor={banner.subtitleColor}
        backgroundMediaUrl={proxiedBackgroundUrl}
        backgroundMediaType={banner.backgroundMediaType}
        titleSize={banner.titleSize}
        subtitleSize={banner.subtitleSize}
        contentSize={banner.contentSize}
        textAlignment={banner.textAlignment}
        className={className}
      />
    );
  }

  // Media banner display - use proxy endpoint instead of direct S3 URL
  const proxiedMediaUrl = `${apiUrl}/api/v1/banners/${banner._id}/media`;
  
  console.log('🎥 Media Banner - Proxied Media URL:', proxiedMediaUrl);
  
  return (
    <div className={`w-full flex items-center justify-center overflow-hidden ${className}`} style={{ minHeight: '120px' }}>
      {banner.mediaType === 'video' ? (
        <video
          key={banner._id}
          src={proxiedMediaUrl}
          className="w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          {...({ 'webkit-playsinline': 'true' } as any)}
        />
      ) : (
        <img
          src={proxiedMediaUrl}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if banner ID or className changes
  return prevProps.banner._id === nextProps.banner._id && 
         prevProps.className === nextProps.className;
});
