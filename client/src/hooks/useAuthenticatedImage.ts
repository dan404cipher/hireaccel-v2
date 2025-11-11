import { useState, useEffect, useRef } from 'react';

/**
 * Hook to fetch an authenticated image and convert it to a blob URL
 * This is necessary because <img> tags don't send Authorization headers
 */
export function useAuthenticatedImage(imageUrl: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Cleanup previous blob URL
    if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
      window.URL.revokeObjectURL(currentBlobUrlRef.current);
      currentBlobUrlRef.current = null;
    }

    if (!imageUrl) {
      setBlobUrl(null);
      return;
    }

    // If it's already a blob URL, use it directly
    if (imageUrl.startsWith('blob:')) {
      currentBlobUrlRef.current = imageUrl;
      setBlobUrl(imageUrl);
      return;
    }

    // If it's a data URI, use it directly
    if (imageUrl.startsWith('data:')) {
      currentBlobUrlRef.current = null; // No cleanup needed for data URIs
      setBlobUrl(imageUrl);
      return;
    }

    // Fetch the image with authentication
    const fetchImage = async () => {
      // Create new abort controller for this fetch
      abortControllerRef.current = new AbortController();
      
      let retries = 0;
      const maxRetries = 2;
      
      console.log('[useAuthenticatedImage] Starting fetch for:', imageUrl);
      
      while (retries <= maxRetries) {
        try {
          const token = localStorage.getItem('accessToken');
          
          if (!token) {
            console.warn('[useAuthenticatedImage] No access token found, skipping authenticated image fetch');
            setBlobUrl(null);
            return;
          }

          console.log('[useAuthenticatedImage] Fetching with token, attempt:', retries + 1);

          const response = await fetch(imageUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
            signal: abortControllerRef.current.signal,
          });
          
          console.log('[useAuthenticatedImage] Response status:', response.status, response.ok);

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              console.warn('Authentication failed for image:', imageUrl, response.status);
              setBlobUrl(null);
              return;
            }
            
            if (response.status === 404) {
              console.warn('Image not found:', imageUrl);
              setBlobUrl(null);
              return;
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const blob = await response.blob();
          
          console.log('[useAuthenticatedImage] Blob created, size:', blob.size, 'type:', blob.type);
          
          // Check if we were aborted while fetching
          if (abortControllerRef.current.signal.aborted) {
            console.log('[useAuthenticatedImage] Aborted during blob creation');
            return;
          }
          
          const url = window.URL.createObjectURL(blob);
          console.log('[useAuthenticatedImage] Success! Created blob URL:', url);
          currentBlobUrlRef.current = url;
          setBlobUrl(url);
          return; // Success, exit retry loop
          
        } catch (error: any) {
          // Don't retry if aborted
          if (error.name === 'AbortError') {
            console.log('[useAuthenticatedImage] Fetch aborted');
            return;
          }
          
          retries++;
          
          console.log('[useAuthenticatedImage] Error on attempt', retries, ':', error.message || error);
          
          if (retries > maxRetries) {
            console.error(`[useAuthenticatedImage] Failed after ${maxRetries} retries:`, imageUrl, error.message || error);
            setBlobUrl(null);
            currentBlobUrlRef.current = null;
            return;
          }
          
          console.log('[useAuthenticatedImage] Retrying in', 500 * retries, 'ms...');
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * retries));
        }
      }
    };

    fetchImage();

    // Cleanup: abort fetch and revoke blob URL when component unmounts or URL changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [imageUrl]);

  return blobUrl;
}

