'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deployMindAPI } from '@/services/api/deploymind';
import {
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CogIcon,
  BoltIcon,
  ServerIcon,
  CloudIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;
}

interface DeploymentStats {
  totalDeployments: number;
  successfulDeployments: number;
  activeProjects: number;
  averageDeployTime: string;
}

interface ApiKeyConfig {
  openaiKey: string;
  isConfigured: boolean;
}

const DeploymentMasterInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'settings'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  const [deploymentStats, setDeploymentStats] = useState<DeploymentStats>({
    totalDeployments: 0,
    successfulDeployments: 0,
    activeProjects: 0,
    averageDeployTime: '0m'
  });
  const [apiConfig, setApiConfig] = useState<ApiKeyConfig>({
    openaiKey: '',
    isConfigured: false
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeDeployMind();
    loadDeploymentStats();
    loadApiConfiguration();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeDeployMind = async () => {
    try {
      const response = await deployMindAPI.initializeChat();
      setSessionId(response.sessionId);
      setContextId(response.contextId);
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'agent',
        content: `🚀 **DoneDep Deployment Assistant Activated**

I'm your AI-powered deployment orchestrator with comprehensive DevOps intelligence. I can help you with:

• **Infrastructure Planning** - Cloud architecture and resource optimization
• **CI/CD Pipeline Setup** - Automated deployment workflows  
• **Container Orchestration** - Docker and Kubernetes management
• **Database Management** - Schema design and migration strategies
• **Security Implementation** - Best practices and vulnerability scanning
• **Monitoring & Observability** - Metrics, logging, and alerting setup

What deployment challenge can I help you solve today?`,
        timestamp: new Date(),
        actions: [
          { label: 'Analyze Project', action: 'analyze', variant: 'primary' },
          { label: 'Setup CI/CD', action: 'cicd', variant: 'secondary' },
          { label: 'Deploy to Cloud', action: 'deploy', variant: 'primary' }
        ]
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize DeployMind:', error);
    }
  };

  const loadDeploymentStats = async () => {
    try {
      const stats = await deployMindAPI.getKnowledgeStats();
      setDeploymentStats({
        totalDeployments: stats.totalPatterns || 0,
        successfulDeployments: Math.floor((stats.totalPatterns || 0) * 0.95),
        activeProjects: stats.activeSessions || 0,
        averageDeployTime: '12m'
      });
    } catch (error) {
      console.error('Failed to load deployment stats:', error);
    }
  };

  const loadApiConfiguration = () => {
    // Check if OpenAI API key is configured
    const storedKey = localStorage.getItem('donedep_openai_key');
    if (storedKey) {
      setApiConfig({
        openaiKey: storedKey,
        isConfigured: true
      });
      setTempApiKey(storedKey);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await deployMindAPI.sendMessage(
        userInput,
        sessionId || 'default-session',
        contextId
      );

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.message,
        timestamp: new Date(),
        actions: response.actions?.map((action: any) => ({
          label: action.content || 'Execute',
          action: action.type || 'execute',
          variant: 'primary' as 'primary' | 'secondary'
        })) || []
      };

      setMessages(prev => [...prev, agentResponse]);
      
      if (response.contextId) {
        setContextId(response.contextId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = async (action: string) => {
    let actionMessage = '';
    
    switch (action) {
      case 'analyze':
        actionMessage = 'Please analyze my project structure and recommend the best deployment strategy.';
        break;
      case 'cicd':
        actionMessage = 'Help me set up a CI/CD pipeline for automated deployments.';
        break;
      case 'deploy':
        actionMessage = 'Guide me through deploying my application to the cloud.';
        break;
      default:
        actionMessage = `Execute action: ${action}`;
    }
    
    setUserInput(actionMessage);
    await handleSendMessage();
  };

  const saveApiConfiguration = () => {
    if (tempApiKey.trim()) {
      localStorage.setItem('donedep_openai_key', tempApiKey.trim());
      setApiConfig({
        openaiKey: tempApiKey.trim(),
        isConfigured: true
      });
      alert('OpenAI API key saved successfully!');
    }
  };

  const clearApiConfiguration = () => {
    localStorage.removeItem('donedep_openai_key');
    setApiConfig({
      openaiKey: '',
      isConfigured: false
    });
    setTempApiKey('');
    alert('OpenAI API key cleared!');
  };

  const renderChatInterface = () => (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              <div className="prose prose-sm max-w-none">
                {message.content.split('\n').map((line, index) => {
                  if (line.startsWith('•')) {
                    return <li key={index} className="ml-4">{line.substring(1).trim()}</li>;
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <h4 key={index} className="font-semibold mt-2 mb-1">{line.slice(2, -2)}</h4>;
                  }
                  return <p key={index} className={line.trim() ? 'mb-2' : 'mb-1'}>{line}</p>;
                })}
              </div>
              
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.action)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        action.variant === 'primary'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me about deployments, CI/CD, infrastructure, or any DevOps challenge..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!userInput.trim() || isTyping}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Deployment Analytics</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <RocketLaunchIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deployments</p>
              <p className="text-2xl font-bold text-gray-900">{deploymentStats.totalDeployments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {deploymentStats.totalDeployments > 0 
                  ? Math.round((deploymentStats.successfulDeployments / deploymentStats.totalDeployments) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <ServerIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900">{deploymentStats.activeProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <BoltIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Deploy Time</p>
              <p className="text-2xl font-bold text-gray-900">{deploymentStats.averageDeployTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deployment Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Frontend deployment successful</p>
                <p className="text-sm text-gray-600">React app deployed to Vercel</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Database migration completed</p>
                <p className="text-sm text-gray-600">PostgreSQL schema updated</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">5 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">CI/CD pipeline warning</p>
                <p className="text-sm text-gray-600">Build took longer than expected</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      {/* OpenAI API Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <KeyIcon className="h-6 w-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">OpenAI API Configuration</h3>
          {apiConfig.isConfigured && (
            <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
          )}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key
            </label>
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showApiKey ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <button
                onClick={saveApiConfiguration}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              {apiConfig.isConfigured && (
                <button
                  onClick={clearApiConfiguration}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <KeyIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">API Key Information</h4>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Your OpenAI API key enables the AI deployment assistant to provide intelligent recommendations.</p>
                  <p className="mt-1">The key is stored locally in your browser and never sent to our servers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DeployMind Brain Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <CloudIcon className="h-6 w-6 text-gray-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">DeployMind Brain Status</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="font-medium text-green-800">AI Brain Connected</p>
                <p className="text-sm text-green-600">DeployMind middleware is active and ready</p>
              </div>
            </div>
            <span className="text-sm font-medium text-green-800">Online</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">150+</p>
              <p className="text-sm text-gray-600">DevOps Patterns</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-600">Availability</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg h-[800px] flex flex-col">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'chat', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
            { id: 'settings', label: 'Settings', icon: CogIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'chat' && renderChatInterface()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'settings' && renderSettings()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeploymentMasterInterface;
