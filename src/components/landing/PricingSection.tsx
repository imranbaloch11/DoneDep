'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      period: 'month',
      description: 'Perfect for individual developers and small projects',
      features: [
        '5 deployments per month',
        '2 custom domains',
        '1 database (PostgreSQL or MongoDB)',
        'Basic email service (1,000 emails/month)',
        'Community support',
        'SSL certificates included',
        'Basic monitoring',
      ],
      limitations: [
        'No priority support',
        'Limited to 5GB storage',
        'No custom integrations',
      ],
      popular: false,
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional',
      price: 99,
      period: 'month',
      description: 'Ideal for growing teams and production applications',
      features: [
        'Unlimited deployments',
        '10 custom domains',
        '5 databases (PostgreSQL & MongoDB)',
        'Advanced email service (50,000 emails/month)',
        'Priority support',
        'SSL certificates included',
        'Advanced monitoring & analytics',
        'CI/CD pipelines',
        'Team collaboration',
        'Custom integrations',
        'Backup & restore',
      ],
      limitations: [
        'Limited to 100GB storage',
        'No white-label options',
      ],
      popular: true,
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise',
      price: 299,
      period: 'month',
      description: 'For large organizations with advanced requirements',
      features: [
        'Everything in Professional',
        'Unlimited domains',
        'Unlimited databases',
        'Unlimited email service',
        '24/7 dedicated support',
        'Custom SLA',
        'White-label options',
        'Advanced security features',
        'Compliance reporting',
        'Custom integrations',
        'Dedicated account manager',
        'On-premise deployment options',
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales',
    },
  ];

  const faqs = [
    {
      question: 'What happens during the free trial?',
      answer: 'You get full access to all Professional plan features for 14 days. No credit card required to start.',
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise customers.',
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees. You only pay the monthly subscription fee.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans.',
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Choose the plan that fits your needs. All plans include our core features with no hidden fees.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular 
                  ? 'border-primary-500 ring-4 ring-primary-100' 
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-1">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation) => (
                        <li key={limitation} className="flex items-start">
                          <XMarkIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button 
                asChild 
                className={`w-full ${plan.popular ? 'bg-primary-600 hover:bg-primary-700' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
              >
                <Link href={plan.name === 'Enterprise' ? '/contact' : '/register'}>
                  {plan.cta}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h3>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16 p-8 bg-green-50 rounded-2xl"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">30-Day Money-Back Guarantee</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Try DoneDep risk-free. If you're not completely satisfied within 30 days, 
            we'll refund your money, no questions asked.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
