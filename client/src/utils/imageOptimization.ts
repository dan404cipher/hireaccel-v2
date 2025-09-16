import { useEffect, useState } from 'react';

// Function to generate srcSet for responsive images
export const generateSrcSet = (imageUrl: string, sizes: number[] = [300, 600, 900, 1200]) => {
  if (imageUrl.includes('unsplash.com')) {
    return sizes
      .map(size => {
        const optimizedUrl = imageUrl.replace(/w=\d+/, `w=${size}`);
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  }
  return '';
};

// Custom hook for lazy loading images
export const useLazyImage = (src: string, options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      setCurrentSrc(src);
    };
  }, [src]);

  return { isLoaded, currentSrc };
};

// Function to get optimized background style
export const getOptimizedBackgroundStyle = (imageUrl: string) => {
  return {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    loading: 'lazy' as const
  };
};

// Function to get WebP URL if supported
export const getWebPUrl = (imageUrl: string) => {
  if (imageUrl.includes('unsplash.com')) {
    return imageUrl.includes('fm=') 
      ? imageUrl.replace(/fm=\w+/, 'fm=webp') 
      : `${imageUrl}&fm=webp`;
  }
  return imageUrl;
};
