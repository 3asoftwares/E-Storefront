import { gql } from '@apollo/client';

// ============== PRODUCT QUERIES ==============
export const GET_PRODUCTS_QUERY = gql`
  query GetProducts(
    $page: Int
    $limit: Int
    $search: String
    $category: String
    $minPrice: Float
    $maxPrice: Float
    $sortBy: String
    $sortOrder: String
    $featured: Boolean
  ) {
    products(
      page: $page
      limit: $limit
      search: $search
      category: $category
      minPrice: $minPrice
      maxPrice: $maxPrice
      sortBy: $sortBy
      sortOrder: $sortOrder
      featured: $featured
    ) {
      products {
        id
        name
        description
        price
        imageUrl
        stock
        category
        rating
        reviewCount
        sellerId
        featured
        createdAt
      }
      total
      page
      limit
      totalPages
    }
  }
`;

export const GET_PRODUCT_QUERY = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      imageUrl
      images
      stock
      category
      rating
      reviewCount
      sellerId
      featured
      specifications
      createdAt
      updatedAt
    }
  }
`;

// ============== CATEGORY QUERIES ==============
export const GET_CATEGORIES_QUERY = gql`
  query GetCategories($filter: CategoryFilterInput) {
    categories(filter: $filter) {
      data {
        id
        name
        slug
        description
        imageUrl
        isActive
        productCount
      }
      total
    }
  }
`;

// ============== AUTH MUTATIONS ==============
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        role
        isEmailVerified
        phone
      }
      accessToken
      refreshToken
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        name
        role
        isEmailVerified
      }
      accessToken
      refreshToken
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      email
      name
      role
      isEmailVerified
      phone
      createdAt
    }
  }
`;

// ============== ORDER QUERIES/MUTATIONS ==============
export const GET_ORDERS_BY_CUSTOMER_QUERY = gql`
  query GetOrdersByCustomer($page: Int, $limit: Int) {
    ordersByCustomer(page: $page, limit: $limit) {
      orders {
        id
        status
        paymentStatus
        totalAmount
        items {
          productId
          name
          price
          quantity
          imageUrl
        }
        createdAt
      }
      total
      page
      limit
    }
  }
`;

export const GET_ORDER_QUERY = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      customerId
      status
      paymentStatus
      paymentMethod
      shippingAddress {
        street
        city
        state
        zipCode
        country
      }
      items {
        productId
        name
        price
        quantity
        imageUrl
      }
      subtotal
      tax
      shippingCost
      discount
      totalAmount
      couponCode
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalAmount
      createdAt
    }
  }
`;

// ============== REVIEW QUERIES/MUTATIONS ==============
export const GET_PRODUCT_REVIEWS_QUERY = gql`
  query GetProductReviews($productId: ID!, $page: Int, $limit: Int) {
    productReviews(productId: $productId, page: $page, limit: $limit) {
      reviews {
        id
        userId
        userName
        rating
        title
        comment
        helpful
        createdAt
      }
      total
      averageRating
    }
  }
`;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      title
      comment
      createdAt
    }
  }
`;

// ============== COUPON QUERIES ==============
export const VALIDATE_COUPON_QUERY = gql`
  query ValidateCoupon($code: String!, $orderTotal: Float!) {
    validateCoupon(code: $code, orderTotal: $orderTotal) {
      valid
      coupon {
        id
        code
        discountType
        discountValue
        minOrderAmount
      }
      discount
      message
    }
  }
`;

// ============== ADDRESS QUERIES/MUTATIONS ==============
export const GET_MY_ADDRESSES_QUERY = gql`
  query GetMyAddresses {
    myAddresses {
      id
      label
      street
      city
      state
      zipCode
      country
      isDefault
    }
  }
`;

export const ADD_ADDRESS_MUTATION = gql`
  mutation AddAddress($input: AddressInput!) {
    addAddress(input: $input) {
      id
      label
      street
      city
      state
      zipCode
      country
      isDefault
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      email
      phone
    }
  }
`;

export const GQL_QUERIES = {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_QUERY,
  GET_CATEGORIES_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  GET_ME_QUERY,
  GET_ORDERS_BY_CUSTOMER_QUERY,
  GET_ORDER_QUERY,
  CREATE_ORDER_MUTATION,
  GET_PRODUCT_REVIEWS_QUERY,
  CREATE_REVIEW_MUTATION,
  VALIDATE_COUPON_QUERY,
  GET_MY_ADDRESSES_QUERY,
  ADD_ADDRESS_MUTATION,
  UPDATE_PROFILE_MUTATION,
};
