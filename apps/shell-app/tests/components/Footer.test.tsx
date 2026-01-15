import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the i18n context
jest.mock('../../src/i18n/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'footer.copyright': `© ${params?.year || '2025'} 3A Softwares. All rights reserved.`,
        'footer.privacy': 'Privacy',
        'footer.terms': 'Terms',
        'footer.help': 'Help',
      };
      return translations[key] || key;
    },
    locale: 'en',
    setLocale: jest.fn(),
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { Footer } from '../../src/components/Footer';

describe('Footer Component', () => {
  it('should render the footer', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should display copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2026 3A Softwares/i)).toBeInTheDocument();
  });

  it('should display all rights reserved', () => {
    render(<Footer />);
    expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
  });

  it('should have privacy link', () => {
    render(<Footer />);
    const privacyLink = screen.getByRole('link', { name: /privacy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('should have terms link', () => {
    render(<Footer />);
    const termsLink = screen.getByRole('link', { name: /terms/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute('href', '/terms');
  });

  it('should have help link', () => {
    render(<Footer />);
    const helpLink = screen.getByRole('link', { name: /help/i });
    expect(helpLink).toBeInTheDocument();
    expect(helpLink).toHaveAttribute('href', '/help');
  });

  it('should apply dark mode classes', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('dark:bg-neutral-900');
  });
});
