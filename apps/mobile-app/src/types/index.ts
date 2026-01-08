// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  stock: number;
  imageUrl?: string;
  images?: string[];
  sellerId: string;
  rating?: number;
  numReviews?: number;
  featured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  slug?: string;
  parentId?: string;
  productCount?: number;
}

// Cart types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId?: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: number;
}

export interface RecentlyViewedItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  viewedAt: number;
}

// Order types
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  notes?: string;
  couponCode?: string;
  discount?: number;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  helpfulCount?: number;
  createdAt: string;
}

// Coupon types
export interface CouponValidation {
  valid: boolean;
  discount: number;
  discountValue: number;
  finalTotal: number;
  discountType: 'percentage' | 'fixed' | null;
  message: string;
  code: string;
}

// Auth types
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// API Response types
export interface ProductsResponse {
  products: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ProductResponse {
  product: Product;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface OrdersResponse {
  ordersByCustomer: Order[];
}

export interface OrderResponse {
  order: Order;
}

// Filter types
export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
  featured?: boolean;
}
