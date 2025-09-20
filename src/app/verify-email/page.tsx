'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { authApi } from '@/services/api/auth';
import { Button } from '@/components/ui/Button';
import { 
  RocketLaunchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [hasVerified, setHasVerified] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || hasVerified) {
        if (!token) {
          setStatus('error');
          setMessage('Invalid verification link. Please check your email for the correct link.');
        }
        return;
      }

      setHasVerified(true);

      try {
        // Make direct fetch request to avoid any axios interceptor issues
        const response = await fetch(`http://localhost:3001/api/auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully! Redirecting to your dashboard...');
          toast.success('Email verified successfully!');
          
          // Store the JWT token from verification response
          if (data.data?.token) {
            localStorage.setItem('accessToken', data.data.token);
          }
          
          // Redirect to dashboard directly since user is now authenticated
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Email verification failed. Please try again.');
        }
      } catch (error: any) {
        setStatus('error');
        const errorMessage = 'Email verification failed. The link may be expired or invalid.';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [token, router, hasVerified]);

  const handleResendVerification = async () => {
    // This would need to be implemented - redirect to a resend verification page
    router.push('/resend-verification');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Link href="/" className="flex items-center justify-center space-x-2 mb-6">
            <RocketLaunchIcon className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">DoneDep</span>
          </Link>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 text-center"
        >
          {status === 'loading' && (
            <div>
              <ArrowPathIcon className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    Go to Dashboard
                  </Link>
                </Button>
                <p className="text-sm text-gray-500">
                  Redirecting you to dashboard in a few seconds...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div>
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleResendVerification}
                  className="w-full"
                >
                  Resend Verification Email
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link
              href="/contact"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
