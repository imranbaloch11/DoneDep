'use client';

import React, { useState, useEffect } from 'react';
import { 
  Monitor, 
  Play, 
  Square, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Activity,
  Settings,
  Eye,
  Bug
} from 'lucide-react';
import { localMonitorAPI, LocalApplication, MonitoringStatus } from '../../services/api/local-monitor';
import { toast } from 'react-hot-toast';

interface LocalEnvironmentMonitorProps {
  userId?: string;
  onApplicationSelect?: (application: LocalApplication) => void;
}

export default function LocalEnvironmentMonitor({ 
  userId = 'default-user',
  onApplicationSelect 
}: LocalEnvironmentMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [applications, setApplications] = useState<LocalApplication[]>([]);
  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<LocalApplication | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    checkMonitoringStatus();
  }, [userId]);

  useEffect(() => {
    if (isMonitoring) {
      // Start polling for updates
      const stopPolling = localMonitorAPI.pollApplications(
        (apps) => setApplications(apps),
        userId,
        5000 // Poll every 5 seconds
      );

      return () => {
        stopPolling.then(stop => stop());
      };
    }
  }, [isMonitoring, userId]);

  const checkMonitoringStatus = async () => {
    try {
      const result = await localMonitorAPI.getStatus(userId);
      setIsMonitoring(result.monitoring.active);
      setMonitoringStatus(result.monitoring.status);
      
      if (result.environment) {
        setApplications(result.environment.applications);
        setLastScan(result.environment.lastScan);
      }
    } catch (error) {
      console.error('Error checking monitoring status:', error);
    }
  };

  const startMonitoring = async () => {
    setLoading(true);
    try {
      console.log('Starting monitoring for userId:', userId);
      const result = await localMonitorAPI.startMonitoring(userId, 30000);
      console.log('Monitoring result:', result);
      
      if (result.success) {
        setIsMonitoring(true);
        setMonitoringStatus(result.status);
        toast.success('Local monitoring started');
        
        // Load applications after a short delay
        setTimeout(() => {
          loadApplications();
        }, 2000);
      } else {
        console.error('Monitoring failed:', result);
        toast.error('Failed to start monitoring');
      }
    } catch (error: any) {
      console.error('Error starting monitoring:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to start monitoring: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const stopMonitoring = async () => {
    setLoading(true);
    try {
      const result = await localMonitorAPI.stopMonitoring();
      if (result.success) {
        setIsMonitoring(false);
        setMonitoringStatus(null);
        toast.success('Local monitoring stopped');
      }
    } catch (error) {
      console.error('Error stopping monitoring:', error);
      toast.error('Failed to stop monitoring');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const result = await localMonitorAPI.getApplications(userId);
      if (result.success) {
        setApplications(result.applications);
        setLastScan(result.lastScan);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const forceScan = async () => {
    setLoading(true);
    try {
      const result = await localMonitorAPI.forceScan();
      if (result.success) {
        toast.success('Port scan completed');
        await loadApplications();
      }
    } catch (error) {
      console.error('Error performing scan:', error);
      toast.error('Failed to perform scan');
    } finally {
      setLoading(false);
    }
  };

  const openApplication = (app: LocalApplication) => {
    const url = localMonitorAPI.getApplicationUrl(app);
    window.open(url, '_blank');
  };

  const selectApplication = (app: LocalApplication) => {
    setSelectedApp(app);
    onApplicationSelect?.(app);
  };

  const getStatusIcon = (status: LocalApplication['status']) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'stopped':
        return <Clock className="w-4 h-4 text-gray-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const runningApps = applications.filter(app => app.status === 'running');
  const healthyApps = runningApps.filter(app => app.healthCheck.status === 'healthy');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="w-5 h-5 text-purple-600 mr-2" />
            <div>
              <h3 className="font-semibold text-gray-900">Local Environment Monitor</h3>
              <p className="text-sm text-gray-600">
                {isMonitoring ? 'Monitoring active' : 'Monitoring inactive'}
                {monitoringStatus && (
                  <span className="ml-2">
                    • {runningApps.length} running • {healthyApps.length} healthy
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isMonitoring && (
              <button
                onClick={forceScan}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Force scan"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
              disabled={loading}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isMonitoring
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : isMonitoring ? (
                <Square className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isMonitoring ? 'Stop' : 'Start'} Monitoring
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && monitoringStatus && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Monitoring Settings</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Auto-detect frameworks:</span>
              <span className="ml-2 font-medium">
                {monitoringStatus.settings.autoDetectFrameworks ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Capture errors:</span>
              <span className="ml-2 font-medium">
                {monitoringStatus.settings.captureErrors ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Health check interval:</span>
              <span className="ml-2 font-medium">
                {Math.floor(monitoringStatus.settings.healthCheckInterval / 1000)}s
              </span>
            </div>
            <div>
              <span className="text-gray-600">Max error history:</span>
              <span className="ml-2 font-medium">{monitoringStatus.settings.maxErrorHistory}</span>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="p-4">
        {!isMonitoring ? (
          <div className="text-center py-8">
            <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Start monitoring to detect local applications</p>
            <button
              onClick={startMonitoring}
              disabled={loading}
              className="flex items-center mx-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Monitoring
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No applications detected</p>
            <p className="text-sm text-gray-500">
              Start a development server and it will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.port}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedApp?.port === app.port
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => selectApplication(app)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">
                      {localMonitorAPI.getFrameworkIcon(app.framework)}
                    </span>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">
                          localhost:{app.port}
                        </h4>
                        <span className="ml-2 text-sm text-gray-600">
                          {app.framework}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          {getStatusIcon(app.status)}
                          <span className="ml-1">{app.status}</span>
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-1 ${
                            app.healthCheck?.status === 'healthy' ? 'bg-green-500' :
                            app.healthCheck?.status === 'unhealthy' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`} />
                          <span>{app.healthCheck?.status || 'unknown'}</span>
                        </div>
                        {app.healthCheck?.responseTime && (
                          <span>
                            {localMonitorAPI.formatResponseTime(app.healthCheck.responseTime)}
                          </span>
                        )}
                        {app.metrics?.errorCount && app.metrics.errorCount > 0 && (
                          <div className="flex items-center text-red-600">
                            <Bug className="w-3 h-3 mr-1" />
                            <span>{app.metrics.errorCount} errors</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectApplication(app);
                      }}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openApplication(app);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Open application"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {app.projectPath && (
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    📁 {app.projectPath}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {lastScan && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Last scan: {new Date(lastScan).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
