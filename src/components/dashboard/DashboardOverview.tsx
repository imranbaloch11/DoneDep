'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  CloudIcon,
  GlobeAltIcon,
  DatabaseIcon,
  EnvelopeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export function DashboardOverview() {
  const stats = [
    {
      name: 'Total Deployments',
      value: '12',
      change: '+2 this week',
      changeType: 'increase',
      icon: CloudIcon,
    },
    {
      name: 'Active Domains',
      value: '3',
      change: '+1 this month',
      changeType: 'increase',
      icon: GlobeAltIcon,
    },
    {
      name: 'Databases',
      value: '5',
      change: 'No change',
      changeType: 'neutral',
      icon: DatabaseIcon,
    },
    {
      name: 'Email Services',
      value: '2',
      change: '+1 this month',
      changeType: 'increase',
      icon: EnvelopeIcon,
    },
  ];

  const recentDeployments = [
    {
      id: 1,
      name: 'my-awesome-app',
      status: 'success',
      domain: 'my-awesome-app.com',
      deployedAt: '2 hours ago',
    },
    {
      id: 2,
      name: 'portfolio-site',
      status: 'building',
      domain: 'johnsmith.dev',
      deployedAt: '1 day ago',
    },
    {
      id: 3,
      name: 'ecommerce-api',
      status: 'success',
      domain: 'api.mystore.com',
      deployedAt: '3 days ago',
    },
  ];

  const quickActions = [
    {
      name: 'Deploy New Project',
      description: 'Deploy your Windsurf project with one command',
      href: '/dashboard/deployments/new',
      icon: CloudIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Register Domain',
      description: 'Get a new domain for your project',
      href: '/dashboard/domains/new',
      icon: GlobeAltIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Create Database',
      description: 'Provision a new database with auto-generated API',
      href: '/dashboard/databases/new',
      icon: DatabaseIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Setup Email',
      description: 'Configure email service for your domain',
      href: '/dashboard/email/new',
      icon: EnvelopeIcon,
      color: 'bg-orange-500',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'building':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Live';
      case 'building':
        return 'Building';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your deployments, domains, databases, and email services
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {stat.changeType === 'increase' && (
                          <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                        )}
                        <span className="sr-only">
                          {stat.changeType === 'increase' ? 'Increased' : 'No change'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div>
                <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                  <action.icon className="h-6 w-6" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900 group-hover:text-primary-600">
                  {action.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
              <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
                <PlusIcon className="h-6 w-6" />
              </span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Deployments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-white shadow rounded-lg"
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Deployments</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/deployments">
                View all
              </Link>
            </Button>
          </div>
          <div className="flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentDeployments.map((deployment) => (
                <li key={deployment.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(deployment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {deployment.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {deployment.domain}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm text-gray-900">
                        {getStatusText(deployment.status)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {deployment.deployedAt}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="bg-primary-50 rounded-lg p-6"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <CloudIcon className="h-6 w-6 text-primary-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-primary-800">
              Ready to deploy your first project?
            </h3>
            <div className="mt-2 text-sm text-primary-700">
              <p>
                Use the Windsurf CLI to deploy your project with a single command:
              </p>
              <div className="mt-3 bg-white rounded-md p-3 font-mono text-sm">
                <code className="text-gray-900">$ windsurf deploy through donedep</code>
              </div>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Button asChild size="sm">
                  <Link href="/docs/getting-started">
                    View Documentation
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
