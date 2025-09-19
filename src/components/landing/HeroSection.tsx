'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  RocketLaunchIcon,
  CloudIcon,
  ServerIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  DatabaseIcon,
} from '@heroicons/react/24/outline';

export function HeroSection() {
  const features = [
    { icon: GlobeAltIcon, text: 'Domain Registration' },
    { icon: DatabaseIcon, text: 'Database Provisioning' },
    { icon: EnvelopeIcon, text: 'Email Services' },
    { icon: CloudIcon, text: 'One-Click Deployment' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-3/4 right-1/4 w-64 h-64 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-8"
          >
            <RocketLaunchIcon className="w-4 h-4 mr-2" />
            Autonomous Deployment Platform
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
          >
            Deploy Everything with
            <span className="block text-gradient">One Command</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            The only platform you need for domains, databases, email services, and deployment. 
            Integrated with Windsurf IDE for seamless development experience.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-10"
          >
            {features.map((feature, index) => (
              <div
                key={feature.text}
                className="flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200"
              >
                <feature.icon className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button asChild size="lg" className="px-8 py-4 text-lg">
              <Link href="/register">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Link href="#demo">
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Terminal Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
              <div className="flex items-center px-4 py-3 bg-gray-800">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-gray-400 text-sm font-mono">Windsurf Terminal</span>
                </div>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="text-green-400">$ windsurf deploy through donedep</div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="text-gray-300 mt-2"
                >
                  <div className="mb-1">🌐 Registering domain: myapp.com</div>
                  <div className="mb-1">🗄️ Provisioning PostgreSQL database</div>
                  <div className="mb-1">📧 Setting up email service</div>
                  <div className="mb-1">🚀 Deploying application</div>
                  <div className="text-green-400 mt-3">✅ Deployment complete! Your app is live at https://myapp.com</div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: '10k+', label: 'Deployments' },
              { value: '99.9%', label: 'Uptime' },
              { value: '5min', label: 'Setup Time' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-gray-300 rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </section>
  );
}
