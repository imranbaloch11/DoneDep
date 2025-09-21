import { apiClient } from './client';

export interface ErrorLog {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  source: 'console' | 'network' | 'runtime';
  url?: string;
}

export interface MonitoringStatus {
  repositoryId: string;
  status: string;
  errorCount: number;
  totalLogs: number;
  lastError?: ErrorLog;
  isRunning: boolean;
}

export interface ActiveDeployment {
  repositoryId: string;
  port: number;
  status: string;
  errorCount: number;
  uptime: number;
  name?: string;
  githubUrl?: string;
}

export interface StartMonitoringRequest {
  repoPath: string;
  port: number;
  githubToken: string;
  owner: string;
  repo: string;
  branch?: string;
}

export interface TriggerCorrectionRequest {
  githubToken: string;
  owner: string;
  repo: string;
  branch?: string;
}

export const errorMonitoringApi = {
  /**
   * Start monitoring a repository deployment
   */
  async startMonitoring(repositoryId: string, data: StartMonitoringRequest) {
    const response = await apiClient.post(`/error-monitoring/${repositoryId}/start`, data);
    return response.data;
  },

  /**
   * Stop monitoring a repository deployment
   */
  async stopMonitoring(repositoryId: string) {
    const response = await apiClient.post(`/error-monitoring/${repositoryId}/stop`);
    return response.data;
  },

  /**
   * Get logs for a repository
   */
  async getLogs(repositoryId: string, params?: { limit?: number; level?: string }) {
    const response = await apiClient.get(`/error-monitoring/${repositoryId}/logs`, { params });
    return response.data;
  },

  /**
   * Get monitoring status for a repository
   */
  async getStatus(repositoryId: string): Promise<{ success: boolean; data: MonitoringStatus }> {
    const response = await apiClient.get(`/error-monitoring/${repositoryId}/status`);
    return response.data;
  },

  /**
   * Get all active deployments for the user
   */
  async getActiveDeployments(): Promise<{ success: boolean; data: { deployments: ActiveDeployment[]; totalCount: number } }> {
    const response = await apiClient.get('/error-monitoring/deployments');
    return response.data;
  },

  /**
   * Trigger manual error correction cycle
   */
  async triggerCorrection(repositoryId: string, data: TriggerCorrectionRequest) {
    const response = await apiClient.post(`/error-monitoring/${repositoryId}/trigger-correction`, data);
    return response.data;
  }
};
