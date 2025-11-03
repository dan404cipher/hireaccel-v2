import { Suspense } from "react";
import { HRProfessionals } from "@/components/landingpage/hr/HRFeatures";
import { CardLoadingSkeleton } from "@/components/ui/LoadingSpinner";

const ForEmployer = () => {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<CardLoadingSkeleton />}>
        <HRProfessionals />
      </Suspense>
    </div>
  );
};

export default ForEmployer;
