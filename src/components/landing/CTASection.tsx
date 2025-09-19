'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { 
  RocketLaunchIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export function CTASection() {
  const benefits = [
    'No setup fees or hidden costs',
    '14-day free trial',
    'Cancel anytime',
    'Expert support included',
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-8"
        >
          <RocketLaunchIcon className="w-4 h-4 mr-2" />
          Ready to Deploy?
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
        >
          Start Your Deployment Journey Today
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-white/90 mb-8 max-w-3xl mx-auto"
        >
          Join thousands of developers who have simplified their deployment process. 
          Get started with our free trial and experience the future of autonomous deployment.
        </motion.p>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 mb-10"
        >
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center text-white/90">
              <CheckIcon className="w-5 h-5 mr-2 text-green-300" />
              <span className="text-sm font-medium">{benefit}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <Button 
            asChild 
            size="lg" 
            className="px-8 py-4 text-lg bg-white text-primary-600 hover:bg-gray-100 shadow-lg"
          >
            <Link href="/register" className="flex items-center">
              Start Free Trial
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-primary-600"
          >
            <Link href="/contact">
              Talk to Sales
            </Link>
          </Button>
        </motion.div>

        {/* Trust Signal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-white/80 text-sm mb-4">
            Trusted by 10,000+ developers worldwide
          </p>
          <div className="flex justify-center items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 bg-white/60 rounded-full"></div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Decoration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
            <RocketLaunchIcon className="w-8 h-8 text-white" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
