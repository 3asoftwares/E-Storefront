import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSellerAuthStore } from '../store/authStore';
import { Button } from '@3asoftwares/ui-library';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faBoxes,
  faShoppingCart,
  faMoneyBillWave,
  faUser,
  faBars,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, clearAuth } = useSellerAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const getLinkClass = (path: string) => {
    const base = 'flex items-center px-4 py-3 rounded-lg transition-all duration-200';
    return isActive(path)
      ? `${base} bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold shadow-md`
      : `${base} text-gray-700 hover:bg-gray-100`;
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: faChartLine },
    { path: '/products', label: 'My Products', icon: faBoxes },
    { path: '/orders', label: 'Orders', icon: faShoppingCart },
    { path: '/earnings', label: 'Earnings', icon: faMoneyBillWave },
    { path: '/profile', label: 'Profile', icon: faUser },
  ];

  return (
    <>
      <Button
        size="sm"
        variant={isOpen ? 'ghost' : 'outline'}
        onClick={() => setIsOpen(!isOpen)}
        className={`!w-auto fixed  ${
          isOpen ? 'top-4 left-48' : 'top-[86px] left-4'
        } z-50 lg:hidden`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="w-5 h-5 text-gray-700" />
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 lg:top-[72px] h-screen lg:h-[calc(100vh_-_72px)] bg-white border-r border-gray-200 
          shadow-lg z-40 transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-64 lg:translate-x-0'}
        `}
      >
        <div className="w-64 h-full flex flex-col p-4">
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={getLinkClass(item.path)}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white font-bold text-lg shadow">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{user?.name || 'Seller'}</h3>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'seller'}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Button
              size="md"
              variant="outline"
              className="w-full"
              onClick={() => {
                clearAuth();
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};
