import net from 'net';
import http from 'http';
import https from 'https';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { LocalEnvironment, ILocalApplication, ILocalEnvironment } from '../models/LocalEnvironment';

const execAsync = promisify(exec);

export class LocalPortMonitor {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private userId: string;
  private machineId: string;

  constructor(userId: string = 'default-user') {
    this.userId = userId;
    this.machineId = this.generateMachineId();
  }

  private generateMachineId(): string {
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    return `${hostname}-${platform}-${arch}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  // Start monitoring local ports
  async startMonitoring(scanInterval: number = 30000): Promise<void> {
    console.log('🔍 Starting local port monitoring...');
    
    // Initialize or get existing environment record
    await this.initializeEnvironment();

    // Initial scan
    await this.scanPorts();

    // Set up periodic scanning
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.scanPorts();
      } catch (error) {
        console.error('Error during port scan:', error);
      }
    }, scanInterval);

    // Set up health checks
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        console.error('Error during health checks:', error);
      }
    }, 60000); // Every minute

    console.log(`✅ Local port monitoring started (scanning every ${scanInterval}ms)`);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    console.log('🛑 Local port monitoring stopped');
  }

  // Initialize environment record in database
  private async initializeEnvironment(): Promise<ILocalEnvironment> {
    try {
      // Try to find existing environment
      let environment = await LocalEnvironment.findOne({ 
        userId: this.userId, 
        machineId: this.machineId 
      });

      if (!environment) {
        // Create new environment with upsert to handle race conditions
        const result = await LocalEnvironment.findOneAndUpdate(
          { userId: this.userId, machineId: this.machineId },
          {
            $setOnInsert: {
              userId: this.userId,
              machineId: this.machineId,
              machineName: os.hostname(),
              platform: `${os.platform()} ${os.arch()}`,
              nodeVersion: process.version,
              applications: [],
              portRange: { start: 3000, end: 9999 },
              excludedPorts: [5000, 7000], // Exclude macOS Control Center ports
              settings: {
                autoDetectFrameworks: true,
                captureErrors: true,
                healthCheckInterval: 60000,
                maxErrorHistory: 100
              },
              createdAt: new Date()
            },
            $set: {
              monitoringActive: true,
              lastScan: new Date(),
              updatedAt: new Date()
            }
          },
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true
          }
        );
        environment = result!;
        console.log('📝 Created/updated local environment record');
      } else {
        // Update existing environment
        environment.monitoringActive = true;
        environment.lastScan = new Date();
        environment.updatedAt = new Date();
        await environment.save();
        console.log('🔄 Updated existing local environment record');
      }

      return environment;
    } catch (error) {
      console.error('Error initializing environment:', error);
      // If there's still a duplicate key error, try to find the existing record
      const existingEnvironment = await LocalEnvironment.findOne({ 
        userId: this.userId, 
        machineId: this.machineId 
      });
      
      if (existingEnvironment) {
        existingEnvironment.monitoringActive = true;
        existingEnvironment.lastScan = new Date();
        existingEnvironment.updatedAt = new Date();
        await existingEnvironment.save();
        console.log('🔄 Found and updated existing environment record');
        return existingEnvironment;
      }
      
      throw error;
    }
  }

  // Scan ports for running applications
  private async scanPorts(): Promise<void> {
    const environment = await LocalEnvironment.findOne({ 
      userId: this.userId, 
      machineId: this.machineId 
    });

    if (!environment) return;

    const { start, end } = environment.portRange;
    const excludedPorts = environment.excludedPorts;
    const runningApps: ILocalApplication[] = [];

    console.log(`🔍 Scanning ports ${start}-${end}...`);

    // Common development ports to check first (reduced range for faster scanning)
    const priorityPorts = [3000, 3001, 8000, 8080, 4000, 5000, 9000, 5432, 6379, 5500, 7000];
    
    // For faster scanning, limit the range to common development ports
    const commonPorts = Array.from({ length: 100 }, (_, i) => 3000 + i) // 3000-3099
      .concat(Array.from({ length: 100 }, (_, i) => 8000 + i)) // 8000-8099
      .concat([4000, 4001, 4200, 5000, 5001, 5432, 5500, 6379, 7000, 9000]);
    
    const portsToCheck = [...priorityPorts, ...commonPorts]
      .filter((port, index, arr) => arr.indexOf(port) === index) // Remove duplicates
      .filter(port => !excludedPorts.includes(port))
      .filter(port => port >= start && port <= end);

    console.log(`🔍 Checking ${portsToCheck.length} ports (optimized scan)...`);

    // Check ports in larger batches for speed
    const batchSize = 50;
    for (let i = 0; i < portsToCheck.length; i += batchSize) {
      const batch = portsToCheck.slice(i, i + batchSize);
      const batchPromises = batch.map(port => this.checkPort(port));
      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          runningApps.push(result.value);
        }
      });

      // Smaller delay between batches for speed
      if (i + batchSize < portsToCheck.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    // Update database with discovered applications
    await this.updateApplications(environment, runningApps);

    console.log(`✅ Port scan complete. Found ${runningApps.length} running applications`);
  }

  // Check if a specific port is open and get application info
  private async checkPort(port: number): Promise<ILocalApplication | null> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = 500; // 500ms timeout for faster scanning

      socket.setTimeout(timeout);
      
      socket.on('connect', async () => {
        socket.destroy();
        
        try {
          // Port is open, try to get more information
          const appInfo = await this.getApplicationInfo(port);
          resolve(appInfo);
        } catch (error) {
          // Port is open but couldn't get app info
          resolve({
            port,
            protocol: 'http',
            status: 'running',
            framework: 'Unknown',
            startTime: new Date(),
            lastChecked: new Date(),
            healthCheck: {
              url: `http://localhost:${port}`,
              status: 'unknown',
              lastChecked: new Date()
            },
            errors: [],
            metrics: {}
          });
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });

      socket.on('error', () => {
        resolve(null);
      });

      socket.connect(port, 'localhost');
    });
  }

  // Get detailed information about an application running on a port
  private async getApplicationInfo(port: number): Promise<ILocalApplication> {
    const baseUrl = `http://localhost:${port}`;
    let framework = 'Unknown';
    let status: 'running' | 'stopped' | 'error' = 'running';
    let healthCheck = {
      url: baseUrl,
      status: 'unknown' as 'healthy' | 'unhealthy' | 'unknown',
      lastChecked: new Date(),
      responseTime: undefined as number | undefined,
      statusCode: undefined as number | undefined
    };

    try {
      const startTime = Date.now();
      const response = await axios.get(baseUrl, { 
        timeout: 2000, // Reduced from 5000ms to 2000ms
        validateStatus: () => true // Accept any status code
      });
      const responseTime = Date.now() - startTime;

      healthCheck.responseTime = responseTime;
      healthCheck.statusCode = response.status;
      healthCheck.status = response.status < 400 ? 'healthy' : 'unhealthy';

      // Detect framework from response headers and content
      framework = this.detectFramework(response);

    } catch (error) {
      healthCheck.status = 'unhealthy';
      status = 'error';
    }

    // Try to get process information
    let processId: number | undefined;
    let projectPath: string | undefined;

    try {
      const processInfo = await this.getProcessInfo(port);
      processId = processInfo?.pid;
      projectPath = processInfo?.cwd;
    } catch (error) {
      // Process info not available
    }

    return {
      port,
      protocol: 'http',
      status,
      framework,
      processId,
      projectPath,
      startTime: new Date(),
      lastChecked: new Date(),
      healthCheck,
      errors: [],
      metrics: {
        errorCount: 0
      }
    };
  }

  // Detect framework from HTTP response
  private detectFramework(response: any): string {
    const headers = response.headers;
    const data = typeof response.data === 'string' ? response.data.toLowerCase() : '';

    // Check headers
    if (headers['x-powered-by']) {
      const poweredBy = headers['x-powered-by'].toLowerCase();
      if (poweredBy.includes('next.js')) return 'Next.js';
      if (poweredBy.includes('express')) return 'Express.js';
      if (poweredBy.includes('react')) return 'React';
    }

    // Check HTML content
    if (data.includes('__next')) return 'Next.js';
    if (data.includes('react')) return 'React';
    if (data.includes('vue')) return 'Vue.js';
    if (data.includes('angular')) return 'Angular';
    if (data.includes('svelte')) return 'Svelte';

    // Check for development servers
    if (data.includes('webpack') || data.includes('hot reload')) return 'Webpack Dev Server';
    if (data.includes('vite')) return 'Vite';

    // Check for API responses
    if (headers['content-type']?.includes('application/json')) {
      return 'API Server';
    }

    return 'Web Server';
  }

  // Get process information for a port
  private async getProcessInfo(port: number): Promise<{ pid: number; cwd: string } | null> {
    try {
      // Use lsof to find process using the port (macOS/Linux)
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pid = parseInt(stdout.trim());

      if (pid) {
        // Get process working directory
        try {
          const { stdout: cwdOutput } = await execAsync(`lsof -p ${pid} | grep cwd | awk '{print $9}'`);
          const cwd = cwdOutput.trim();
          return { pid, cwd };
        } catch {
          return { pid, cwd: '' };
        }
      }
    } catch (error) {
      // lsof not available or port not found
    }

    return null;
  }

  // Update applications in database
  private async updateApplications(environment: ILocalEnvironment, newApps: ILocalApplication[]): Promise<void> {
    // Merge with existing applications, preserving error history
    const existingApps = environment.applications || [];
    const updatedApps: ILocalApplication[] = [];

    newApps.forEach(newApp => {
      const existing = existingApps.find(app => app.port === newApp.port);
      if (existing) {
        // Preserve error history and metrics
        newApp.errors = existing.errors;
        newApp.metrics = {
          ...existing.metrics,
          ...newApp.metrics
        };
        newApp.startTime = existing.startTime;
      }
      updatedApps.push(newApp);
    });

    // Mark stopped applications
    existingApps.forEach(existingApp => {
      if (!newApps.find(app => app.port === existingApp.port)) {
        existingApp.status = 'stopped';
        existingApp.lastChecked = new Date();
        updatedApps.push(existingApp);
      }
    });

    environment.applications = updatedApps;
    environment.lastScan = new Date();
    await environment.save();
  }

  // Perform health checks on all running applications
  private async performHealthChecks(): Promise<void> {
    const environment = await LocalEnvironment.findOne({ 
      userId: this.userId, 
      machineId: this.machineId 
    });

    if (!environment) return;

    const runningApps = environment.applications.filter(app => app.status === 'running');
    
    for (const app of runningApps) {
      try {
        const startTime = Date.now();
        const response = await axios.get(app.healthCheck.url, { 
          timeout: 5000,
          validateStatus: () => true
        });
        const responseTime = Date.now() - startTime;

        app.healthCheck.responseTime = responseTime;
        app.healthCheck.statusCode = response.status;
        app.healthCheck.status = response.status < 400 ? 'healthy' : 'unhealthy';
        app.healthCheck.lastChecked = new Date();
        app.lastChecked = new Date();

        // Update metrics
        if (!app.metrics.uptime) {
          app.metrics.uptime = Date.now() - app.startTime.getTime();
        }

      } catch (error) {
        app.healthCheck.status = 'unhealthy';
        app.healthCheck.lastChecked = new Date();
        app.status = 'error';

        // Log error
        app.errors.push({
          timestamp: new Date(),
          type: 'network',
          level: 'error',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { port: app.port, url: app.healthCheck.url }
        });

        // Limit error history
        if (app.errors.length > environment.settings.maxErrorHistory) {
          app.errors = app.errors.slice(-environment.settings.maxErrorHistory);
        }

        app.metrics.errorCount = (app.metrics.errorCount || 0) + 1;
        app.metrics.lastErrorTime = new Date();
      }
    }

    await environment.save();
  }

  // Get current monitoring status
  async getMonitoringStatus(): Promise<any> {
    const environment = await LocalEnvironment.findOne({ 
      userId: this.userId, 
      machineId: this.machineId 
    });

    if (!environment) return null;

    const runningApps = environment.applications.filter(app => app.status === 'running');
    const healthyApps = runningApps.filter(app => app.healthCheck.status === 'healthy');
    const totalErrors = environment.applications.reduce((sum, app) => sum + (app.metrics.errorCount || 0), 0);

    return {
      machineId: this.machineId,
      machineName: environment.machineName,
      monitoringActive: environment.monitoringActive,
      lastScan: environment.lastScan,
      applications: {
        total: environment.applications.length,
        running: runningApps.length,
        healthy: healthyApps.length,
        stopped: environment.applications.filter(app => app.status === 'stopped').length,
        errors: environment.applications.filter(app => app.status === 'error').length
      },
      totalErrors,
      settings: environment.settings
    };
  }

  // Add error to application
  async addError(port: number, error: {
    type: 'console' | 'server' | 'network' | 'build';
    level: 'error' | 'warn' | 'info';
    message: string;
    stack?: string;
    source?: string;
    line?: number;
    column?: number;
    url?: string;
    details?: Record<string, any>;
  }): Promise<void> {
    const environment = await LocalEnvironment.findOne({ 
      userId: this.userId, 
      machineId: this.machineId 
    });

    if (!environment) return;

    const app = environment.applications.find(app => app.port === port);
    if (!app) return;

    app.errors.push({
      timestamp: new Date(),
      ...error
    });

    // Limit error history
    if (app.errors.length > environment.settings.maxErrorHistory) {
      app.errors = app.errors.slice(-environment.settings.maxErrorHistory);
    }

    app.metrics.errorCount = (app.metrics.errorCount || 0) + 1;
    app.metrics.lastErrorTime = new Date();

    await environment.save();
  }
}
