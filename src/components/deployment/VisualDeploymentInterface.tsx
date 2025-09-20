'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { agentApi } from '@/services/api/agent';
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
  status: 'pending' | 'connecting' | 'connected' | 'failed';
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
      content: "Hi! I'm your DoneDep deployment assistant. Let's get your project deployed! First, let's connect your GitHub repositories.",
      timestamp: new Date(),
      actions: [
        { label: 'Connect GitHub', action: 'connect_github', variant: 'primary' },
        { label: 'Skip for now', action: 'skip_github', variant: 'secondary' }
      ]
    }
  ]);

  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

      // Call real OpenAI API through backend
      const response = await agentApi.chat({
        message: userInput,
        conversationHistory: messages,
        deploymentContext,
      });

      if (response.success && response.data) {
        const agentResponse: AgentMessage = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          content: response.data.response,
          timestamp: new Date(),
          actions: response.data.actions.map(action => ({
            label: action.label,
            action: action.action,
            variant: action.variant as 'primary' | 'secondary'
          }))
        };

        setMessages(prev => [...prev, agentResponse]);
      } else {
        throw new Error(response.message || 'Failed to get agent response');
      }
    } catch (error) {
      console.error('Agent chat error:', error);
      
      // Fallback response
      const fallbackResponse: AgentMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I'm having trouble connecting to my AI brain right now, but I can still help you! Let me know what specific deployment step you'd like to work on.",
        timestamp: new Date(),
        actions: [
          { label: 'Connect GitHub', action: 'connect_github', variant: 'primary' },
          { label: 'Register Domain', action: 'register_domain', variant: 'secondary' },
          { label: 'Setup Database', action: 'setup_database', variant: 'secondary' }
        ]
      };

      setMessages(prev => [...prev, fallbackResponse]);
    }

    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Agentic Deployment Interface
          </h1>
          <p className="text-gray-600">
            Visual deployment with AI-powered guidance
          </p>
        </div>

        {/* Visual Blocks Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <CubeIcon className="h-6 w-6 mr-2 text-blue-600" />
            Deployment Architecture
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {blocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={getBlockStyles(block.status)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="text-blue-600 mb-3">
                    {getBlockIcon(block.type)}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {block.name}
                  </h3>
                  {block.details && (
                    <p className="text-xs text-gray-500 mb-2">
                      {block.details}
                    </p>
                  )}
                  <div className="flex items-center justify-center">
                    {getStatusIcon(block.status)}
                  </div>
                </div>
                
                {/* Connection Lines */}
                {index < blocks.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                    <ArrowRightIcon className="h-4 w-4 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
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
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-md p-4 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-line">{message.content}</p>
                    
                    {message.actions && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => handleAction(action.action)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
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
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserMessage()}
                placeholder="Ask me anything about your deployment..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleUserMessage}
                disabled={!userInput.trim() || isTyping}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
