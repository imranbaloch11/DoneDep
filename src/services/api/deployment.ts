import { apiClient } from './client';

export interface DeploymentComponent {
  name: string;
  type: 'frontend' | 'api_gateway' | 'database' | 'cloud_platform' | 'cicd_pipeline' | 'security';
  status: 'pending' | 'configuring' | 'deploying' | 'active' | 'failed' | 'stopped';
  technology: string;
  url?: string;
  port?: number;
  healthCheck?: {
    url: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastChecked: string;
    responseTime?: number;
  };
  deployment?: {
    provider: string;
    region?: string;
    instanceId?: string;
    deploymentId?: string;
    deployedAt?: string;
    version?: string;
  };
  metrics?: {
    cpu?: number;
    memory?: number;
    disk?: number;
    uptime?: number;
    requestCount?: number;
    errorRate?: number;
  };
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: Record<string, any>;
  }>;
}

export interface DeploymentArchitecture {
  projectId: string;
  projectName: string;
  framework: string;
  language: string;
  repositoryUrl: string;
  overallStatus: 'initializing' | 'configuring' | 'deploying' | 'active' | 'failed' | 'maintenance';
  deploymentUrl?: string;
  localTestUrl?: string;
  testEmail?: string;
  components: DeploymentComponent[];
  updatedAt: string;
}

export interface CreateDeploymentRequest {
  repositoryUrl: string;
  repositoryBranch?: string;
  userId?: string;
  testEmail?: string;
}

export interface CreateDeploymentResponse {
  success: boolean;
  projectId: string;
  deploymentArchitecture: {
    projectId: string;
    projectName: string;
    framework: string;
    language: string;
    components: Array<{
      name: string;
      type: string;
      status: string;
      technology: string;
    }>;
    overallStatus: string;
  };
}

export interface UpdateComponentRequest {
  status?: string;
  config?: Record<string, any>;
  url?: string;
  port?: number;
  deployment?: Record<string, any>;
}

export interface DeployComponentRequest {
  provider?: string;
  region?: string;
}

export const deploymentAPI = {
  // Create new deployment architecture
  async createDeployment(data: CreateDeploymentRequest): Promise<CreateDeploymentResponse> {
    const response = await apiClient.post('/deployment/create', data);
    return response.data;
  },

  // Get deployment status
  async getDeployment(projectId: string): Promise<{ success: boolean; deployment: DeploymentArchitecture }> {
    const response = await apiClient.get(`/deployment/${projectId}`);
    return response.data;
  },

  // Update component status
  async updateComponent(
    projectId: string, 
    componentType: string, 
    data: UpdateComponentRequest
  ): Promise<{ success: boolean; component: any }> {
    const response = await apiClient.patch(`/deployment/${projectId}/component/${componentType}`, data);
    return response.data;
  },

  // Deploy component
  async deployComponent(
    projectId: string, 
    componentType: string, 
    data: DeployComponentRequest = {}
  ): Promise<{ success: boolean; message: string; component: any }> {
    const response = await apiClient.post(`/deployment/${projectId}/component/${componentType}/deploy`, data);
    return response.data;
  },

  // Get component logs
  async getComponentLogs(
    projectId: string, 
    componentType: string, 
    limit: number = 50
  ): Promise<{ success: boolean; logs: any[] }> {
    const response = await apiClient.get(`/deployment/${projectId}/component/${componentType}/logs?limit=${limit}`);
    return response.data;
  },

  // Set test email
  async setTestEmail(
    projectId: string, 
    email: string
  ): Promise<{ success: boolean; message: string; testEmail: string }> {
    const response = await apiClient.post(`/deployment/${projectId}/test-email`, { email });
    return response.data;
  },

  // Get deployment status with polling
  async pollDeploymentStatus(
    projectId: string, 
    onUpdate: (deployment: DeploymentArchitecture) => void,
    intervalMs: number = 5000
  ): Promise<() => void> {
    let isPolling = true;

    const poll = async () => {
      if (!isPolling) return;

      try {
        const result = await this.getDeployment(projectId);
        if (result.success) {
          onUpdate(result.deployment);
        }
      } catch (error) {
        console.error('Error polling deployment status:', error);
      }

      if (isPolling) {
        setTimeout(poll, intervalMs);
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

// Helper functions for component status
export const getComponentStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'deploying':
    case 'configuring':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'stopped':
      return 'text-gray-600 bg-gray-100';
    case 'pending':
    default:
      return 'text-blue-600 bg-blue-100';
  }
};

export const getComponentIcon = (type: string): string => {
  switch (type) {
    case 'frontend':
      return '🎨';
    case 'api_gateway':
      return '🔗';
    case 'database':
      return '🗄️';
    case 'cloud_platform':
      return '☁️';
    case 'cicd_pipeline':
      return '🔄';
    case 'security':
      return '🔒';
    default:
      return '📦';
  }
};

export const getOverallStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600';
    case 'deploying':
    case 'configuring':
      return 'text-yellow-600';
    case 'failed':
      return 'text-red-600';
    case 'maintenance':
      return 'text-orange-600';
    case 'initializing':
    default:
      return 'text-blue-600';
  }
};
