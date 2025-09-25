import mongoose, { Schema, Document } from 'mongoose';

export interface IErrorEvent {
  timestamp: Date;
  type: 'javascript' | 'network' | 'server' | 'build' | 'runtime';
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  stack?: string;
  source: {
    file?: string;
    line?: number;
    column?: number;
    function?: string;
  };
  context: {
    url?: string;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
    applicationPort?: number;
    environment?: string;
  };
  metadata: {
    errorId: string;
    fingerprint: string; // For grouping similar errors
    count: number; // How many times this error occurred
    firstSeen: Date;
    lastSeen: Date;
    resolved: boolean;
    resolvedAt?: Date;
    resolvedBy?: string;
    tags: string[];
  };
  impact: {
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedUsers: number;
    affectedFeatures: string[];
    businessImpact?: string;
  };
  technicalDetails: {
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
    serverInfo?: {
      processId?: number;
      memoryUsage?: number;
      cpuUsage?: number;
      uptime?: number;
    };
    buildInfo?: {
      buildId?: string;
      commitHash?: string;
      branch?: string;
      buildTime?: Date;
    };
  };
}


export interface IErrorCapture {
  applicationId: string;
  applicationName: string;
  applicationPort: number;
  environment: 'development' | 'staging' | 'production';
  errors: IErrorEvent[];
  summary: {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsByLevel: Record<string, number>;
    criticalErrors: number;
    resolvedErrors: number;
    activeErrors: number;
    lastErrorTime?: Date;
    errorRate: number; // errors per minute
    uptimePercentage: number;
  };
  monitoring: {
    isActive: boolean;
    startTime: Date;
    lastHeartbeat: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

const ErrorEventSchema = new Schema<IErrorEvent>({
  timestamp: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['javascript', 'network', 'server', 'build', 'runtime'],
    required: true
  },
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    required: true
  },
  message: { type: String, required: true },
  stack: { type: String },
  source: {
    file: { type: String },
    line: { type: Number },
    column: { type: Number },
    function: { type: String }
  },
  context: {
    url: { type: String },
    userAgent: { type: String },
    userId: { type: String },
    sessionId: { type: String },
    applicationPort: { type: Number },
    environment: { type: String }
  },
  metadata: {
    errorId: { type: String, required: true, unique: true },
    fingerprint: { type: String, required: true },
    count: { type: Number, default: 1 },
    firstSeen: { type: Date, default: Date.now },
    lastSeen: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: String },
    tags: [{ type: String }]
  },
  impact: {
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      required: true
    },
    affectedUsers: { type: Number, default: 0 },
    affectedFeatures: [{ type: String }],
    businessImpact: { type: String }
  },
  technicalDetails: {
    browserInfo: {
      name: { type: String },
      version: { type: String },
      platform: { type: String }
    },
    networkInfo: {
      statusCode: { type: Number },
      responseTime: { type: Number },
      endpoint: { type: String },
      method: { type: String }
    },
    serverInfo: {
      processId: { type: Number },
      memoryUsage: { type: Number },
      cpuUsage: { type: Number },
      uptime: { type: Number }
    },
    buildInfo: {
      buildId: { type: String },
      commitHash: { type: String },
      branch: { type: String },
      buildTime: { type: Date }
    }
  }
});

const ErrorCaptureSchema = new Schema<IErrorCapture>({
  applicationId: { type: String, required: true },
  applicationName: { type: String, required: true },
  applicationPort: { type: Number, required: true },
  environment: {
    type: String,
    enum: ['development', 'staging', 'production'],
    default: 'development'
  },
  errors: [ErrorEventSchema],
  summary: {
    totalErrors: { type: Number, default: 0 },
    errorsByType: { type: Schema.Types.Mixed, default: {} },
    errorsByLevel: { type: Schema.Types.Mixed, default: {} },
    criticalErrors: { type: Number, default: 0 },
    resolvedErrors: { type: Number, default: 0 },
    activeErrors: { type: Number, default: 0 },
    lastErrorTime: { type: Date },
    errorRate: { type: Number, default: 0 },
    uptimePercentage: { type: Number, default: 100 }
  },
  monitoring: {
    isActive: { type: Boolean, default: true },
    startTime: { type: Date, default: Date.now },
    lastHeartbeat: { type: Date, default: Date.now },
    captureSettings: {
      captureJavaScriptErrors: { type: Boolean, default: true },
      captureNetworkErrors: { type: Boolean, default: true },
      captureServerLogs: { type: Boolean, default: true },
      captureBuildErrors: { type: Boolean, default: true },
      maxErrorsPerHour: { type: Number, default: 1000 },
      errorRetentionDays: { type: Number, default: 30 },
      enableRealTimeAlerts: { type: Boolean, default: true },
      alertThresholds: {
        criticalErrorCount: { type: Number, default: 5 },
        errorRatePerMinute: { type: Number, default: 10 },
        responseTimeThreshold: { type: Number, default: 5000 }
      }
    }
  },
  integrations: {
    windsurfIDE: {
      enabled: { type: Boolean, default: false },
      autoFix: { type: Boolean, default: false },
      createPRs: { type: Boolean, default: false },
      notifyOnErrors: { type: Boolean, default: true }
    },
    notifications: {
      email: { type: Boolean, default: false },
      slack: { type: Boolean, default: false },
      webhook: { type: String }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt and summary on save
ErrorCaptureSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update summary statistics
  const errors = this.errors || [];
  this.summary.totalErrors = errors.length;
  this.summary.activeErrors = errors.filter(e => !e.metadata.resolved).length;
  this.summary.resolvedErrors = errors.filter(e => e.metadata.resolved).length;
  this.summary.criticalErrors = errors.filter(e => e.impact.severity === 'critical').length;
  
  // Group by type
  this.summary.errorsByType = errors.reduce((acc: Record<string, number>, error: any) => {
    acc[error.type] = (acc[error.type] || 0) + 1;
    return acc;
  }, {});
  
  // Group by level
  this.summary.errorsByLevel = errors.reduce((acc: Record<string, number>, error: any) => {
    acc[error.level] = (acc[error.level] || 0) + 1;
    return acc;
  }, {});
  
  // Update last error time
  if (errors.length > 0) {
    this.summary.lastErrorTime = errors[errors.length - 1].timestamp;
  }
  
  // Calculate error rate (errors per minute in last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentErrors = errors.filter(e => e.timestamp > oneHourAgo);
  this.summary.errorRate = recentErrors.length / 60; // per minute
  
  next();
});

// Indexes for efficient queries
ErrorCaptureSchema.index({ applicationId: 1, applicationPort: 1 });
ErrorCaptureSchema.index({ 'errors.timestamp': -1 });
ErrorCaptureSchema.index({ 'errors.metadata.fingerprint': 1 });
ErrorCaptureSchema.index({ 'errors.impact.severity': 1 });
ErrorCaptureSchema.index({ 'errors.metadata.resolved': 1 });

export const ErrorCapture = mongoose.model('ErrorCapture', ErrorCaptureSchema);
