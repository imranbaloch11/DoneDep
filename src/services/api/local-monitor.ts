import axios from 'axios';

// Create a simple API client without authentication for local monitoring
const localApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface LocalApplication {
  port: number;
  protocol: 'http' | 'https';
  status: 'running' | 'stopped' | 'error';
  framework: string;
  projectPath?: string;
  processId?: number;
  startTime: string;
  lastChecked: string;
  healthCheck: {
    url: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    responseTime?: number;
    statusCode?: number;
    lastChecked: string;
  };
  metrics?: {
    uptime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    requestCount?: number;
    errorCount?: number;
    lastErrorTime?: string;
  };
  recentErrors?: ApplicationError[];
}

export interface ApplicationError {
  timestamp: string;
  type: 'console' | 'server' | 'network' | 'build';
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  url?: string;
  details?: Record<string, any>;
}

export interface MonitoringStatus {
  machineId: string;
  machineName: string;
  monitoringActive: boolean;
  lastScan: string;
  applications: {
    total: number;
    running: number;
    healthy: number;
    stopped: number;
    errors: number;
  };
  totalErrors: number;
  settings: {
    autoDetectFrameworks: boolean;
    captureErrors: boolean;
    healthCheckInterval: number;
    maxErrorHistory: number;
  };
}

export interface LocalEnvironment {
  machineId: string;
  machineName: string;
  platform: string;
  nodeVersion: string;
  lastScan: string;
  applications: LocalApplication[];
}

export interface ApplicationSummary {
  total: number;
  running: number;
  healthy: number;
  stopped: number;
  errors: number;
}

export const localMonitorAPI = {
  // Start local port monitoring
  async startMonitoring(userId: string = 'default-user', scanInterval: number = 30000): Promise<{
    success: boolean;
    message: string;
    status: MonitoringStatus;
    scanInterval: number;
  }> {
    console.log('API Base URL:', localApiClient.defaults.baseURL);
    console.log('Making request to:', '/local-monitor/start');
    console.log('Request data:', { userId, scanInterval });
    
    const response = await localApiClient.post('/local-monitor/start', {
      userId,
      scanInterval
    });
    return response.data;
  },

  // Stop local port monitoring
  async stopMonitoring(): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await localApiClient.post('/local-monitor/stop');
    return response.data;
  },

  // Get monitoring status
  async getStatus(userId: string = 'default-user'): Promise<{
    success: boolean;
    monitoring: {
      active: boolean;
      status: MonitoringStatus | null;
    };
    environment: LocalEnvironment | null;
  }> {
    const response = await localApiClient.get('/local-monitor/status', {
      params: { userId }
    });
    return response.data;
  },

  // Get all applications
  async getApplications(userId: string = 'default-user'): Promise<{
    success: boolean;
    applications: LocalApplication[];
    summary: ApplicationSummary;
    lastScan: string;
    message?: string;
  }> {
    const response = await localApiClient.get('/local-monitor/applications', {
      params: { userId }
    });
    return response.data;
  },

  // Get specific application details
  async getApplication(port: number, userId: string = 'default-user'): Promise<{
    success: boolean;
    application: LocalApplication & {
      errors: ApplicationError[];
      uptime: number;
    };
  }> {
    const response = await localApiClient.get(`/local-monitor/applications/${port}`, {
      params: { userId }
    });
    return response.data;
  },

  // Add error to application
  async addError(port: number, error: Omit<ApplicationError, 'timestamp'>, userId: string = 'default-user'): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await localApiClient.post(`/local-monitor/applications/${port}/errors`, error, {
      params: { userId }
    });
    return response.data;
  },

  // Get errors for application
  async getErrors(port: number, userId: string = 'default-user', limit: number = 50): Promise<{
    success: boolean;
    errors: ApplicationError[];
    summary: {
      total: number;
      byType: Record<string, number>;
      byLevel: Record<string, number>;
      lastError?: string;
    };
  }> {
    const response = await localApiClient.get(`/local-monitor/applications/${port}/errors`, {
      params: { userId, limit }
    });
    return response.data;
  },

  // Update monitoring settings
  async updateSettings(settings: Partial<MonitoringStatus['settings']>, userId: string = 'default-user'): Promise<{
    success: boolean;
    message: string;
    settings: MonitoringStatus['settings'];
  }> {
    const response = await localApiClient.patch('/local-monitor/settings', settings, {
      params: { userId }
    });
    return response.data;
  },

  // Force immediate scan
  async forceScan(): Promise<{
    success: boolean;
    message: string;
    status: MonitoringStatus;
  }> {
    const response = await localApiClient.post('/local-monitor/scan');
    return response.data;
  },

  // Utility functions
  getApplicationUrl(app: LocalApplication): string {
    return `${app.protocol}://localhost:${app.port}`;
  },

  getStatusColor(status: LocalApplication['status']): string {
    switch (status) {
      case 'running': return 'text-green-600 bg-green-100';
      case 'stopped': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  getHealthColor(health: LocalApplication['healthCheck']['status']): string {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      case 'unknown': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  getFrameworkIcon(framework: string): string {
    switch (framework) {
      case 'Next.js': return '⚡';
      case 'React': return '⚛️';
      case 'Vue.js': return '💚';
      case 'Angular': return '🅰️';
      case 'Express.js': return '🚀';
      case 'API Server': return '🔌';
      case 'Web Server': return '🌐';
      case 'Webpack Dev Server': return '📦';
      case 'Vite': return '⚡';
      default: return '🔧';
    }
  },

  formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  },

  formatResponseTime(responseTime?: number): string {
    if (!responseTime) return 'N/A';
    if (responseTime < 100) return `${responseTime}ms`;
    if (responseTime < 1000) return `${responseTime}ms`;
    return `${(responseTime / 1000).toFixed(1)}s`;
  },

  // Polling function for real-time updates
  async pollApplications(
    callback: (applications: LocalApplication[]) => void,
    userId: string = 'default-user',
    interval: number = 5000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const result = await this.getApplications(userId);
        if (result.success) {
          callback(result.applications);
        }
      } catch (error) {
        console.error('Error polling applications:', error);
      }

      if (isPolling) {
        setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Return stop function
    return () => {
      isPolling = false;
    };
  }
};
