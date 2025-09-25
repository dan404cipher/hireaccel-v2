import React, { useEffect, useState } from 'react';

export const WaterLoader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let isPageReady = false;

    // Comprehensive page readiness check
    const checkPageReady = () => {
      // Check if document is ready
      if (document.readyState !== 'complete') return false;
      
      // Check if all images are loaded (including background images)
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
      
      // Check if all lazy components are loaded
      const lazyElements = document.querySelectorAll('[data-lazy]');
      const allLazyLoaded = lazyElements.length === 0 || 
        Array.from(lazyElements).every(el => el.getAttribute('data-loaded') === 'true');
      
      return allImagesLoaded && bgImagesLoaded && noSuspenseFallbacks && 
             contentVisible && allSectionsRendered && allLazyLoaded;
    };

    // Progress bar animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 15); // Slightly faster progress

    // Check page readiness periodically
    const checkInterval = setInterval(() => {
      if (checkPageReady() && progress >= 100) {
        isPageReady = true;
        clearInterval(checkInterval);
        // Add a small delay for smooth transition
        setTimeout(() => {
          setIsVisible(false);
          // Dispatch custom event to notify LandingPage
          window.dispatchEvent(new CustomEvent('loaderComplete'));
        }, 500);
      }
    }, 100);

    // Fallback timer (maximum 5 seconds)
    const fallbackTimer = setTimeout(() => {
      if (!isPageReady) {
        clearInterval(checkInterval);
        clearInterval(progressInterval);
        setIsVisible(false);
        // Dispatch custom event to notify LandingPage
        window.dispatchEvent(new CustomEvent('loaderComplete'));
      }
    }, 5000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(checkInterval);
      clearTimeout(fallbackTimer);
    };
  }, [progress]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-out'
      }}
    >
      <div className="flex flex-col items-center justify-center space-y-6 md:space-y-8 px-4">
        <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white font-inter text-center">
          HIREACCEL
        </div>
        
        {/* Progress bar container */}
        <div className="w-64 sm:w-80 md:w-96 bg-gray-700 rounded-full h-1.5 md:h-2 overflow-hidden">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Progress percentage */}
        <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500 font-inter text-center">
          {progress}%
        </div>
      </div>
    </div>
  );
};