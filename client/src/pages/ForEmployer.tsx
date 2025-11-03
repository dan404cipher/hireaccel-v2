import { Suspense } from "react";
import { Header } from "@/components/landingpage/Header";
import { Footer } from "@/components/landingpage/Footer";
import { HRProfessionals } from "@/components/landingpage/hr/HRFeatures";
import { CardLoadingSkeleton } from "@/components/ui/LoadingSpinner";

const ForEmployer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Suspense fallback={<CardLoadingSkeleton />}> 
          <HRProfessionals />
        </Suspense>
      </main>
      <Suspense fallback={<CardLoadingSkeleton />}> 
        <Footer />
      </Suspense>
    </div>
  );
};

export default ForEmployer;


