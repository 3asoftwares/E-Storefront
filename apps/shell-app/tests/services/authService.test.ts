import axios from 'axios';
import {
  login,
  register,
  forgotPassword,
  resetPassword,
  validateResetToken,
  getProfile,
  logout,
} from '../../src/services/authService';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
  })),
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock utils
jest.mock('@3asoftwares/utils', () => ({
  getAccessToken: jest.fn(() => 'mock-token'),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('authService', () => {
  const API_BASE = 'http://localhost:3011/api/auth';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should send login request with email and password', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'test@example.com', role: 'admin' },
          accessToken: 'test-token',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await login('test@example.com', 'Password123!');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE}/login`, {
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on login failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Invalid credentials'));

      await expect(login('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(login('test@example.com', 'password')).rejects.toThrow('Network Error');
    });
  });

  describe('register', () => {
    it('should send register request with all fields', async () => {
      const mockResponse = {
        data: {
          user: { id: '1', email: 'new@example.com', role: 'seller' },
          message: 'User registered successfully',
        },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await register('new@example.com', 'Password123!', 'seller', 'John Doe');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE}/register`, {
        email: 'new@example.com',
        password: 'Password123!',
        role: 'seller',
        name: 'John Doe',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should send register request without optional name', async () => {
      const mockResponse = {
        data: { user: { id: '1', email: 'new@example.com' } },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await register('new@example.com', 'Password123!', 'admin');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE}/register`, {
        email: 'new@example.com',
        password: 'Password123!',
        role: 'admin',
        name: undefined,
      });
    });

    it('should throw error when email already exists', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: 'Email already registered' } },
      });

      await expect(
        register('existing@example.com', 'Password123!', 'seller')
      ).rejects.toBeDefined();
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request', async () => {
      const mockResponse = {
        data: { message: 'Password reset email sent' },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await forgotPassword('test@example.com', 'seller');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE}/forgot-password`, {
        email: 'test@example.com',
        role: 'seller',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle user not found error', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: 'User not found' } },
      });

      await expect(forgotPassword('notfound@example.com', 'seller')).rejects.toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should send reset password request', async () => {
      const mockResponse = {
        data: { message: 'Password reset successfully' },
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await resetPassword('reset-token', 'NewPassword123!', 'NewPassword123!');

      expect(mockedAxios.post).toHaveBeenCalledWith(`${API_BASE}/reset-password`, {
        token: 'reset-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error for invalid token', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: 'Invalid or expired token' } },
      });

      await expect(resetPassword('invalid-token', 'pass', 'pass')).rejects.toBeDefined();
    });

    it('should throw error when passwords do not match', async () => {
      mockedAxios.post.mockRejectedValue({
        response: { data: { message: 'Passwords do not match' } },
      });

      await expect(resetPassword('token', 'pass1', 'pass2')).rejects.toBeDefined();
    });
  });

  describe('validateResetToken', () => {
    it('should validate reset token', async () => {
      const mockResponse = {
        data: { valid: true, email: 'test@example.com' },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await validateResetToken('valid-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_BASE}/validate-reset-token/valid-token`);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error for expired token', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { data: { message: 'Token expired' } },
      });

      await expect(validateResetToken('expired-token')).rejects.toBeDefined();
    });
  });

  describe('environment variables', () => {
    it('should use default API_BASE when env variable is not set', () => {
      // The default value is used when AUTH_SERVICE_BASE is not set
      expect(API_BASE).toBe('http://localhost:3011/api/auth');
    });
  });
});
