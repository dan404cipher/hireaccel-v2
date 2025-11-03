import { Suspense } from "react";
import { Header } from "@/components/landingpage/Header";
import { Footer } from "@/components/landingpage/Footer";
import { JobCandidates } from "@/components/landingpage/condidate/CandidateFeatures";
import { CardLoadingSkeleton } from "@/components/ui/LoadingSpinner";

const ForEmployee = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <Suspense fallback={<CardLoadingSkeleton />}> 
          <JobCandidates />
        </Suspense>
      </main>
      <Suspense fallback={<CardLoadingSkeleton />}> 
        <Footer />
      </Suspense>
    </div>
  );
};

export default ForEmployee;


