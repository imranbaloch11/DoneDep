import mongoose, { Schema, Document } from 'mongoose';

export interface IDeploymentComponent {
  name: string;
  type: 'frontend' | 'api_gateway' | 'database' | 'cloud_platform' | 'cicd_pipeline' | 'security';
  status: 'pending' | 'configuring' | 'deploying' | 'active' | 'failed' | 'stopped';
  technology: string;
  url?: string;
  port?: number;
  config: Record<string, any>;
  healthCheck?: {
    url: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastChecked: Date;
    responseTime?: number;
  };
  deployment?: {
    provider: string;
    region?: string;
    instanceId?: string;
    deploymentId?: string;
    deployedAt?: Date;
    version?: string;
  };
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    details?: Record<string, any>;
  }>;
  metrics?: {
    cpu?: number;
    memory?: number;
    disk?: number;
    uptime?: number;
    requestCount?: number;
    errorRate?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeploymentArchitecture extends Document {
  userId: string;
  projectId: string;
  repositoryUrl: string;
  repositoryBranch: string;
  projectName: string;
  framework: string;
  language: string;
  components: IDeploymentComponent[];
  overallStatus: 'initializing' | 'configuring' | 'deploying' | 'active' | 'failed' | 'maintenance';
  deploymentStrategy: 'monorepo' | 'microservices' | 'serverless';
  environment: 'development' | 'staging' | 'production';
  testEmail?: string;
  deploymentUrl?: string;
  localTestUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeploymentComponentSchema = new Schema<IDeploymentComponent>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['frontend', 'api_gateway', 'database', 'cloud_platform', 'cicd_pipeline', 'security']
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'configuring', 'deploying', 'active', 'failed', 'stopped'],
    default: 'pending'
  },
  technology: { type: String, required: true },
  url: { type: String },
  port: { type: Number },
  config: { type: Schema.Types.Mixed, default: {} },
  healthCheck: {
    url: { type: String },
    status: { 
      type: String, 
      enum: ['healthy', 'unhealthy', 'unknown'],
      default: 'unknown'
    },
    lastChecked: { type: Date },
    responseTime: { type: Number }
  },
  deployment: {
    provider: { type: String },
    region: { type: String },
    instanceId: { type: String },
    deploymentId: { type: String },
    deployedAt: { type: Date },
    version: { type: String }
  },
  logs: [{
    timestamp: { type: Date, default: Date.now },
    level: { 
      type: String, 
      enum: ['info', 'warn', 'error'],
      required: true
    },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed }
  }],
  metrics: {
    cpu: { type: Number },
    memory: { type: Number },
    disk: { type: Number },
    uptime: { type: Number },
    requestCount: { type: Number },
    errorRate: { type: Number }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DeploymentArchitectureSchema = new Schema<IDeploymentArchitecture>({
  userId: { type: String, required: true },
  projectId: { type: String, required: true, unique: true },
  repositoryUrl: { type: String, required: true },
  repositoryBranch: { type: String, default: 'main' },
  projectName: { type: String, required: true },
  framework: { type: String, required: true },
  language: { type: String, required: true },
  components: [DeploymentComponentSchema],
  overallStatus: { 
    type: String, 
    enum: ['initializing', 'configuring', 'deploying', 'active', 'failed', 'maintenance'],
    default: 'initializing'
  },
  deploymentStrategy: { 
    type: String, 
    enum: ['monorepo', 'microservices', 'serverless'],
    default: 'monorepo'
  },
  environment: { 
    type: String, 
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  testEmail: { type: String },
  deploymentUrl: { type: String },
  localTestUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt on save
DeploymentArchitectureSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
DeploymentArchitectureSchema.index({ userId: 1, projectId: 1 });
DeploymentArchitectureSchema.index({ repositoryUrl: 1 });

export const DeploymentArchitecture = mongoose.model<IDeploymentArchitecture>('DeploymentArchitecture', DeploymentArchitectureSchema);
