'use client';

import React, { useState } from 'react';
import { Bot, GitBranch, BarChart3, Settings, History } from 'lucide-react';
import DeployAgentChatNew from '../../components/deployagent/DeployAgentChatNew';
import ArchitectureVisualizer from '../../components/deployagent/ArchitectureVisualizer';
import ProjectAnalyzer from '../../components/deployagent/ProjectAnalyzer';
import { ProjectAnalysis } from '../../services/api/deployagent';
export default function DeploymentPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'analyze' | 'deployments' | 'settings'>('chat');
  const [currentContextId, setCurrentContextId] = useState<string | undefined>();

  const handleContextCreated = (contextId: string) => {
    setCurrentContextId(contextId);
  };

  const handleAnalysisComplete = (analysis: ProjectAnalysis) => {
    console.log('Analysis completed:', analysis);
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: Bot },
    { id: 'analyze', label: 'Analyze', icon: GitBranch },
    { id: 'deployments', label: 'Deployments', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DeployAgent</h1>
              <p className="text-gray-600">AI-Powered Deployment Assistant</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>AI Agent Active</span>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 border-b border-gray-200">
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
      <div className="h-[calc(100vh-140px)]">
        {activeTab === 'chat' && (
          <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Left Side - Architecture Visualizer */}
              <div className="h-full">
                <ArchitectureVisualizer />
              </div>
              
              {/* Right Side - Chat */}
              <div className="h-full">
                <DeployAgentChatNew 
                  contextId={currentContextId}
                  onContextCreated={handleContextCreated}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProjectAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </div>
        )}

        {activeTab === 'deployments' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <History size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Deployment History</h3>
              <p className="text-gray-600">Your deployment history will appear here.</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">DeployAgent Settings</h3>
              <p className="text-gray-600">Configure your deployment preferences and integrations.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
