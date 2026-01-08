import axios from 'axios';
import { getAccessToken } from '@3asoftwares/utils';

const API_BASE = process.env.VITE_AUTH_API_BASE || 'http://localhost:3011/api/auth';

// Create authenticated client
const createAuthClient = () => {
  const client = axios.create({
    baseURL: API_BASE,
  });

  client.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const authClient = createAuthClient();

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_BASE}/login`, { email, password });
  return res.data;
};

export const register = async (email: string, password: string, role: string, name?: string) => {
  const res = await axios.post(`${API_BASE}/register`, {
    email,
    password: password,
    role,
    name,
  });
  return res.data;
};

export const forgotPassword = async (email: string, role: string) => {
  const res = await axios.post(`${API_BASE}/forgot-password`, { email, role });
  return res.data;
};

export const resetPassword = async (token: string, password: string, confirmPassword: string) => {
  const res = await axios.post(`${API_BASE}/reset-password`, {
    token,
    password,
    confirmPassword,
  });
  return res.data;
};

export const validateResetToken = async (token: string) => {
  const res = await axios.get(`${API_BASE}/validate-reset-token/${token}`);
  return res.data;
};

export const getProfile = async () => {
  const res = await authClient.get('/me');
  return res.data;
};

export const logout = async () => {
  const res = await authClient.post('/logout');
  return res.data;
};
