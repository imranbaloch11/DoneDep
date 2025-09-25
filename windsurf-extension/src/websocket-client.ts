import { io, Socket } from 'socket.io-client';

export interface DoneDepMessage {
  id: string;
  type: 'command' | 'response' | 'error' | 'notification';
  action: string;
  payload: any;
  timestamp: number;
}

export class WindsurfBridge {
  private socket: Socket | null = null;
  private url: string = '';
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 5000;
  private messageHandlers: ((message: DoneDepMessage) => void)[] = [];
  private isConnecting: boolean = false;

  async connect(url: string): Promise<void> {
    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }

    this.url = url;
    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(url, {
          path: '/windsurf'
        });

        this.socket.on('connect', () => {
          console.log('🔗 Connected to DoneDep Socket.IO server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('message', (data: any) => {
          try {
            const message: DoneDepMessage = typeof data === 'string' ? JSON.parse(data) : data;
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        });

        this.socket.on('connect_error', (error: any) => {
          console.error('Socket.IO connection error:', error);
          this.isConnecting = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        });

        this.socket.on('disconnect', (reason: string) => {
          console.log('🔌 Socket.IO connection closed:', reason);
          this.isConnecting = false;
          this.scheduleReconnect();
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`⏳ Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(this.url).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectInterval);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  sendMessage(message: DoneDepMessage): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', message);
    } else {
      console.error('Socket.IO not connected');
    }
  }

  onMessage(handler: (message: DoneDepMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  private handleMessage(message: DoneDepMessage): void {
    console.log('📨 Received message from DoneDep:', message.action);
    
    // Call all registered message handlers
    this.messageHandlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  getConnectionState(): string {
    if (!this.socket) return 'disconnected';
    return this.socket.connected ? 'connected' : 'disconnected';
  }

  private generateMessageId(): string {
    return `windsurf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Send handshake to establish connection with DoneDep server
  async sendHandshake(extensionInfo: {
    extensionVersion: string;
    workspaceFolder: string;
    vsCodeVersion: string;
  }): Promise<void> {
    if (this.socket && this.socket.connected) {
      this.socket.emit('handshake', extensionInfo);
    } else {
      console.error('Socket.IO not connected for handshake');
    }
  }

  // Send error to DoneDep for capture and analysis
  async sendError(error: any): Promise<void> {
    if (this.socket && this.socket.connected) {
      this.socket.emit('error.captured', { error });
    } else {
      console.error('Socket.IO not connected for error capture');
    }
  }

  // Send deployment status update
  async sendDeploymentStatus(status: any): Promise<void> {
    if (this.socket && this.socket.connected) {
      this.socket.emit('deployment.status', status);
    } else {
      console.error('Socket.IO not connected for deployment status');
    }
  }

  // Request file operation from DoneDep
  async requestFileOperation(operation: any): Promise<void> {
    const fileOpMessage: DoneDepMessage = {
      id: this.generateMessageId(),
      type: 'command',
      action: 'file.operation',
      payload: operation,
      timestamp: Date.now()
    };

    this.sendMessage(fileOpMessage);
  }
}
