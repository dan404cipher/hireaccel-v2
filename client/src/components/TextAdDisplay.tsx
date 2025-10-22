import React from 'react';

interface TextAdDisplayProps {
  title: string;
  subtitle?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  backgroundMediaUrl?: string;
  backgroundMediaType?: 'image' | 'gif' | 'video';
  titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleSize?: 'small' | 'medium' | 'large';
  contentSize?: 'small' | 'medium' | 'large';
  textAlignment?: 'left' | 'center' | 'right';
  className?: string;
}

export function TextAdDisplay({
  title,
  subtitle,
  content,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  titleColor = '#000000',
  subtitleColor = '#666666',
  backgroundMediaUrl,
  backgroundMediaType,
  titleSize = 'large',
  subtitleSize = 'medium',
  contentSize = 'small',
  textAlignment = 'center',
  className = '',
}: TextAdDisplayProps) {
  // Helper functions for text sizing
  const getTitleSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-lg md:text-xl';
      case 'medium': return 'text-xl md:text-2xl';
      case 'large': return 'text-2xl md:text-3xl';
      case 'xlarge': return 'text-3xl md:text-4xl';
      default: return 'text-2xl md:text-3xl';
    }
  };

  const getSubtitleSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-sm md:text-base';
      case 'medium': return 'text-base md:text-lg';
      case 'large': return 'text-lg md:text-xl';
      default: return 'text-base md:text-lg';
    }
  };

  const getContentSizeClass = (size: string) => {
    switch (size) {
      case 'small': return 'text-xs md:text-sm';
      case 'medium': return 'text-sm md:text-base';
      case 'large': return 'text-base md:text-lg';
      default: return 'text-xs md:text-sm';
    }
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left': return 'text-left';
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  const backgroundStyle = backgroundMediaUrl ? {
    backgroundImage: `url(${backgroundMediaUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  } : {};

  return (
    <div
      className={`relative w-full flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: backgroundMediaUrl ? 'transparent' : backgroundColor,
        color: textColor,
        minHeight: '120px',
        ...backgroundStyle,
      }}
    >
      {/* Background Media Overlay */}
      {backgroundMediaUrl && (
        <div className="absolute inset-0 z-0">
          {backgroundMediaType === 'video' ? (
            <video
              src={backgroundMediaUrl}
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={backgroundMediaUrl}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay for better text readability */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundColor: backgroundColor,
              opacity: 0.8,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 px-4 py-2 max-w-4xl ${getAlignmentClass(textAlignment)}`}>
        <h2
          className={`${getTitleSizeClass(titleSize)} font-bold mb-2`}
          style={{ color: titleColor }}
        >
          {title}
        </h2>
        
        {subtitle && (
          <h3
            className={`${getSubtitleSizeClass(subtitleSize)} font-semibold mb-3`}
            style={{ color: subtitleColor }}
          >
            {subtitle}
          </h3>
        )}
        
        {content && (
          <p
            className={`${getContentSizeClass(contentSize)} leading-relaxed`}
            style={{ color: textColor }}
          >
            {content}
          </p>
        )}
      </div>
    </div>
  );
}
