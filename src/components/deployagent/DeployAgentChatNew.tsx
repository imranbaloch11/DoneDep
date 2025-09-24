'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Github, Rocket, Globe } from 'lucide-react';
import { deployAgentAPI, ChatMessage, ChatResponse } from '../../services/api/deployagent';
import { toast } from 'react-hot-toast';
import GitHubConnectModal from './GitHubConnectModal';

interface DeployAgentChatNewProps {
  contextId?: string;
  onContextCreated?: (contextId: string) => void;
}

export default function DeployAgentChatNew({ contextId, onContextCreated }: DeployAgentChatNewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const { sessionId: newSessionId, message } = await deployAgentAPI.initializeChat();
      setSessionId(newSessionId);
      const initialMessage = {
        role: 'assistant' as const,
        content: message,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      // Set fallback message if API fails
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m DeployAgent, your intelligent deployment orchestrator. I can help you with infrastructure deployment, CI/CD pipelines, monitoring, and security. What would you like to deploy today?',
        timestamp: new Date()
      }]);
      setIsInitialized(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    // Clear input and add message
    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response: ChatResponse = await deployAgentAPI.sendMessage(
        messageText,
        sessionId,
        contextId
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.contextId && !contextId && onContextCreated) {
        onContextCreated(response.contextId);
      }

      if (response.actions && response.actions.length > 0) {
        setActions(response.actions);
        toast.success(`Generated ${response.actions.length} deployment actions`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message to DeployAgent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAction = (action: any) => {
    switch (action.type) {
      case 'github_connect':
        setShowGitHubModal(true);
        break;
      case 'start_deployment':
        if (selectedRepository) {
          sendMessage();
          setInput(`Start deployment for ${selectedRepository.name}`);
        } else {
          toast.error('Please connect a GitHub repository first');
        }
        break;
      case 'domain_setup':
        setInput('Help me set up a domain for my project');
        sendMessage();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleRepositorySelect = (repository: any) => {
    setSelectedRepository(repository);
    setShowGitHubModal(false);
    
    // Send a message about the selected repository
    const repoMessage = `I've connected the repository "${repository.name}". It's a ${repository.language} project. What would you like to do with it?`;
    
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: repoMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    toast.success(`Connected repository: ${repository.name}`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 max-h-screen overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">DeployAgent</h2>
              <p className="text-sm text-white/80">AI Deployment Assistant</p>
            </div>
          </div>
          <div className="text-xs text-white/60">
            {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" 
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6',
          height: 'calc(100vh - 200px)',
          maxHeight: 'calc(100vh - 200px)'
        }}
      >
        <div className="flex flex-col space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center text-gray-500">
                <Bot size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Start a conversation with DeployAgent</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {message.role === 'user' ? 
                        <User size={16} className="text-white" /> : 
                        <Bot size={16} className="text-white" />
                      }
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-gray-600 text-sm">DeployAgent is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Repository Status */}
      {selectedRepository && (
        <div className="flex-shrink-0 px-4 py-3 bg-blue-50 border-t border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Github className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Connected: {selectedRepository.name}
                </p>
                <p className="text-xs text-blue-700">
                  {selectedRepository.language} • {selectedRepository.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedRepository(null)}
              className="text-blue-600 hover:text-blue-800 text-xs"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Quick Actions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors"
              >
                {action.type === 'github_connect' && <Github className="h-4 w-4" />}
                {action.type === 'start_deployment' && <Rocket className="h-4 w-4" />}
                {action.type === 'domain_setup' && <Globe className="h-4 w-4" />}
                {action.content}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask DeployAgent about deployments, infrastructure, or CI/CD..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm overflow-hidden"
              rows={1}
              style={{ 
                minHeight: '44px', 
                maxHeight: '80px',
                height: '44px'
              }}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[44px]"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* GitHub Connect Modal */}
      <GitHubConnectModal
        isOpen={showGitHubModal}
        onClose={() => setShowGitHubModal(false)}
        onRepositorySelect={handleRepositorySelect}
      />
    </div>
  );
}
