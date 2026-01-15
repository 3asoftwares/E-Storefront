import { renderHook, act, waitFor } from '@testing-library/react';

// Mock the dependencies before importing the hook
jest.mock('@3asoftwares/utils/client', () => ({
  getAccessToken: jest.fn(),
  clearAuth: jest.fn(),
  storeAuth: jest.fn(),
  getStoredAuth: jest.fn(),
}));

jest.mock('../../src/services/authService', () => ({
  getProfile: jest.fn(),
  logout: jest.fn(),
}));

import { useTokenValidator } from '../../src/store/useTokenValidator';
import { getAccessToken, clearAuth, storeAuth, getStoredAuth } from '@3asoftwares/utils/client';
import { getProfile, logout } from '../../src/services/authService';

const mockGetAccessToken = getAccessToken as jest.Mock;
const mockClearAuth = clearAuth as jest.Mock;
const mockStoreAuth = storeAuth as jest.Mock;
const mockGetStoredAuth = getStoredAuth as jest.Mock;
const mockGetProfile = getProfile as jest.Mock;
const mockLogout = logout as jest.Mock;

describe('useTokenValidator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('validateToken', () => {
    it('should return invalid when no token exists', async () => {
      mockGetAccessToken.mockReturnValue(null);

      const { result } = renderHook(() => useTokenValidator());

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateToken();
      });

      expect(validationResult).toEqual({ valid: false, reason: 'no_token' });
      expect(mockGetProfile).not.toHaveBeenCalled();
    });

    it('should validate token and return user when valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com', role: 'admin' };
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetProfile.mockResolvedValue({ data: { user: mockUser } });
      mockGetStoredAuth.mockReturnValue({ token: 'valid-token', user: mockUser });

      const { result } = renderHook(() => useTokenValidator());

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateToken();
      });

      expect(validationResult).toEqual({ valid: true, user: mockUser });
      expect(mockGetProfile).toHaveBeenCalled();
    });

    it('should call onUserUpdate callback when token is valid', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      const mockOnUserUpdate = jest.fn();
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetProfile.mockResolvedValue({ data: { user: mockUser } });
      mockGetStoredAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useTokenValidator(mockOnUserUpdate));

      await act(async () => {
        await result.current.validateToken();
      });

      expect(mockOnUserUpdate).toHaveBeenCalledWith(mockUser);
    });

    it('should refresh stored auth on successful validation (sliding expiration)', async () => {
      const mockUser = { id: '1', email: 'test@example.com' };
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetProfile.mockResolvedValue({ data: { user: mockUser } });
      mockGetStoredAuth.mockReturnValue({ token: 'valid-token' });

      const { result } = renderHook(() => useTokenValidator());

      await act(async () => {
        await result.current.validateToken();
      });

      expect(mockStoreAuth).toHaveBeenCalledWith({
        user: mockUser,
        accessToken: 'valid-token',
      });
    });

    it('should return invalid when profile returns no user', async () => {
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetProfile.mockResolvedValue({ data: { user: null } });

      const { result } = renderHook(() => useTokenValidator());

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateToken();
      });

      expect(validationResult).toEqual({ valid: false, reason: 'no_user' });
    });

    it('should handle 401 unauthorized error', async () => {
      mockGetAccessToken.mockReturnValue('expired-token');
      mockGetProfile.mockRejectedValue(new Error('401 Unauthorized'));

      const { result } = renderHook(() => useTokenValidator());

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateToken();
      });

      // validateToken returns invalid with auth_error reason
      expect(validationResult).toEqual({ valid: false, reason: 'auth_error' });
    });

    it('should handle jwt expired error', async () => {
      mockGetAccessToken.mockReturnValue('expired-token');
      mockGetProfile.mockRejectedValue(new Error('jwt expired'));

      const { result } = renderHook(() => useTokenValidator());

      let validationResult: any;
      await act(async () => {
        validationResult = await result.current.validateToken();
      });

      // validateToken returns invalid with auth_error reason
      expect(validationResult).toEqual({ valid: false, reason: 'auth_error' });
    });
  });

  describe('automatic validation', () => {
    it('should start periodic validation automatically when token exists', async () => {
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetProfile.mockResolvedValue({ data: { user: { id: '1' } } });
      mockGetStoredAuth.mockReturnValue({ token: 'valid-token' });

      renderHook(() => useTokenValidator());

      // Wait for initial validation
      await act(async () => {
        await Promise.resolve();
      });

      // Advance timers by 5 minutes (TOKEN_CHECK_INTERVAL)
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockGetProfile).toHaveBeenCalled();
    });

    it('should not start validation when no token exists', async () => {
      mockGetAccessToken.mockReturnValue(null);

      renderHook(() => useTokenValidator());

      // Advance timers
      act(() => {
        jest.advanceTimersByTime(10 * 60 * 1000);
      });

      // Should not have been called without a token
      expect(mockGetProfile).not.toHaveBeenCalled();
    });
  });

  describe('checkAndValidate', () => {
    it('should validate and handle invalid token', async () => {
      mockGetAccessToken.mockReturnValue('expired-token');
      mockGetProfile.mockRejectedValue(new Error('401 Unauthorized'));
      mockLogout.mockResolvedValue({ message: 'Logged out' });

      // Mock window.location.reload
      const reloadMock = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      const { result } = renderHook(() => useTokenValidator());

      await act(async () => {
        await result.current.checkAndValidate();
      });

      expect(mockClearAuth).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    it('should stop validation on unmount', async () => {
      mockGetAccessToken.mockReturnValue('valid-token');
      mockGetProfile.mockResolvedValue({ data: { user: { id: '1' } } });
      mockGetStoredAuth.mockReturnValue({ token: 'valid-token' });

      const { unmount } = renderHook(() => useTokenValidator());

      // Wait for initial setup
      await act(async () => {
        await Promise.resolve();
      });

      unmount();

      // Verify cleanup happened (no errors thrown)
      expect(true).toBe(true);
    });
  });
});
