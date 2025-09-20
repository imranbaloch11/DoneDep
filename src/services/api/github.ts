import { apiClient } from './client';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  updated_at: string;
  clone_url: string;
  ssh_url: string;
  default_branch: string;
  private: boolean;
}

interface ProjectAnalysis {
  projectType: string;
  framework: string | null;
  technologies: string[];
  isMonorepo: boolean;
  hasDockerfile: boolean;
  hasDatabase: boolean;
  deploymentRecommendations: Array<{
    platform: string;
    reason: string;
    cost: string;
  }>;
}

interface ConnectGitHubRequest {
  accessToken: string;
}

interface ConnectGitHubResponse {
  success: boolean;
  data?: {
    user: GitHubUser;
    repositories: Repository[];
  };
  message?: string;
}

interface AnalyzeRepositoryRequest {
  owner: string;
  repo: string;
  accessToken: string;
}

interface AnalyzeRepositoryResponse {
  success: boolean;
  data?: {
    repository: { owner: string; repo: string };
    analysis: ProjectAnalysis;
    packageJson: {
      name: string;
      version: string;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    } | null;
  };
  message?: string;
}

interface DeploymentStatusRequest {
  owner: string;
  repo: string;
  accessToken: string;
}

interface DeploymentStatusResponse {
  success: boolean;
  data?: {
    deployments: Array<{
      id: number;
      environment: string;
      created_at: string;
      updated_at: string;
    }>;
    workflowRuns: Array<{
      id: number;
      name: string;
      status: string;
      conclusion: string;
      created_at: string;
      updated_at: string;
    }>;
  };
  message?: string;
}

export const githubApi = {
  async connect(data: ConnectGitHubRequest): Promise<ConnectGitHubResponse> {
    const response = await apiClient.post<ConnectGitHubResponse>('/github/connect', data);
    return response.data;
  },

  async analyzeRepository(data: AnalyzeRepositoryRequest): Promise<AnalyzeRepositoryResponse> {
    const response = await apiClient.post<AnalyzeRepositoryResponse>('/github/analyze', data);
    return response.data;
  },

  async getDeploymentStatus(data: DeploymentStatusRequest): Promise<DeploymentStatusResponse> {
    const response = await apiClient.post<DeploymentStatusResponse>('/github/deployment-status', data);
    return response.data;
  },
};
