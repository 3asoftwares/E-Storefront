import { describe, it, expect } from 'vitest';
import { render, screen } from '../../src/test-utils';
import { Spinner } from '../../src/components/Spinner/Spinner';

describe('Spinner', () => {
  it('renders spinner', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(<Spinner size="sm" />);
    // Responsive classes: w-4 h-4 sm:w-5 sm:h-5
    expect(container.querySelector('svg')).toHaveClass('w-4', 'h-4', 'sm:w-5', 'sm:h-5');

    rerender(<Spinner size="md" />);
    // Responsive classes: w-6 h-6 sm:w-8 sm:h-8
    expect(container.querySelector('svg')).toHaveClass('w-6', 'h-6', 'sm:w-8', 'sm:h-8');

    rerender(<Spinner size="lg" />);
    // Responsive classes: w-10 h-10 sm:w-12 sm:h-12
    expect(container.querySelector('svg')).toHaveClass('w-10', 'h-10', 'sm:w-12', 'sm:h-12');

    rerender(<Spinner size="xl" />);
    // Responsive classes: w-12 h-12 sm:w-16 sm:h-16
    expect(container.querySelector('svg')).toHaveClass('w-12', 'h-12', 'sm:w-16', 'sm:h-16');
  });

  it('applies custom className', () => {
    const { container } = render(<Spinner className="custom-class" />);
    expect(container.querySelector('svg')).toHaveClass('custom-class');
  });

  it('renders in fullScreen mode', () => {
    const { container } = render(<Spinner fullScreen />);
    expect(container.querySelector('.fixed')).toBeInTheDocument();
    expect(container.querySelector('.inset-0')).toBeInTheDocument();
  });

  it('renders inline by default', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('.fixed')).not.toBeInTheDocument();
  });

  it('has animate-spin class', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveClass('animate-spin');
  });

  it('has correct color class', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveClass('text-blue-600');
  });
});
