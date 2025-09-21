'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
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
  PaperAirplaneIcon,
  KeyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface EmailService {
  id: string;
  name: string;
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'postmark' | 'resend' | 'zoho';
  status: 'active' | 'configuring' | 'error' | 'testing';
  fromEmail: string;
  fromName: string;
  dailyLimit: number;
  monthlyLimit: number;
  sentToday: number;
  sentThisMonth: number;
  deliveryRate: number;
  bounceRate: number;
  createdAt: Date;
  lastUsed: Date;
  deployments: string[];
  isDefault: boolean;
}

const EMAIL_PROVIDERS = [
  {
    id: 'smtp',
    name: 'SMTP Server',
    description: 'Custom SMTP server configuration',
    icon: '📧',
    features: ['Custom domains', 'Full control', 'No limits'],
    pricing: 'Free',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Reliable email delivery service by Twilio',
    icon: '📮',
    features: ['100 emails/day free', 'Analytics', 'Templates'],
    pricing: 'Free tier available',
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    description: 'Email service for developers',
    icon: '🔫',
    features: ['5,000 emails/month free', 'API-first', 'Webhooks'],
    pricing: 'Free tier available',
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    description: 'Amazon Simple Email Service',
    icon: '📨',
    features: ['$0.10 per 1,000 emails', 'High deliverability', 'AWS integration'],
    pricing: 'Pay per use',
  },
  {
    id: 'postmark',
    name: 'Postmark',
    description: 'Email delivery for web applications',
    icon: '📬',
    features: ['100 emails/month free', 'Fast delivery', 'Great support'],
    pricing: 'Free tier available',
  },
  {
    id: 'resend',
    name: 'Resend',
    description: 'Modern email API for developers',
    icon: '🚀',
    features: ['3,000 emails/month free', 'React templates', 'Modern API'],
    pricing: 'Free tier available',
  },
  {
    id: 'zoho',
    name: 'Zoho Mail',
    description: 'Professional email hosting',
    icon: '📫',
    features: ['Custom domain', 'Professional email', 'Calendar integration'],
    pricing: 'Paid service',
  },
];

const MOCK_EMAIL_SERVICES: EmailService[] = [
  {
    id: '1',
    name: 'Production SMTP',
    provider: 'smtp',
    status: 'active',
    fromEmail: 'noreply@dealdeck.online',
    fromName: 'DealDeck',
    dailyLimit: 1000,
    monthlyLimit: 30000,
    sentToday: 45,
    sentThisMonth: 1250,
    deliveryRate: 98.5,
    bounceRate: 1.2,
    createdAt: new Date('2024-01-15'),
    lastUsed: new Date('2024-01-20'),
    deployments: ['dealdeck-frontend', 'dealdeck-backend'],
    isDefault: true,
  },
  {
    id: '2',
    name: 'SendGrid Backup',
    provider: 'sendgrid',
    status: 'active',
    fromEmail: 'support@dealdeck.online',
    fromName: 'DealDeck Support',
    dailyLimit: 100,
    monthlyLimit: 3000,
    sentToday: 12,
    sentThisMonth: 340,
    deliveryRate: 99.2,
    bounceRate: 0.8,
    createdAt: new Date('2024-01-10'),
    lastUsed: new Date('2024-01-19'),
    deployments: ['dealdeck-backend'],
    isDefault: false,
  },
];

export function EmailServicesInterface() {
  const [emailServices, setEmailServices] = useState<EmailService[]>(MOCK_EMAIL_SERVICES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedService, setSelectedService] = useState<EmailService | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [showCredentials, setShowCredentials] = useState<{ [key: string]: boolean }>({});

  const getStatusColor = (status: EmailService['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'configuring':
        return 'text-yellow-600 bg-yellow-50';
      case 'testing':
        return 'text-blue-600 bg-blue-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: EmailService['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'configuring':
        return <CogIcon className="h-4 w-4" />;
      case 'testing':
        return <ClockIcon className="h-4 w-4" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getProviderIcon = (provider: EmailService['provider']) => {
    const providerData = EMAIL_PROVIDERS.find(p => p.id === provider);
    return providerData?.icon || '📧';
  };

  const handleCreateService = () => {
    setShowCreateModal(true);
  };

  const handleConfigureService = (service: EmailService) => {
    setSelectedService(service);
    setShowConfigModal(true);
  };

  const handleDeleteService = (serviceId: string) => {
    setEmailServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleSetDefault = (serviceId: string) => {
    setEmailServices(prev => prev.map(s => ({
      ...s,
      isDefault: s.id === serviceId
    })));
  };

  const toggleCredentialsVisibility = (serviceId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Services</h1>
          <p className="text-gray-600">Configure email providers for your deployments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateService}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Add Email Service
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailServices.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Emails Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {emailServices.reduce((sum, s) => sum + s.sentToday, 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(emailServices.reduce((sum, s) => sum + s.deliveryRate, 0) / emailServices.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {(emailServices.reduce((sum, s) => sum + s.bounceRate, 0) / emailServices.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Services List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Configured Services</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {emailServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getProviderIcon(service.provider)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      {service.isDefault && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{service.fromEmail}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {getStatusIcon(service.status)}
                        {service.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {service.deployments.length} deployment{service.deployments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Usage Stats */}
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {service.sentToday}/{service.dailyLimit}
                    </div>
                    <div className="text-xs text-gray-500">emails today</div>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: `${Math.min((service.sentToday / service.dailyLimit) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{service.deliveryRate}%</div>
                    <div className="text-xs text-gray-500">delivery rate</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleConfigureService(service)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Configure"
                    >
                      <CogIcon className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleCredentialsVisibility(service.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Toggle credentials"
                    >
                      {showCredentials[service.id] ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </motion.button>

                    {!service.isDefault && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSetDefault(service.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Set as default"
                      >
                        <ShieldCheckIcon className="h-4 w-4" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Credentials (when visible) */}
              {showCredentials[service.id] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Provider:</span>
                      <span className="ml-2 text-gray-900 capitalize">{service.provider}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">From Name:</span>
                      <span className="ml-2 text-gray-900">{service.fromName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Monthly Usage:</span>
                      <span className="ml-2 text-gray-900">{service.sentThisMonth}/{service.monthlyLimit}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Bounce Rate:</span>
                      <span className="ml-2 text-gray-900">{service.bounceRate}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Email Service</h2>
              <p className="text-gray-600 mt-1">Choose an email provider for your deployments</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EMAIL_PROVIDERS.map((provider) => (
                  <motion.div
                    key={provider.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedProvider(provider.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProvider === provider.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{provider.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{provider.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                        <div className="mt-2">
                          <div className="text-xs font-medium text-blue-600 mb-1">{provider.pricing}</div>
                          <ul className="text-xs text-gray-500 space-y-0.5">
                            {provider.features.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedProvider}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Configure {selectedProvider && EMAIL_PROVIDERS.find(p => p.id === selectedProvider)?.name}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Configure Service Modal */}
      {showConfigModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Configure {selectedService.name}</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedService.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  defaultValue={selectedService.fromEmail}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  defaultValue={selectedService.fromName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Limit
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedService.dailyLimit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Limit
                  </label>
                  <input
                    type="number"
                    defaultValue={selectedService.monthlyLimit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="setDefault"
                  defaultChecked={selectedService.isDefault}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="setDefault" className="text-sm text-gray-700">
                  Set as default email service
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
