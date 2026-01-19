import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '../../src/test-utils';
import { Badge } from '../../src/components/Badge/Badge';

describe('Badge', () => {
  it('renders children correctly', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-900');
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100', 'text-green-900');

    rerender(<Badge variant="error">Error</Badge>);
    expect(screen.getByText('Error')).toHaveClass('bg-red-100', 'text-red-900');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100', 'text-yellow-900');

    rerender(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('bg-cyan-100', 'text-cyan-900');

    rerender(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-100', 'text-gray-900');
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    // Responsive classes: px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs
    expect(screen.getByText('Small')).toHaveClass('px-1.5', 'sm:px-2', 'py-0.5', 'text-[10px]', 'sm:text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    // Responsive classes: px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm
    expect(screen.getByText('Medium')).toHaveClass('px-2', 'sm:px-3', 'py-0.5', 'sm:py-1', 'text-xs', 'sm:text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    // Responsive classes: px-3 sm:px-4 py-1 sm:py-1.5 text-sm sm:text-base
    expect(screen.getByText('Large')).toHaveClass('px-3', 'sm:px-4', 'py-1', 'sm:py-1.5', 'text-sm', 'sm:text-base');
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('custom-class');
  });

  it('renders as span element', () => {
    const { container } = render(<Badge>Badge</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('includes base classes', () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('inline-flex', 'items-center', 'font-bold', 'rounded-full');
  });
});
