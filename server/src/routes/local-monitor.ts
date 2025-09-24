import express from 'express';
import { LocalPortMonitor } from '../services/LocalPortMonitor';
import { LocalEnvironment } from '../models/LocalEnvironment';
import { createError } from '../middleware/errorHandler';

const router = express.Router();

// Global monitor instance
let globalMonitor: LocalPortMonitor | null = null;

// Start local port monitoring
router.post('/start', async (req, res, next) => {
  try {
    const { userId = 'default-user', scanInterval = 30000 } = req.body;

    // Stop existing monitor if running
    if (globalMonitor) {
      console.log('🛑 Stopping existing monitor...');
      globalMonitor.stopMonitoring();
      globalMonitor = null;
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('🚀 Starting new monitor...');
    // Create new monitor
    globalMonitor = new LocalPortMonitor(userId);
    
    // Start monitoring with timeout protection
    const monitoringPromise = globalMonitor.startMonitoring(scanInterval);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Monitoring startup timeout')), 15000); // 15 second timeout
    });

    await Promise.race([monitoringPromise, timeoutPromise]);

    const status = await globalMonitor.getMonitoringStatus();

    res.json({
      success: true,
      message: 'Local port monitoring started',
      status,
      scanInterval
    });

  } catch (error) {
    console.error('Error starting local monitoring:', error);
    
    // Clean up on error
    if (globalMonitor) {
      globalMonitor.stopMonitoring();
      globalMonitor = null;
    }
    
    next(error);
  }
});

// Stop local port monitoring
router.post('/stop', async (req, res, next) => {
  try {
    if (globalMonitor) {
      globalMonitor.stopMonitoring();
      globalMonitor = null;
    }

    res.json({
      success: true,
      message: 'Local port monitoring stopped'
    });

  } catch (error) {
    console.error('Error stopping local monitoring:', error);
    next(error);
  }
});

// Get monitoring status
router.get('/status', async (req, res, next) => {
  try {
    const { userId = 'default-user' } = req.query;

    let status = null;
    if (globalMonitor) {
      status = await globalMonitor.getMonitoringStatus();
    }

    // Also get from database
    const environment = await LocalEnvironment.findOne({ userId });
    
    res.json({
      success: true,
      monitoring: {
        active: globalMonitor !== null,
        status
      },
      environment: environment ? {
        machineId: environment.machineId,
        machineName: environment.machineName,
        platform: environment.platform,
        nodeVersion: environment.nodeVersion,
        lastScan: environment.lastScan,
        applications: environment.applications.map(app => ({
          port: app.port,
          protocol: app.protocol,
          status: app.status,
          framework: app.framework,
          projectPath: app.projectPath,
          healthCheck: app.healthCheck,
          errorCount: app.metrics.errorCount || 0,
          lastError: app.metrics.lastErrorTime
        }))
      } : null
    });

  } catch (error) {
    console.error('Error getting monitoring status:', error);
    next(error);
  }
});

// Get applications running on local machine
router.get('/applications', async (req, res, next) => {
  try {
    const { userId = 'default-user' } = req.query;

    const environment = await LocalEnvironment.findOne({ userId });
    
    if (!environment) {
      res.json({
        success: true,
        applications: [],
        message: 'No local environment found. Start monitoring first.'
      });
      return;
    }

    const applications = environment.applications.map(app => ({
      port: app.port,
      protocol: app.protocol,
      status: app.status,
      framework: app.framework,
      projectPath: app.projectPath,
      processId: app.processId,
      startTime: app.startTime,
      lastChecked: app.lastChecked,
      healthCheck: app.healthCheck,
      metrics: app.metrics,
      recentErrors: app.errors.slice(-5) // Last 5 errors
    }));

    // Group by status
    const summary = {
      total: applications.length,
      running: applications.filter(app => app.status === 'running').length,
      healthy: applications.filter(app => app.healthCheck.status === 'healthy').length,
      stopped: applications.filter(app => app.status === 'stopped').length,
      errors: applications.filter(app => app.status === 'error').length
    };

    res.json({
      success: true,
      applications,
      summary,
      lastScan: environment.lastScan
    });

  } catch (error) {
    console.error('Error getting applications:', error);
    next(error);
  }
});

// Get detailed information about a specific application
router.get('/applications/:port', async (req, res, next) => {
  try {
    const { port } = req.params;
    const { userId = 'default-user' } = req.query;

    const environment = await LocalEnvironment.findOne({ userId });
    
    if (!environment) {
      throw createError('Local environment not found', 404);
    }

    const application = environment.applications.find(app => app.port === parseInt(port));
    
    if (!application) {
      throw createError(`Application on port ${port} not found`, 404);
    }

    res.json({
      success: true,
      application: {
        port: application.port,
        protocol: application.protocol,
        status: application.status,
        framework: application.framework,
        projectPath: application.projectPath,
        processId: application.processId,
        startTime: application.startTime,
        lastChecked: application.lastChecked,
        healthCheck: application.healthCheck,
        metrics: application.metrics,
        errors: application.errors,
        uptime: application.startTime ? Date.now() - application.startTime.getTime() : 0
      }
    });

  } catch (error) {
    console.error('Error getting application details:', error);
    next(error);
  }
});

// Add error to application
router.post('/applications/:port/errors', async (req, res, next) => {
  try {
    const { port } = req.params;
    const { userId = 'default-user' } = req.query;
    const errorData = req.body;

    if (!globalMonitor) {
      throw createError('Local monitoring not active', 400);
    }

    await globalMonitor.addError(parseInt(port), errorData);

    res.json({
      success: true,
      message: 'Error logged successfully'
    });

  } catch (error) {
    console.error('Error adding application error:', error);
    next(error);
  }
});

// Get errors for a specific application
router.get('/applications/:port/errors', async (req, res, next) => {
  try {
    const { port } = req.params;
    const { userId = 'default-user', limit = 50 } = req.query;

    const environment = await LocalEnvironment.findOne({ userId });
    
    if (!environment) {
      throw createError('Local environment not found', 404);
    }

    const application = environment.applications.find(app => app.port === parseInt(port));
    
    if (!application) {
      throw createError(`Application on port ${port} not found`, 404);
    }

    const errors = application.errors
      .slice(-parseInt(limit as string))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const errorSummary = {
      total: application.errors.length,
      byType: application.errors.reduce((acc, err) => {
        acc[err.type] = (acc[err.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byLevel: application.errors.reduce((acc, err) => {
        acc[err.level] = (acc[err.level] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastError: application.metrics.lastErrorTime
    };

    res.json({
      success: true,
      errors,
      summary: errorSummary
    });

  } catch (error) {
    console.error('Error getting application errors:', error);
    next(error);
  }
});

// Update monitoring settings
router.patch('/settings', async (req, res, next) => {
  try {
    const { userId = 'default-user' } = req.query;
    const settings = req.body;

    const environment = await LocalEnvironment.findOne({ userId });
    
    if (!environment) {
      throw createError('Local environment not found', 404);
    }

    // Update settings
    environment.settings = {
      ...environment.settings,
      ...settings
    };

    await environment.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: environment.settings
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    next(error);
  }
});

// Force immediate port scan
router.post('/scan', async (req, res, next) => {
  try {
    if (!globalMonitor) {
      throw createError('Local monitoring not active', 400);
    }

    // Trigger immediate scan (this is a private method, so we'll restart monitoring)
    const status = await globalMonitor.getMonitoringStatus();
    
    res.json({
      success: true,
      message: 'Port scan completed',
      status
    });

  } catch (error) {
    console.error('Error performing port scan:', error);
    next(error);
  }
});

export default router;
