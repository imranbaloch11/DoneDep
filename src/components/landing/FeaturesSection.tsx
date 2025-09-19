'use client';

import { motion } from 'framer-motion';
import { 
  GlobeAltIcon,
  DatabaseIcon,
  EnvelopeIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  ClockIcon,
  CpuChipIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

export function FeaturesSection() {
  const features = [
    {
      icon: GlobeAltIcon,
      title: 'Domain Management',
      description: 'Register domains directly through our platform with automatic DNS configuration and SSL certificates.',
      benefits: ['Namecheap integration', 'Auto DNS setup', 'Free SSL certificates', 'Domain monitoring'],
    },
    {
      icon: DatabaseIcon,
      title: 'Database Provisioning',
      description: 'Create PostgreSQL or MongoDB databases with auto-generated APIs stored in your account.',
      benefits: ['PostgreSQL & MongoDB', 'Auto-generated APIs', 'Connection strings', 'Backup & restore'],
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Services',
      description: 'Professional email services with SendGrid or Zoho integration for your domains.',
      benefits: ['SendGrid & Zoho', 'Custom domains', 'SMTP configuration', 'Email analytics'],
    },
    {
      icon: RocketLaunchIcon,
      title: 'One-Click Deployment',
      description: 'Deploy your Windsurf projects with a single command through our native integration.',
      benefits: ['Windsurf integration', 'CI/CD pipelines', 'Auto scaling', 'Zero downtime'],
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption, monitoring, and compliance features.',
      benefits: ['End-to-end encryption', 'SOC 2 compliance', 'DDoS protection', 'Access controls'],
    },
    {
      icon: ClockIcon,
      title: '24/7 Monitoring',
      description: 'Real-time monitoring and alerts to keep your applications running smoothly.',
      benefits: ['Uptime monitoring', 'Performance metrics', 'Alert notifications', 'Health checks'],
    },
  ];

  const integrations = [
    { name: 'Windsurf IDE', logo: '🌊', description: 'Native integration' },
    { name: 'Namecheap', logo: '🌐', description: 'Domain registration' },
    { name: 'SendGrid', logo: '📧', description: 'Email delivery' },
    { name: 'PostgreSQL', logo: '🐘', description: 'Relational database' },
    { name: 'MongoDB', logo: '🍃', description: 'Document database' },
    { name: 'Docker', logo: '🐳', description: 'Containerization' },
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6"
          >
            <CpuChipIcon className="w-4 h-4 mr-2" />
            Powerful Features
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Everything You Need in One Platform
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            From domain registration to deployment, we've got you covered with enterprise-grade tools and seamless integrations.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="ml-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-6">{feature.description}</p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-3 flex-shrink-0"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Integrations */}
        <div className="text-center">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold text-gray-900 mb-8"
          >
            Seamless Integrations
          </motion.h3>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
          >
            {integrations.map((integration, index) => (
              <div
                key={integration.name}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-3">{integration.logo}</div>
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{integration.name}</h4>
                <p className="text-xs text-gray-600">{integration.description}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Command Line Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple Command Line Interface</h3>
            <p className="text-gray-600">Deploy your entire stack with just one command</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center px-4 py-3 bg-gray-800">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-gray-400 text-sm font-mono">Terminal</span>
              </div>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <div className="text-gray-500"># Initialize your project</div>
              <div className="text-green-400">$ donedep init myproject</div>
              <div className="text-gray-300 ml-4">✓ Project initialized</div>
              
              <div className="text-gray-500 mt-4"># Configure your stack</div>
              <div className="text-green-400">$ donedep config --domain myapp.com --db postgresql --email sendgrid</div>
              <div className="text-gray-300 ml-4">✓ Configuration saved</div>
              
              <div className="text-gray-500 mt-4"># Deploy everything</div>
              <div className="text-green-400">$ donedep deploy</div>
              <div className="text-gray-300 ml-4">🌐 Registering domain: myapp.com</div>
              <div className="text-gray-300 ml-4">🗄️ Creating PostgreSQL database</div>
              <div className="text-gray-300 ml-4">📧 Setting up SendGrid email</div>
              <div className="text-gray-300 ml-4">🚀 Deploying application</div>
              <div className="text-green-400 ml-4 mt-2">✅ Deployment complete! https://myapp.com</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
