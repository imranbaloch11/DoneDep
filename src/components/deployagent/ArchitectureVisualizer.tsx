'use client';

import React, { useState } from 'react';
import { Server, Database, Cloud, GitBranch, Shield, Monitor, Zap, Settings } from 'lucide-react';

export default function ArchitectureVisualizer() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const architectureComponents = [
    {
      id: 'frontend',
      name: 'Frontend',
      icon: Monitor,
      color: 'bg-blue-500',
      description: 'React/Next.js Application',
      status: 'active'
    },
    {
      id: 'api',
      name: 'API Gateway',
      icon: Server,
      color: 'bg-green-500',
      description: 'Express.js Backend',
      status: 'active'
    },
    {
      id: 'database',
      name: 'Database',
      icon: Database,
      color: 'bg-purple-500',
      description: 'MongoDB/PostgreSQL',
      status: 'active'
    },
    {
      id: 'cloud',
      name: 'Cloud Platform',
      icon: Cloud,
      color: 'bg-orange-500',
      description: 'DigitalOcean/AWS',
      status: 'pending'
    },
    {
      id: 'cicd',
      name: 'CI/CD Pipeline',
      icon: GitBranch,
      color: 'bg-indigo-500',
      description: 'GitHub Actions',
      status: 'pending'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      color: 'bg-red-500',
      description: 'SSL/Auth/Monitoring',
      status: 'pending'
    }
  ];

  return (
    <div className="h-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Deployment Architecture</h2>
        <p className="text-sm text-gray-600">Visual overview of your deployment infrastructure</p>
      </div>

      {/* Architecture Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {architectureComponents.map((component) => {
          const IconComponent = component.icon;
          return (
            <div
              key={component.id}
              onClick={() => setSelectedComponent(component.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedComponent === component.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 ${component.color} rounded-lg flex items-center justify-center`}>
                  <IconComponent size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{component.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      component.status === 'active' ? 'bg-green-400' : 
                      component.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`} />
                    <span className="text-xs text-gray-500 capitalize">{component.status}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600">{component.description}</p>
            </div>
          );
        })}
      </div>

      {/* Component Details */}
      {selectedComponent && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">Component Details</h3>
          {(() => {
            const component = architectureComponents.find(c => c.id === selectedComponent);
            if (!component) return null;
            
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{component.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    component.status === 'active' ? 'bg-green-400' : 
                    component.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                  }`} />
                </div>
                <p className="text-sm text-gray-600">{component.description}</p>
                <div className="mt-3 space-y-1">
                  {component.status === 'active' && (
                    <div className="text-xs text-green-600">✓ Component is running</div>
                  )}
                  {component.status === 'pending' && (
                    <div className="text-xs text-yellow-600">⏳ Awaiting deployment</div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
            <Zap size={14} />
            Deploy Now
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Settings size={14} />
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}
