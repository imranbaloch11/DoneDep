'use client';

import React, { useState } from 'react';
import { Bot, GitBranch, BarChart3, Settings, History } from 'lucide-react';
import DeployMindChat from '../../components/deploymind/DeployMindChat';
import ProjectAnalyzer from '../../components/deploymind/ProjectAnalyzer';
import { ProjectAnalysis } from '../../services/api/deploymind';

export default function DeployMindPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analyze' | 'deployments' | 'settings'>('chat');
  const [currentContextId, setCurrentContextId] = useState<string | undefined>();

  const tabs = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'analyze', label: 'Analyze', icon: GitBranch },
    { id: 'deployments', label: 'Deployments', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleAnalysisComplete = (analysis: ProjectAnalysis) => {
    setCurrentContextId(analysis.contextId);
    setActiveTab('chat');
  };

  const handleContextCreated = (contextId: string) => {
    setCurrentContextId(contextId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Bot className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">DeployMind</h1>
                <p className="text-sm text-gray-500">Intelligent Deployment Orchestrator</p>
              </div>
            </div>
            
            {currentContextId && (
              <div className="hidden md:flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">Context Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <DeployMindChat 
              contextId={currentContextId}
              onContextCreated={handleContextCreated}
            />
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="max-w-6xl mx-auto">
            <ProjectAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="max-w-6xl mx-auto">
            <DeploymentsList />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <DeployMindSettings />
          </div>
        )}
      </div>
    </div>
  );
}

// Placeholder components for other tabs
function DeploymentsList() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <History size={24} className="text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">Your Deployments</h2>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={32} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
        <p className="text-gray-500 mb-4">Start by analyzing a project or chatting with DeployMind</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

function DeployMindSettings() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-purple-600" />
        <h2 className="text-2xl font-bold text-gray-900">DeployMind Settings</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto-execute deployment commands</label>
                <p className="text-sm text-gray-500">Automatically run safe deployment commands</p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable monitoring suggestions</label>
                <p className="text-sm text-gray-500">Get proactive monitoring and alerting recommendations</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Cost optimization alerts</label>
                <p className="text-sm text-gray-500">Receive notifications about cost-saving opportunities</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Knowledge Base</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">
              DeployMind learns from your deployments to provide better recommendations over time.
            </p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
              View Knowledge Stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
