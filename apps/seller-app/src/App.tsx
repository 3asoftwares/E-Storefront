import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from '@3asoftwares/ui';
import { useSellerAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { authApi } from './api/client';
import { SHELL_APP_URL, storeAuth, getStoredAuth, Logger } from '@3asoftwares/utils/client';
import { useTokenValidator } from './store/useTokenValidator';
import { Dashboard } from './pages/Dashboard';
import { SellerProducts } from './pages/SellerProducts';
import { SellerUpload } from './pages/SellerUpload';
import { SellerOrders } from './pages/SellerOrders';
import { SellerEarnings } from './pages/SellerEarnings';
import { SellerProfile } from './pages/SellerProfile';
import { VerifyEmail } from './pages/VerifyEmail';

function App() {
  const location = useLocation();
  const { isAuthenticated, user, hydrate, clearAuth, setAuthData } = useSellerAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Check if current route is verify-email (public route)
  const isPublicRoute = location.pathname === '/verify-email';

  // Periodically validate token to implement sliding expiration
  useTokenValidator();

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
          const response = await authApi.getUserById(userId);
          const authData = response?.data || response;

          if (authData && authData.user) {
            const { user, accessToken, refreshToken, tokenExpiry } = authData;
            if (user.role !== 'seller') {
              clearAuth();
              return;
            }

            storeAuth({
              user,
              accessToken,
              refreshToken,
              expiresIn: tokenExpiry,
            });

            setAuthData(user, accessToken);

            window.history.replaceState({}, document.title, window.location.pathname);
            setIsLoading(false);
            return;
          } else {
            clearAuth();
            return;
          }
        }

        hydrate();
        setIsLoading(false);

        const storedAuth = getStoredAuth();

        if (!storedAuth || !storedAuth.user || !storedAuth.token) {
          setTimeout(() => {
            window.location.href = process.env.VITE_SHELL_APP_URL || SHELL_APP_URL;
          }, 500);
        }
      } catch (error) {
        Logger.error('Auth initialization failed', error, 'App');
        clearAuth();
      }
    };

    initAuth();
  }, [hydrate, clearAuth, setAuthData, isPublicRoute]);

  // Render public routes without auth check
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && (
        <Header
          appName="Seller Portal"
          onLogout={() => clearAuth()}
          user={user ? { name: user.name } : undefined}
        />
      )}

      <div className="flex">
        {isAuthenticated && <Sidebar />}

        <div
          className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''} ${
            isAuthenticated ? 'mt-[69px]' : ''
          }`}
        >
          {isAuthenticated ? (
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <SellerProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/new"
                element={
                  <ProtectedRoute>
                    <SellerUpload />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <SellerOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/earnings"
                element={
                  <ProtectedRoute>
                    <SellerEarnings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <SellerProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Redirecting to login...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
