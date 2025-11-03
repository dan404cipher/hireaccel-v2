/**
 * Analytics Utility
 * Handles PostHog and Microsoft Clarity initialization
 * Clarity is a free alternative to OpenReplay for session replay and heatmaps
 */

// PostHog initialization
export const initializePostHog = () => {
  const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
  const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

  if (posthogKey && typeof window !== 'undefined') {
    // Dynamic import to avoid SSR issues
    import('posthog-js').then((posthogModule) => {
      const posthog = posthogModule.default;
      
      if (!posthog.__loaded) {
        posthog.init(posthogKey, {
          api_host: posthogHost,
          autocapture: true,
          capture_pageview: true,
          capture_pageleave: true,
          // Reduce batch size to avoid 64KB beacon limit
          batch_size: 10,
          // Use compression to reduce payload size
          compression: 'gzip-js',
          // Reduce max_batch_queue_size to prevent queue overflow
          max_batch_queue_size: 100,
          // Flush events more frequently
          batch_flush_interval_ms: 1000,
        });
        console.log('✅ PostHog initialized with optimized settings');
      }
    }).catch((error) => {
      console.warn('PostHog initialization failed:', error);
    });
  }
};

// Microsoft Clarity initialization (free alternative to OpenReplay)
// Clarity provides session replay, heatmaps, and click tracking
export const initializeClarity = () => {
  const clarityId = import.meta.env.VITE_CLARITY_ID;

  if (clarityId && typeof window !== 'undefined') {
    // Dynamic import to avoid SSR issues
    import('@microsoft/clarity').then((clarityModule) => {
      const Clarity = clarityModule.default;
      Clarity.init(clarityId);
      console.log('✅ Microsoft Clarity initialized with project ID:', clarityId);
      console.log('📊 Clarity is now tracking. Visit your website pages to generate data.');
      console.log('⏱️  Data will appear in Clarity dashboard after 5-10 minutes of user activity.');
      
      // Verify Clarity is accessible
      setTimeout(() => {
        if (typeof (window as any).clarity !== 'undefined') {
          console.log('✅ Clarity object is available in window.clarity');
          console.log('🔍 To verify tracking: Open Network tab, filter by "clarity", refresh page');
          console.log('📡 You should see requests to v.clarity.ms/collect if tracking is working');
        } else {
          console.warn('⚠️ Clarity object not found. This might be normal - it loads asynchronously.');
        }
      }, 1000);
    }).catch((error) => {
      console.error('❌ Microsoft Clarity initialization failed:', error);
      console.warn('Make sure @microsoft/clarity package is installed: npm install @microsoft/clarity');
    });
  } else if (typeof window !== 'undefined') {
    console.warn('⚠️ Microsoft Clarity not configured. Add VITE_CLARITY_ID to your .env file');
    console.info('To set up Clarity:');
    console.info('1. Go to https://clarity.microsoft.com and create a project');
    console.info('2. Copy your Project ID from Settings → Overview');
    console.info('3. Add VITE_CLARITY_ID=your_project_id to your .env file');
    console.info('4. Restart your dev server');
  }
};

// Clarity helper functions for advanced tracking
export const clarityIdentify = (customId: string, customSessionId?: string, customPageId?: string, friendlyName?: string) => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_CLARITY_ID) {
    import('@microsoft/clarity').then((clarityModule) => {
      const Clarity = clarityModule.default;
      Clarity.identify(customId, customSessionId, customPageId, friendlyName);
    }).catch(() => {
      // Silently fail if Clarity is not available
    });
  }
};

export const claritySetTag = (key: string, value: string | string[]) => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_CLARITY_ID) {
    import('@microsoft/clarity').then((clarityModule) => {
      const Clarity = clarityModule.default;
      Clarity.setTag(key, value);
    }).catch(() => {
      // Silently fail if Clarity is not available
    });
  }
};

export const clarityEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_CLARITY_ID) {
    import('@microsoft/clarity').then((clarityModule) => {
      const Clarity = clarityModule.default;
      Clarity.event(eventName);
    }).catch(() => {
      // Silently fail if Clarity is not available
    });
  }
};

export const clarityUpgrade = (reason: string) => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_CLARITY_ID) {
    import('@microsoft/clarity').then((clarityModule) => {
      const Clarity = clarityModule.default;
      Clarity.upgrade(reason);
    }).catch(() => {
      // Silently fail if Clarity is not available
    });
  }
};

export const clarityConsent = (consent: boolean = true) => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_CLARITY_ID) {
    import('@microsoft/clarity').then((clarityModule) => {
      const Clarity = clarityModule.default;
      Clarity.consent(consent);
    }).catch(() => {
      // Silently fail if Clarity is not available
    });
  }
};

// Initialize all analytics tools
export const initializeAnalytics = () => {
  initializePostHog();
  initializeClarity();
};

