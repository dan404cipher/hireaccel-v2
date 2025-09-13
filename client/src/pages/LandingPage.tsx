import { useEffect, Suspense, lazy } from "react";
import { CardLoadingSkeleton } from "@/components/ui/LoadingSpinner";

// Lazy load landing page components for better performance
const Header = lazy(() => import("@/components/landingpage/Header").then(module => ({ default: module.Header })));
const Hero = lazy(() => import("@/components/landingpage/Hero").then(module => ({ default: module.Hero })));
const Features = lazy(() => import("@/components/landingpage/Features").then(module => ({ default: module.Features })));
const TalentPool = lazy(() => import("@/components/landingpage/TalentPool").then(module => ({ default: module.TalentPool })));
const HowItWorks = lazy(() => import("@/components/landingpage/HowItWorks").then(module => ({ default: module.HowItWorks })));
const Stats = lazy(() => import("@/components/landingpage/Stats").then(module => ({ default: module.Stats })));
const Testimonials = lazy(() => import("@/components/landingpage/Testimonials").then(module => ({ default: module.Testimonials })));
const CTA = lazy(() => import("@/components/landingpage/CtA").then(module => ({ default: module.CTA })));
const Footer = lazy(() => import("@/components/landingpage/Footer").then(module => ({ default: module.Footer })));

const LandingPage = () => {
    // Scroll to top when component mounts
    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Suspense fallback={<CardLoadingSkeleton />}>
        <Header />
      </Suspense>
      
      <main>
        <Suspense fallback={<CardLoadingSkeleton />}>
          <Hero />
        </Suspense>
        
        <section id="features">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <Features />
          </Suspense>
        </section>
        
        <Suspense fallback={<CardLoadingSkeleton />}>
          <TalentPool />
        </Suspense>
        
        <section id="why-choose">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <HowItWorks />
          </Suspense>
        </section>
        
        <Suspense fallback={<CardLoadingSkeleton />}>
          <Stats />
        </Suspense>
        
        <section id="testimonials">
          <Suspense fallback={<CardLoadingSkeleton />}>
            <Testimonials />
          </Suspense>
        </section>
        
        <Suspense fallback={<CardLoadingSkeleton />}>
          <CTA />
        </Suspense>
      </main> 
      
      <Suspense fallback={<CardLoadingSkeleton />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default LandingPage;