import { useState, useEffect, useRef } from 'react';

/**
 * Hook to fetch an authenticated image and convert it to a blob URL
 * This is necessary because <img> tags don't send Authorization headers
 */
export function useAuthenticatedImage(imageUrl: string | null | undefined): string | null {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const currentBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
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
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(imageUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          console.error('Failed to fetch image:', response.status, response.statusText);
          setBlobUrl(null);
          currentBlobUrlRef.current = null;
          return;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        currentBlobUrlRef.current = url;
        setBlobUrl(url);
      } catch (error) {
        console.error('Error fetching authenticated image:', error);
        setBlobUrl(null);
        currentBlobUrlRef.current = null;
      }
    };

    fetchImage();

    // Cleanup: revoke blob URL when component unmounts or URL changes
    return () => {
      if (currentBlobUrlRef.current && currentBlobUrlRef.current.startsWith('blob:')) {
        window.URL.revokeObjectURL(currentBlobUrlRef.current);
        currentBlobUrlRef.current = null;
      }
    };
  }, [imageUrl]);

  return blobUrl;
}

