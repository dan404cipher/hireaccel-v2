import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}></div>
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

export const PageLoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading page...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const CardLoadingSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-4 w-3/4 mb-4"></div>
    <div className="bg-gray-200 rounded h-3 w-1/2 mb-2"></div>
    <div className="bg-gray-200 rounded h-3 w-2/3"></div>
  </div>
);
