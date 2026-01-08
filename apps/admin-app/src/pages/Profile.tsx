import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/store';
import { setUser } from '../store/authSlice';
import { Button, Badge, Spinner } from '@3asoftwares/ui-library';
import { graphqlRequest } from '../api/client';
import {
  SEND_VERIFICATION_EMAIL_MUTATION,
  VERIFY_EMAIL_MUTATION,
  GET_ME_QUERY,
  storeAuth,
  getStoredAuth,
  Logger,
} from '@3asoftwares/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faShieldAlt,
  faCheckCircle,
  faExclamationTriangle,
  faPaperPlane,
} from '@fortawesome/free-solid-svg-icons';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await graphqlRequest(GET_ME_QUERY);
        if (response.me) {
          const fetchedUser = response.me;
          const storedAuth = getStoredAuth();

          // Update stored auth with fresh user data
          if (storedAuth) {
            storeAuth({
              user: fetchedUser,
              accessToken: storedAuth.token,
            });
          }

          // Update Redux store
          dispatch(setUser({ user: fetchedUser, token: storedAuth?.token || '' }));
        }
      } catch (error) {
        Logger.error('Failed to fetch user details', error, 'Profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [dispatch]);

  const handleSendVerificationEmail = async () => {
    setIsSendingEmail(true);
    setMessage(null);
    try {
      const response = await graphqlRequest(SEND_VERIFICATION_EMAIL_MUTATION, { source: 'admin' });
      if (response.sendVerificationEmail.success) {
        setMessage({ type: 'success', text: response.sendVerificationEmail.message });
      } else {
        setMessage({ type: 'error', text: response.sendVerificationEmail.message });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send verification email' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const isEmailVerified = user.emailVerified;

  return (
    <div className="mx-auto">
      <h1 className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Profile
      </h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-600 via-gray-500 to-gray-700 px-6 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-4xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-blue-100">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon icon={faUser} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon icon={faShieldAlt} className="text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                <Badge variant="primary" className="mt-1">
                  {user.role?.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Email Verification Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <FontAwesomeIcon
                icon={isEmailVerified ? faCheckCircle : faExclamationTriangle}
                className={isEmailVerified ? 'text-green-500' : 'text-yellow-500'}
              />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email Status</p>
                <Badge variant={isEmailVerified ? 'success' : 'warning'} className="mt-1">
                  {isEmailVerified ? 'Verified' : 'Not Verified'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Email Verification Section */}
          {!isEmailVerified && (
            <div className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-4">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-yellow-500 text-xl mt-1"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Email Not Verified
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    Please verify your email address to access all features. Click the button below
                    to send a verification email or verify directly.
                  </p>
                  <div className="flex gap-3 mt-4">
                    <Button
                      onClick={handleSendVerificationEmail}
                      disabled={isSendingEmail}
                      variant="outline"
                      size="sm"
                    >
                      {isSendingEmail ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                          Send Verification Email
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verified Badge */}
          {isEmailVerified && (
            <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-4">
                <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-2xl" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Email Verified
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Your email address has been verified. You have full access to all features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
