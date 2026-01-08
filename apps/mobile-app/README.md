# 3A Softwares Mobile App

React Native mobile application for the 3A Softwares E-Commerce platform built with Expo.

## Tech Stack

- **Framework:** Expo SDK 51 with Expo Router
- **Language:** TypeScript
- **State Management:** Zustand with persist middleware
- **Data Fetching:** TanStack React Query + Apollo Client
- **Navigation:** Expo Router (file-based routing)
- **Styling:** React Native StyleSheet with custom theme
- **Authentication:** Expo SecureStore for tokens

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for development)
- iOS Simulator (macOS only) or Android Emulator

## Getting Started

### 1. Install Dependencies

```bash
# From the root of the monorepo
yarn install

# Or from the mobile-app directory
cd apps/mobile-app
yarn install
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
```

### 3. Run the App

```bash
# Start Expo development server
yarn start

# Run on iOS (macOS only)
yarn ios

# Run on Android
yarn android

# Run on web
yarn web
```

## Project Structure

```
mobile-app/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Home screen
│   │   ├── products.tsx   # Products listing
│   │   ├── cart.tsx       # Shopping cart
│   │   ├── wishlist.tsx   # Wishlist
│   │   └── profile.tsx    # User profile
│   ├── product/[id].tsx   # Product detail
│   ├── order/[id].tsx     # Order detail
│   └── checkout.tsx       # Checkout flow
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Colors, Layout, etc.
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Apollo client & GraphQL queries
│   ├── store/             # Zustand stores
│   └── types/             # TypeScript types
├── assets/
│   └── images/            # App icons, splash screens
├── app.json               # Expo configuration
└── package.json
```

## Features

### Customer Features

- 🏠 Home screen with featured products and categories
- 🔍 Product search with filters (category, price, sort)
- 📦 Product details with image gallery
- 🛒 Shopping cart with quantity management
- ❤️ Wishlist functionality
- 👤 User profile with order history
- 🔐 Authentication (login, register, forgot password)
- 💳 Checkout flow with address and payment

### UI Features

- 🌙 Dark mode support
- 📱 Responsive design for all screen sizes
- 🔄 Pull-to-refresh on lists
- 💀 Skeleton loading states
- 🎨 Consistent design system

## Environment Variables

| Variable                       | Description                          | Required |
| ------------------------------ | ------------------------------------ | -------- |
| `EXPO_PUBLIC_GRAPHQL_URL`      | GraphQL Gateway URL                  | Yes      |
| `EXPO_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth Client ID               | Optional |
| `EXPO_PUBLIC_ENV`              | Environment (development/production) | No       |

## Building for Production

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for Android
eas build -p android

# Build for iOS
eas build -p ios
```

### Local Build

```bash
# Android APK
expo build:android -t apk

# Android App Bundle (for Play Store)
expo build:android -t app-bundle

# iOS (requires macOS with Xcode)
expo build:ios
```

## Scripts

| Script               | Description                  |
| -------------------- | ---------------------------- |
| `yarn start`         | Start Expo dev server        |
| `yarn android`       | Run on Android               |
| `yarn ios`           | Run on iOS                   |
| `yarn web`           | Run on web browser           |
| `yarn build:android` | Build Android with EAS       |
| `yarn build:ios`     | Build iOS with EAS           |
| `yarn lint`          | Run ESLint                   |
| `yarn type-check`    | Run TypeScript type checking |

## API Integration

The app connects to the GraphQL Gateway which provides:

- Product queries (list, detail, search)
- Category queries
- Order queries and mutations
- Authentication mutations
- User profile queries

## Troubleshooting

### Common Issues

1. **Metro bundler cache issues**

   ```bash
   npx expo start --clear
   ```

2. **iOS build fails on Apple Silicon**

   ```bash
   sudo arch -x86_64 gem install ffi
   cd ios && pod install
   ```

3. **Android emulator not detected**
   ```bash
   # Make sure ANDROID_HOME is set
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

MIT © 3A Softwares
