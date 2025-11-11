import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/services/api';

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
  titleSize?: 'small' | 'medium' | 'large' | 'xlarge';
  subtitleSize?: 'small' | 'medium' | 'large';
  contentSize?: 'small' | 'medium' | 'large';
  textAlignment?: 'left' | 'center' | 'right';
}

// Persistent cache using localStorage
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'banner_cache_';

// Helper functions for localStorage cache
const getCachedBanner = (key: string): { data: Banner; timestamp: number } | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading banner cache:', error);
  }
  return null;
};

const setCachedBanner = (key: string, data: Banner) => {
  try {
    localStorage.setItem(
      `${CACHE_KEY_PREFIX}${key}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (error) {
    console.error('Error saving banner cache:', error);
  }
};

const clearCachedBanner = (key: string) => {
  try {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
  } catch (error) {
    console.error('Error clearing banner cache:', error);
  }
};

interface UseBannerOptions {
  category: 'hr' | 'candidate';
  pollingInterval?: number; // Auto-refresh interval in ms (optional)
  cacheTimeout?: number; // Cache duration in ms (default 5 minutes)
}

/**
 * Custom hook to fetch and cache banner data
 * Implements:
 * - In-memory caching to reduce API calls
 * - Automatic cache invalidation
 * - Optional polling for live updates
 * - Memoized callbacks to prevent unnecessary re-renders
 */
export function useBanner({ category, pollingInterval, cacheTimeout = CACHE_DURATION }: UseBannerOptions) {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cacheKey = `banner-${category}`;

  const fetchBanner = useCallback(async (skipCache = false) => {
    try {
      // Check localStorage cache first
      if (!skipCache) {
        const cached = getCachedBanner(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTimeout) {
          console.log('📦 Using cached banner data from localStorage for', category);
          setBanner(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      console.log('🌐 Fetching banner from API for', category);
      const response = await apiClient.getActiveBanner(category);
      
      // Update localStorage cache
      setCachedBanner(cacheKey, response);

      setBanner(response);
      setError(null);
      return response;
    } catch (err) {
      console.error('Error fetching banner:', err);
      setError(err as Error);
      // Don't throw - banners are optional UI elements
    } finally {
      setLoading(false);
    }
  }, [category, cacheKey, cacheTimeout]);

  // Initial fetch
  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  // Set up polling if interval provided
  useEffect(() => {
    if (pollingInterval && pollingInterval > 0) {
      pollingIntervalRef.current = setInterval(() => {
        console.log('🔄 Polling for banner updates:', category);
        fetchBanner(true); // Skip cache on polling
      }, pollingInterval);

      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [pollingInterval, fetchBanner, category]);

  // Manual refresh function
  const refresh = useCallback(() => {
    console.log('♻️ Manual banner refresh requested');
    return fetchBanner(true);
  }, [fetchBanner]);

  // Clear cache function
  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing banner cache for', category);
    clearCachedBanner(cacheKey);
  }, [cacheKey, category]);

  return {
    banner,
    loading,
    error,
    refresh,
    clearCache,
  };
}

/**
 * Clear all banner cache (useful when admin updates banners)
 */
export function clearAllBannerCache() {
  console.log('🗑️ Clearing all banner cache from localStorage');
  try {
    // Clear all banner cache entries
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing banner cache:', error);
  }
}

