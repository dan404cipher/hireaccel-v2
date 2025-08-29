import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

export function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Something went wrong
        </CardTitle>
        <CardDescription>
          An unexpected error occurred. Please try again.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground">Error details</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
        <Button onClick={resetError} className="w-full">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function ApiErrorAlert({ 
  error, 
  onRetry, 
  className 
}: { 
  error: any; 
  onRetry?: () => void; 
  className?: string;
}) {
  const errorMessage = error?.detail || error?.message || 'An unexpected error occurred';
  const errorTitle = error?.title || 'Error';

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-destructive">{errorTitle}</h4>
            <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="mt-3"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
