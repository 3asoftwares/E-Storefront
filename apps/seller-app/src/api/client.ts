import axios from 'axios';
import { SERVICE_URLS, SHELL_APP_URL, getAccessToken } from '@3asoftwares/utils/client';

const AUTH_SERVICE = process.env.VITE_AUTH_SERVICE || SERVICE_URLS.AUTH_SERVICE;
const PRODUCT_SERVICE = process.env.VITE_PRODUCT_SERVICE || SERVICE_URLS.PRODUCT_SERVICE;
const ORDER_SERVICE = process.env.VITE_ORDER_SERVICE || SERVICE_URLS.ORDER_SERVICE;
const CATEGORY_SERVICE = process.env.VITE_CATEGORY_SERVICE || SERVICE_URLS.CATEGORY_SERVICE;

const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
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

const authClient = createApiClient(AUTH_SERVICE);
const productClient = createApiClient(PRODUCT_SERVICE);
const orderClient = createApiClient(ORDER_SERVICE);
const categoryClient = createApiClient(CATEGORY_SERVICE);

export const authApi = {
  getUserById: async (userId: string) => {
    const response = await authClient.get(`/api/auth/user/${userId}`);
    return response.data;
  },

  getProfile: async () => {
    const response = await authClient.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await authClient.post('/api/auth/logout');
    return response.data;
  },

  sendVerificationEmail: async (source: string = 'seller') => {
    const response = await authClient.post('/api/auth/send-verification-email', { source });
    return response.data;
  },
};

export const productApi = {
  getBySeller: (sellerId: string) =>
    productClient
      .get('/api/products', {
        params: { sellerId, limit: 1000 },
      })
      .then((response) => response.data),

  create: (data: any) => productClient.post('/api/products', data),

  update: (id: string, data: any) => productClient.put(`/api/products/${id}`, data),

  delete: (id: string) => productClient.delete(`/api/products/${id}`),
};

export const orderApi = {
  getBySeller: (sellerId: string, page = 1, limit = 20) =>
    orderClient.get(`/api/orders/seller/${sellerId}`, { params: { page, limit } }),

  getSellerStats: (sellerId: string) => orderClient.get(`/api/orders/seller-stats/${sellerId}`),

  getSellerEarnings: (sellerId: string) =>
    orderClient.get(`/api/orders/seller-earnings/${sellerId}`),

  updateStatus: (id: string, status: string) =>
    orderClient.patch(`/api/orders/${id}/status`, { orderStatus: status.toUpperCase() }),
};

export const categoryApi = {
  getCategories: () => categoryClient.get('/api/categories'),
};

export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message === 'Invalid or expired token') {
      window.location.href = `${process.env.VITE_SHELL_APP_URL || SHELL_APP_URL}?logout=true`;
    }
    return error.response?.data?.message || error.message;
  }
  return 'An error occurred';
};
