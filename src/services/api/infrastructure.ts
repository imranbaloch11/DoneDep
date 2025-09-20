import { apiClient } from './client';

interface AppService {
  name: string;
  source_dir?: string;
  github?: {
    repo: string;
    branch: string;
  };
  build_command?: string;
  run_command?: string;
  environment_slug?: string;
  instance_count?: number;
  instance_size_slug?: string;
  routes?: Array<{
    path: string;
  }>;
}

interface AppDatabase {
  name: string;
  engine: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  version?: string;
  size?: string;
  num_nodes?: number;
}

interface CreateAppRequest {
  name: string;
  region?: string;
  services?: AppService[];
  databases?: AppDatabase[];
  domains?: string[];
  envVars?: Record<string, string>;
}

interface CreateAppResponse {
  success: boolean;
  data?: {
    app: {
      id: string;
      name: string;
      region: string;
      status: string;
      created_at: string;
      updated_at: string;
      live_url: string;
      services: Array<AppService & { id: string; status: string }>;
      databases: Array<AppDatabase & { 
        id: string; 
        status: string; 
        connection_string: string;
      }>;
      domains: string[];
      env_vars: Record<string, string>;
    };
    estimatedDeployTime: string;
    cost: {
      monthly: number;
      currency: string;
    };
  };
  message?: string;
}

interface AppStatusResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    phase: string;
    progress: number;
    services: Array<{
      id: string;
      name: string;
      status: string;
      url: string | null;
    }>;
    databases: Array<{
      id: string;
      name: string;
      status: string;
      engine: string;
      version: string;
    }>;
    last_deployment: {
      id: string;
      status: string;
      created_at: string;
      finished_at: string | null;
    };
  };
  message?: string;
}

interface ScaleAppRequest {
  services: Array<{
    id: string;
    instance_count: number;
    instance_size_slug?: string;
  }>;
}

interface ScaleAppResponse {
  success: boolean;
  data?: {
    app_id: string;
    scaling_operation_id: string;
    status: string;
    services: Array<{
      id: string;
      status: string;
      estimated_completion: string;
    }>;
    estimated_cost_change: {
      monthly_increase: number;
      currency: string;
    };
  };
  message?: string;
}

interface CreateDatabaseRequest {
  name: string;
  engine?: 'postgresql' | 'mysql' | 'mongodb' | 'redis';
  version?: string;
  size?: string;
  region?: string;
  num_nodes?: number;
}

interface CreateDatabaseResponse {
  success: boolean;
  data?: {
    database: {
      id: string;
      name: string;
      engine: string;
      version: string;
      size: string;
      region: string;
      num_nodes: number;
      status: string;
      created_at: string;
      connection: {
        uri: string;
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
      };
      estimated_cost: number;
    };
    estimated_ready_time: string;
  };
  message?: string;
}

interface RegionsResponse {
  success: boolean;
  data?: {
    regions: Array<{
      slug: string;
      name: string;
      available: boolean;
    }>;
  };
  message?: string;
}

export const infrastructureApi = {
  async createApp(data: CreateAppRequest): Promise<CreateAppResponse> {
    const response = await apiClient.post<CreateAppResponse>('/infrastructure/app', data);
    return response.data;
  },

  async getAppStatus(appId: string): Promise<AppStatusResponse> {
    const response = await apiClient.get<AppStatusResponse>(`/infrastructure/app/${appId}/status`);
    return response.data;
  },

  async scaleApp(appId: string, data: ScaleAppRequest): Promise<ScaleAppResponse> {
    const response = await apiClient.put<ScaleAppResponse>(`/infrastructure/app/${appId}/scale`, data);
    return response.data;
  },

  async createDatabase(data: CreateDatabaseRequest): Promise<CreateDatabaseResponse> {
    const response = await apiClient.post<CreateDatabaseResponse>('/infrastructure/database', data);
    return response.data;
  },

  async getRegions(): Promise<RegionsResponse> {
    const response = await apiClient.get<RegionsResponse>('/infrastructure/regions');
    return response.data;
  },
};
