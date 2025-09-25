'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Settings,
  Play,
  Square,
  RefreshCw,
  ExternalLink,
  Filter,
  Eye,
  CheckSquare
} from 'lucide-react';
import { ErrorCaptureClient, ErrorEvent, ErrorCaptureStatus, ErrorStatistics } from '../../services/api/error-capture';
import ErrorBoundary from '../ui/ErrorBoundary';
import { toast } from 'react-hot-toast';

interface ErrorCaptureDashboardProps {
  applicationId?: string;
  applicationName?: string;
  applicationPort?: number;
  onErrorSelect?: (error: ErrorEvent) => void;
}

export default function ErrorCaptureDashboard({ 
  applicationId = 'donedep-frontend',
  applicationName = 'DoneDep Frontend',
  applicationPort = 3000,
  onErrorSelect 
}: ErrorCaptureDashboardProps) {
  const [errorCapture] = useState(() => new ErrorCaptureClient(applicationId, applicationName, applicationPort));
  const [status, setStatus] = useState<ErrorCaptureStatus | null>(null);
  const [statistics, setStatistics] = useState<ErrorStatistics | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [windsurfSettings, setWindsurfSettings] = useState({
    enabled: false,
    autoFix: false,
    createPRs: false,
    notifyOnErrors: true
  });

  useEffect(() => {
    loadErrorData();
    startRealTimeStream();

    return () => {
      errorCapture.stopRealTimeStream();
    };
  }, []);

  const loadErrorData = async () => {
    setLoading(true);
    try {
      const [statusData, statisticsData, errorsData] = await Promise.all([
        errorCapture.getStatus(),
        errorCapture.getStatistics(),
        errorCapture.getRecentErrors(50, selectedSeverity || undefined)
      ]);

      setStatus(statusData);
      setStatistics(statisticsData);
      setRecentErrors(errorsData);

      if (statusData) {
        setWindsurfSettings(statusData.integrations.windsurfIDE);
      }
    } catch (error) {
      console.error('Error loading error data:', error);
      toast.error('Failed to load error data');
    } finally {
      setLoading(false);
    }
  };

  const startRealTimeStream = () => {
    errorCapture.startRealTimeStream(
      (data) => {
        // New error captured
        if (data.isNew) {
          setRecentErrors(prev => [data.error, ...prev.slice(0, 49)]);
          toast.error(`New ${data.error.impact.severity} error: ${data.error.message.substring(0, 50)}...`);
        }
        // Refresh statistics
        loadErrorData();
      },
      (alertData) => {
        // Alert received
        toast.error(`Alert: ${alertData.message}`);
      }
    );
    setIsStreaming(true);
  };

  const stopRealTimeStream = () => {
    errorCapture.stopRealTimeStream();
    setIsStreaming(false);
  };

  const resolveError = async (errorId: string) => {
    const success = await errorCapture.resolveError(errorId, 'user');
    if (success) {
      toast.success('Error resolved');
      setRecentErrors(prev => 
        prev.map(error => 
          error.metadata?.errorId === errorId 
            ? { ...error, metadata: { ...error.metadata, resolved: true } }
            : error
        )
      );
    } else {
      toast.error('Failed to resolve error');
    }
  };

  const updateWindsurfSettings = async (newSettings: Partial<typeof windsurfSettings>) => {
    const success = await errorCapture.updateWindsurfIntegration(newSettings);
    if (success) {
      setWindsurfSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('Windsurf integration updated');
    } else {
      toast.error('Failed to update Windsurf integration');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'javascript': return '🔧';
      case 'network': return '🌐';
      case 'server': return '🖥️';
      case 'build': return '📦';
      case 'runtime': return '⚡';
      default: return '❓';
    }
  };

  const formatTimestamp = (timestamp: string | Date | undefined) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  if (!status) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mr-2" />
          <span>Initializing error capture...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bug className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <h3 className="font-semibold text-gray-900">Error Capture Dashboard</h3>
              <p className="text-sm text-gray-600">
                {status.applicationName} • {status.summary.activeErrors} active errors
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={loadErrorData}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={isStreaming ? stopRealTimeStream : startRealTimeStream}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isStreaming
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isStreaming ? (
                <Square className="w-4 h-4 mr-2" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isStreaming ? 'Stop' : 'Start'} Stream
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Windsurf IDE Integration</h4>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={windsurfSettings.enabled}
                onChange={(e) => updateWindsurfSettings({ enabled: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Enable Integration</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={windsurfSettings.autoFix}
                onChange={(e) => updateWindsurfSettings({ autoFix: e.target.checked })}
                disabled={!windsurfSettings.enabled}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto-fix Errors</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={windsurfSettings.createPRs}
                onChange={(e) => updateWindsurfSettings({ createPRs: e.target.checked })}
                disabled={!windsurfSettings.enabled}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Create Pull Requests</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={windsurfSettings.notifyOnErrors}
                onChange={(e) => updateWindsurfSettings({ notifyOnErrors: e.target.checked })}
                disabled={!windsurfSettings.enabled}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Notify on Errors</span>
            </label>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Critical Errors</p>
                  <p className="text-2xl font-bold text-red-700">{status.summary.criticalErrors}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-700">{status.summary.resolvedErrors}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Active</p>
                  <p className="text-2xl font-bold text-yellow-700">{status.summary.activeErrors}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Error Rate</p>
                  <p className="text-2xl font-bold text-blue-700">{status.summary.errorRate.toFixed(1)}/min</p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={selectedSeverity}
            onChange={(e) => {
              setSelectedSeverity(e.target.value);
              // Reload errors with new filter
              setTimeout(() => loadErrorData(), 100);
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <span className="text-sm text-gray-600">
            Showing {recentErrors.length} errors
          </span>
        </div>
      </div>

      {/* Recent Errors List */}
      <div className="p-4">
        {recentErrors.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No errors found</p>
            <p className="text-sm text-gray-500">
              {selectedSeverity ? `No ${selectedSeverity} severity errors` : 'Your application is running smoothly!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentErrors.map((error, index) => (
              <div
                key={error.metadata?.errorId || index}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  error.metadata?.resolved 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onErrorSelect?.(error)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">
                        {getTypeIcon(error.type)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(error.impact?.severity || 'low')}`}>
                        {error.impact?.severity || 'low'}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {error.type}
                      </span>
                      {error.metadata?.resolved && (
                        <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-1">
                      {error.message}
                    </h4>
                    
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{formatTimestamp(error.timestamp)}</span>
                      {error.metadata?.count && error.metadata.count > 1 && (
                        <span>Count: {error.metadata.count}</span>
                      )}
                      {error.source?.file && (
                        <span>{error.source.file}:{error.source.line}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onErrorSelect?.(error);
                      }}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {!error.metadata?.resolved && error.metadata?.errorId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (error.metadata?.errorId) {
                            resolveError(error.metadata.errorId);
                          }
                        }}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Mark as resolved"
                      >
                        <CheckSquare className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stream Status */}
      {isStreaming && (
        <div className="px-4 py-2 bg-green-50 border-t border-green-200">
          <div className="flex items-center text-sm text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live error monitoring active
          </div>
        </div>
      )}
    </div>
  );
}
