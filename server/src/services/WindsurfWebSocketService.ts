import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ErrorCaptureService } from './ErrorCaptureService';

export interface WindsurfMessage {
  id: string;
  type: 'command' | 'response' | 'error' | 'notification';
  action: string;
  payload: any;
  timestamp: number;
}

export interface ConnectedExtension {
  id: string;
  extensionVersion: string;
  workspaceFolder?: string;
  vsCodeVersion: string;
  connected: Date;
  lastActivity: Date;
}

export class WindsurfWebSocketService {
  private io: SocketIOServer;
  private connectedExtensions: Map<string, ConnectedExtension> = new Map();
  private errorCaptureService: ErrorCaptureService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: '/windsurf'
    });

    this.errorCaptureService = ErrorCaptureService.getInstance();
    this.setupEventHandlers();
    
    console.log('🔌 Windsurf WebSocket service initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: any) => {
      console.log(`🔗 Windsurf extension connected: ${socket.id}`);

      socket.on('handshake', (data: any) => {
        this.handleHandshake(socket, data);
      });

      socket.on('message', (message: WindsurfMessage) => {
        this.handleMessage(socket, message);
      });

      socket.on('error.captured', (data: any) => {
        this.handleErrorCapture(socket, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      socket.on('ping', () => {
        socket.emit('pong');
        this.updateLastActivity(socket.id);
      });
    });
  }

  private handleHandshake(socket: any, data: any): void {
    const extension: ConnectedExtension = {
      id: socket.id,
      extensionVersion: data.extensionVersion || 'unknown',
      workspaceFolder: data.workspaceFolder,
      vsCodeVersion: data.vsCodeVersion || 'unknown',
      connected: new Date(),
      lastActivity: new Date()
    };

    this.connectedExtensions.set(socket.id, extension);

    socket.emit('handshake-ack', {
      success: true,
      serverId: 'donedep-server',
      capabilities: [
        'file-operations',
        'terminal-execution',
        'git-operations',
        'error-capture',
        'deployment-automation'
      ]
    });

    console.log(`✅ Handshake completed for extension ${socket.id}`);
    console.log(`📁 Workspace: ${data.workspaceFolder || 'Unknown'}`);
  }

  private async handleMessage(socket: any, message: WindsurfMessage): Promise<void> {
    this.updateLastActivity(socket.id);
    
    console.log(`📨 Received message: ${message.action} from ${socket.id}`);

    try {
      switch (message.action) {
        case 'deploy':
          await this.handleDeployRequest(socket, message);
          break;

        case 'fix-error':
          await this.handleFixErrorRequest(socket, message);
          break;

        case 'terminal.result':
          await this.handleTerminalResult(socket, message);
          break;

        case 'file.created':
        case 'file.updated':
        case 'file.deleted':
          await this.handleFileOperation(socket, message);
          break;

        case 'git.committed':
        case 'git.pushed':
          await this.handleGitOperation(socket, message);
          break;

        default:
          console.log(`❓ Unknown message action: ${message.action}`);
      }
    } catch (error) {
      console.error(`❌ Error handling message ${message.action}:`, error);
      
      socket.emit('error', {
        id: message.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      });
    }
  }

  private async handleDeployRequest(socket: any, message: WindsurfMessage): Promise<void> {
    const { projectPath, projectName } = message.payload;
    
    // Simulate deployment process
    socket.emit('deployment.status', {
      status: 'started',
      message: `Starting deployment for ${projectName}`,
      timestamp: Date.now()
    });

    // In a real implementation, this would trigger actual deployment
    setTimeout(() => {
      socket.emit('deployment.status', {
        status: 'building',
        message: 'Building project...',
        timestamp: Date.now()
      });
    }, 1000);

    setTimeout(() => {
      socket.emit('deployment.status', {
        status: 'deploying',
        message: 'Deploying to server...',
        timestamp: Date.now()
      });
    }, 3000);

    setTimeout(() => {
      socket.emit('deployment.status', {
        status: 'success',
        message: 'Deployment completed successfully!',
        url: `https://${projectName.toLowerCase()}.donedep.app`,
        timestamp: Date.now()
      });
    }, 5000);
  }

  private async handleFixErrorRequest(socket: any, message: WindsurfMessage): Promise<void> {
    const { filePath, selectedText, line, column, language } = message.payload;
    
    // Simulate AI error analysis and fix generation
    socket.emit('error.analysis', {
      status: 'analyzing',
      message: 'Analyzing error with AI...',
      timestamp: Date.now()
    });

    setTimeout(() => {
      // Generate a mock fix
      const fix = this.generateMockFix(selectedText, language);
      
      socket.emit('file.update', {
        action: 'file.update',
        payload: {
          path: filePath,
          content: fix.content,
          line: line,
          column: column
        }
      });

      socket.emit('error.fixed', {
        status: 'fixed',
        message: fix.description,
        changes: fix.changes,
        timestamp: Date.now()
      });
    }, 2000);
  }

  private generateMockFix(errorText: string, language: string): any {
    // This is a simplified mock - in reality, this would use AI
    const fixes = {
      typescript: {
        content: errorText.replace(/any/g, 'string'),
        description: 'Fixed type annotations',
        changes: ['Replaced any types with specific types']
      },
      javascript: {
        content: errorText.replace(/var /g, 'const '),
        description: 'Updated variable declarations',
        changes: ['Changed var to const for better scoping']
      }
    };

    return fixes[language as keyof typeof fixes] || {
      content: errorText,
      description: 'No automatic fix available',
      changes: []
    };
  }

  private async handleTerminalResult(socket: any, message: WindsurfMessage): Promise<void> {
    const { id, result } = message.payload;
    
    // Forward terminal results to interested parties
    console.log(`📟 Terminal result for ${id}:`, result.success ? '✅' : '❌');
  }

  private async handleFileOperation(socket: any, message: WindsurfMessage): Promise<void> {
    const { path } = message.payload;
    console.log(`📄 File operation: ${message.action} - ${path}`);
    
    // Log file operations for audit trail
    // In a real implementation, you might want to sync this with a database
  }

  private async handleGitOperation(socket: any, message: WindsurfMessage): Promise<void> {
    console.log(`🔧 Git operation: ${message.action}`);
    
    // Handle git operations like commits, pushes, PR creation
    if (message.action === 'git.committed') {
      // Could trigger deployment pipeline
      socket.emit('deployment.trigger', {
        reason: 'git-commit',
        commit: message.payload.message,
        timestamp: Date.now()
      });
    }
  }

  private async handleErrorCapture(socket: any, data: any): Promise<void> {
    const extension = this.connectedExtensions.get(socket.id);
    if (!extension) return;

    // Capture error through the error capture service
    await this.errorCaptureService.captureError(
      'windsurf-extension', // applicationId
      0, // applicationPort (not applicable)
      {
        type: data.error.type || 'ide',
        level: data.error.level || 'error',
        message: data.error.message,
        stack: data.error.stack,
        source: data.error.source || {},
        context: {
          ...data.error.context,
          extensionId: socket.id,
          workspaceFolder: extension.workspaceFolder
        },
        impact: {
          severity: this.calculateSeverity(data.error),
          affectedUsers: 1,
          affectedFeatures: ['ide-integration'],
          businessImpact: 'development'
        },
        metadata: {
          errorId: `windsurf-${Date.now()}`,
          fingerprint: `windsurf-${data.error.message}`,
          count: 1,
          firstSeen: new Date(),
          lastSeen: new Date(),
          resolved: false,
          tags: ['windsurf', 'ide', 'extension']
        }
      }
    );

    console.log(`🐛 Error captured from extension ${socket.id}: ${data.error.message}`);
  }

  private calculateSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    if (error.level === 'error') return 'high';
    if (error.level === 'warn') return 'medium';
    return 'low';
  }

  private handleDisconnect(socket: any): void {
    this.connectedExtensions.delete(socket.id);
    console.log(`🔌 Windsurf extension disconnected: ${socket.id}`);
  }

  private updateLastActivity(socketId: string): void {
    const extension = this.connectedExtensions.get(socketId);
    if (extension) {
      extension.lastActivity = new Date();
    }
  }

  // Public methods for external use
  public sendToExtension(extensionId: string, action: string, payload: any): boolean {
    const socket = this.io.sockets.sockets.get(extensionId);
    if (socket) {
      socket.emit('message', {
        id: `server-${Date.now()}`,
        type: 'command',
        action,
        payload,
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }

  public sendToAllExtensions(action: string, payload: any): number {
    let sent = 0;
    this.connectedExtensions.forEach((_, extensionId) => {
      if (this.sendToExtension(extensionId, action, payload)) {
        sent++;
      }
    });
    return sent;
  }

  public getConnectedExtensions(): ConnectedExtension[] {
    return Array.from(this.connectedExtensions.values());
  }

  public getExtensionCount(): number {
    return this.connectedExtensions.size;
  }

  public notifyError(errorId: string, errorMessage: string): void {
    this.sendToAllExtensions('error.notify', {
      errorId,
      message: errorMessage,
      timestamp: Date.now()
    });
  }

  public requestAutoFix(extensionId: string, errorId: string, errorDetails: any): boolean {
    return this.sendToExtension(extensionId, 'error.autofix', {
      errorId,
      errorDetails,
      timestamp: Date.now()
    });
  }
}
