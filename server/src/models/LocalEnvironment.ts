import mongoose, { Schema, Document } from 'mongoose';

export interface ILocalApplication {
  port: number;
  protocol: 'http' | 'https';
  status: 'running' | 'stopped' | 'error';
  framework: string;
  projectPath?: string;
  processId?: number;
  startTime: Date;
  lastChecked: Date;
  healthCheck: {
    url: string;
    status: 'healthy' | 'unhealthy' | 'unknown';
    responseTime?: number;
    statusCode?: number;
    lastChecked: Date;
  };
  errors: Array<{
    timestamp: Date;
    type: 'console' | 'server' | 'network' | 'build';
    level: 'error' | 'warn' | 'info';
    message: string;
    stack?: string;
    source?: string;
    line?: number;
    column?: number;
    url?: string;
    details?: Record<string, any>;
  }>;
  metrics: {
    uptime?: number;
    memoryUsage?: number;
    cpuUsage?: number;
    requestCount?: number;
    errorCount?: number;
    lastErrorTime?: Date;
  };
}

export interface ILocalEnvironment extends Document {
  userId: string;
  machineId: string;
  machineName: string;
  platform: string;
  nodeVersion: string;
  applications: ILocalApplication[];
  monitoringActive: boolean;
  lastScan: Date;
  scanInterval: number; // in milliseconds
  portRange: {
    start: number;
    end: number;
  };
  excludedPorts: number[];
  settings: {
    autoDetectFrameworks: boolean;
    captureErrors: boolean;
    healthCheckInterval: number;
    maxErrorHistory: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LocalApplicationSchema = new Schema<ILocalApplication>({
  port: { type: Number, required: true },
  protocol: { 
    type: String, 
    enum: ['http', 'https'], 
    default: 'http' 
  },
  status: {
    type: String,
    enum: ['running', 'stopped', 'error'],
    default: 'running'
  },
  framework: { type: String, default: 'Unknown' },
  projectPath: { type: String },
  processId: { type: Number },
  startTime: { type: Date, default: Date.now },
  lastChecked: { type: Date, default: Date.now },
  healthCheck: {
    url: { type: String, required: true },
    status: {
      type: String,
      enum: ['healthy', 'unhealthy', 'unknown'],
      default: 'unknown'
    },
    responseTime: { type: Number },
    statusCode: { type: Number },
    lastChecked: { type: Date, default: Date.now }
  },
  errors: [{
    timestamp: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ['console', 'server', 'network', 'build'],
      required: true
    },
    level: {
      type: String,
      enum: ['error', 'warn', 'info'],
      required: true
    },
    message: { type: String, required: true },
    stack: { type: String },
    source: { type: String },
    line: { type: Number },
    column: { type: Number },
    url: { type: String },
    details: { type: Schema.Types.Mixed }
  }],
  metrics: {
    uptime: { type: Number },
    memoryUsage: { type: Number },
    cpuUsage: { type: Number },
    requestCount: { type: Number },
    errorCount: { type: Number },
    lastErrorTime: { type: Date }
  }
});

const LocalEnvironmentSchema = new Schema<ILocalEnvironment>({
  userId: { type: String, required: true },
  machineId: { type: String, required: true },
  machineName: { type: String, required: true },
  platform: { type: String, required: true },
  nodeVersion: { type: String, required: true },
  applications: [LocalApplicationSchema],
  monitoringActive: { type: Boolean, default: true },
  lastScan: { type: Date, default: Date.now },
  scanInterval: { type: Number, default: 30000 }, // 30 seconds
  portRange: {
    start: { type: Number, default: 3000 },
    end: { type: Number, default: 9999 }
  },
  excludedPorts: [{ type: Number }],
  settings: {
    autoDetectFrameworks: { type: Boolean, default: true },
    captureErrors: { type: Boolean, default: true },
    healthCheckInterval: { type: Number, default: 60000 }, // 1 minute
    maxErrorHistory: { type: Number, default: 100 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt on save
LocalEnvironmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries - make userId + machineId combination unique
LocalEnvironmentSchema.index({ userId: 1, machineId: 1 }, { unique: true });
LocalEnvironmentSchema.index({ 'applications.port': 1 });
LocalEnvironmentSchema.index({ lastScan: 1 });

export const LocalEnvironment = mongoose.model<ILocalEnvironment>('LocalEnvironment', LocalEnvironmentSchema);
