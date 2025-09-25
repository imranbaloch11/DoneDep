import * as express from 'express';
import { ErrorCaptureService } from '../services/ErrorCaptureService';
import { createError } from '../middleware/errorHandler';

const router = express.Router();
const errorCaptureService = ErrorCaptureService.getInstance();

// Initialize error capture for an application
router.post('/initialize', async (req, res, next) => {
  try {
    const { 
      applicationId, 
      applicationName, 
      applicationPort, 
      environment = 'development' 
    } = req.body;

    if (!applicationId || !applicationName || !applicationPort) {
      throw createError('Missing required fields: applicationId, applicationName, applicationPort', 400);
    }

    const capture = await errorCaptureService.initializeCapture(
      applicationId,
      applicationName,
      applicationPort,
      environment
    );

    res.json({
      success: true,
      message: 'Error capture initialized successfully',
      capture: {
        applicationId: capture.applicationId,
        applicationName: capture.applicationName,
        applicationPort: capture.applicationPort,
        environment: capture.environment,
        monitoring: capture.monitoring,
        integrations: capture.integrations,
        summary: capture.summary
      }
    });

  } catch (error) {
    console.error('Error initializing error capture:', error);
    next(error);
  }
});

// Capture a new error event
router.post('/capture', async (req, res, next) => {
  try {
    const { applicationId, applicationPort, error } = req.body;

    if (!applicationId || !applicationPort || !error) {
      throw createError('Missing required fields: applicationId, applicationPort, error', 400);
    }

    await errorCaptureService.captureError(applicationId, applicationPort, error);

    res.json({
      success: true,
      message: 'Error captured successfully'
    });

  } catch (error) {
    console.error('Error capturing error event:', error);
    next(error);
  }
});

// Get error capture status
router.get('/status/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;

    const capture = await errorCaptureService.getCaptureStatus(
      applicationId,
      parseInt(applicationPort)
    );

    if (!capture) {
      throw createError('Error capture not found', 404);
    }

    res.json({
      success: true,
      capture: {
        applicationId: capture.applicationId,
        applicationName: capture.applicationName,
        applicationPort: capture.applicationPort,
        environment: capture.environment,
        monitoring: capture.monitoring,
        integrations: capture.integrations,
        summary: capture.summary,
        lastHeartbeat: capture.monitoring.lastHeartbeat
      }
    });

  } catch (error) {
    console.error('Error getting capture status:', error);
    next(error);
  }
});

// Get recent errors
router.get('/errors/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;
    const { limit = 50, severity } = req.query;

    const errors = await errorCaptureService.getRecentErrors(
      applicationId,
      parseInt(applicationPort),
      parseInt(limit as string),
      severity as string
    );

    res.json({
      success: true,
      errors: errors.map(error => ({
        errorId: error.metadata.errorId,
        timestamp: error.timestamp,
        type: error.type,
        level: error.level,
        message: error.message,
        stack: error.stack,
        source: error.source,
        context: error.context,
        impact: error.impact,
        metadata: error.metadata,
        technicalDetails: error.technicalDetails
      }))
    });

  } catch (error) {
    console.error('Error getting recent errors:', error);
    next(error);
  }
});

// Get error statistics
router.get('/statistics/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;

    const statistics = await errorCaptureService.getErrorStatistics(
      applicationId,
      parseInt(applicationPort)
    );

    if (!statistics) {
      throw createError('Error capture not found', 404);
    }

    res.json({
      success: true,
      statistics
    });

  } catch (error) {
    console.error('Error getting error statistics:', error);
    next(error);
  }
});

// Resolve an error
router.patch('/resolve/:applicationId/:applicationPort/:errorId', async (req, res, next) => {
  try {
    const { applicationId, applicationPort, errorId } = req.params;
    const { resolvedBy = 'user' } = req.body;

    const resolved = await errorCaptureService.resolveError(
      applicationId,
      parseInt(applicationPort),
      errorId,
      resolvedBy
    );

    if (!resolved) {
      throw createError('Error not found or already resolved', 404);
    }

    res.json({
      success: true,
      message: 'Error resolved successfully'
    });

  } catch (error) {
    console.error('Error resolving error:', error);
    next(error);
  }
});

// Update capture settings
router.patch('/settings/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;
    const settings = req.body;

    const updated = await errorCaptureService.updateCaptureSettings(
      applicationId,
      parseInt(applicationPort),
      settings
    );

    if (!updated) {
      throw createError('Error capture not found', 404);
    }

    res.json({
      success: true,
      message: 'Capture settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating capture settings:', error);
    next(error);
  }
});

// Update Windsurf IDE integration settings
router.patch('/windsurf/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;
    const settings = req.body;

    const updated = await errorCaptureService.updateWindsurfIntegration(
      applicationId,
      parseInt(applicationPort),
      settings
    );

    if (!updated) {
      throw createError('Error capture not found', 404);
    }

    res.json({
      success: true,
      message: 'Windsurf integration settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating Windsurf integration:', error);
    next(error);
  }
});

// Stop error capture
router.post('/stop/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;

    await errorCaptureService.stopCapture(
      applicationId,
      parseInt(applicationPort)
    );

    res.json({
      success: true,
      message: 'Error capture stopped successfully'
    });

  } catch (error) {
    console.error('Error stopping capture:', error);
    next(error);
  }
});

// WebSocket endpoint for real-time error streaming
router.get('/stream/:applicationId/:applicationPort', async (req, res, next) => {
  try {
    const { applicationId, applicationPort } = req.params;

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);

    // Listen for error events
    const onErrorCaptured = (data: any) => {
      if (data.applicationId === applicationId && data.applicationPort === parseInt(applicationPort)) {
        res.write(`data: ${JSON.stringify({
          type: 'error-captured',
          timestamp: new Date(),
          error: data.error,
          isNew: data.isNew
        })}\n\n`);
      }
    };

    const onErrorResolved = (data: any) => {
      if (data.applicationId === applicationId && data.applicationPort === parseInt(applicationPort)) {
        res.write(`data: ${JSON.stringify({
          type: 'error-resolved',
          timestamp: new Date(),
          errorId: data.errorId,
          resolvedBy: data.resolvedBy
        })}\n\n`);
      }
    };

    const onAlert = (data: any) => {
      if (data.applicationId === applicationId && data.applicationPort === parseInt(applicationPort)) {
        res.write(`data: ${JSON.stringify({
          type: 'alert',
          timestamp: new Date(),
          alertType: data.type,
          message: data.message,
          data: data.data
        })}\n\n`);
      }
    };

    // Register event listeners
    errorCaptureService.on('error-captured', onErrorCaptured);
    errorCaptureService.on('error-resolved', onErrorResolved);
    errorCaptureService.on('alert', onAlert);

    // Handle client disconnect
    req.on('close', () => {
      errorCaptureService.off('error-captured', onErrorCaptured);
      errorCaptureService.off('error-resolved', onErrorResolved);
      errorCaptureService.off('alert', onAlert);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date() })}\n\n`);
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
    });

  } catch (error) {
    console.error('Error setting up error stream:', error);
    next(error);
  }
});

export default router;
