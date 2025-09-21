'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  KeyIcon,
  GlobeAltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: Date;
  createdAt: Date;
  isActive: boolean;
}

interface NotificationSettings {
  deploymentSuccess: boolean;
  deploymentFailure: boolean;
  domainExpiry: boolean;
  usageAlerts: boolean;
  securityAlerts: boolean;
  weeklyReports: boolean;
}

const MOCK_API_KEYS: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'ddp_live_1234567890abcdef',
    permissions: ['deployments:read', 'deployments:write', 'domains:read'],
    lastUsed: new Date('2024-01-20'),
    createdAt: new Date('2024-01-15'),
    isActive: true,
  },
  {
    id: '2',
    name: 'CI/CD Pipeline',
    key: 'ddp_test_abcdef1234567890',
    permissions: ['deployments:read', 'deployments:write'],
    lastUsed: new Date('2024-01-19'),
    createdAt: new Date('2024-01-10'),
    isActive: true,
  },
];

export function SettingsInterface() {
  const [activeTab, setActiveTab] = useState('general');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [notifications, setNotifications] = useState<NotificationSettings>({
    deploymentSuccess: true,
    deploymentFailure: true,
    domainExpiry: true,
    usageAlerts: true,
    securityAlerts: true,
    weeklyReports: false,
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon },
  ];

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleDeleteApiKey = (keyId: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== keyId));
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Default Region</h4>
              <p className="text-sm text-gray-600">Primary region for new deployments</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>US East (N. Virginia)</option>
              <option>US West (Oregon)</option>
              <option>Europe (Frankfurt)</option>
              <option>Asia Pacific (Singapore)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Auto-scaling</h4>
              <p className="text-sm text-gray-600">Automatically scale deployments based on traffic</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Build Timeout</h4>
              <p className="text-sm text-gray-600">Maximum time allowed for builds</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>5 minutes</option>
              <option>10 minutes</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="john@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              defaultValue="Acme Inc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Zone
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (Central European Time)</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Avatar</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <UserIcon className="h-8 w-8 text-gray-600" />
          </div>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upload New Avatar
            </button>
            <p className="text-sm text-gray-600 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Password & Authentication</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="New password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Enable 2FA
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Session Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Current Session</div>
              <div className="text-sm text-gray-600">Chrome on macOS • Active now</div>
            </div>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Current</span>
          </div>
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Mobile Session</div>
              <div className="text-sm text-gray-600">Safari on iOS • 2 hours ago</div>
            </div>
            <button className="text-red-600 hover:text-red-700 text-sm">Revoke</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <p className="text-sm text-gray-600">
                  {key === 'deploymentSuccess' && 'Get notified when deployments complete successfully'}
                  {key === 'deploymentFailure' && 'Get notified when deployments fail'}
                  {key === 'domainExpiry' && 'Get notified before your domains expire'}
                  {key === 'usageAlerts' && 'Get notified when you approach usage limits'}
                  {key === 'securityAlerts' && 'Get notified about security-related events'}
                  {key === 'weeklyReports' && 'Receive weekly usage and performance reports'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() => handleNotificationChange(key as keyof NotificationSettings)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
        <div className="p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-bold text-gray-900">Pro Plan</h4>
              <p className="text-gray-600">$29/month • Billed monthly</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">10</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">100GB</div>
              <div className="text-sm text-gray-600">Bandwidth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">5</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">∞</div>
              <div className="text-sm text-gray-600">Deployments</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Upgrade Plan
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              View Usage
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <div className="font-medium text-gray-900">•••• •••• •••• 4242</div>
                <div className="text-sm text-gray-600">Expires 12/25</div>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm">Update</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing History</h3>
        <div className="space-y-3">
          {[
            { date: '2024-01-01', amount: '$29.00', status: 'Paid' },
            { date: '2023-12-01', amount: '$29.00', status: 'Paid' },
            { date: '2023-11-01', amount: '$29.00', status: 'Paid' },
          ].map((invoice, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{invoice.date}</div>
                <div className="text-sm text-gray-600">Pro Plan</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{invoice.amount}</div>
                <div className="text-sm text-green-600">{invoice.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">API Keys</h3>
          <p className="text-gray-600">Manage API keys for programmatic access</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{apiKey.name}</h4>
                <p className="text-sm text-gray-600">
                  Created {apiKey.createdAt.toLocaleDateString()} • Last used {apiKey.lastUsed.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  apiKey.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {apiKey.isActive ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => toggleApiKeyVisibility(apiKey.id)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey[apiKey.id] ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteApiKey(apiKey.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded font-mono text-sm">
                  {showApiKey[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                </code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
              <div className="flex flex-wrap gap-2">
                {apiKey.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and platform preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'profile' && renderProfileSettings()}
        {activeTab === 'security' && renderSecuritySettings()}
        {activeTab === 'notifications' && renderNotificationSettings()}
        {activeTab === 'billing' && renderBillingSettings()}
        {activeTab === 'api' && renderApiSettings()}
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
