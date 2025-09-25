"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindsurfBridge = void 0;
const socket_io_client_1 = require("socket.io-client");
class WindsurfBridge {
    constructor() {
        this.socket = null;
        this.url = '';
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
        this.messageHandlers = [];
        this.isConnecting = false;
    }
    async connect(url) {
        if (this.isConnecting) {
            throw new Error('Connection already in progress');
        }
        this.url = url;
        this.isConnecting = true;
        return new Promise((resolve, reject) => {
            try {
                this.socket = (0, socket_io_client_1.io)(url, {
                    path: '/windsurf'
                });
                this.socket.on('connect', () => {
                    console.log('🔗 Connected to DoneDep Socket.IO server');
                    this.isConnecting = false;
                    this.reconnectAttempts = 0;
                    resolve();
                });
                this.socket.on('message', (data) => {
                    try {
                        const message = typeof data === 'string' ? JSON.parse(data) : data;
                        this.handleMessage(message);
                    }
                    catch (error) {
                        console.error('Failed to parse message:', error);
                    }
                });
                this.socket.on('connect_error', (error) => {
                    console.error('Socket.IO connection error:', error);
                    this.isConnecting = false;
                    if (this.reconnectAttempts === 0) {
                        reject(error);
                    }
                });
                this.socket.on('disconnect', (reason) => {
                    console.log('🔌 Socket.IO connection closed:', reason);
                    this.isConnecting = false;
                    this.scheduleReconnect();
                });
            }
            catch (error) {
                this.isConnecting = false;
                reject(error);
            }
        });
    }
    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`⏳ Reconnecting in ${this.reconnectInterval}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect(this.url).catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectInterval);
        }
        else {
            console.error('❌ Max reconnection attempts reached');
        }
    }
    sendMessage(message) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('message', message);
        }
        else {
            console.error('Socket.IO not connected');
        }
    }
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }
    handleMessage(message) {
        console.log('📨 Received message from DoneDep:', message.action);
        // Call all registered message handlers
        this.messageHandlers.forEach(handler => {
            try {
                handler(message);
            }
            catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
    isConnected() {
        return this.socket !== null && this.socket.connected;
    }
    getConnectionState() {
        if (!this.socket)
            return 'disconnected';
        return this.socket.connected ? 'connected' : 'disconnected';
    }
    generateMessageId() {
        return `windsurf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    // Send handshake to establish connection with DoneDep server
    async sendHandshake(extensionInfo) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('handshake', extensionInfo);
        }
        else {
            console.error('Socket.IO not connected for handshake');
        }
    }
    // Send error to DoneDep for capture and analysis
    async sendError(error) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('error.captured', { error });
        }
        else {
            console.error('Socket.IO not connected for error capture');
        }
    }
    // Send deployment status update
    async sendDeploymentStatus(status) {
        if (this.socket && this.socket.connected) {
            this.socket.emit('deployment.status', status);
        }
        else {
            console.error('Socket.IO not connected for deployment status');
        }
    }
    // Request file operation from DoneDep
    async requestFileOperation(operation) {
        const fileOpMessage = {
            id: this.generateMessageId(),
            type: 'command',
            action: 'file.operation',
            payload: operation,
            timestamp: Date.now()
        };
        this.sendMessage(fileOpMessage);
    }
}
exports.WindsurfBridge = WindsurfBridge;
//# sourceMappingURL=websocket-client.js.map