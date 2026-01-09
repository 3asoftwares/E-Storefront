# 3A Storefront Mobile App

A full-featured e-commerce mobile application built with Expo, React Native, and TypeScript. This app mirrors the functionality of the web storefront application.

## 🚀 Features

### Core Features

- **Product Browsing**: Browse products with search, filtering, and sorting
- **Product Details**: View detailed product information, images, reviews
- **Shopping Cart**: Add items, update quantities, apply coupon codes
- **Wishlist**: Save products for later
- **User Authentication**: Login, signup, password recovery
- **Checkout Flow**: Multi-step checkout with shipping and payment
- **Order Management**: View order history and track orders
- **Address Management**: Add, edit, and manage delivery addresses
- **User Profile**: View and edit profile information

### Technical Features

- **GraphQL API**: Apollo Client for data fetching
- **State Management**: Zustand with persistence
- **Navigation**: Expo Router with file-based routing
- **Offline Support**: AsyncStorage for data persistence
- **Cross-Platform**: iOS, Android, and Web support

## 📱 Screenshots

| Home | Products | Cart | Profile |
| ---- | -------- | ---- | ------- |
| 🏠   | 📦       | 🛒   | 👤      |

## 🛠️ Tech Stack

- **Framework**: Expo SDK 54
- **Navigation**: Expo Router v6
- **Language**: TypeScript
- **UI**: React Native with custom components
- **State Management**: Zustand
- **Data Fetching**: Apollo Client + React Query
- **Storage**: AsyncStorage
- **Styling**: StyleSheet (React Native)

## 📦 Project Structure

```
mobile-app/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx           # Tab layout
│   │   ├── index.tsx             # Home screen
│   │   ├── products.tsx          # Products listing
│   │   ├── cart.tsx              # Shopping cart
│   │   ├── wishlist.tsx          # Wishlist
│   │   └── profile.tsx           # User profile
│   ├── product/[id].tsx          # Product detail
│   ├── orders/                   # Order screens
│   │   ├── index.tsx             # Order list
│   │   └── [id].tsx              # Order detail
│   ├── login.tsx                 # Login screen
│   ├── signup.tsx                # Signup screen
│   ├── checkout.tsx              # Checkout flow
│   ├── search.tsx                # Search screen
│   ├── categories.tsx            # Categories screen
│   ├── settings.tsx              # Settings screen
│   ├── addresses.tsx             # Address management
│   ├── forgot-password.tsx       # Password recovery
│   └── _layout.tsx               # Root layout
├── src/
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── EmptyState.tsx
│   │   └── products/             # Product components
│   │       ├── ProductCard.tsx
│   │       └── ProductGrid.tsx
│   ├── lib/
│   │   ├── apollo/
│   │   │   ├── client.ts         # Apollo Client setup
│   │   │   └── queries.ts        # GraphQL queries/mutations
│   │   └── hooks/
│   │       └── index.ts          # React Query hooks
│   ├── store/
│   │   └── cartStore.ts          # Zustand store
│   ├── constants/
│   │   └── theme.ts              # Colors, spacing, etc.
│   └── utils/
│       └── helpers.ts            # Utility functions
├── assets/                       # App assets
├── app.json                      # Expo config
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Navigate to the mobile app directory**:

   ```bash
   cd apps/mobile-app
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Update the GraphQL endpoint**:

   Edit `src/lib/apollo/client.ts` and update the API URL:

   ```typescript
   // For local development, use your machine's IP address
   const getApiUrl = () => {
     if (Platform.OS === 'web') {
       return 'http://localhost:4000/graphql';
     }
     // Replace with your machine's IP address
     return 'http://192.168.1.100:4000/graphql';
   };
   ```

4. **Start the development server**:

   ```bash
   npx expo start
   ```

5. **Run on device/simulator**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for Web browser
   - Scan QR code with Expo Go app for physical device

### Running the Backend

Make sure the backend services are running:

```bash
# From the project root
docker-compose up -d

# Or run individual services
cd services/graphql-gateway && npm run dev
```

## 📱 Available Scripts

```bash
# Start development server
npx expo start

# Start with cache cleared
npx expo start --clear

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android

# Run on Web
npx expo start --web

# Build for production
eas build --platform ios
eas build --platform android

# Run tests
npm test

# Type check
npm run typecheck
```

## 🔧 Configuration

### Environment Variables

The app uses the following configuration in `src/constants/theme.ts`:

```typescript
export const API_CONFIG = {
  graphqlEndpoint: __DEV__
    ? 'http://192.168.1.100:4000/graphql' // Development
    : 'https://api.your-domain.com/graphql', // Production
  timeout: 30000,
  retryAttempts: 3,
};
```

### Theme Customization

Colors, spacing, and other theme values can be customized in `src/constants/theme.ts`:

```typescript
export const Colors = {
  light: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    // ... more colors
  },
  dark: {
    // Dark mode colors
  },
};
```

## 📝 API Integration

The app connects to the GraphQL gateway. Available queries and mutations:

### Queries

- `GET_PRODUCTS_QUERY` - Fetch products with filters
- `GET_PRODUCT_QUERY` - Get single product details
- `GET_CATEGORIES_QUERY` - Fetch all categories
- `GET_ORDERS_BY_CUSTOMER_QUERY` - Get user's orders
- `GET_ORDER_QUERY` - Get single order details

### Mutations

- `LOGIN_MUTATION` - User login
- `REGISTER_MUTATION` - User registration
- `CREATE_ORDER_MUTATION` - Create new order
- `CREATE_REVIEW_MUTATION` - Add product review
- `VALIDATE_COUPON_MUTATION` - Validate coupon code

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- ProductCard.test.tsx
```

## 📦 Building for Production

### Using EAS Build

1. **Install EAS CLI**:

   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**:

   ```bash
   eas login
   ```

3. **Configure build**:

   ```bash
   eas build:configure
   ```

4. **Build for iOS**:

   ```bash
   eas build --platform ios
   ```

5. **Build for Android**:
   ```bash
   eas build --platform android
   ```

### Local Build (Development Client)

```bash
# iOS
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../../LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - React Native framework
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [Apollo Client](https://www.apollographql.com/docs/react/) - GraphQL client
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [React Query](https://tanstack.com/query) - Data fetching
