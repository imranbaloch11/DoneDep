'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CircleStackIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Database {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'sqlite';
  status: 'active' | 'creating' | 'error' | 'stopped';
  provider: 'supabase' | 'planetscale' | 'mongodb_atlas' | 'redis_cloud' | 'local';
  region: string;
  size: string;
  connections: number;
  maxConnections: number;
  storage: string;
  createdAt: Date;
  connectionString: string;
  deployments: string[];
}

const DATABASE_TYPES = [
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    description: 'Powerful, open source object-relational database',
    icon: '🐘',
    providers: ['supabase', 'local'],
  },
  {
    id: 'mysql',
    name: 'MySQL',
    description: 'Popular open-source relational database',
    icon: '🐬',
    providers: ['planetscale', 'local'],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    description: 'Document-oriented NoSQL database',
    icon: '🍃',
    providers: ['mongodb_atlas', 'local'],
  },
  {
    id: 'redis',
    name: 'Redis',
    description: 'In-memory data structure store',
    icon: '🔴',
    providers: ['redis_cloud', 'local'],
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    description: 'Lightweight, serverless database',
    icon: '💎',
    providers: ['local'],
  },
];

const PROVIDERS = {
  supabase: { name: 'Supabase', logo: '⚡', color: 'bg-green-600' },
  planetscale: { name: 'PlanetScale', logo: '🌍', color: 'bg-black' },
  mongodb_atlas: { name: 'MongoDB Atlas', logo: '🍃', color: 'bg-green-700' },
  redis_cloud: { name: 'Redis Cloud', logo: '🔴', color: 'bg-red-600' },
  local: { name: 'Local', logo: '💻', color: 'bg-gray-600' },
};

export function DatabasesInterface() {
  const [databases, setDatabases] = useState<Database[]>([
    {
      id: '1',
      name: 'production-db',
      type: 'postgresql',
      status: 'active',
      provider: 'supabase',
      region: 'us-east-1',
      size: '2GB',
      connections: 15,
      maxConnections: 100,
      storage: '8GB',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      connectionString: 'postgresql://user:pass@host:5432/db',
      deployments: ['My Portfolio', 'API Server'],
    },
    {
      id: '2',
      name: 'cache-redis',
      type: 'redis',
      status: 'active',
      provider: 'redis_cloud',
      region: 'us-west-2',
      size: '256MB',
      connections: 5,
      maxConnections: 30,
      storage: '256MB',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      connectionString: 'redis://user:pass@host:6379',
      deployments: ['API Server'],
    },
  ]);

  const [showCreateDatabase, setShowCreateDatabase] = useState(false);
  const [showConnectionString, setShowConnectionString] = useState<string | null>(null);
  const [newDatabase, setNewDatabase] = useState({
    name: '',
    type: 'postgresql' as Database['type'],
    provider: 'supabase' as Database['provider'],
    region: 'us-east-1',
    size: '1GB',
  });

  const handleCreateDatabase = () => {
    if (!newDatabase.name) return;

    const database: Database = {
      id: Date.now().toString(),
      name: newDatabase.name,
      type: newDatabase.type,
      status: 'creating',
      provider: newDatabase.provider,
      region: newDatabase.region,
      size: newDatabase.size,
      connections: 0,
      maxConnections: getMaxConnections(newDatabase.type, newDatabase.size),
      storage: newDatabase.size,
      createdAt: new Date(),
      connectionString: generateConnectionString(newDatabase.type, newDatabase.provider),
      deployments: [],
    };

    setDatabases(prev => [...prev, database]);

    // Simulate database creation
    setTimeout(() => {
      setDatabases(prev => prev.map(db => 
        db.id === database.id ? { ...db, status: 'active' } : db
      ));
    }, 5000);

    setNewDatabase({
      name: '',
      type: 'postgresql',
      provider: 'supabase',
      region: 'us-east-1',
      size: '1GB',
    });
    setShowCreateDatabase(false);
  };

  const handleDeleteDatabase = (id: string) => {
    setDatabases(prev => prev.filter(db => db.id !== id));
  };

  const handleRestartDatabase = (id: string) => {
    setDatabases(prev => prev.map(db => 
      db.id === id ? { ...db, status: 'creating' } : db
    ));

    setTimeout(() => {
      setDatabases(prev => prev.map(db => 
        db.id === id ? { ...db, status: 'active' } : db
      ));
    }, 3000);
  };

  const getMaxConnections = (type: Database['type'], size: string): number => {
    const sizeNum = parseInt(size);
    switch (type) {
      case 'postgresql':
      case 'mysql':
        return Math.min(sizeNum * 50, 500);
      case 'mongodb':
        return Math.min(sizeNum * 30, 300);
      case 'redis':
        return Math.min(sizeNum * 100, 1000);
      case 'sqlite':
        return 1;
      default:
        return 100;
    }
  };

  const generateConnectionString = (type: Database['type'], provider: Database['provider']): string => {
    const host = provider === 'local' ? 'localhost' : `${provider}.example.com`;
    const port = getDefaultPort(type);
    
    switch (type) {
      case 'postgresql':
        return `postgresql://username:password@${host}:${port}/database`;
      case 'mysql':
        return `mysql://username:password@${host}:${port}/database`;
      case 'mongodb':
        return `mongodb://username:password@${host}:${port}/database`;
      case 'redis':
        return `redis://username:password@${host}:${port}`;
      case 'sqlite':
        return `sqlite:///path/to/database.db`;
      default:
        return `${type}://username:password@${host}:${port}/database`;
    }
  };

  const getDefaultPort = (type: Database['type']): number => {
    switch (type) {
      case 'postgresql': return 5432;
      case 'mysql': return 3306;
      case 'mongodb': return 27017;
      case 'redis': return 6379;
      case 'sqlite': return 0;
      default: return 5432;
    }
  };

  const getStatusIcon = (status: Database['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'creating':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'stopped':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <CircleStackIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDatabaseTypeInfo = (type: Database['type']) => {
    return DATABASE_TYPES.find(t => t.id === type) || DATABASE_TYPES[0];
  };

  const getProviderInfo = (provider: Database['provider']) => {
    return PROVIDERS[provider] || PROVIDERS.local;
  };

  const maskConnectionString = (connectionString: string): string => {
    return connectionString.replace(/:([^:@]+)@/, ':****@');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Databases</h1>
          <p className="text-gray-600">Manage your database instances and connections</p>
        </div>
        <button
          onClick={() => setShowCreateDatabase(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Create Database
        </button>
      </div>

      {/* Create Database Modal */}
      {showCreateDatabase && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl"
          >
            <h3 className="text-lg font-semibold mb-6">Create New Database</h3>
            
            {/* Database Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Database Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {DATABASE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setNewDatabase(prev => ({ 
                        ...prev, 
                        type: type.id as Database['type'],
                        provider: type.providers[0] as Database['provider']
                      }));
                    }}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      newDatabase.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{type.icon}</span>
                      <h4 className="font-medium">{type.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={newDatabase.name}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="my-database"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Provider
                  </label>
                  <select
                    value={newDatabase.provider}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, provider: e.target.value as Database['provider'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {DATABASE_TYPES.find(t => t.id === newDatabase.type)?.providers.map((provider) => {
                      const providerInfo = PROVIDERS[provider as keyof typeof PROVIDERS];
                      return (
                        <option key={provider} value={provider}>
                          {providerInfo.logo} {providerInfo.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <select
                    value={newDatabase.region}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Size
                  </label>
                  <select
                    value={newDatabase.size}
                    onChange={(e) => setNewDatabase(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="256MB">256MB</option>
                    <option value="1GB">1GB</option>
                    <option value="2GB">2GB</option>
                    <option value="5GB">5GB</option>
                    <option value="10GB">10GB</option>
                    <option value="20GB">20GB</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateDatabase(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDatabase}
                disabled={!newDatabase.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create Database
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Databases List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Database Instances</h2>
        </div>
        
        {databases.length === 0 ? (
          <div className="p-8 text-center">
            <CircleStackIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No databases configured</h3>
            <p className="text-gray-600 mb-4">Create your first database to get started</p>
            <button
              onClick={() => setShowCreateDatabase(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Database
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {databases.map((database) => {
              const typeInfo = getDatabaseTypeInfo(database.type);
              const providerInfo = getProviderInfo(database.provider);
              
              return (
                <div key={database.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(database.status)}
                        <span className="text-2xl">{typeInfo.icon}</span>
                        <div className={`px-2 py-1 rounded text-xs font-medium text-white ${providerInfo.color}`}>
                          {providerInfo.logo} {providerInfo.name}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{database.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>{typeInfo.name}</span>
                          <span>Region: {database.region}</span>
                          <span>Size: {database.size}</span>
                          <span>Connections: {database.connections}/{database.maxConnections}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {database.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowConnectionString(
                          showConnectionString === database.id ? null : database.id
                        )}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        {showConnectionString === database.id ? (
                          <EyeSlashIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                        Connection
                      </button>
                      
                      {database.status === 'active' && (
                        <button
                          onClick={() => handleRestartDatabase(database.id)}
                          className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                        >
                          <ArrowPathIcon className="h-4 w-4" />
                          Restart
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteDatabase(database.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Connection String */}
                  {showConnectionString === database.id && (
                    <div className="mt-4 p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-400">Connection String</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(database.connectionString)}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <code className="text-sm text-gray-300 font-mono break-all">
                        {maskConnectionString(database.connectionString)}
                      </code>
                    </div>
                  )}

                  {/* Connected Deployments */}
                  {database.deployments.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ChartBarIcon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Connected Deployments</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {database.deployments.map((deployment, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {deployment}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Usage Stats */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Storage Used</span>
                        <span className="text-sm font-medium">{Math.floor(Math.random() * 80)}%</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 80)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Connections</span>
                        <span className="text-sm font-medium">
                          {database.connections}/{database.maxConnections}
                        </span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(database.connections / database.maxConnections) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">CPU Usage</span>
                        <span className="text-sm font-medium">{Math.floor(Math.random() * 60)}%</span>
                      </div>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-600 h-2 rounded-full" 
                          style={{ width: `${Math.floor(Math.random() * 60)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Database Templates */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DATABASE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setNewDatabase(prev => ({ 
                  ...prev, 
                  type: type.id as Database['type'],
                  provider: type.providers[0] as Database['provider']
                }));
                setShowCreateDatabase(true);
              }}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{type.icon}</span>
                <h3 className="font-medium text-gray-900">{type.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{type.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
