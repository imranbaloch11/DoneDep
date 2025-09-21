'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GlobeAltIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CogIcon,
  LinkIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  DocumentDuplicateIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface Domain {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'expired' | 'error';
  type: 'purchased' | 'subdomain' | 'custom';
  registrar?: string;
  expiryDate?: Date;
  sslStatus: 'active' | 'pending' | 'expired';
  deployments: string[];
  dnsRecords: DNSRecord[];
}

interface DNSRecord {
  id: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl: number;
}

const DOMAIN_PROVIDERS = [
  { id: 'namecheap', name: 'Namecheap', logo: '🏷️' },
  { id: 'godaddy', name: 'GoDaddy', logo: '🌐' },
  { id: 'cloudflare', name: 'Cloudflare', logo: '☁️' },
  { id: 'google', name: 'Google Domains', logo: '🔍' },
];

export function DomainsInterface() {
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: '1',
      name: 'myapp.com',
      status: 'active',
      type: 'purchased',
      registrar: 'namecheap',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      sslStatus: 'active',
      deployments: ['My Portfolio', 'API Server'],
      dnsRecords: [
        { id: '1', type: 'A', name: '@', value: '192.168.1.1', ttl: 3600 },
        { id: '2', type: 'CNAME', name: 'www', value: 'myapp.com', ttl: 3600 },
      ],
    },
    {
      id: '2',
      name: 'staging.donedep.dev',
      status: 'active',
      type: 'subdomain',
      sslStatus: 'active',
      deployments: ['Staging App'],
      dnsRecords: [
        { id: '3', type: 'CNAME', name: 'staging', value: 'donedep.dev', ttl: 300 },
      ],
    },
  ]);

  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showDNSEditor, setShowDNSEditor] = useState<string | null>(null);
  const [newDomain, setNewDomain] = useState({
    name: '',
    type: 'purchased' as 'purchased' | 'subdomain' | 'custom',
    registrar: 'namecheap',
  });
  const [newDNSRecord, setNewDNSRecord] = useState({
    type: 'A' as 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT',
    name: '',
    value: '',
    ttl: 3600,
  });

  const handleAddDomain = () => {
    if (!newDomain.name) return;

    const domain: Domain = {
      id: Date.now().toString(),
      name: newDomain.name,
      status: newDomain.type === 'subdomain' ? 'active' : 'pending',
      type: newDomain.type,
      registrar: newDomain.type === 'purchased' ? newDomain.registrar : undefined,
      expiryDate: newDomain.type === 'purchased' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) 
        : undefined,
      sslStatus: 'pending',
      deployments: [],
      dnsRecords: [],
    };

    setDomains(prev => [...prev, domain]);
    setNewDomain({ name: '', type: 'purchased', registrar: 'namecheap' });
    setShowAddDomain(false);
  };

  const handleAddDNSRecord = (domainId: string) => {
    if (!newDNSRecord.name || !newDNSRecord.value) return;

    const record: DNSRecord = {
      id: Date.now().toString(),
      ...newDNSRecord,
    };

    setDomains(prev => prev.map(domain => 
      domain.id === domainId 
        ? { ...domain, dnsRecords: [...domain.dnsRecords, record] }
        : domain
    ));

    setNewDNSRecord({ type: 'A', name: '', value: '', ttl: 3600 });
  };

  const handleDeleteDNSRecord = (domainId: string, recordId: string) => {
    setDomains(prev => prev.map(domain => 
      domain.id === domainId 
        ? { ...domain, dnsRecords: domain.dnsRecords.filter(r => r.id !== recordId) }
        : domain
    ));
  };

  const handleDeleteDomain = (domainId: string) => {
    setDomains(prev => prev.filter(d => d.id !== domainId));
  };

  const getStatusIcon = (status: Domain['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <GlobeAltIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSSLIcon = (status: Domain['sslStatus']) => {
    switch (status) {
      case 'active':
        return <ShieldCheckIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ShieldCheckIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProviderInfo = (registrar?: string) => {
    return DOMAIN_PROVIDERS.find(p => p.id === registrar) || { name: 'Unknown', logo: '🌐' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
          <p className="text-gray-600">Manage your domains and DNS settings</p>
        </div>
        <button
          onClick={() => setShowAddDomain(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Domain
        </button>
      </div>

      {/* Add Domain Modal */}
      {showAddDomain && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold mb-4">Add Domain</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <input
                  type="text"
                  value={newDomain.name}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Type
                </label>
                <select
                  value={newDomain.type}
                  onChange={(e) => setNewDomain(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="purchased">Purchased Domain</option>
                  <option value="subdomain">DoneDep Subdomain</option>
                  <option value="custom">Custom Domain</option>
                </select>
              </div>

              {newDomain.type === 'purchased' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registrar
                  </label>
                  <select
                    value={newDomain.registrar}
                    onChange={(e) => setNewDomain(prev => ({ ...prev, registrar: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {DOMAIN_PROVIDERS.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.logo} {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddDomain(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDomain}
                disabled={!newDomain.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Domain
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* DNS Editor Modal */}
      {showDNSEditor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            {(() => {
              const domain = domains.find(d => d.id === showDNSEditor);
              if (!domain) return null;

              return (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">DNS Records - {domain.name}</h3>
                    <button
                      onClick={() => setShowDNSEditor(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Add DNS Record */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-3">Add DNS Record</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <select
                        value={newDNSRecord.type}
                        onChange={(e) => setNewDNSRecord(prev => ({ ...prev, type: e.target.value as any }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="A">A</option>
                        <option value="AAAA">AAAA</option>
                        <option value="CNAME">CNAME</option>
                        <option value="MX">MX</option>
                        <option value="TXT">TXT</option>
                      </select>
                      <input
                        type="text"
                        value={newDNSRecord.name}
                        onChange={(e) => setNewDNSRecord(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={newDNSRecord.value}
                        onChange={(e) => setNewDNSRecord(prev => ({ ...prev, value: e.target.value }))}
                        placeholder="Value"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newDNSRecord.ttl}
                          onChange={(e) => setNewDNSRecord(prev => ({ ...prev, ttl: parseInt(e.target.value) }))}
                          placeholder="TTL"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleAddDNSRecord(domain.id)}
                          disabled={!newDNSRecord.name || !newDNSRecord.value}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DNS Records Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-4 py-2 text-left">Type</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Value</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">TTL</th>
                          <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {domain.dnsRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="border border-gray-200 px-4 py-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {record.type}
                              </span>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 font-mono text-sm">
                              {record.name || '@'}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 font-mono text-sm">
                              {record.value}
                            </td>
                            <td className="border border-gray-200 px-4 py-2">{record.ttl}</td>
                            <td className="border border-gray-200 px-4 py-2">
                              <button
                                onClick={() => handleDeleteDNSRecord(domain.id, record.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}

      {/* Domains List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Domains</h2>
        </div>
        
        {domains.length === 0 ? (
          <div className="p-8 text-center">
            <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No domains configured</h3>
            <p className="text-gray-600 mb-4">Add your first domain to get started</p>
            <button
              onClick={() => setShowAddDomain(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Domain
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {domains.map((domain) => {
              const providerInfo = getProviderInfo(domain.registrar);
              
              return (
                <div key={domain.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(domain.status)}
                        <div className="flex items-center gap-1">
                          {getSSLIcon(domain.sslStatus)}
                          <span className="text-xs text-gray-500">SSL</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{domain.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            domain.type === 'purchased' 
                              ? 'bg-green-100 text-green-800'
                              : domain.type === 'subdomain'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {domain.type}
                          </span>
                          {domain.registrar && (
                            <span className="text-xs text-gray-500">
                              {providerInfo.logo} {providerInfo.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span>Status: {domain.status}</span>
                          <span>SSL: {domain.sslStatus}</span>
                          {domain.expiryDate && (
                            <span>Expires: {domain.expiryDate.toLocaleDateString()}</span>
                          )}
                        </div>
                        {domain.deployments.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Connected to: </span>
                            {domain.deployments.map((deployment, index) => (
                              <span key={index} className="text-xs text-blue-600">
                                {deployment}{index < domain.deployments.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://${domain.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        Visit
                      </a>
                      
                      <button
                        onClick={() => navigator.clipboard.writeText(domain.name)}
                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <DocumentDuplicateIcon className="h-4 w-4" />
                        Copy
                      </button>
                      
                      <button
                        onClick={() => setShowDNSEditor(domain.id)}
                        className="px-3 py-1 text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <CogIcon className="h-4 w-4" />
                        DNS
                      </button>
                      
                      <button
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* DNS Records Preview */}
                  {domain.dnsRecords.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          DNS Records ({domain.dnsRecords.length})
                        </span>
                        <button
                          onClick={() => setShowDNSEditor(domain.id)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit DNS
                        </button>
                      </div>
                      <div className="space-y-1">
                        {domain.dnsRecords.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-center gap-2 text-xs">
                            <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded">
                              {record.type}
                            </span>
                            <span className="font-mono">{record.name || '@'}</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-mono">{record.value}</span>
                          </div>
                        ))}
                        {domain.dnsRecords.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{domain.dnsRecords.length - 3} more records
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Domain Management Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Domain Management Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-1">SSL Certificates</h4>
            <p>SSL certificates are automatically provisioned for all domains</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">DNS Propagation</h4>
            <p>DNS changes may take up to 48 hours to propagate globally</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Subdomains</h4>
            <p>Use DoneDep subdomains for quick testing and staging environments</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Custom Domains</h4>
            <p>Point your custom domain to our servers using CNAME records</p>
          </div>
        </div>
      </div>
    </div>
  );
}
