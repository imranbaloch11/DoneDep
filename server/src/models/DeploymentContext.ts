import mongoose, { Schema, Document } from 'mongoose';

export interface IDeploymentRepository {
  url: string;
  branch: string;
  framework: string;
  language: string;
  packageManager?: string;
}

export interface IDeploymentRequirements {
  domain?: string;
  ssl?: boolean;
  monitoring?: boolean;
  scaling?: 'manual' | 'auto' | 'serverless';
  database?: string;
  caching?: string;
  cdn?: boolean;
}

export interface IDeploymentStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  output?: string;
  error?: string;
}

export interface IEstimatedCost {
  monthly: number;
  currency: string;
}

export interface IDeploymentContext extends Document {
  contextId: string;
  projectId: string;
  userId?: string;
  repository: IDeploymentRepository;
  requirements: IDeploymentRequirements;
  status: 'planning' | 'executing' | 'deployed' | 'failed' | 'rollback';
  steps: IDeploymentStep[];
  estimatedCost?: IEstimatedCost;
  createdAt: Date;
  updatedAt: Date;
}

const DeploymentRepositorySchema = new Schema({
  url: { type: String, required: true },
  branch: { type: String, required: true },
  framework: { type: String, required: true },
  language: { type: String, required: true },
  packageManager: { type: String }
});

const DeploymentRequirementsSchema = new Schema({
  domain: { type: String },
  ssl: { type: Boolean, default: true },
  monitoring: { type: Boolean, default: false },
  scaling: { 
    type: String, 
    enum: ['manual', 'auto', 'serverless'],
    default: 'manual'
  },
  database: { type: String },
  caching: { type: String },
  cdn: { type: Boolean, default: false }
});

const DeploymentStepSchema = new Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  startTime: { type: Date },
  endTime: { type: Date },
  output: { type: String },
  error: { type: String }
});

const EstimatedCostSchema = new Schema({
  monthly: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
});

const DeploymentContextSchema = new Schema({
  contextId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  projectId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  },
  repository: {
    type: DeploymentRepositorySchema,
    required: true
  },
  requirements: {
    type: DeploymentRequirementsSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'executing', 'deployed', 'failed', 'rollback'],
    default: 'planning',
    index: true
  },
  steps: [DeploymentStepSchema],
  estimatedCost: EstimatedCostSchema,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
DeploymentContextSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const DeploymentContext = mongoose.model<IDeploymentContext>('DeploymentContext', DeploymentContextSchema);
