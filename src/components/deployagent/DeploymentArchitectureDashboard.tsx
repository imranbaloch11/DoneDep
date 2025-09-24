import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  ExternalLink, 
  Monitor, 
  Mail, 
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Settings,
  Eye,
  Zap
} from 'lucide-react';
import { 
  deploymentAPI, 
  DeploymentArchitecture, 
  DeploymentComponent,
  getComponentStatusColor,
  getComponentIcon,
  getOverallStatusColor
} from '../../services/api/deployment';
import { toast } from 'react-hot-toast';

interface DeploymentArchitectureDashboardProps {
  projectId: string;
  repositoryUrl: string;
  onDeploymentCreated?: (deployment: DeploymentArchitecture) => void;
}

const DeploymentArchitectureDashboard: React.FC<DeploymentArchitectureDashboardProps> = ({
  projectId,
  repositoryUrl,
  onDeploymentCreated
}) => {
  const [deployment, setDeployment] = useState<DeploymentArchitecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [deployingComponents, setDeployingComponents] = useState<Set<string>>(new Set());
  const [selectedComponent, setSelectedComponent] = useState<DeploymentComponent | null>(null);
  const [showComponentDetails, setShowComponentDetails] = useState(false);

  useEffect(() => {
    initializeDeployment();
  }, [projectId, repositoryUrl]);

  useEffect(() => {
    if (deployment) {
      // Start polling for status updates
      let stopPolling: (() => void) | undefined;
      
      deploymentAPI.pollDeploymentStatus(
        deployment.projectId,
        (updatedDeployment) => {
          setDeployment(updatedDeployment);
          onDeploymentCreated?.(updatedDeployment);
        },
        3000 // Poll every 3 seconds
      ).then((stopFn) => {
        stopPolling = stopFn;
      });

      return () => {
        if (stopPolling) {
          stopPolling();
        }
      };
    }
  }, [deployment?.projectId]);

  const initializeDeployment = async () => {
    try {
      setLoading(true);
      
      // Try to get existing deployment first
      try {
        const result = await deploymentAPI.getDeployment(projectId);
        if (result.success) {
          setDeployment(result.deployment);
          setTestEmail(result.deployment.testEmail || '');
          onDeploymentCreated?.(result.deployment);
          return;
        }
      } catch (error) {
        // Deployment doesn't exist, create new one
      }

      // Create new deployment
      const createResult = await deploymentAPI.createDeployment({
        repositoryUrl,
        repositoryBranch: 'main',
        userId: 'default-user'
      });

      if (createResult.success) {
        // Get full deployment details
        const result = await deploymentAPI.getDeployment(createResult.projectId);
        if (result.success) {
          setDeployment(result.deployment);
          onDeploymentCreated?.(result.deployment);
          toast.success('Deployment architecture initialized!');
        }
      }
    } catch (error) {
      console.error('Error initializing deployment:', error);
      toast.error('Failed to initialize deployment architecture');
    } finally {
      setLoading(false);
    }
  };

  const handleDeployComponent = async (componentType: string) => {
    if (!deployment) return;

    try {
      setDeployingComponents(prev => new Set([...Array.from(prev), componentType]));
      
      const result = await deploymentAPI.deployComponent(deployment.projectId, componentType, {
        provider: 'digitalocean',
        region: 'nyc1'
      });

      if (result.success) {
        toast.success(`${componentType} deployment started!`);
      }
    } catch (error) {
      console.error('Error deploying component:', error);
      toast.error(`Failed to deploy ${componentType}`);
    } finally {
      setDeployingComponents(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(componentType);
        return newSet;
      });
    }
  };

  const handleSetTestEmail = async () => {
    if (!deployment || !testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const result = await deploymentAPI.setTestEmail(deployment.projectId, testEmail);
      if (result.success) {
        setDeployment(prev => prev ? { ...prev, testEmail } : null);
        setShowTestEmailModal(false);
        toast.success('Test email configured successfully!');
      }
    } catch (error) {
      console.error('Error setting test email:', error);
      toast.error('Failed to configure test email');
    }
  };

  const handleOpenLocalTest = () => {
    if (deployment?.localTestUrl) {
      window.open(deployment.localTestUrl, '_blank');
    } else {
      window.open('http://localhost:3000', '_blank');
    }
  };

  const handleOpenDeployment = () => {
    if (deployment?.deploymentUrl) {
      window.open(deployment.deploymentUrl, '_blank');
    } else {
      toast.error('Deployment URL not available yet');
    }
  };

  const handleViewComponentDetails = (component: DeploymentComponent) => {
    setSelectedComponent(component);
    setShowComponentDetails(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'deploying':
      case 'configuring':
        return <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Initializing deployment architecture...</span>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Initialize Deployment</h3>
        <p className="text-gray-600 mb-4">Unable to create deployment architecture</p>
        <button
          onClick={initializeDeployment}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Deployment Architecture</h2>
            <p className="text-gray-600">Visual overview of your deployment infrastructure</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOverallStatusColor(deployment.overallStatus)}`}>
              {deployment.overallStatus.charAt(0).toUpperCase() + deployment.overallStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">{deployment.projectName}</h4>
            <p className="text-sm text-gray-600">{deployment.framework} • {deployment.language}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">Repository</h4>
            <p className="text-sm text-gray-600 truncate">{deployment.repositoryUrl}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900">Last Updated</h4>
            <p className="text-sm text-gray-600">{new Date(deployment.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenLocalTest}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Monitor className="w-4 h-4 mr-2" />
            Test Application
          </button>
          
          <button
            onClick={handleOpenDeployment}
            disabled={!deployment.deploymentUrl}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Deployment
          </button>
          
          <button
            onClick={() => setShowTestEmailModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            {deployment.testEmail ? 'Update Email' : 'Set Test Email'}
          </button>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deployment.components.map((component) => (
          <div key={component.type} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getComponentIcon(component.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{component.name}</h3>
                  <p className="text-sm text-gray-600">{component.technology}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(component.status)}
                <button
                  onClick={() => handleViewComponentDetails(component)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getComponentStatusColor(component.status)}`}>
                {component.status}
              </span>
            </div>

            {component.url && (
              <div className="mb-4">
                <a
                  href={component.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  {component.url}
                </a>
              </div>
            )}

            {component.healthCheck && (
              <div className="mb-4">
                <div className="flex items-center text-sm">
                  <Activity className="w-4 h-4 mr-1" />
                  <span className={component.healthCheck.status === 'healthy' ? 'text-green-600' : 'text-red-600'}>
                    {component.healthCheck.status}
                  </span>
                  {component.healthCheck.responseTime && (
                    <span className="text-gray-500 ml-2">({component.healthCheck.responseTime}ms)</span>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              {component.status === 'pending' && (
                <button
                  onClick={() => handleDeployComponent(component.type)}
                  disabled={deployingComponents.has(component.type)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {deployingComponents.has(component.type) ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Deploy
                    </>
                  )}
                </button>
              )}
              
              {component.status === 'active' && (
                <button
                  onClick={() => handleViewComponentDetails(component)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Test Email</h3>
            <p className="text-gray-600 mb-4">
              Enter your email address to receive deployment notifications and test SMTP configuration.
            </p>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSetTestEmail}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Component Details Modal */}
      {showComponentDetails && selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedComponent.name} Details
              </h3>
              <button
                onClick={() => setShowComponentDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status & Configuration</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${getComponentStatusColor(selectedComponent.status)}`}>
                        {selectedComponent.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Technology:</span>
                      <span className="ml-2 text-gray-900">{selectedComponent.technology}</span>
                    </div>
                    {selectedComponent.url && (
                      <div className="col-span-2">
                        <span className="text-gray-600">URL:</span>
                        <a href={selectedComponent.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800">
                          {selectedComponent.url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedComponent.logs.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recent Logs</h4>
                  <div className="bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                    {selectedComponent.logs.slice(-10).map((log, index) => (
                      <div key={index} className="text-sm font-mono mb-1">
                        <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`ml-2 ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-green-400'}`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="ml-2 text-white">{log.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentArchitectureDashboard;
