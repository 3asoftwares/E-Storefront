'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '3a-ecommerce-ui-library';
import { storeAuth, getStoredAuth } from '3a-ecommerce-utils/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingBag,
  faCheckCircle,
  faExclamationTriangle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

const API_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3010/api/auth';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>(
    'loading'
  );
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        // First validate the token
        const validateResponse = await fetch(`${API_BASE}/validate-email-token/${token}`);
        const validateData = await validateResponse.json();

        if (!validateResponse.ok) {
          if (validateData.message?.includes('already verified')) {
            setStatus('already-verified');
            setMessage('Your email has already been verified.');
          } else {
            setStatus('error');
            setMessage(validateData.message || 'Invalid or expired verification link');
          }
          return;
        }

        setUserEmail(validateData.email);

        // Now verify the email
        const verifyResponse = await fetch(`${API_BASE}/verify-email-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok && verifyData.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');

          // Update stored auth data if user is logged in
          const storedAuth = getStoredAuth();
          if (storedAuth && verifyData.data?.user) {
            storeAuth({
              user: verifyData.data.user,
              accessToken: storedAuth.token,
            });
          }
        } else {
          if (verifyData.message?.includes('already verified')) {
            setStatus('already-verified');
            setMessage('Your email has already been verified.');
          } else {
            setStatus('error');
            setMessage(verifyData.message || 'Failed to verify email');
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-[calc(100vh_-_80px)] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-600 px-8 py-10 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                3A Softwares
              </h1>
            </div>
            <div className="px-8 py-16 text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-blue-500 text-5xl animate-spin mb-6"
              />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Your Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' || status === 'already-verified') {
    return (
      <div className="min-h-[calc(100vh_-_80px)] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-500 px-8 py-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-white text-3xl" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {status === 'success' ? 'Email Verified!' : 'Already Verified'}
              </h1>
              <p className="text-green-100 text-sm">{message}</p>
            </div>

            <div className="px-8 py-10">
              <div className="text-center mb-6">
                {userEmail && (
                  <p className="text-gray-600 mb-4">
                    Your email <strong className="text-gray-900">{userEmail}</strong> has been
                    verified.
                  </p>
                )}
                <p className="text-gray-600">
                  You now have full access to all features of 3A E-Commerce.
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/" className="block">
                  <Button variant="primary" className="w-full">
                    Go to Homepage
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-[calc(100vh_-_80px)] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-red-100 text-sm">{message}</p>
          </div>

          <div className="px-8 py-10">
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                The verification link may have expired or is invalid. Verification links are valid
                for 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/profile" className="block">
                <Button variant="primary" className="w-full">
                  Go to Profile to Resend
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button variant="outline" className="w-full">
                  Go to Homepage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh_-_80px)] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
