import { useEffect, Suspense, lazy, useState } from "react";
import { CardLoadingSkeleton } from "@/components/ui/LoadingSpinner";
import { WaterLoader } from "@/components/ui/WaterLoader";
import heroBackground from '@/assets/Hero-background.jpeg';
import section1Background from '@/assets/section1.jpg';

// Critical above-the-fold components - load immediately
import { Header } from "@/components/landingpage/Header";
import { Hero } from "@/components/landingpage/Hero";

// Lazy load other components
const Features = lazy(() => import("@/components/landingpage/Features").then(module => ({ default: module.Features })));
const ReadyToStart = lazy(() => import("@/components/landingpage/ReadyToStart").then(module => ({ default: module.ReadyToStart })));
const TalentPool = lazy(() => import("@/components/landingpage/TalentPool").then(module => ({ default: module.TalentPool })));
const HowItWorks = lazy(() => import("@/components/landingpage/HowItWorks").then(module => ({ default: module.HowItWorks })));
const Stats = lazy(() => import("@/components/landingpage/Stats").then(module => ({ default: module.Stats })));
const Testimonials = lazy(() => import("@/components/landingpage/Testimonials").then(module => ({ default: module.Testimonials })));
const CTA = lazy(() => import("@/components/landingpage/CtA").then(module => ({ default: module.CTA })));
const Footer = lazy(() => import("@/components/landingpage/Footer").then(module => ({ default: module.Footer })));
const FloatingNav = lazy(() => import("@/components/landingpage/FloatingNav").then(module => ({ default: module.FloatingNav })));

const LandingPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingNav, setShowFloatingNav] = useState(window.innerWidth >= 800 && window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setShowFloatingNav(window.innerWidth >= 800 && window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Preload critical background images immediately
    const preloadImages = () => {
      const images = [heroBackground, section1Background];
      images.forEach(src => {
        const img = new Image();
        img.src = src;
      });
    };

    // Start preloading images immediately
    preloadImages();

    // Preload components that are likely to be needed soon
    const preloadComponents = () => {
      const links = [
        { rel: 'preload', href: '/components/landingpage/Features.tsx', as: 'script' },
        { rel: 'preload', href: '/components/landingpage/ReadyToStart.tsx', as: 'script' }
      ];

      links.forEach(({ rel, href, as }) => {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        link.as = as;
        document.head.appendChild(link);
      });
    };

    // Preload after initial render
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => preloadComponents());
    } else {
      setTimeout(preloadComponents, 0);
    }

    // Listen for when the loader finishes
    const handleLoaderComplete = () => {
      setIsLoading(false);
    };

    // Listen for custom event from WaterLoader
    window.addEventListener('loaderComplete', handleLoaderComplete);

    return () => {
      window.removeEventListener('loaderComplete', handleLoaderComplete);
    };
  }, []);

  return (
    <>
      <WaterLoader />
      <div className="min-h-screen overflow-x-hidden">
      {/* Critical above-the-fold content - no Suspense */}
      {!isLoading && <Header />}
      <main data-landing-page="true">
        <Hero />
        
        <section id="features">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <Features />
          </Suspense>
        </section>
        
        <Suspense fallback={<CardLoadingSkeleton />}>
          <ReadyToStart />
        </Suspense>
        
        {/* Talent section group */}
        <Suspense fallback={<CardLoadingSkeleton />}>
          <TalentPool />
          <section id="why-choose">
            <HowItWorks />
          </section>
          <Stats />
        </Suspense>
        
        {/* Social proof and conversion group */}
        <Suspense fallback={<CardLoadingSkeleton />}>
          <section id="testimonials">
            <Testimonials />
          </section>
          <CTA />
        </Suspense>
      </main> 
      
      {/* Footer and navigation - load last */}
      <Suspense fallback={<CardLoadingSkeleton />}>
        <Footer />
      </Suspense>
      
      {showFloatingNav && (
        <Suspense fallback={<CardLoadingSkeleton />}>
          <FloatingNav />
        </Suspense>
      )}
    </div>
    </>
  );
};

export default LandingPage;