import React from 'react';
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

export function BannerDisplay({ banner, className = '' }: BannerDisplayProps) {
  if (banner.adType === 'text') {
    return (
      <TextAdDisplay
        title={banner.title!}
        subtitle={banner.subtitle}
        content={banner.content}
        backgroundColor={banner.backgroundColor}
        textColor={banner.textColor}
        titleColor={banner.titleColor}
        subtitleColor={banner.subtitleColor}
        backgroundMediaUrl={banner.backgroundMediaUrl}
        backgroundMediaType={banner.backgroundMediaType}
        titleSize={banner.titleSize}
        subtitleSize={banner.subtitleSize}
        contentSize={banner.contentSize}
        textAlignment={banner.textAlignment}
        className={className}
      />
    );
  }

  // Media banner display
  return (
    <div className={`w-full flex items-center justify-center overflow-hidden ${className}`} style={{ minHeight: '120px' }}>
      {banner.mediaType === 'video' ? (
        <video
          src={banner.mediaUrl}
          className="w-full h-full object-cover"
          muted
          loop
          autoPlay
          playsInline
        />
      ) : (
        <img
          src={banner.mediaUrl}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}
