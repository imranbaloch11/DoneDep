'use client';

import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Full Stack Developer',
      company: 'TechStart Inc.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      content: 'DoneDep has completely transformed our deployment process. What used to take hours now takes minutes. The Windsurf integration is seamless!',
      rating: 5,
    },
    {
      name: 'Marcus Rodriguez',
      role: 'DevOps Engineer',
      company: 'CloudScale Solutions',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      content: 'The auto-generated APIs for databases are a game-changer. We can provision and connect to databases in seconds, not hours.',
      rating: 5,
    },
    {
      name: 'Emily Watson',
      role: 'Startup Founder',
      company: 'InnovateLab',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      content: 'As a non-technical founder, DoneDep lets me deploy and manage our infrastructure without needing a DevOps team. Incredible value!',
      rating: 5,
    },
    {
      name: 'David Kim',
      role: 'Senior Developer',
      company: 'Enterprise Corp',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      content: 'The security features and compliance reporting give us confidence to use DoneDep for our enterprise applications. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Lisa Thompson',
      role: 'Product Manager',
      company: 'AgileTeam',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=764&q=80',
      content: 'Our team productivity has increased 3x since switching to DoneDep. The one-command deployment is exactly what we needed.',
      rating: 5,
    },
    {
      name: 'Alex Johnson',
      role: 'CTO',
      company: 'FastGrow Startup',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80',
      content: 'DoneDep scales with us perfectly. From MVP to production with thousands of users, the platform handles everything seamlessly.',
      rating: 5,
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Developers' },
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '5 min', label: 'Average Setup Time' },
    { value: '24/7', label: 'Expert Support' },
  ];

  return (
    <section className="py-24 bg-gray-50">
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
            Loved by Developers Worldwide
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Join thousands of developers who have streamlined their deployment process with DoneDep.
          </motion.p>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div className="ml-4">
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-600 mb-8">Trusted by companies of all sizes</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {/* Company logos would go here - using placeholder text for now */}
            <div className="text-2xl font-bold text-gray-400">TechStart</div>
            <div className="text-2xl font-bold text-gray-400">CloudScale</div>
            <div className="text-2xl font-bold text-gray-400">InnovateLab</div>
            <div className="text-2xl font-bold text-gray-400">Enterprise Corp</div>
            <div className="text-2xl font-bold text-gray-400">AgileTeam</div>
            <div className="text-2xl font-bold text-gray-400">FastGrow</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
