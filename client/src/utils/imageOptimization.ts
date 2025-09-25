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

// Custom hook for preloading critical images (no lazy loading)
export const usePreloadedImage = (src: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    
    // Start loading immediately
    img.src = src;
  }, [src]);

  return { isLoaded, isLoading, error };
};

// Custom hook for lazy loading images (for non-critical images)
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
