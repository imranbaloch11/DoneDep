import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function GitHubCallback() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const { code, error, error_description } = router.query;

      if (error) {
        console.error('GitHub OAuth error:', error, error_description);
        toast.error(`GitHub authentication failed: ${error_description || error}`);
        router.push('/dashboard/repositories');
        return;
      }

      if (code) {
        try {
          // Exchange code for access token
          const response = await fetch('/api/auth/github/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          const data = await response.json();

          if (data.success) {
            // Store GitHub token in localStorage or secure cookie
            localStorage.setItem('github_token', data.access_token);
            toast.success('Successfully connected to GitHub!');
            router.push('/dashboard/repositories');
          } else {
            throw new Error(data.message || 'Failed to authenticate with GitHub');
          }
        } catch (error) {
          console.error('Error processing GitHub callback:', error);
          toast.error('Failed to complete GitHub authentication');
          router.push('/dashboard/repositories');
        }
      }
    };

    if (router.isReady) {
      handleCallback();
    }
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to GitHub...</h2>
        <p className="text-gray-600">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
