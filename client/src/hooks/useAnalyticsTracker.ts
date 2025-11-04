import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { clarityIdentify, clarityEvent, claritySetTag } from '@/utils/analytics';

/**
 * Analytics Tracker Hook
 * Tracks user events and sends them to the backend
 */

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Get or store UTM parameters from URL
const getUTMParams = (): { source?: string; medium?: string; campaign?: string } => {
  const urlParams = new URLSearchParams(window.location.search);
  const utm = {
    source: urlParams.get('utm_source') || undefined,
    medium: urlParams.get('utm_medium') || undefined,
    campaign: urlParams.get('utm_campaign') || undefined,
  };

  // Store UTM params in localStorage if they exist
  if (utm.source || utm.medium || utm.campaign) {
    localStorage.setItem('analytics_utm', JSON.stringify(utm));
    return utm;
  }

  // Return stored UTM params if available
  const stored = localStorage.getItem('analytics_utm');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return {};
    }
  }

  return {};
};

// Track scroll depth
const trackScroll = (
  sessionId: string,
  page: string,
  utm: { source?: string; medium?: string; campaign?: string },
  userId?: string
) => {
  let maxScroll = 0;
  let tracked50 = false;
  let tracked100 = false;

  const handleScroll = () => {
    const scrollPercent = Math.round(
      ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
    );

    if (scrollPercent >= 50 && !tracked50) {
      tracked50 = true;
      apiClient.trackEvent({
        eventName: 'scroll_event',
        page,
        sessionId,
        userId,
        eventData: { scrollPercent: 50 },
        utm,
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    }

    if (scrollPercent >= 100 && !tracked100) {
      tracked100 = true;
      apiClient.trackEvent({
        eventName: 'scroll_event',
        page,
        sessionId,
        userId,
        eventData: { scrollPercent: 100 },
        utm,
      }).catch(() => {
        // Silently fail
      });
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
};

export const useAnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionIdRef = useRef<string>(getSessionId());
  const sessionStartTimeRef = useRef<number>(Date.now());
  const pagesViewedRef = useRef<Set<string>>(new Set());
  const scrollCleanupRef = useRef<(() => void) | null>(null);

  // Track page view
  const trackPageView = useCallback(() => {
    const page = location.pathname + location.search;
    const utm = getUTMParams();
    const referrer = document.referrer || undefined;

    pagesViewedRef.current.add(page);

    // Track to our backend
    apiClient.trackEvent({
      eventName: 'page_view',
      page,
      referrer,
      sessionId: sessionIdRef.current,
      userId: user?.id,
      eventData: {},
      utm,
    }).catch(() => {
      // Silently fail
    });

    // Track to Clarity
    if (user?.id) {
      clarityIdentify(user.id, sessionIdRef.current, page, `${user.firstName} ${user.lastName}`);
    } else {
      clarityIdentify(sessionIdRef.current, sessionIdRef.current, page);
    }

    // Set UTM tags in Clarity
    if (utm.source) {
      claritySetTag('utm_source', utm.source);
    }
    if (utm.medium) {
      claritySetTag('utm_medium', utm.medium);
    }
    if (utm.campaign) {
      claritySetTag('utm_campaign', utm.campaign);
    }

    // Clean up previous scroll tracker
    if (scrollCleanupRef.current) {
      scrollCleanupRef.current();
    }

    // Set up new scroll tracker for this page
    scrollCleanupRef.current = trackScroll(
      sessionIdRef.current,
      page,
      utm,
      user?.id
    );
  }, [location, user?.id]);

  // Track custom event
  const trackEvent = useCallback((
    eventName: string,
    eventData?: Record<string, any>,
    buttonId?: string
  ) => {
    const page = location.pathname + location.search;
    const utm = getUTMParams();

    // Track to our backend
    apiClient.trackEvent({
      eventName,
      page,
      referrer: document.referrer || undefined,
      sessionId: sessionIdRef.current,
      userId: user?.id,
      eventData: {
        ...eventData,
        ...(buttonId && { buttonId }),
      },
      utm,
    }).catch(() => {
      // Silently fail
    });

    // Track to Clarity as well
    clarityEvent(eventName);
    if (buttonId) {
      claritySetTag('button_id', buttonId);
    }
  }, [location, user?.id]);

  // Track session end on unmount
  useEffect(() => {
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);

      // Use sendBeacon for reliable tracking on page unload
      const data = JSON.stringify({
        eventName: 'session_end',
        page: window.location.pathname + window.location.search,
        sessionId: sessionIdRef.current,
        userId: user?.id,
        eventData: {
          pagesViewed: pagesViewedRef.current.size,
        },
        duration,
        utm: getUTMParams(),
      });

      navigator.sendBeacon(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/analytics/track`,
        data
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.id]);

  // Track page view on route change
  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  // Track session start on mount
  useEffect(() => {
    const page = location.pathname + location.search;
    const utm = getUTMParams();

    // Track to our backend
    apiClient.trackEvent({
      eventName: 'session_start',
      page,
      referrer: document.referrer || undefined,
      sessionId: sessionIdRef.current,
      userId: user?.id,
      eventData: {},
      utm,
    }).catch(() => {
      // Silently fail
    });

    // Identify user in Clarity on session start
    if (user?.id) {
      clarityIdentify(user.id, sessionIdRef.current, page, `${user.firstName} ${user.lastName}`);
    } else {
      clarityIdentify(sessionIdRef.current, sessionIdRef.current, page);
    }
  }, []); // Only on mount

  return {
    trackEvent,
    trackPageView,
    sessionId: sessionIdRef.current,
  };
};

