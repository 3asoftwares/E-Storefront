import { gql } from '@apollo/client';

// Product Queries
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
        stock
        imageUrl
        rating
        reviewCount
        featured
        category {
          id
          name
        }
      }
      total
      page
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
      stock
      imageUrl
      images
      rating
      reviewCount
      featured
      category {
        id
        name
      }
      seller {
        id
        name
      }
    }
  }
`;

// Category Queries
export const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
      description
      imageUrl
      productCount
    }
  }
`;

// Order Queries
export const GET_ORDERS_QUERY = gql`
  query GetOrders($page: Int, $limit: Int) {
    orders(page: $page, limit: $limit) {
      orders {
        id
        status
        totalAmount
        createdAt
        items {
          id
          name
          quantity
          price
          imageUrl
        }
      }
      total
    }
  }
`;

export const GET_ORDER_QUERY = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      status
      totalAmount
      subtotal
      tax
      shippingCost
      paymentMethod
      createdAt
      items {
        id
        name
        quantity
        price
        imageUrl
      }
      shippingAddress {
        name
        street
        city
        state
        postalCode
        country
        phone
      }
    }
  }
`;

// Auth Mutations
export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      addresses {
        id
        name
        street
        city
        state
        postalCode
        country
        phone
        isDefault
      }
    }
  }
`;

// Order Mutations
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      status
      totalAmount
    }
  }
`;

export const GQL_QUERIES = {
  GET_PRODUCTS_QUERY,
  GET_PRODUCT_QUERY,
  GET_CATEGORIES_QUERY,
  GET_ORDERS_QUERY,
  GET_ORDER_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  ME_QUERY,
  CREATE_ORDER_MUTATION,
};
