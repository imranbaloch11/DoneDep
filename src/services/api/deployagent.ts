import { apiClient } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface DeploymentRepository {
  url: string;
  branch: string;
  framework: string;
  language: string;
  packageManager?: string;
}

export interface DeploymentRequirements {
  domain?: string;
  ssl?: boolean;
  monitoring?: boolean;
  scaling?: 'manual' | 'auto' | 'serverless';
  database?: string;
  caching?: string;
  cdn?: boolean;
}

export interface DeploymentContext {
  _id: string;
  projectId: string;
  userId: string;
  repository: DeploymentRepository;
  requirements: DeploymentRequirements;
  status: 'planning' | 'executing' | 'deployed' | 'failed' | 'rollback';
  steps: Array<{
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
    output?: string;
    error?: string;
  }>;
  estimatedCost?: {
    monthly: number;
    currency: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  contextId?: string;
  status: 'active' | 'completed' | 'abandoned';
}

export interface ProjectAnalysis {
  contextId: string;
  analysis: string;
  recommendations: {
    summary?: string;
    complexity?: number;
    estimatedCost?: string;
    [key: string]: any;
  };
}

export interface DeploymentAction {
  type: string;
  content: string;
  language?: string;
}

export interface ChatResponse {
  message: string;
  actions: DeploymentAction[];
  sessionId: string;
  contextId?: string;
}

export interface KnowledgeStats {
  totalPatterns: number;
  totalExecutions: number;
  topPatterns: Array<{
    pattern: string;
    description: string;
    usageCount: number;
    successRate: number;
  }>;
  categoryStats: Array<{
    _id: string;
    count: number;
    avgSuccessRate: number;
  }>;
}

class DeployAgentAPI {
  // Initialize a new chat session
  async initializeChat(): Promise<{ sessionId: string; message: string }> {
    const response = await apiClient.post('/deployagent/chat/init');
    return response.data.data;
  }

  // Send a message to DeployAgent
  async sendMessage(
    message: string,
    sessionId: string,
    contextId?: string
  ): Promise<ChatResponse> {
    const response = await apiClient.post('/deployagent/chat/message', {
      message,
      sessionId,
      contextId
    });
    return response.data.data;
  }

  // Get chat history for a session
  async getChatHistory(sessionId: string): Promise<{
    messages: ChatMessage[];
    contextId?: string;
    status: string;
  }> {
    const response = await apiClient.get(`/deployagent/chat/${sessionId}/history`);
    return response.data.data;
  }

  // Analyze a project for deployment
  async analyzeProject(
    repository: DeploymentRepository,
    requirements: DeploymentRequirements
  ): Promise<ProjectAnalysis> {
    const response = await apiClient.post('/deployagent/analyze', {
      repository,
      requirements
    });
    return response.data.data;
  }

  // Get list of user's deployments
  async getDeployments(page: number = 1, limit: number = 10): Promise<{
    deployments: DeploymentContext[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await apiClient.get('/deployagent/deployments', {
      params: { page, limit }
    });
    return response.data.data;
  }

  // Get deployment status
  async getDeploymentStatus(contextId: string): Promise<{
    context: DeploymentContext;
    recentActions: any[];
    status: string;
  }> {
    const response = await apiClient.get(`/deployagent/deployments/${contextId}/status`);
    return response.data.data;
  }

  // Submit feedback for a deployment
  async submitFeedback(
    contextId: string,
    rating: number,
    comment?: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post(`/deployagent/deployments/${contextId}/feedback`, {
      rating,
      comment
    });
    return response.data;
  }

  // Get knowledge base statistics
  async getKnowledgeStats(): Promise<KnowledgeStats> {
    const response = await apiClient.get('/deployagent/knowledge/stats');
    return response.data.data;
  }

  // Seed knowledge base (admin only)
  async seedKnowledgeBase(): Promise<{ message: string }> {
    const response = await apiClient.post('/deployagent/knowledge/seed');
    return response.data;
  }
}

export const deployAgentAPI = new DeployAgentAPI();
