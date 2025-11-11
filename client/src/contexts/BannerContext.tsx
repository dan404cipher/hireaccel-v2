import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface BannerContextType {
  hrBanner: Banner | null;
  candidateBanner: Banner | null;
  loading: boolean;
  refreshBanners: () => Promise<void>;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

const CACHE_KEY = 'banner_cache_global';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedBanners {
  hr: Banner | null;
  candidate: Banner | null;
  timestamp: number;
}

/**
 * Banner Provider - Maintains global banner state across route changes
 * This prevents re-fetching banners when navigating between pages
 */
export function BannerProvider({ children }: { children: ReactNode }) {
  const [hrBanner, setHrBanner] = useState<Banner | null>(null);
  const [candidateBanner, setCandidateBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromCache = (): CachedBanners | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedBanners = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          console.log('📦 Loading banners from localStorage cache');
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading banner cache:', error);
    }
    return null;
  };

  const saveToCache = (hr: Banner | null, candidate: Banner | null) => {
    try {
      const cacheData: CachedBanners = {
        hr,
        candidate,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('💾 Banners saved to localStorage cache');
    } catch (error) {
      console.error('Error saving banner cache:', error);
    }
  };

  const fetchBanners = async () => {
    try {
      console.log('🌐 Fetching banners from API');
      
      // Fetch both banners in parallel
      const [hrResponse, candidateResponse] = await Promise.allSettled([
        apiClient.getActiveBanner('hr'),
        apiClient.getActiveBanner('candidate'),
      ]);

      const hr = hrResponse.status === 'fulfilled' ? hrResponse.value : null;
      const candidate = candidateResponse.status === 'fulfilled' ? candidateResponse.value : null;

      setHrBanner(hr);
      setCandidateBanner(candidate);
      
      // Save to cache
      saveToCache(hr, candidate);
      
      console.log('✅ Banners loaded and cached');
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBanners = async () => {
    console.log('♻️ Refreshing banners');
    localStorage.removeItem(CACHE_KEY);
    setLoading(true);
    await fetchBanners();
  };

  useEffect(() => {
    // Try to load from cache first
    const cached = loadFromCache();
    if (cached) {
      setHrBanner(cached.hr);
      setCandidateBanner(cached.candidate);
      setLoading(false);
      
      // Fetch in background to check for updates
      fetchBanners();
    } else {
      // No cache, fetch immediately
      fetchBanners();
    }
  }, []);

  return (
    <BannerContext.Provider value={{ hrBanner, candidateBanner, loading, refreshBanners }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBannerContext() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBannerContext must be used within a BannerProvider');
  }
  return context;
}

