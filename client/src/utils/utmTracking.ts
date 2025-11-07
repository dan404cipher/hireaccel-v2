/**
 * UTM Tracking Utility
 * Captures and stores UTM parameters for campaign attribution
 */

export interface UTMParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    referrer?: string;
    landing_page?: string;
}

/**
 * Capture UTM parameters from current URL
 */
export const captureUTMParams = (): UTMParams => {
    const params = new URLSearchParams(window.location.search);

    return {
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        utm_content: params.get('utm_content') || undefined,
        utm_term: params.get('utm_term') || undefined,
        referrer: document.referrer || undefined,
        landing_page: window.location.pathname || undefined,
    };
};

/**
 * Store UTM params in localStorage (persist across sessions for 30 days)
 */
export const storeUTMParams = (params: UTMParams): void => {
    // Only store if there's at least one UTM parameter
    if (params.utm_source || params.utm_medium || params.utm_campaign) {
        const existingParams = getStoredUTMParams();

        // Merge with existing params (new params take precedence)
        const mergedParams = { ...existingParams, ...params };

        localStorage.setItem('utm_params', JSON.stringify(mergedParams));
        localStorage.setItem('utm_timestamp', new Date().toISOString());

        // Also store in sessionStorage for immediate access
        sessionStorage.setItem('utm_params', JSON.stringify(mergedParams));
    }
};

/**
 * Retrieve stored UTM params from localStorage
 * Returns null if expired (>30 days) or not found
 */
export const getStoredUTMParams = (): UTMParams | null => {
    // Check if expired first
    if (areUTMParamsExpired()) {
        clearUTMParams();
        return null;
    }

    // Try localStorage first (persists across sessions)
    let stored = localStorage.getItem('utm_params');

    // Fallback to sessionStorage
    if (!stored) {
        stored = sessionStorage.getItem('utm_params');
    }

    if (!stored) return null;

    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
};

/**
 * Get UTM timestamp
 */
export const getUTMTimestamp = (): string | null => {
    return localStorage.getItem('utm_timestamp');
};

/**
 * Check if UTM params are expired (older than 30 days)
 */
export const areUTMParamsExpired = (): boolean => {
    const timestamp = getUTMTimestamp();
    if (!timestamp) return true;

    try {
        const capturedDate = new Date(timestamp);
        const now = new Date();
        const daysDiff = (now.getTime() - capturedDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysDiff > 30;
    } catch {
        return true;
    }
};

/**
 * Get or capture UTM params
 * Returns stored params if available, otherwise captures from current URL
 */
export const getUTMParams = (): UTMParams => {
    // Check if already stored
    const stored = getStoredUTMParams();
    if (stored) return stored;

    // Capture from current URL
    const params = captureUTMParams();

    // Store if we captured anything
    if (params.utm_source || params.utm_medium || params.utm_campaign) {
        storeUTMParams(params);
    }

    return params;
};

/**
 * Clear stored UTM params (e.g., after successful signup)
 */
export const clearUTMParams = (): void => {
    localStorage.removeItem('utm_params');
    localStorage.removeItem('utm_timestamp');
    sessionStorage.removeItem('utm_params');
    sessionStorage.removeItem('utm_captured_at');
};

/**
 * Store referrer URL separately
 */
export const storeReferrer = (): void => {
    if (document.referrer && !localStorage.getItem('referrer_url')) {
        localStorage.setItem('referrer_url', document.referrer);
    }
};

/**
 * Get stored referrer URL
 */
export const getStoredReferrer = (): string | null => {
    return localStorage.getItem('referrer_url');
};

/**
 * Clear referrer URL
 */
export const clearReferrer = (): void => {
    localStorage.removeItem('referrer_url');
};

/**
 * Map UTM source to predefined source categories
 */
export const mapUTMToSource = (utmParams: UTMParams): string => {
    const source = utmParams.utm_source?.toLowerCase();

    // Direct mapping from UTM source to our predefined list
    const mapping: Record<string, string> = {
        facebook: 'Facebook',
        instagram: 'Instagram',
        whatsapp: 'WhatsApp',
        telegram: 'Telegram',
        google: 'Google',
        email: 'Email',
        'conversational-ai': 'Conversational AI (GPT, Gemini etc)',
        gpt: 'Conversational AI (GPT, Gemini etc)',
        gemini: 'Conversational AI (GPT, Gemini etc)',
        chatgpt: 'Conversational AI (GPT, Gemini etc)',
        journal: 'Journals',
        poster: 'Posters',
        brochure: 'Brochures',
        forum: 'Forums',
    };

    // If we have a UTM source and it maps to our categories
    if (source && mapping[source]) {
        return mapping[source];
    }

    // If UTM source exists but doesn't map, use Google as default paid source
    if (source) {
        return 'Google';
    }

    // If no UTM parameters at all, it's direct traffic
    if (!utmParams.utm_source && !utmParams.utm_medium && !utmParams.utm_campaign) {
        return 'Direct';
    }

    // Fallback to Direct
    return 'Direct';
};

/**
 * Check if UTM params have any tracking data
 */
export const hasUTMData = (utmParams: UTMParams): boolean => {
    return !!(
        utmParams.utm_source ||
        utmParams.utm_medium ||
        utmParams.utm_campaign ||
        utmParams.utm_content ||
        utmParams.utm_term
    );
};

/**
 * Get a human-readable summary of UTM tracking
 * Useful for debugging or showing to users
 */
export const getUTMSummary = (utmParams: UTMParams): string => {
    if (!hasUTMData(utmParams)) {
        return 'Direct traffic';
    }

    const parts: string[] = [];

    if (utmParams.utm_campaign) {
        parts.push(`Campaign: ${utmParams.utm_campaign}`);
    }
    if (utmParams.utm_source) {
        parts.push(`Source: ${utmParams.utm_source}`);
    }
    if (utmParams.utm_medium) {
        parts.push(`Medium: ${utmParams.utm_medium}`);
    }

    return parts.join(' | ') || 'Unknown source';
};
