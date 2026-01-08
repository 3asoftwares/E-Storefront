# Auth Service

## Overview

Authentication service providing JWT-based authentication, role-based access control (RBAC), user registration, login, and session management.

## Tech Stack

### Runtime & Framework

- **Node.js** - JavaScript runtime
- **Express 4** - Web framework
- **TypeScript 5** - Type-safe development

### Database

- **MongoDB 8** (via Mongoose) - NoSQL database

### Authentication

- **JSON Web Tokens (JWT)** - Token-based auth
- **Argon2** - Password hashing
- **bcryptjs** - Alternative password hashing

### Email

- **Nodemailer** - Email sending (password reset, verification)

### Security

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **express-validator** - Input validation

### Logging

- **Morgan** - HTTP request logging
- **Custom Logger** - Application logging with file support

### Testing

- **Jest 29** - Test runner
- **ts-jest** - TypeScript support

## Features

- ✅ User registration with email verification
- ✅ User login with JWT tokens
- ✅ Access token + Refresh token flow
- ✅ Password reset via email
- ✅ Role-based access control (ADMIN, SELLER, CUSTOMER)
- ✅ User profile management
- ✅ Session management
- ✅ Token refresh mechanism
- ✅ Protected route middleware
- ✅ Input validation
- ✅ Structured logging

## API Endpoints

### Public

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh access token

### Protected

- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/users` - Get all users (admin only)

## Project Structure

```
src/
├── controllers/  # Route handlers
├── middleware/   # Auth & validation middleware
├── models/       # Mongoose models
├── routes/       # Express routes
├── services/     # Business logic (email, etc.)
├── types/        # TypeScript types
└── index.ts      # Entry point
```

## Scripts

```bash
yarn dev         # Start development server with nodemon
yarn start       # Start production server
yarn build       # Compile TypeScript
yarn test        # Run tests
yarn test:watch  # Run tests in watch mode
yarn test:coverage # Run tests with coverage
yarn lint        # Run ESLint
```

## Environment Variables

```env
PORT=4001
MONGODB_URI=mongodb://localhost:27017/ecommerce_auth
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FRONTEND_URL=http://localhost:3000
```

## Port

- Development: `4001`

## Dependencies on Shared Packages

- `@3asoftwares/utils` - Shared utilities and Logger
