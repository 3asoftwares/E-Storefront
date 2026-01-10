// Common/Base Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface MutationResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface Address {
  id?: string;
  userId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  zip?: string;
  postalCode?: string;
  country: string;
  landmark?: string;
  type?: 'shipping' | 'billing' | 'both';
  isDefault?: boolean;
  addressLine1?: string;
  addressLine2?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
