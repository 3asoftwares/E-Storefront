// Storefront Hook Types

// Address Types
export interface AddressData {
  id: string;
  userId: string;
  name?: string;
  mobile?: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
  label?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddAddressInput {
  name: string;
  mobile: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

export interface UpdateAddressInput {
  name?: string;
  mobile?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  isDefault?: boolean;
  label?: string;
}

// Email Verification Types
export interface SendVerificationEmailResponse {
  sendVerificationEmail: {
    success: boolean;
    message: string;
  };
}

export interface VerifyEmailResponse {
  verifyEmail: {
    success: boolean;
    message: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      isActive: boolean;
      emailVerified: boolean;
    } | null;
  };
}

// Password Reset Types
export interface ForgotPasswordResponse {
  forgotPassword: {
    success: boolean;
    message: string;
    resetToken: string | null;
    resetUrl: string | null;
  };
}

export interface ResetPasswordResponse {
  resetPassword: {
    success: boolean;
    message: string;
  };
}

export interface ValidateTokenResponse {
  validateResetToken: {
    success: boolean;
    message: string;
    email: string | null;
  };
}

// Review Types
export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  helpful: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewConnection {
  reviews: ReviewData[];
  totalCount: number;
  hasNextPage: boolean;
}

export interface CreateReviewInput {
  productId: string;
  rating: number;
  comment: string;
}
