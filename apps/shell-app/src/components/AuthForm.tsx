import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '@3asoftwares/ui-library';
import {
  login as loginService,
  register as registerService,
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from '../services/authService';
import { storeAuth } from '@3asoftwares/utils';
import { renderApp } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password';

interface AuthFormProps {
  initialMode?: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  initialMode = 'login',
  setAuthMode,
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode as AuthMode);
  const isLogin = mode === 'login';
  const isSignup = mode === 'signup';
  const isForgotPassword = mode === 'forgot-password';
  const isResetPassword = mode === 'reset-password';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('seller');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check for reset token in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl && window.location.pathname === '/reset-password') {
      setResetToken(tokenFromUrl);
      setMode('reset-password');
    }
  }, []);

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return undefined;
  };

  const validateConfirmPassword = (
    password: string,
    confirmPassword: string
  ): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (isForgotPassword) {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
    } else if (isResetPassword) {
      const passwordError = validatePassword(password);
      if (passwordError) errors.password = passwordError;
      const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
    } else if (isLogin) {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;
      if (!password) {
        errors.password = 'Password is required';
      }
    } else {
      const emailError = validateEmail(email);
      if (emailError) errors.email = emailError;

      const nameError = validateName(name);
      if (nameError) errors.name = nameError;

      const passwordError = validatePassword(password);
      if (passwordError) errors.password = passwordError;

      const confirmPasswordError = validateConfirmPassword(password, confirmPassword);
      if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

      if (!role) {
        errors.role = 'Please select a role';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isForgotPassword) {
        const result = await forgotPasswordService(email, 'seller');
        if (result.success) {
          setSuccessMessage(
            'If an account with that email exists, a password reset link has been sent. Please check your email.'
          );
        } else {
          setError(result.message || 'Failed to send reset email');
        }
      } else if (isResetPassword) {
        const result = await resetPasswordService(resetToken, password, confirmPassword);
        if (result.success) {
          setSuccessMessage('Password reset successfully! You can now log in.');
          setTimeout(() => {
            setMode('login');
            setSuccessMessage('');
            setPassword('');
            setConfirmPassword('');
            setResetToken('');
          }, 2000);
        } else {
          setError(result.message || 'Failed to reset password');
        }
      } else if (isLogin) {
        const data = await loginService(email, password);
        if (!data || !data.user) throw new Error(data.message || 'Authentication failed');

        storeAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        });

        onSuccess?.();
        renderApp(data.user.role);
      } else {
        const data = await registerService(email, password, role, name);
        if (!data || !data.user) throw new Error(data.message || 'Authentication failed');

        storeAuth({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        });

        onSuccess?.();
        renderApp(data.user.role);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModeToggle = () => {
    const newMode = isLogin ? 'signup' : 'login';
    setMode(newMode);
    setAuthMode(newMode as 'login' | 'signup');
    setError('');
    setSuccessMessage('');
    setFieldErrors({});
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('customer');
  };

  const handleForgotPassword = () => {
    setMode('forgot-password');
    setError('');
    setSuccessMessage('');
    setFieldErrors({});
    setPassword('');
  };

  const handleBackToLogin = () => {
    setMode('login');
    setAuthMode('login');
    setError('');
    setSuccessMessage('');
    setFieldErrors({});
    setPassword('');
    setConfirmPassword('');
    setResetToken('');
  };

  // Forgot Password Form
  if (isForgotPassword) {
    return (
      <div className="py-2">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Reset your password
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="E-mail"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e: any) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={fieldErrors.email || ''}
            size="md"
            fullWidth
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                {successMessage}
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={handleBackToLogin}
            className="text-sm"
            disabled={isSubmitting}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // Reset Password Form
  if (isResetPassword) {
    return (
      <div className="py-2">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Create new password
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="New Password"
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e: any) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            error={fieldErrors.password || ''}
            size="md"
            fullWidth
            helperText={
              'Must be 8+ characters with uppercase, lowercase, number & special character'
            }
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e: any) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) {
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            error={fieldErrors.confirmPassword || ''}
            size="md"
            fullWidth
          />

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                {successMessage}
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={handleBackToLogin}
            className="text-sm"
            disabled={isSubmitting}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      <form onSubmit={handleSubmit} className="space-y-5">
        {isSignup && (
          <Input
            label="Name"
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e: any) => {
              setName(e.target.value);
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            error={fieldErrors.name || ''}
            size="md"
            fullWidth
          />
        )}

        <Input
          label="E-mail"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e: any) => {
            setEmail(e.target.value);
            if (fieldErrors.email) {
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
          }}
          error={fieldErrors.email || ''}
          size="md"
          fullWidth
        />

        <Input
          label="Password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e: any) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          error={fieldErrors.password || ''}
          size="md"
          fullWidth
          helperText={'Must be 8+ characters with uppercase, lowercase, number & special character'}
        />

        {isSignup && (
          <>
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e: any) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              error={fieldErrors.confirmPassword || ''}
              size="md"
              fullWidth
            />

            <div className="w-full">
              <Select
                value={role}
                label="Select Role"
                onChange={(role: any) => {
                  setRole(role);
                  if (fieldErrors.role) {
                    setFieldErrors((prev) => ({ ...prev, role: undefined }));
                  }
                }}
                options={[
                  { value: 'seller', label: 'Seller' },
                  { value: 'admin', label: 'Admin' },
                ]}
                className="w-full"
              />
              {fieldErrors.role && (
                <p className="mt-2 text-sm text-red-700 dark:text-red-400 font-semibold">
                  {fieldErrors.role}
                </p>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faTimesCircle}
                className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0"
              />
              <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{error}</p>
            </div>
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5 text-white" />
              {isLogin ? 'Logging in...' : 'Signing up...'}
            </span>
          ) : isLogin ? (
            'Login'
          ) : (
            'Sign Up'
          )}
        </Button>

        {isLogin && (
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleForgotPassword}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              disabled={isSubmitting}
            >
              Forgot your password?
            </Button>
          </div>
        )}
      </form>
      <div className="mt-2 text-center">
        <Button
          variant="ghost"
          onClick={handleModeToggle}
          className="text-sm"
          disabled={isSubmitting}
        >
          {isLogin ? 'Create an account' : 'Already have an account? Login'}
        </Button>
      </div>
    </div>
  );
};
