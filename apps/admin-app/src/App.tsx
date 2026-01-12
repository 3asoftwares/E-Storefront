import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { setUser } from './store/authSlice';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Coupons } from './pages/Coupons';
import { Profile } from './pages/Profile';
import { VerifyEmail } from './pages/VerifyEmail';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { useUIStore } from './store/uiStore';
import {
  validateUserRole,
  clearAuth,
  storeAuth,
  getStoredAuth,
  SHELL_APP_URL,
  Logger,
} from '@3asoftwares/utils/client';
import { getUserById } from './api/client';
import { useAppDispatch } from './store/store';
import { useTokenValidator } from './store/useTokenValidator';

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { theme, sidebarOpen } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);

  // Check if current route is verify-email (public route)
  const isPublicRoute = location.pathname === '/verify-email';

  // Periodically validate token to implement sliding expiration
  useTokenValidator();

  const clearAndLogout = () => {
    clearAuth();
    window.location.href = `${process.env.VITE_SHELL_APP_URL || SHELL_APP_URL}?logout=true`;
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const initAuth = async () => {
      // Skip auth check for public routes
      if (isPublicRoute) {
        setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('userId');
        if (userId) {
          const authData = await getUserById(userId);
          if (authData && authData.user) {
            const { user, accessToken, refreshToken, tokenExpiry } = authData;
            if (user.role !== 'admin') {
              clearAndLogout();
              return;
            }
            storeAuth({
              user,
              accessToken,
              refreshToken,
              expiresIn: tokenExpiry,
            });

            dispatch(setUser({ user, token: accessToken }));

            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
            return;
          } else {
            clearAndLogout();
          }
          return;
        }

        if (!validateUserRole('admin')) {
          clearAndLogout();
          return;
        }

        const storedAuth = getStoredAuth();

        if (storedAuth && storedAuth.user && storedAuth.token) {
          dispatch(setUser({ user: storedAuth.user, token: storedAuth.token }));
          setIsLoading(false);
        } else {
          clearAndLogout();
        }
      } catch (error) {
        Logger.error('Auth initialization failed', error, 'App');
        clearAndLogout();
      }
    };

    initAuth();
  }, [dispatch, isPublicRoute]);

  if (isPublicRoute) {
    return (
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main
          className={`
          flex-1 p-4 md:p-6 lg:p-8 overflow-auto mt-[69px] min-h-[calc(100vh-69px)]
          transition-all duration-300
          ml-0 lg:ml-20
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
