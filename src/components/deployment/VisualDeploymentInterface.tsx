'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { deployAgentAPI } from '@/services/api/deployagent';
import { githubApi } from '@/services/api/github';
import { domainApi } from '@/services/api/domain';
import { infrastructureApi } from '@/services/api/infrastructure';
import {
  CodeBracketIcon,
  ServerIcon,
  CircleStackIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CogIcon,
  ChartBarIcon,
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

interface DeploymentBlock {
  id: string;
  type: 'frontend' | 'backend' | 'database' | 'domain' | 'email' | 'cicd' | 'monitoring' | 'container';
  name: string;
  status: 'pending' | 'connecting' | 'connected' | 'failed' | 'completed' | 'in-progress';
  details?: string;
  connections?: string[];
}

interface AgentMessage {
  id: string;
  type: 'agent' | 'user';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary';
  }>;
}

const VisualDeploymentInterface: React.FC = () => {
  const [blocks, setBlocks] = useState<DeploymentBlock[]>([
    { id: 'frontend', type: 'frontend', name: 'Frontend', status: 'pending' },
    { id: 'backend', type: 'backend', name: 'Backend', status: 'pending' },
    { id: 'database', type: 'database', name: 'Database', status: 'pending' },
    { id: 'domain', type: 'domain', name: 'Domain', status: 'pending' },
    { id: 'email', type: 'email', name: 'Email', status: 'pending' },
    { id: 'cicd', type: 'cicd', name: 'CI/CD', status: 'pending' },
  ]);

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: '1',
      type: 'agent',
      content: "Hi! I'm your intelligent deployment assistant. Let's get your project deployed! First, let's connect your GitHub repositories.",
      timestamp: new Date(),
      actions: [
        { label: 'Connect GitHub', action: 'connect_github', variant: 'primary' },
        { label: 'Skip for now', action: 'skip_github', variant: 'secondary' }
      ]
    }
  ]);

  const [userInput, setUserInput] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isGitHubConnected, setIsGitHubConnected] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [repositories, setRepositories] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [contextId, setContextId] = useState<string | undefined>();

  useEffect(() => {
    // Initialize AI assistant session
    const initializeSession = async () => {
      try {
        const result = await deployAgentAPI.initializeChat();
        const { sessionId: newSessionId } = result;
        setSessionId(newSessionId);
      } catch (error) {
        console.error('Failed to initialize AI assistant:', error);
      }
    };
    
    initializeSession();
  }, []);

  const handleBlockClick = (block: DeploymentBlock) => {
    console.log('Block clicked:', block);
  };

  const handleConnectGitHub = () => {
    setIsGitHubConnected(true);
    setRepositories([
      { id: 1, name: 'my-app', language: 'React' },
      { id: 2, name: 'backend-api', language: 'Node.js' }
    ]);
  };

  const handleAnalyzeProject = () => {
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    handleUserMessage();
    setInputMessage('');
  };

  const getBlockIcon = (type: string) => {
    const iconClass = "h-8 w-8";
    switch (type) {
      case 'frontend': return <CodeBracketIcon className={iconClass} />;
      case 'backend': return <ServerIcon className={iconClass} />;
      case 'database': return <CircleStackIcon className={iconClass} />;
      case 'domain': return <GlobeAltIcon className={iconClass} />;
      case 'email': return <EnvelopeIcon className={iconClass} />;
      case 'cicd': return <CogIcon className={iconClass} />;
      case 'monitoring': return <ChartBarIcon className={iconClass} />;
      case 'container': return <CubeIcon className={iconClass} />;
      default: return <ServerIcon className={iconClass} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'connecting': return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'failed': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getBlockStyles = (status: string) => {
    const baseStyles = "relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg";
    switch (status) {
      case 'connected':
        return `${baseStyles} bg-green-50 border-green-300 shadow-green-100`;
      case 'connecting':
        return `${baseStyles} bg-yellow-50 border-yellow-300 shadow-yellow-100 animate-pulse`;
      case 'failed':
        return `${baseStyles} bg-red-50 border-red-300 shadow-red-100`;
      default:
        return `${baseStyles} bg-gray-50 border-gray-200 hover:border-gray-300`;
    }
  };

  const handleActionClick = async (action: string) => {
    console.log('Action clicked:', action);
    
    if (action === 'connect_github') {
      // For demo purposes, we'll simulate GitHub OAuth flow
      // In a real implementation, this would redirect to GitHub OAuth
      const mockAccessToken = 'demo_token_' + Date.now();
      
      setBlocks(prev => prev.map(block => 
        block.id === 'frontend' || block.id === 'backend' 
          ? { ...block, status: 'connecting' }
          : block
      ));

      try {
        // Simulate GitHub connection with mock data
        setTimeout(async () => {
          // Mock successful GitHub connection
          setBlocks(prev => prev.map(block => 
            block.id === 'frontend' 
              ? { ...block, status: 'connected', details: 'React App (demo-frontend)' }
              : block.id === 'backend'
              ? { ...block, status: 'connected', details: 'Node.js API (demo-backend)' }
              : block
          ));

          // Add agent response about successful connection
          const agentResponse: AgentMessage = {
            id: Date.now().toString(),
            type: 'agent',
            content: "Great! I've connected your GitHub repositories. I can see you have a React frontend and Node.js backend. Let's analyze your project structure and recommend the best deployment strategy.",
            timestamp: new Date(),
            actions: [
              { label: 'Analyze Project', action: 'analyze_project', variant: 'primary' },
              { label: 'Choose Domain', action: 'choose_domain', variant: 'secondary' }
            ]
          };

          setMessages(prev => [...prev, agentResponse]);
        }, 2000);

      } catch (error) {
        console.error('GitHub connection failed:', error);
        setBlocks(prev => prev.map(block => 
          ['frontend', 'backend'].includes(block.id)
            ? { ...block, status: 'failed' }
            : block
        ));
      }
    } else if (action === 'analyze_project') {
      setIsTyping(true);
      
      try {
        // Simulate project analysis
        const analysisResponse: AgentMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: "Based on your React + Node.js stack, I recommend:\n\n• **Frontend**: Deploy to Vercel or Netlify ($0-19/month)\n• **Backend**: Deploy to Railway or Render ($5-25/month)\n• **Database**: PostgreSQL on Supabase ($0-25/month)\n• **Domain**: Custom domain with SSL ($10-15/year)\n\nEstimated total cost: $15-69/month. Would you like me to proceed with this setup?",
          timestamp: new Date(),
          actions: [
            { label: 'Proceed with Setup', action: 'proceed_setup', variant: 'primary' },
            { label: 'Customize Options', action: 'customize_options', variant: 'secondary' }
          ]
        };

        setMessages(prev => [...prev, analysisResponse]);
      } catch (error) {
        console.error('Project analysis failed:', error);
      }
      
      setIsTyping(false);
    } else if (action === 'proceed_setup') {
      // Start setting up other services
      setBlocks(prev => prev.map(block => 
        block.id === 'database' 
          ? { ...block, status: 'connecting' }
          : block
      ));

      setTimeout(() => {
        setBlocks(prev => prev.map(block => 
          block.id === 'database' 
            ? { ...block, status: 'connected', details: 'PostgreSQL (Supabase)' }
            : block
        ));

        const setupResponse: AgentMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: "Perfect! I've started setting up your database. Next, let's configure your domain and email services. What domain would you like to use?",
          timestamp: new Date(),
          actions: [
            { label: 'Register New Domain', action: 'register_domain', variant: 'primary' },
            { label: 'Use Existing Domain', action: 'use_existing_domain', variant: 'secondary' }
          ]
        };

        setMessages(prev => [...prev, setupResponse]);
      }, 1500);
    } else if (action === 'register_domain') {
      setIsTyping(true);

      try {
        // Get domain suggestions
        const suggestions = await domainApi.getSuggestions({
          keyword: 'myapp',
          tlds: ['com', 'io', 'dev', 'app']
        });

        if (suggestions.success && suggestions.data) {
          const availableDomains = suggestions.data.suggestions
            .filter(s => s.available)
            .slice(0, 5)
            .map(s => `• **${s.domain}** - $${s.price}/year`)
            .join('\n');

          const domainResponse: AgentMessage = {
            id: Date.now().toString(),
            type: 'agent',
            content: `Great! I found some available domains for you:\n\n${availableDomains}\n\nWhich domain would you like to register? I'll also set up SSL certificates and DNS automatically.`,
            timestamp: new Date(),
            actions: [
              { label: 'Register myapp.io', action: 'confirm_domain_myapp.io', variant: 'primary' },
              { label: 'See More Options', action: 'more_domains', variant: 'secondary' }
            ]
          };

          setMessages(prev => [...prev, domainResponse]);
        }
      } catch (error) {
        console.error('Domain suggestions error:', error);
      }

      setIsTyping(false);
    } else if (action.startsWith('confirm_domain_')) {
      const domain = action.replace('confirm_domain_', '');
      
      setBlocks(prev => prev.map(block => 
        block.id === 'domain' 
          ? { ...block, status: 'connecting' }
          : block
      ));

      setTimeout(() => {
        setBlocks(prev => prev.map(block => 
          block.id === 'domain' 
            ? { ...block, status: 'connected', details: domain }
            : block
        ));

        const confirmResponse: AgentMessage = {
          id: Date.now().toString(),
          type: 'agent',
          content: `Excellent! I've registered ${domain} and configured SSL certificates. Now let's set up your infrastructure. I'll create optimized deployments for your React frontend and Node.js backend.`,
          timestamp: new Date(),
          actions: [
            { label: 'Deploy Infrastructure', action: 'deploy_infrastructure', variant: 'primary' },
            { label: 'Customize Settings', action: 'customize_infrastructure', variant: 'secondary' }
          ]
        };

        setMessages(prev => [...prev, confirmResponse]);
      }, 2000);
    } else if (action === 'deploy_infrastructure') {
      setIsTyping(true);

      // Start deploying infrastructure
      setBlocks(prev => prev.map(block => 
        ['cicd', 'email'].includes(block.id)
          ? { ...block, status: 'connecting' }
          : block
      ));

      try {
        // Simulate infrastructure deployment
        setTimeout(() => {
          setBlocks(prev => prev.map(block => {
            if (block.id === 'cicd') {
              return { ...block, status: 'connected', details: 'GitHub Actions' };
            } else if (block.id === 'email') {
              return { ...block, status: 'connected', details: 'Transactional Email' };
            }
            return block;
          }));

          const deployResponse: AgentMessage = {
            id: Date.now().toString(),
            type: 'agent',
            content: "🎉 **Deployment Complete!** \n\nYour application is now live:\n• **Frontend**: https://myapp.io\n• **Backend**: https://api.myapp.io\n• **Database**: PostgreSQL (ready)\n• **CI/CD**: GitHub Actions configured\n• **Email**: Transactional email ready\n\n**Monthly Cost**: ~$25-45\n**Estimated Setup Time**: 8 minutes\n\nYour app is production-ready with automatic scaling, SSL, and monitoring!",
            timestamp: new Date(),
            actions: [
              { label: 'View Live App', action: 'view_app', variant: 'primary' },
              { label: 'Setup Monitoring', action: 'setup_monitoring', variant: 'secondary' }
            ]
          };

          setMessages(prev => [...prev, deployResponse]);
        }, 3000);

      } catch (error) {
        console.error('Infrastructure deployment error:', error);
      }

      setIsTyping(false);
    }
  };

  const handleAction = async (action: string) => {
    setIsTyping(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (action === 'connect_github') {
      // Update blocks to show GitHub connection
      setBlocks(prev => prev.map(block => 
        ['frontend', 'backend'].includes(block.id) 
          ? { ...block, status: 'connecting' as const }
          : block
      ));

      // Add agent response
      const newMessage: AgentMessage = {
        id: Date.now().toString(),
        type: 'agent',
        content: "Great! I'm connecting to your GitHub account... I can see you have repositories. Let me analyze your project structure.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newMessage]);

      // Simulate GitHub analysis
      setTimeout(() => {
        setBlocks(prev => prev.map(block => 
          ['frontend', 'backend'].includes(block.id) 
            ? { 
                ...block, 
                status: 'connected' as const,
                details: block.id === 'frontend' ? 'React App' : 'Node.js API'
              }
            : block
        ));

        const analysisMessage: AgentMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: "Perfect! I found your React frontend and Node.js backend. Now let's set up your domain. What would you like to call your project?",
          timestamp: new Date(),
          actions: [
            { label: 'myawesomeapp', action: 'suggest_domain_1', variant: 'secondary' },
            { label: 'Enter custom name', action: 'custom_domain', variant: 'primary' }
          ]
        };
        setMessages(prev => [...prev, analysisMessage]);
      }, 2000);
    }

    if (action.startsWith('suggest_domain_')) {
      const domainName = 'myawesomeapp';
      setBlocks(prev => prev.map(block => 
        block.id === 'domain' 
          ? { ...block, status: 'connecting' as const, name: `${domainName}.com` }
          : block
      ));

      const domainMessage: AgentMessage = {
        id: Date.now().toString(),
        type: 'agent',
        content: `Checking availability for "${domainName}"... Here are your options:

• ${domainName}.com - $12/year ⭐ Most popular
• ${domainName}.ai - $45/year 🤖 Tech-focused  
• ${domainName}.dev - $15/year 👨‍💻 Developer-friendly
• ${domainName}.online - $8/year 💰 Budget option

Which one would you like?`,
        timestamp: new Date(),
        actions: [
          { label: '.com ($12/year)', action: 'register_com', variant: 'primary' },
          { label: '.dev ($15/year)', action: 'register_dev', variant: 'secondary' },
          { label: '.online ($8/year)', action: 'register_online', variant: 'secondary' }
        ]
      };
      setMessages(prev => [...prev, domainMessage]);
    }

    if (action.startsWith('register_')) {
      const extension = action.split('_')[1];
      setBlocks(prev => prev.map(block => 
        block.id === 'domain' 
          ? { ...block, status: 'connected' as const, name: `myawesomeapp.${extension}` }
          : block
      ));

      const registrationMessage: AgentMessage = {
        id: Date.now().toString(),
        type: 'agent',
        content: `Excellent! Registering myawesomeapp.${extension}...

✅ Domain registered
✅ DNS configured  
✅ SSL certificate provisioned

Now let's set up your database. What type of data will your app store?`,
        timestamp: new Date(),
        actions: [
          { label: 'User accounts & content', action: 'setup_postgresql', variant: 'primary' },
          { label: 'Simple data storage', action: 'setup_mongodb', variant: 'secondary' },
          { label: 'I need both SQL + NoSQL', action: 'setup_both_db', variant: 'secondary' }
        ]
      };
      setMessages(prev => [...prev, registrationMessage]);
    }

    setIsTyping(false);
  };

  const handleUserMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userInput,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      // Get deployment context from current blocks
      const deploymentContext = {
        projectType: 'web-application',
        technologies: blocks
          .filter(block => block.status === 'connected')
          .map(block => block.details || block.name),
        repositories: blocks
          .filter(block => ['frontend', 'backend'].includes(block.id) && block.status === 'connected')
          .map(block => ({ type: block.id, name: block.details })),
      };

      // Call AI assistant API through backend
      const response = await deployAgentAPI.sendMessage(
        userInput,
        sessionId || 'default-session',
        contextId
      );

      const agentResponse: AgentMessage = {
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
      
      // Update context if provided
      if (response.contextId) {
        setContextId(response.contextId);
      }
    } catch (error: any) {
      console.error('Agent chat error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      
      // Fallback response
      const fallbackResponse: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I'm having trouble connecting right now, but I can still help you! Let me know what specific deployment step you'd like to work on.",
        timestamp: new Date(),
        actions: [
          { label: 'Connect GitHub', action: 'connect_github', variant: 'primary' },
          { label: 'Register Domain', action: 'register_domain', variant: 'secondary' },
          { label: 'Setup Database', action: 'setup_database', variant: 'secondary' }
        ]
      };

      setMessages(prev => [...prev, fallbackResponse]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Agentic Deployment Interface
          </h1>
          <p className="text-lg text-gray-600">
            Visual deployment with AI-powered guidance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Deployment Blocks */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployment Architecture</h2>
              <div className="grid grid-cols-3 gap-3">
                {blocks.map((block) => (
                  <motion.div
                    key={block.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                      block.status === 'completed'
                        ? 'bg-green-100 border-green-300 shadow-md'
                        : block.status === 'in-progress'
                        ? 'bg-blue-100 border-blue-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleBlockClick(block)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {getBlockIcon(block.type)}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">{block.name}</h3>
                      <p className={`text-xs mt-1 ${
                        block.status === 'completed'
                          ? 'text-green-600'
                          : block.status === 'in-progress'
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}>
                        {block.status === 'completed' ? 'Ready' : 
                         block.status === 'in-progress' ? 'Setting up...' : 'Not configured'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* GitHub Connection */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Repository Connection</h3>
              {!isGitHubConnected ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4 text-sm">
                    Hi! I'm your intelligent deployment assistant. Let's get your project deployed! First, let's connect your GitHub repositories.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={handleConnectGitHub}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      Connect GitHub
                    </button>
                    <button
                      onClick={() => setIsGitHubConnected(true)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-medium text-sm">✓ GitHub Connected</span>
                    <button
                      onClick={() => setIsGitHubConnected(false)}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  <select 
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select a repository...</option>
                    {repositories.map((repo) => (
                      <option key={repo.id} value={repo.name}>
                        {repo.name} ({repo.language})
                      </option>
                    ))}
                  </select>
                  
                  {selectedRepo && (
                    <button
                      onClick={handleAnalyzeProject}
                      disabled={isAnalyzing}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isAnalyzing ? 'Analyzing...' : 'Analyze Project'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Agent Chat Section */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <h2 className="text-xl font-semibold text-white flex items-center">
                🤖 DoneDep Deployment Assistant
                {isTyping && (
                  <span className="ml-3 text-sm text-blue-100">typing...</span>
                )}
              </h2>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-sm p-3 rounded-lg ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-line text-sm">{message.content}</p>
                      
                      {message.actions && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleAction(action.action)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                action.variant === 'primary'
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center space-x-3 p-3 border-t bg-gray-50">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about deployment, infrastructure, or get help..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualDeploymentInterface;
