import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config({ path: '.env' });
console.log('🔧 Environment loaded. OpenAI key present:', !!process.env.OPENAI_API_KEY);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes AFTER environment is loaded
import deployAgentRoutes from './routes/deployagent';
import githubRoutes from './routes/github';
import testDeployRoutes from './routes/testDeploy';
import windsurfRoutes from './routes/windsurf';
import domainRoutes from './routes/domains';
import deploymentRoutes from './routes/deployment';
import githubEnhancedRoutes from './routes/github-enhanced';
import localMonitorRoutes from './routes/local-monitor';
import errorCaptureRoutes from './routes/error-capture';
import { WindsurfWebSocketService } from './services/WindsurfWebSocketService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'DoneDep Backend API'
  });
});

// API Routes
app.use('/deployagent', deployAgentRoutes);
app.use('/github', githubRoutes);
app.use('/test-deploy', testDeployRoutes);
app.use('/windsurf', windsurfRoutes);
app.use('/domains', domainRoutes);
app.use('/deployment', deploymentRoutes);
app.use('/github-enhanced', githubEnhancedRoutes);
app.use('/local-monitor', localMonitorRoutes);
app.use('/error-capture', errorCaptureRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 DoneDep Backend API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });

    // Initialize WebSocket service for Windsurf extension communication
    const windsurfWebSocket = new WindsurfWebSocketService(server);
    console.log(`🔌 Windsurf WebSocket service running on ws://localhost:${PORT}/windsurf`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
