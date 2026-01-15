import React, { useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { useAppSelector } from '../store/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUsers,
  faBox,
  faShoppingCart,
  faTicket,
  faBars,
  IconDefinition,
  faUserCircle,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faHeadset,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@3asoftwares/ui';
import { SUPPORT_APP_URL } from '@3asoftwares/utils/client';

const SUPPORT_URL = process.env.REACT_APP_SUPPORT_APP_URL || SUPPORT_APP_URL;

interface NavItem {
  path: string;
  icon: IconDefinition;
  label: string;
  isExternal?: boolean;
}

const staticNavItems: NavItem[] = [
  { path: '/', icon: faChartLine, label: 'Dashboard' },
  { path: '/users', icon: faUsers, label: 'Users' },
  { path: '/products', icon: faBox, label: 'Products' },
  { path: '/orders', icon: faShoppingCart, label: 'Orders' },
  { path: '/coupons', icon: faTicket, label: 'Coupons' },
  { path: '/profile', icon: faUserCircle, label: 'Profile' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const user = useAppSelector((state) => state.auth.user);

  // Generate nav items with dynamic user ID for Support Portal
  const navItems = useMemo<NavItem[]>(() => {
    const userId = user?._id || user?.id || '';
    return [
      ...staticNavItems,
      {
        path: `${SUPPORT_URL}?userId=${userId}`,
        icon: faHeadset,
        label: 'Support Portal',
        isExternal: true
      },
    ];
  }, [user]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024 && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 1024) {
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, toggleSidebar]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <>
      {!sidebarOpen && (
        <Button
          size="sm"
          variant={sidebarOpen ? 'ghost' : 'outline'}
          onClick={toggleSidebar}
          className={`!w-auto fixed bg-white  ${
            sidebarOpen ? 'top-4 left-48' : 'top-[98px] left-4'
          } z-50 lg:hidden`}
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <FontAwesomeIcon
            icon={sidebarOpen ? faTimes : faBars}
            className="w-5 h-5 text-gray-700"
          />
        </Button>
      )}
      <div
        className={`lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />
      <aside
        className={`
          fixed top-0 lg:top-[72px] left-0 z-40 h-screen lg:h-[calc(100vh-72px)] bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800 
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'w-64' : 'w-0 lg:w-20'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={`p-4 border-b border-gray-100 dark:border-gray-800 ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Navigation</p>
                  </div>
                </div>
              )}
              <Button variant="outline" className="!w-auto" size="md" onClick={toggleSidebar}>
                <FontAwesomeIcon
                  icon={sidebarOpen ? faChevronLeft : faChevronRight}
                  className="w-3 h-3 text-gray-600 dark:text-gray-400"
                />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-3 p-3 overflow-y-auto">
            <ul
              className={`flex flex-col ${
                sidebarOpen ? 'justify-center' : 'justify-start items-center'
              } space-y-2`}
            >
              {navItems.map((item) => {
                const isActive = !item.isExternal && location.pathname === item.path;
                const linkClassName = `
                  group flex items-center gap-3 w-10 h-10 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }
                  ${!sidebarOpen ? 'lg:justify-center lg:px-0' : 'w-full'}
                `;
                const iconSpanClassName = `
                  flex items-center justify-center w-10 h-10 rounded-lg transition-colors
                  ${isActive
                    ? 'bg-white/20'
                    : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                  }
                  ${!sidebarOpen ? 'lg:bg-transparent lg:dark:bg-transparent' : ''}
                `;

                const linkContent = (
                  <>
                    <span className={iconSpanClassName}>
                      <FontAwesomeIcon
                        icon={item.icon}
                        className={`w-5 h-5 ${isActive ? 'text-white' : ''}`}
                      />
                    </span>
                    {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                  </>
                );

                return (
                  <li key={item.path}>
                    {item.isExternal ? (
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClassName}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        {linkContent}
                      </a>
                    ) : (
                      <Link
                        to={item.path}
                        className={linkClassName}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        {linkContent}
                        </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          {sidebarOpen && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  E-Commerce Admin
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">v1.0.0</p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
