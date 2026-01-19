import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../src/test-utils';
import { Button } from '../../src/components/Button/Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-800', 'hover:bg-gray-600', 'text-white');
  });

  it('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-white', 'hover:bg-gray-50', 'text-gray-900');

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-transparent',
      'hover:bg-gray-50',
      'text-gray-900'
    );

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole('button')).toHaveClass(
      'bg-transparent',
      'hover:bg-gray-100',
      'text-gray-900'
    );
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    // Responsive classes: text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5
    expect(screen.getByRole('button')).toHaveClass('text-xs', 'sm:text-sm', 'px-2', 'sm:px-3', 'py-1', 'sm:py-1.5');

    rerender(<Button size="md">Medium</Button>);
    // Responsive classes: text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5
    expect(screen.getByRole('button')).toHaveClass('text-sm', 'sm:text-base', 'px-3', 'sm:px-4', 'py-2', 'sm:py-2.5');

    rerender(<Button size="lg">Large</Button>);
    // Responsive classes: text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4
    expect(screen.getByRole('button')).toHaveClass('text-base', 'sm:text-lg', 'px-4', 'sm:px-6', 'py-3', 'sm:py-4');
  });

  it('handles onClick event', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows loading spinner when loading', () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies fullWidth class', () => {
    render(<Button fullWidth>Full Width</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });

  it('sets correct button type', () => {
    const { rerender } = render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');

    rerender(<Button type="reset">Reset</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset');

    rerender(<Button type="button">Button</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
