import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../src/store/authSlice';

// Mock window resize
const mockWindowInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    value: width,
  });
};

// Mock the UI store
const mockToggleSidebar = jest.fn();

jest.mock('../../src/store/uiStore', () => ({
  useUIStore: jest.fn(() => ({
    sidebarOpen: true,
    toggleSidebar: mockToggleSidebar,
  })),
}));

// Import component after mocking
import { Sidebar } from '../../src/components/Sidebar';
import { useUIStore } from '../../src/store/uiStore';

// Create test store helper
const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: { _id: 'test-user-id', email: 'test@example.com', role: 'admin' },
        isAuthenticated: true,
        loading: false,
        error: null,
      },
      ...preloadedState,
    },
  });

describe('Admin Sidebar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowInnerWidth(1024);
    document.body.style.overflow = '';
    (useUIStore as any).mockReturnValue({
      sidebarOpen: true,
      toggleSidebar: mockToggleSidebar,
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  const renderSidebar = (initialRoute = '/') => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Sidebar />
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Navigation Links', () => {
    it('should render all navigation links', () => {
      renderSidebar();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Coupons')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should have correct hrefs for navigation links', () => {
      renderSidebar();

      expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
      expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/users');
      expect(screen.getByText('Products').closest('a')).toHaveAttribute('href', '/products');
      expect(screen.getByText('Orders').closest('a')).toHaveAttribute('href', '/orders');
      expect(screen.getByText('Coupons').closest('a')).toHaveAttribute('href', '/coupons');
      expect(screen.getByText('Profile').closest('a')).toHaveAttribute('href', '/profile');
    });
  });

  describe('Toggle Button', () => {
    it('should render toggle button', () => {
      renderSidebar();

      // Multiple buttons have mock-button testid, use getAllByTestId
      const toggleButtons = screen.getAllByTestId('mock-button');
      expect(toggleButtons.length).toBeGreaterThan(0);
      expect(toggleButtons[0]).toBeInTheDocument();
    });

    it('should call toggleSidebar when button is clicked', () => {
      renderSidebar();

      // Use first toggle button (the mobile close button or sidebar collapse)
      const toggleButtons = screen.getAllByTestId('mock-button');
      fireEvent.click(toggleButtons[0]);

      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sidebar Open State', () => {
    it('should have correct classes when sidebar is open', () => {
      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('should have correct classes when sidebar is closed', () => {
      (useUIStore as any).mockReturnValue({
        sidebarOpen: false,
        toggleSidebar: mockToggleSidebar,
      });

      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('w-0');
      expect(sidebar).toHaveClass('-translate-x-full');
    });
  });

  describe('Mobile Behavior', () => {
    beforeEach(() => {
      mockWindowInnerWidth(768);
    });

    it('should show overlay when sidebar is open on mobile', () => {
      renderSidebar();

      const overlay = document.querySelector('.backdrop-blur-sm');
      expect(overlay).toHaveClass('opacity-100');
    });

    it('should hide overlay when sidebar is closed', () => {
      (useUIStore as any).mockReturnValue({
        sidebarOpen: false,
        toggleSidebar: mockToggleSidebar,
      });

      renderSidebar();

      const overlay = document.querySelector('.backdrop-blur-sm');
      expect(overlay).toHaveClass('opacity-0');
    });

    it('should call toggleSidebar when overlay is clicked', () => {
      renderSidebar();

      const overlay = document.querySelector('.backdrop-blur-sm') as HTMLElement;
      fireEvent.click(overlay);

      expect(mockToggleSidebar).toHaveBeenCalled();
    });

    it('should close sidebar on Escape key', () => {
      renderSidebar();

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockToggleSidebar).toHaveBeenCalled();
    });
  });

  describe('Desktop Behavior', () => {
    beforeEach(() => {
      mockWindowInnerWidth(1280);
    });

    it('should show collapsed sidebar when closed on desktop', () => {
      (useUIStore as any).mockReturnValue({
        sidebarOpen: false,
        toggleSidebar: mockToggleSidebar,
      });

      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('lg:w-20');
      expect(sidebar).toHaveClass('lg:translate-x-0');
    });

    it('should not close sidebar on Escape key when on desktop', () => {
      mockWindowInnerWidth(1280);
      renderSidebar();

      fireEvent.keyDown(window, { key: 'Escape' });

      // toggleSidebar should not be called on desktop
      expect(mockToggleSidebar).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have overlay with aria-hidden attribute', () => {
      renderSidebar();

      const overlay = document.querySelector('.backdrop-blur-sm');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Fixed Positioning', () => {
    it('should be fixed positioned below header', () => {
      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('fixed');
      expect(sidebar).toHaveClass('lg:top-[72px]');
      expect(sidebar).toHaveClass('left-0');
    });

    it('should have correct height calculation', () => {
      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('lg:h-[calc(100vh-72px)]');
    });
  });
});
