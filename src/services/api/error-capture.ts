import axios from 'axios';

// Create a simple API client for error capture (no authentication needed)
const errorCaptureClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ErrorEvent {
  timestamp?: Date;
  type: 'javascript' | 'network' | 'server' | 'build' | 'runtime';
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  source?: {
    file?: string;
    line?: number;
    column?: number;
    function?: string;
  };
  context?: {
    url?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
  };
  impact?: {
    severity?: 'critical' | 'high' | 'medium' | 'low';
    affectedFeatures?: string[];
    businessImpact?: string;
  };
  technicalDetails?: {
    browserInfo?: {
      name: string;
      version: string;
      platform: string;
    };
    networkInfo?: {
      statusCode?: number;
      responseTime?: number;
      endpoint?: string;
      method?: string;
    };
  };
  metadata?: {
    errorId?: string;
    fingerprint?: string;
    count?: number;
    firstSeen?: Date;
    lastSeen?: Date;
    resolved?: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    tags?: string[];
  };
}

export interface ErrorCaptureStatus {
  applicationId: string;
  applicationName: string;
  applicationPort: number;
  environment: 'development' | 'staging' | 'production';
  monitoring: {
    isActive: boolean;
    startTime: string;
    lastHeartbeat: string;
    captureSettings: {
      captureJavaScriptErrors: boolean;
      captureNetworkErrors: boolean;
      captureServerLogs: boolean;
      captureBuildErrors: boolean;
      maxErrorsPerHour: number;
      errorRetentionDays: number;
      enableRealTimeAlerts: boolean;
      alertThresholds: {
        criticalErrorCount: number;
        errorRatePerMinute: number;
        responseTimeThreshold: number;
      };
    };
  };
  integrations: {
    windsurfIDE: {
      enabled: boolean;
      autoFix: boolean;
      createPRs: boolean;
      notifyOnErrors: boolean;
    };
    notifications: {
      email: boolean;
      slack: boolean;
      webhook?: string;
    };
  };
  summary: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByLevel: Record<string, number>;
    criticalErrors: number;
    resolvedErrors: number;
    activeErrors: number;
    lastErrorTime?: string;
    errorRate: number;
    uptimePercentage: number;
  };
}

export interface ErrorStatistics {
  summary: ErrorCaptureStatus['summary'];
  trends: {
    last24Hours: {
      total: number;
      critical: number;
      resolved: number;
    };
    lastWeek: {
      total: number;
      critical: number;
      resolved: number;
    };
  };
  topErrors: Array<{
    message: string;
    count: number;
    severity: string;
    lastSeen: string;
  }>;
}

export class ErrorCaptureClient {
  private applicationId: string;
  private applicationName: string;
  private applicationPort: number;
  private environment: 'development' | 'staging' | 'production';
  private sessionId: string;
  private userId?: string;
  private isInitialized: boolean = false;
  private eventSource?: EventSource;

  constructor(
    applicationId: string,
    applicationName: string,
    applicationPort: number = 3000,
    environment: 'development' | 'staging' | 'production' = 'development'
  ) {
    this.applicationId = applicationId;
    this.applicationName = applicationName;
    this.applicationPort = applicationPort;
    this.environment = environment;
    this.sessionId = this.generateSessionId();
    
    // Auto-initialize
    this.initialize();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (ua.includes('Chrome')) {
      browserName = 'Chrome';
      const match = ua.match(/Chrome\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      const match = ua.match(/Firefox\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    } else if (ua.includes('Safari')) {
      browserName = 'Safari';
      const match = ua.match(/Version\/([0-9.]+)/);
      if (match) browserVersion = match[1];
    }

    return {
      name: browserName,
      version: browserVersion,
      platform: navigator.platform
    };
  }

  // Initialize error capture
  async initialize(): Promise<void> {
    try {
      const response = await errorCaptureClient.post('/error-capture/initialize', {
        applicationId: this.applicationId,
        applicationName: this.applicationName,
        applicationPort: this.applicationPort,
        environment: this.environment
      });

      if (response.data.success) {
        this.isInitialized = true;
        this.setupErrorHandlers();
        console.log('✅ Error capture initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize error capture:', error);
    }
  }

  // Set up global error handlers
  private setupErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript',
        level: 'error',
        message: event.message,
        stack: event.error?.stack,
        source: {
          file: event.filename,
          line: event.lineno,
          column: event.colno
        },
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: this.sessionId,
          userId: this.userId
        },
        technicalDetails: {
          browserInfo: this.getBrowserInfo()
        }
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'javascript',
        level: 'error',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          url: window.location.href,
          userAgent: navigator.userAgent,
          sessionId: this.sessionId,
          userId: this.userId
        },
        technicalDetails: {
          browserInfo: this.getBrowserInfo()
        }
      });
    });

    // Network errors (intercept fetch)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(...args);
        const responseTime = Date.now() - startTime;

        // Log failed requests
        if (!response.ok) {
          this.captureError({
            type: 'network',
            level: response.status >= 500 ? 'error' : 'warn',
            message: `HTTP ${response.status}: ${response.statusText}`,
            context: {
              url: window.location.href,
              userAgent: navigator.userAgent,
              sessionId: this.sessionId,
              userId: this.userId
            },
            technicalDetails: {
              browserInfo: this.getBrowserInfo(),
              networkInfo: {
                statusCode: response.status,
                responseTime,
                endpoint: args[0] as string,
                method: (args[1] as RequestInit)?.method || 'GET'
              }
            }
          });
        }

        return response;
      } catch (error) {
        const responseTime = Date.now() - startTime;
        
        this.captureError({
          type: 'network',
          level: 'error',
          message: `Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          stack: error instanceof Error ? error.stack : undefined,
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
            sessionId: this.sessionId,
            userId: this.userId
          },
          technicalDetails: {
            browserInfo: this.getBrowserInfo(),
            networkInfo: {
              responseTime,
              endpoint: args[0] as string,
              method: (args[1] as RequestInit)?.method || 'GET'
            }
          }
        });

        throw error;
      }
    };

    console.log('🔧 Error handlers set up successfully');
  }

  // Manually capture an error
  async captureError(error: ErrorEvent): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Error capture not initialized, queuing error...');
      // Could implement a queue here for errors before initialization
      return;
    }

    try {
      await errorCaptureClient.post('/error-capture/capture', {
        applicationId: this.applicationId,
        applicationPort: this.applicationPort,
        error: {
          ...error,
          timestamp: new Date(),
          context: {
            ...error.context,
            sessionId: this.sessionId,
            userId: this.userId
          }
        }
      });
    } catch (captureError) {
      console.error('Failed to capture error:', captureError);
    }
  }

  // Get error capture status
  async getStatus(): Promise<ErrorCaptureStatus | null> {
    try {
      const response = await errorCaptureClient.get(
        `/error-capture/status/${this.applicationId}/${this.applicationPort}`
      );
      return response.data.success ? response.data.capture : null;
    } catch (error) {
      console.error('Failed to get error capture status:', error);
      return null;
    }
  }

  // Get recent errors
  async getRecentErrors(limit: number = 50, severity?: string): Promise<ErrorEvent[]> {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (severity) params.append('severity', severity);

      const response = await errorCaptureClient.get(
        `/error-capture/errors/${this.applicationId}/${this.applicationPort}?${params}`
      );
      return response.data.success ? response.data.errors : [];
    } catch (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }
  }

  // Get error statistics
  async getStatistics(): Promise<ErrorStatistics | null> {
    try {
      const response = await errorCaptureClient.get(
        `/error-capture/statistics/${this.applicationId}/${this.applicationPort}`
      );
      return response.data.success ? response.data.statistics : null;
    } catch (error) {
      console.error('Failed to get error statistics:', error);
      return null;
    }
  }

  // Resolve an error
  async resolveError(errorId: string, resolvedBy: string = 'user'): Promise<boolean> {
    try {
      const response = await errorCaptureClient.patch(
        `/error-capture/resolve/${this.applicationId}/${this.applicationPort}/${errorId}`,
        { resolvedBy }
      );
      return response.data.success;
    } catch (error) {
      console.error('Failed to resolve error:', error);
      return false;
    }
  }

  // Update Windsurf IDE integration settings
  async updateWindsurfIntegration(settings: {
    enabled?: boolean;
    autoFix?: boolean;
    createPRs?: boolean;
    notifyOnErrors?: boolean;
  }): Promise<boolean> {
    try {
      const response = await errorCaptureClient.patch(
        `/error-capture/windsurf/${this.applicationId}/${this.applicationPort}`,
        settings
      );
      return response.data.success;
    } catch (error) {
      console.error('Failed to update Windsurf integration:', error);
      return false;
    }
  }

  // Start real-time error streaming
  startRealTimeStream(onError: (data: any) => void, onAlert?: (data: any) => void): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    const streamUrl = `${errorCaptureClient.defaults.baseURL}/error-capture/stream/${this.applicationId}/${this.applicationPort}`;
    this.eventSource = new EventSource(streamUrl);

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connected':
            console.log('🔗 Connected to error stream');
            break;
          case 'error-captured':
            onError(data);
            break;
          case 'error-resolved':
            console.log('✅ Error resolved:', data.errorId);
            break;
          case 'alert':
            if (onAlert) onAlert(data);
            break;
          case 'heartbeat':
            // Keep connection alive
            break;
        }
      } catch (error) {
        console.error('Error parsing stream data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('Error stream connection error:', error);
    };
  }

  // Stop real-time error streaming
  stopRealTimeStream(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
      console.log('🔌 Disconnected from error stream');
    }
  }

  // Set user ID for error tracking
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Stop error capture
  async stop(): Promise<void> {
    try {
      await errorCaptureClient.post(
        `/error-capture/stop/${this.applicationId}/${this.applicationPort}`
      );
      this.stopRealTimeStream();
      this.isInitialized = false;
      console.log('🛑 Error capture stopped');
    } catch (error) {
      console.error('Failed to stop error capture:', error);
    }
  }
}

// Global error capture instance for the DoneDep frontend
export const donedepErrorCapture = new ErrorCaptureClient(
  'donedep-frontend',
  'DoneDep Frontend',
  3000,
  'development'
);

// Note: ErrorBoundary component moved to separate file to avoid JSX in .ts file

export default ErrorCaptureClient;
