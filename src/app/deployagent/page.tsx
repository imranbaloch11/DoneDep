'use client';

import React, { useState } from 'react';
import { Bot, GitBranch, BarChart3, Settings, History } from 'lucide-react';
import DeployAgentChatNew from '../../components/deployagent/DeployAgentChatNew';
import ArchitectureVisualizer from '../../components/deployagent/ArchitectureVisualizer';
import ProjectAnalyzer from '../../components/deployagent/ProjectAnalyzer';
import { ProjectAnalysis } from '../../services/api/deployagent';
export default function DeployAgentPage() {
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
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <Bot className="h-8 w-8 text-purple-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">DoneDep</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Status section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">AI Agent</p>
                <p className="text-xs text-gray-500">Active & Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Agentic Deploy</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-sm text-gray-700">AI-Powered Deployment Assistant</span>
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
    </div>
  );
}
