import * as crypto from 'crypto';
import { ErrorCapture, IErrorCapture, IErrorEvent } from '../models/ErrorCapture';
import { EventEmitter } from 'events';
import { Document } from 'mongoose';

export class ErrorCaptureService extends EventEmitter {
  private static instance: ErrorCaptureService;
  private activeCaptures: Map<string, any> = new Map();

  private constructor() {
    super();
    this.startCleanupInterval();
  }

  static getInstance(): ErrorCaptureService {
    if (!ErrorCaptureService.instance) {
      ErrorCaptureService.instance = new ErrorCaptureService();
    }
    return ErrorCaptureService.instance;
  }

  // Initialize error capture for an application
  async initializeCapture(
    applicationId: string,
    applicationName: string,
    applicationPort: number,
    environment: 'development' | 'staging' | 'production' = 'development'
  ): Promise<IErrorCapture> {
    let capture = await ErrorCapture.findOne({ applicationId, applicationPort });

    if (!capture) {
      capture = new ErrorCapture({
        applicationId,
        applicationName,
        applicationPort,
        environment,
        errors: [],
        monitoring: {
          isActive: true,
          startTime: new Date(),
          lastHeartbeat: new Date(),
          captureSettings: {
            captureJavaScriptErrors: true,
            captureNetworkErrors: true,
            captureServerLogs: true,
            captureBuildErrors: true,
            maxErrorsPerHour: 1000,
            errorRetentionDays: 30,
            enableRealTimeAlerts: true,
            alertThresholds: {
              criticalErrorCount: 5,
              errorRatePerMinute: 10,
              responseTimeThreshold: 5000
            }
          }
        },
        integrations: {
          windsurfIDE: {
            enabled: false,
            autoFix: false,
            createPRs: false,
            notifyOnErrors: true
          },
          notifications: {
            email: false,
            slack: false
          }
        }
      });

      await capture.save();
      console.log(`✅ Error capture initialized for ${applicationName} on port ${applicationPort}`);
    } else {
      // Update existing capture
      capture.monitoring.isActive = true;
      capture.monitoring.lastHeartbeat = new Date();
      await capture.save();
      console.log(`🔄 Error capture resumed for ${applicationName} on port ${applicationPort}`);
    }

    this.activeCaptures.set(`${applicationId}:${applicationPort}`, capture);
    return capture;
  }

  // Capture a new error event
  async captureError(
    applicationId: string,
    applicationPort: number,
    errorData: Partial<IErrorEvent>
  ): Promise<void> {
    const captureKey = `${applicationId}:${applicationPort}`;
    let capture = this.activeCaptures.get(captureKey);

    if (!capture) {
      capture = await ErrorCapture.findOne({ applicationId, applicationPort });
      if (!capture) {
        console.error(`❌ No error capture found for ${applicationId}:${applicationPort}`);
        return;
      }
      this.activeCaptures.set(captureKey, capture);
    }

    // Generate error fingerprint for grouping similar errors
    const fingerprint = this.generateErrorFingerprint(errorData);
    
    // Check if this error already exists
    const existingError = capture.errors.find((e: any) => e.metadata.fingerprint === fingerprint);

    if (existingError) {
      // Update existing error
      existingError.metadata.count += 1;
      existingError.metadata.lastSeen = new Date();
      existingError.timestamp = new Date(); // Update to latest occurrence
    } else {
      // Create new error event
      const errorEvent: IErrorEvent = {
        timestamp: new Date(),
        type: errorData.type || 'javascript',
        level: errorData.level || 'error',
        message: errorData.message || 'Unknown error',
        stack: errorData.stack,
        source: {
          file: errorData.source?.file,
          line: errorData.source?.line,
          column: errorData.source?.column,
          function: errorData.source?.function
        },
        context: {
          url: errorData.context?.url,
          userAgent: errorData.context?.userAgent,
          userId: errorData.context?.userId,
          sessionId: errorData.context?.sessionId,
          applicationPort,
          environment: capture.environment
        },
        metadata: {
          errorId: crypto.randomUUID(),
          fingerprint,
          count: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          resolved: false,
          tags: errorData.metadata?.tags || []
        },
        impact: {
          severity: this.calculateSeverity(errorData),
          affectedUsers: 1,
          affectedFeatures: errorData.impact?.affectedFeatures || [],
          businessImpact: errorData.impact?.businessImpact
        },
        technicalDetails: {
          browserInfo: errorData.technicalDetails?.browserInfo,
          networkInfo: errorData.technicalDetails?.networkInfo,
          serverInfo: errorData.technicalDetails?.serverInfo,
          buildInfo: errorData.technicalDetails?.buildInfo
        }
      };

      capture.errors.push(errorEvent);
    }

    // Update heartbeat
    capture.monitoring.lastHeartbeat = new Date();

    // Save to database
    await capture.save();

    // Emit real-time event
    this.emit('error-captured', {
      applicationId,
      applicationPort,
      error: existingError || capture.errors[capture.errors.length - 1],
      isNew: !existingError
    });

    // Check for alerts
    await this.checkAlertThresholds(capture);

    console.log(`🚨 Error captured for ${applicationId}:${applicationPort} - ${errorData.message}`);
  }

  // Generate fingerprint for error grouping
  private generateErrorFingerprint(errorData: Partial<IErrorEvent>): string {
    const key = [
      errorData.type,
      errorData.message,
      errorData.source?.file,
      errorData.source?.line,
      errorData.source?.function
    ].filter(Boolean).join('|');

    return crypto.createHash('md5').update(key).digest('hex');
  }

  // Calculate error severity based on context
  private calculateSeverity(errorData: Partial<IErrorEvent>): 'critical' | 'high' | 'medium' | 'low' {
    // Critical: Server errors, build failures, network timeouts
    if (errorData.type === 'server' || errorData.type === 'build') {
      return 'critical';
    }

    // High: JavaScript errors in core functionality
    if (errorData.type === 'javascript' && errorData.level === 'error') {
      return 'high';
    }

    // Medium: Network errors, warnings
    if (errorData.type === 'network' || errorData.level === 'warn') {
      return 'medium';
    }

    // Low: Info and debug messages
    return 'low';
  }

  // Check alert thresholds and trigger notifications
  private async checkAlertThresholds(capture: IErrorCapture): Promise<void> {
    const settings = capture.monitoring.captureSettings;
    const thresholds = settings.alertThresholds;

    // Check critical error count
    if (capture.summary.criticalErrors >= thresholds.criticalErrorCount) {
      this.emit('alert', {
        type: 'critical-errors',
        applicationId: capture.applicationId,
        applicationPort: capture.applicationPort,
        message: `Critical error threshold exceeded: ${capture.summary.criticalErrors} critical errors`,
        data: { criticalErrors: capture.summary.criticalErrors }
      });
    }

    // Check error rate
    if (capture.summary.errorRate >= thresholds.errorRatePerMinute) {
      this.emit('alert', {
        type: 'high-error-rate',
        applicationId: capture.applicationId,
        applicationPort: capture.applicationPort,
        message: `High error rate: ${capture.summary.errorRate.toFixed(2)} errors/minute`,
        data: { errorRate: capture.summary.errorRate }
      });
    }
  }

  // Get error capture status
  async getCaptureStatus(applicationId: string, applicationPort: number): Promise<IErrorCapture | null> {
    const captureKey = `${applicationId}:${applicationPort}`;
    let capture = this.activeCaptures.get(captureKey);

    if (!capture) {
      capture = await ErrorCapture.findOne({ applicationId, applicationPort });
      if (capture) {
        this.activeCaptures.set(captureKey, capture);
      }
    }

    return capture;
  }

  // Get recent errors
  async getRecentErrors(
    applicationId: string,
    applicationPort: number,
    limit: number = 50,
    severity?: string
  ): Promise<IErrorEvent[]> {
    const capture = await this.getCaptureStatus(applicationId, applicationPort);
    if (!capture) return [];

    let errors = capture.errors.slice().reverse(); // Most recent first

    if (severity) {
      errors = errors.filter(e => e.impact.severity === severity);
    }

    return errors.slice(0, limit);
  }

  // Resolve an error
  async resolveError(
    applicationId: string,
    applicationPort: number,
    errorId: string,
    resolvedBy: string
  ): Promise<boolean> {
    const capture = await ErrorCapture.findOne({ applicationId, applicationPort });
    if (!capture) return false;

    const error = capture.errors.find(e => e.metadata.errorId === errorId);
    if (!error) return false;

    error.metadata.resolved = true;
    error.metadata.resolvedAt = new Date();
    error.metadata.resolvedBy = resolvedBy;

    await capture.save();

    this.emit('error-resolved', {
      applicationId,
      applicationPort,
      errorId,
      resolvedBy
    });

    return true;
  }

  // Update capture settings
  async updateCaptureSettings(
    applicationId: string,
    applicationPort: number,
    settings: Partial<IErrorCapture['monitoring']['captureSettings']>
  ): Promise<boolean> {
    const capture = await ErrorCapture.findOne({ applicationId, applicationPort });
    if (!capture) return false;

    capture.monitoring.captureSettings = {
      ...capture.monitoring.captureSettings,
      ...settings
    };

    await capture.save();
    this.activeCaptures.set(`${applicationId}:${applicationPort}`, capture);

    return true;
  }

  // Enable/disable Windsurf IDE integration
  async updateWindsurfIntegration(
    applicationId: string,
    applicationPort: number,
    settings: Partial<IErrorCapture['integrations']['windsurfIDE']>
  ): Promise<boolean> {
    const capture = await ErrorCapture.findOne({ applicationId, applicationPort });
    if (!capture) return false;

    capture.integrations.windsurfIDE = {
      ...capture.integrations.windsurfIDE,
      ...settings
    };

    await capture.save();
    this.activeCaptures.set(`${applicationId}:${applicationPort}`, capture);

    this.emit('windsurf-integration-updated', {
      applicationId,
      applicationPort,
      settings: capture.integrations.windsurfIDE
    });

    return true;
  }

  // Stop error capture
  async stopCapture(applicationId: string, applicationPort: number): Promise<void> {
    const capture = await ErrorCapture.findOne({ applicationId, applicationPort });
    if (capture) {
      capture.monitoring.isActive = false;
      await capture.save();
    }

    this.activeCaptures.delete(`${applicationId}:${applicationPort}`);
    console.log(`🛑 Error capture stopped for ${applicationId}:${applicationPort}`);
  }

  // Cleanup old errors based on retention settings
  private async cleanupOldErrors(): Promise<void> {
    const captures = await ErrorCapture.find({ 'monitoring.isActive': true });

    for (const capture of captures) {
      const retentionDays = capture.monitoring.captureSettings.errorRetentionDays;
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      const originalCount = capture.errors.length;
      capture.errors = capture.errors.filter((error: any) => error.timestamp > cutoffDate) as any;

      if (capture.errors.length < originalCount) {
        await capture.save();
        console.log(`🧹 Cleaned up ${originalCount - capture.errors.length} old errors for ${capture.applicationId}:${capture.applicationPort}`);
      }
    }
  }

  // Start cleanup interval
  private startCleanupInterval(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldErrors().catch(console.error);
    }, 60 * 60 * 1000);
  }

  // Get error statistics
  async getErrorStatistics(applicationId: string, applicationPort: number): Promise<any> {
    const capture = await this.getCaptureStatus(applicationId, applicationPort);
    if (!capture) return null;

    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const errors24h = capture.errors.filter(e => e.timestamp > last24Hours);
    const errorsWeek = capture.errors.filter(e => e.timestamp > lastWeek);

    return {
      summary: capture.summary,
      trends: {
        last24Hours: {
          total: errors24h.length,
          critical: errors24h.filter(e => e.impact.severity === 'critical').length,
          resolved: errors24h.filter(e => e.metadata.resolved).length
        },
        lastWeek: {
          total: errorsWeek.length,
          critical: errorsWeek.filter(e => e.impact.severity === 'critical').length,
          resolved: errorsWeek.filter(e => e.metadata.resolved).length
        }
      },
      topErrors: capture.errors
        .filter(e => !e.metadata.resolved)
        .sort((a, b) => b.metadata.count - a.metadata.count)
        .slice(0, 10)
        .map(e => ({
          message: e.message,
          count: e.metadata.count,
          severity: e.impact.severity,
          lastSeen: e.metadata.lastSeen
        }))
    };
  }
}
