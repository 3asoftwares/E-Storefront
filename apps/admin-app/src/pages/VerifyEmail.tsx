import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/store';
import { setUser } from '../store/authSlice';
import { Button, Spinner } from '@3asoftwares/ui-library';
import {
  storeAuth,
  getStoredAuth,
  VALIDATE_EMAIL_TOKEN_QUERY,
  VERIFY_EMAIL_BY_TOKEN_MUTATION,
} from '@3asoftwares/utils';
import { graphqlRequest } from '../api/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faHome,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
        // First validate the token using GraphQL
        const validateData = await graphqlRequest(VALIDATE_EMAIL_TOKEN_QUERY, { token });
        const validateResult = validateData?.validateEmailToken;

        if (!validateResult?.success) {
          if (validateResult?.message?.includes('already verified')) {
            setStatus('already-verified');
            setMessage('Your email has already been verified.');
          } else {
            setStatus('error');
            setMessage(validateResult?.message || 'Invalid or expired verification link');
          }
          return;
        }

        setUserEmail(validateResult.email || '');

        // Now verify the email using GraphQL
        const verifyData = await graphqlRequest(VERIFY_EMAIL_BY_TOKEN_MUTATION, { token });
        const verifyResult = verifyData?.verifyEmailByToken;

        if (verifyResult?.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');

          // Update user data in store if user is logged in
          const storedAuth = getStoredAuth();
          if (storedAuth && verifyResult?.user) {
            const updatedUser = verifyResult.user;
            storeAuth({
              user: updatedUser,
              accessToken: storedAuth.token,
            });
            dispatch(setUser({ user: updatedUser, token: storedAuth.token }));
          }
        } else {
          if (verifyResult?.message?.includes('already verified')) {
            setStatus('already-verified');
            setMessage('Your email has already been verified.');
          } else {
            setStatus('error');
            setMessage(verifyResult?.message || 'Failed to verify email');
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, dispatch]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
            </div>
            <div className="px-8 py-16 text-center">
              <Spinner size="lg" className="mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' || status === 'already-verified') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
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
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your email{' '}
                    <strong className="text-gray-900 dark:text-white">{userEmail}</strong> has been
                    verified.
                  </p>
                )}
                <p className="text-gray-600 dark:text-gray-400">
                  You now have full access to all admin features.
                </p>
              </div>

              <div className="space-y-3">
                <Button variant="primary" className="w-full" onClick={() => navigate('/dashboard')}>
                  <FontAwesomeIcon icon={faHome} className="mr-2" />
                  Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                  View Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Verification Failed</h1>
            <p className="text-red-100 text-sm">{message}</p>
          </div>

          <div className="px-8 py-10">
            <div className="text-center mb-6">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                The verification link may have expired or is invalid. Verification links are valid
                for 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              <Button variant="primary" className="w-full" onClick={() => navigate('/profile')}>
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Go to Profile to Resend
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
