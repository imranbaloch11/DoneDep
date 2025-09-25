'use client';

import React from 'react';
import { donedepErrorCapture } from '../../services/api/error-capture';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
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
    // Capture React errors
    donedepErrorCapture.captureError({
      type: 'javascript',
      level: 'error',
      message: `React Error: ${error.message}`,
      stack: error.stack,
      source: {
        function: 'React Component'
      },
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      metadata: {
        tags: ['react', 'component-error']
      },
      technicalDetails: {
        browserInfo: {
          name: 'React',
          version: React.version,
          platform: navigator.platform
        }
      }
    });

    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback;
      if (FallbackComponent && this.state.error) {
        return <FallbackComponent error={this.state.error} />;
      }
      
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold">Something went wrong</h2>
          <p className="text-red-600 text-sm mt-2">
            An error occurred in this component. The error has been logged automatically.
          </p>
          {this.state.error && (
            <details className="mt-2">
              <summary className="text-red-700 cursor-pointer text-sm">Error Details</summary>
              <pre className="text-xs text-red-600 mt-2 overflow-auto">
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
