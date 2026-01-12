# Seller App

## Overview

Seller portal for product management, inventory control, and order fulfillment - dedicated dashboard for merchants to manage their business on the platform.

## Tech Stack

### Frontend Framework

- **React 18** - UI library
- **TypeScript 5** - Type-safe development
- **Vite 4.5** - Build tool and dev server

### State Management

- **Redux Toolkit** - Global state management
- **TanStack React Query** - Server state and caching

### Styling

- **Tailwind CSS 3.4** - Utility-first CSS
- **DaisyUI 4** - Component library

### Routing

- **React Router DOM 6** - Client-side routing

### API & Data

- **Axios** - HTTP client

### Testing

- **Jest 29** - Test runner
- **React Testing Library 14** - Component testing

### Icons

- **FontAwesome** - Icon library

### Other

- **Cloudinary** - Image upload/management
- **Module Federation** - Micro-frontend architecture

## Features

- ✅ Product management (CRUD operations)
- ✅ Image upload with Cloudinary
- ✅ Order management and fulfillment
- ✅ Sales analytics dashboard
- ✅ Inventory tracking
- ✅ Revenue statistics
- ✅ Profile management
- ✅ Dark/Light theme support
- ✅ Protected routes with authentication

## Project Structure

```
src/
├── api/          # API service functions
├── components/   # Reusable UI components
├── pages/        # Page components
├── store/        # State management
└── App.tsx       # Main application component
```

## Scripts

```bash
yarn dev         # Start development server (port 3002)
yarn build       # Build for production
yarn preview     # Preview production build
yarn test        # Run tests
yarn test:watch  # Run tests in watch mode
yarn test:coverage # Run tests with coverage
```

## Environment Variables

```env
VITE_AUTH_SERVICE=http://localhost:4000
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

## Port

- Development: `3002`

## Dependencies on Shared Packages

- `3asoftwares/types` - Shared TypeScript types
- `3asoftwares/ui` - Shared UI components
- `3asoftwares/utils` - Shared utilities
