import { useEffect, useState } from 'react';

export const usePageReady = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkPageReady = () => {
      // Check if document is ready
      if (document.readyState !== 'complete') return false;
      
      // Check if all images are loaded
      const images = document.querySelectorAll('img');
      const allImagesLoaded = Array.from(images).every(img => 
        img.complete && img.naturalHeight !== 0
      );
      
      // Check if all background images are loaded
      const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
      const bgImagesLoaded = Array.from(elementsWithBg).every(el => {
        const style = window.getComputedStyle(el);
        const bgImage = style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
          return el.offsetHeight > 0;
        }
        return true;
      });
      
      // Check if all Suspense fallbacks are gone
      const suspenseFallbacks = document.querySelectorAll('[data-suspense-fallback]');
      const noSuspenseFallbacks = suspenseFallbacks.length === 0;
      
      // Check if main content is visible
      const mainContent = document.querySelector('main[data-landing-page="true"]');
      const contentVisible = mainContent && mainContent.offsetHeight > 0;
      
      // Check if all sections are rendered
      const sections = document.querySelectorAll('section');
      const allSectionsRendered = sections.length >= 4; // Expected number of sections
      
      return allImagesLoaded && bgImagesLoaded && noSuspenseFallbacks && 
             contentVisible && allSectionsRendered;
    };

    const interval = setInterval(() => {
      if (checkPageReady()) {
        setIsReady(true);
        clearInterval(interval);
      }
    }, 100);

    // Fallback timer
    const fallbackTimer = setTimeout(() => {
      setIsReady(true);
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return isReady;
};
