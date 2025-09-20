import { apiClient } from './client';

interface AgentMessage {
  id: string;
  type: 'agent' | 'user';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;
}

interface DeploymentContext {
  projectType?: string;
  technologies?: string[];
  repositories?: any[];
  domain?: string;
  databases?: string[];
  deploymentTier?: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: AgentMessage[];
  deploymentContext?: DeploymentContext;
}

interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    actions: Array<{
      action: string;
      label: string;
      variant: string;
    }>;
    timestamp: string;
  };
  message?: string;
}

interface ProjectAnalysisRequest {
  projectType: string;
  technologies: string[];
  userRequirements: string;
}

interface ProjectAnalysisResponse {
  success: boolean;
  data?: {
    analysis: string;
    recommendations: {
      architecture: string | null;
      platforms: string[];
      databases: string[];
      estimatedCost: number | null;
      nextSteps: string[];
    };
    timestamp: string;
  };
  message?: string;
}

interface DeploymentStatusResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    steps: Array<{
      name: string;
      status: string;
      timestamp: Date | null;
    }>;
    estimatedCompletion: Date;
  };
  message?: string;
}

export const agentApi = {
  async chat(data: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/agent/chat', data);
    return response.data;
  },

  async analyzeProject(data: ProjectAnalysisRequest): Promise<ProjectAnalysisResponse> {
    const response = await apiClient.post<ProjectAnalysisResponse>('/agent/analyze', data);
    return response.data;
  },

  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatusResponse> {
    const response = await apiClient.get<DeploymentStatusResponse>(`/agent/deployment/${deploymentId}/status`);
    return response.data;
  },
};
