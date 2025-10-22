import React from 'react';
import { TextAdDisplay } from './TextAdDisplay';

interface TextAdPreviewProps {
  title: string;
  subtitle?: string;
  content?: string;
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleSize?: 'small' | 'medium' | 'large';
  contentSize?: 'small' | 'medium' | 'large';
  textAlignment?: 'left' | 'center' | 'right';
  backgroundMedia?: File | null;
  backgroundMediaUrl?: string;
  backgroundMediaType?: 'image' | 'gif' | 'video';
}

export function TextAdPreview({
  title,
  subtitle,
  content,
  backgroundColor = '#ffffff',
  textColor = '#000000',
  titleColor = '#000000',
  subtitleColor = '#666666',
  titleSize = 'large',
  subtitleSize = 'medium',
  contentSize = 'small',
  textAlignment = 'center',
  backgroundMedia,
  backgroundMediaUrl,
  backgroundMediaType
}: TextAdPreviewProps) {
  // Use uploaded file URL if available, otherwise use existing background
  const previewBackgroundUrl = backgroundMedia ? URL.createObjectURL(backgroundMedia) : backgroundMediaUrl;
  const previewBackgroundType = backgroundMedia ? 
    (backgroundMedia.type.startsWith('video/') ? 'video' : 
     backgroundMedia.type === 'image/gif' ? 'gif' : 'image') : 
    backgroundMediaType;

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-50">
      <div className="p-3 border-b bg-gray-100">
        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
      </div>
      <div className="p-4">
        <div className="border rounded-lg overflow-hidden" style={{ maxWidth: '100%' }}>
          <TextAdDisplay
            title={title || 'Your Title Here'}
            subtitle={subtitle}
            content={content}
            backgroundColor={backgroundColor}
            textColor={textColor}
            titleColor={titleColor}
            subtitleColor={subtitleColor}
            titleSize={titleSize}
            subtitleSize={subtitleSize}
            contentSize={contentSize}
            textAlignment={textAlignment}
            backgroundMediaUrl={previewBackgroundUrl}
            backgroundMediaType={previewBackgroundType}
            className="h-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
