'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Code, Terminal, FileText, Zap } from 'lucide-react';
import { deployMindAPI, ChatMessage, ChatResponse, DeploymentAction } from '../../services/api/deploymind';
import { toast } from 'react-hot-toast';

interface DeployMindChatProps {
  contextId?: string;
  onContextCreated?: (contextId: string) => void;
}

export default function DeployMindChat({ contextId, onContextCreated }: DeployMindChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
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
      const { sessionId: newSessionId, message } = await deployMindAPI.initializeChat();
      setSessionId(newSessionId);
      setMessages([{
        role: 'assistant',
        content: message,
        timestamp: new Date()
      }]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast.error('Failed to initialize DeployMind chat');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await deployMindAPI.sendMessage(
        userMessage.content,
        sessionId,
        contextId
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If a new context was created, notify parent
      if (response.contextId && !contextId && onContextCreated) {
        onContextCreated(response.contextId);
      }

      // Show actions if any
      if (response.actions && response.actions.length > 0) {
        toast.success(`Generated ${response.actions.length} deployment actions`);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message to DeployMind');
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

  const renderMessage = (message: ChatMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500 ml-2' : 'bg-purple-500 mr-2'
          }`}>
            {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
          </div>
          <div className={`px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 border'
          }`}>
            <div className="whitespace-pre-wrap">{formatMessage(message.content)}</div>
            <div className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatMessage = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code
        const lines = part.slice(3, -3).split('\n');
        const language = lines[0] || '';
        const code = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="my-2">
            <div className="flex items-center gap-2 bg-gray-800 text-white px-3 py-1 rounded-t-lg text-sm">
              <Code size={14} />
              <span>{language || 'code'}</span>
            </div>
            <pre className="bg-gray-900 text-green-400 p-3 rounded-b-lg overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4" size={32} />
          <p className="text-gray-600">Initializing DeployMind...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-semibold">DeployMind</h3>
          <p className="text-sm opacity-90">Intelligent Deployment Orchestrator</p>
        </div>
        <div className="ml-auto flex gap-2">
          <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded text-xs">
            <Zap size={12} />
            <span>AI Powered</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-96">
        {messages.map((message, index) => renderMessage(message, index))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-2">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-gray-600">DeployMind is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask DeployMind about your deployment needs..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setInput("Help me deploy a Next.js application to Vercel")}
            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors"
          >
            Next.js → Vercel
          </button>
          <button
            onClick={() => setInput("Set up CI/CD pipeline with GitHub Actions")}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            CI/CD Setup
          </button>
          <button
            onClick={() => setInput("Configure monitoring with Prometheus and Grafana")}
            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
          >
            Monitoring
          </button>
        </div>
      </div>
    </div>
  );
}
