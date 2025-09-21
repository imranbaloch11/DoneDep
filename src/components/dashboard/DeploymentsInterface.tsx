'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CloudIcon,
  RocketLaunchIcon,
  ServerIcon,
  GlobeAltIcon,
  CircleStackIcon,
  CogIcon,
  PlayIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface Deployment {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'fullstack';
  provider: 'vercel' | 'netlify' | 'heroku' | 'aws' | 'digitalocean';
  status: 'deploying' | 'deployed' | 'failed' | 'stopped';
  url?: string;
  branch: string;
  lastDeploy: Date;
  buildTime?: number;
  environment: 'production' | 'staging' | 'development';
}

const PROVIDERS = [
  { id: 'vercel', name: 'Vercel', icon: '▲', color: 'bg-black text-white' },
  { id: 'netlify', name: 'Netlify', icon: '◆', color: 'bg-teal-600 text-white' },
  { id: 'heroku', name: 'Heroku', icon: '⬢', color: 'bg-purple-600 text-white' },
  { id: 'aws', name: 'AWS', icon: '☁', color: 'bg-orange-500 text-white' },
  { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊', color: 'bg-blue-600 text-white' },
];

const DEPLOYMENT_TEMPLATES = [
  {
    id: 'react-app',
    name: 'React Application',
    description: 'Deploy a React frontend application',
    type: 'frontend',
    icon: <ServerIcon className="h-6 w-6" />,
    buildCommand: 'npm run build',
    outputDir: 'build',
  },
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    description: 'Deploy a Next.js full-stack application',
    type: 'fullstack',
    icon: <RocketLaunchIcon className="h-6 w-6" />,
    buildCommand: 'npm run build',
    outputDir: '.next',
  },
  {
    id: 'node-api',
    name: 'Node.js API',
    description: 'Deploy a Node.js backend API',
    type: 'backend',
    icon: <CircleStackIcon className="h-6 w-6" />,
    buildCommand: 'npm install',
    startCommand: 'npm start',
  },
  {
    id: 'static-site',
    name: 'Static Website',
    description: 'Deploy a static HTML/CSS/JS website',
    type: 'frontend',
    icon: <GlobeAltIcon className="h-6 w-6" />,
    buildCommand: 'npm run build',
    outputDir: 'dist',
  },
];

export function DeploymentsInterface() {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      name: 'My Portfolio',
      type: 'frontend',
      provider: 'vercel',
      status: 'deployed',
      url: 'https://my-portfolio.vercel.app',
      branch: 'main',
      lastDeploy: new Date(Date.now() - 2 * 60 * 60 * 1000),
      buildTime: 45,
      environment: 'production',
    },
    {
      id: '2',
      name: 'API Server',
      type: 'backend',
      provider: 'heroku',
      status: 'deploying',
      branch: 'develop',
      lastDeploy: new Date(Date.now() - 10 * 60 * 1000),
      environment: 'staging',
    },
  ]);

  const [showNewDeployment, setShowNewDeployment] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [deploymentConfig, setDeploymentConfig] = useState({
    name: '',
    repository: '',
    branch: 'main',
    provider: 'vercel',
    environment: 'production',
    buildCommand: '',
    outputDir: '',
    envVars: '',
  });

  const handleCreateDeployment = () => {
    const template = DEPLOYMENT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template || !deploymentConfig.name || !deploymentConfig.repository) return;

    const newDeployment: Deployment = {
      id: Date.now().toString(),
      name: deploymentConfig.name,
      type: template.type as 'frontend' | 'backend' | 'fullstack',
      provider: deploymentConfig.provider as any,
      status: 'deploying',
      branch: deploymentConfig.branch,
      lastDeploy: new Date(),
      environment: deploymentConfig.environment as any,
    };

    setDeployments(prev => [...prev, newDeployment]);
    
    // Simulate deployment process
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { 
              ...d, 
              status: 'deployed', 
              url: `https://${deploymentConfig.name.toLowerCase().replace(/\s+/g, '-')}.${deploymentConfig.provider}.app`,
              buildTime: Math.floor(Math.random() * 120) + 30
            }
          : d
      ));
    }, 5000);

    // Reset form
    setDeploymentConfig({
      name: '',
      repository: '',
      branch: 'main',
      provider: 'vercel',
      environment: 'production',
      buildCommand: '',
      outputDir: '',
      envVars: '',
    });
    setSelectedTemplate('');
    setShowNewDeployment(false);
  };

  const handleStopDeployment = (id: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'stopped' } : d
    ));
  };

  const handleRestartDeployment = (id: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === id ? { ...d, status: 'deploying', lastDeploy: new Date() } : d
    ));

    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === id ? { ...d, status: 'deployed' } : d
      ));
    }, 3000);
  };

  const handleDeleteDeployment = (id: string) => {
    setDeployments(prev => prev.filter(d => d.id !== id));
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'deploying':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'deployed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'stopped':
        return <StopIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <CloudIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deployments</h1>
          <p className="text-gray-600">Manage your application deployments across different platforms</p>
        </div>
        <button
          onClick={() => setShowNewDeployment(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RocketLaunchIcon className="h-4 w-4" />
          New Deployment
        </button>
      </div>

      {/* New Deployment Modal */}
      {showNewDeployment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold mb-6">Create New Deployment</h3>
            
            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEPLOYMENT_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setDeploymentConfig(prev => ({
                        ...prev,
                        buildCommand: template.buildCommand,
                        outputDir: template.outputDir || '',
                      }));
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {template.icon}
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedTemplate && (
              <div className="space-y-4">
                {/* Basic Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deployment Name
                    </label>
                    <input
                      type="text"
                      value={deploymentConfig.name}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="My Awesome App"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repository URL
                    </label>
                    <input
                      type="url"
                      value={deploymentConfig.repository}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, repository: e.target.value }))}
                      placeholder="https://github.com/username/repo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={deploymentConfig.branch}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, branch: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider
                    </label>
                    <select
                      value={deploymentConfig.provider}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, provider: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {PROVIDERS.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Environment
                    </label>
                    <select
                      value={deploymentConfig.environment}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, environment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                </div>

                {/* Build Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Build Command
                    </label>
                    <input
                      type="text"
                      value={deploymentConfig.buildCommand}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
                      placeholder="npm run build"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Output Directory
                    </label>
                    <input
                      type="text"
                      value={deploymentConfig.outputDir}
                      onChange={(e) => setDeploymentConfig(prev => ({ ...prev, outputDir: e.target.value }))}
                      placeholder="build"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Environment Variables */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Environment Variables (one per line)
                  </label>
                  <textarea
                    value={deploymentConfig.envVars}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, envVars: e.target.value }))}
                    placeholder="REACT_APP_API_URL=https://api.example.com&#10;NODE_ENV=production"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewDeployment(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeployment}
                disabled={!selectedTemplate || !deploymentConfig.name || !deploymentConfig.repository}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Deploy
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Deployments List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Deployments</h2>
        </div>
        
        {deployments.length === 0 ? (
          <div className="p-8 text-center">
            <CloudIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
            <p className="text-gray-600 mb-4">Create your first deployment to get started</p>
            <button
              onClick={() => setShowNewDeployment(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Deployment
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {deployments.map((deployment) => {
              const providerInfo = getProviderInfo(deployment.provider);
              
              return (
                <div key={deployment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deployment.status)}
                        <div className={`px-2 py-1 rounded text-xs font-medium ${providerInfo.color}`}>
                          {providerInfo.icon} {providerInfo.name}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{deployment.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Branch: {deployment.branch}</span>
                          <span>Type: {deployment.type}</span>
                          <span>Env: {deployment.environment}</span>
                          {deployment.buildTime && (
                            <span>Build: {deployment.buildTime}s</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Last deploy: {deployment.lastDeploy.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {deployment.url && (
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <EyeIcon className="h-4 w-4" />
                          View
                        </a>
                      )}
                      
                      {deployment.status === 'deployed' && (
                        <>
                          <button
                            onClick={() => handleRestartDeployment(deployment.id)}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                          >
                            <PlayIcon className="h-4 w-4" />
                            Redeploy
                          </button>
                          <button
                            onClick={() => handleStopDeployment(deployment.id)}
                            className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                          >
                            <StopIcon className="h-4 w-4" />
                            Stop
                          </button>
                        </>
                      )}
                      
                      {deployment.status === 'stopped' && (
                        <button
                          onClick={() => handleRestartDeployment(deployment.id)}
                          className="px-3 py-1 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                        >
                          <PlayIcon className="h-4 w-4" />
                          Start
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteDeployment(deployment.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {deployment.url && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <GlobeAltIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Live URL:</span>
                        <a
                          href={deployment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {deployment.url}
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(deployment.url)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Deploy Templates */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Deploy Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DEPLOYMENT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template.id);
                setDeploymentConfig(prev => ({
                  ...prev,
                  buildCommand: template.buildCommand,
                  outputDir: template.outputDir || '',
                }));
                setShowNewDeployment(true);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                {template.icon}
                <h3 className="font-medium text-gray-900">{template.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
