import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
};

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export function LoadingCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center p-8", className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
