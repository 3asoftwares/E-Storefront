import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../src/test-utils';
import userEvent from '@testing-library/user-event';
import { Input } from '../../src/components/Input/Input';

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('displays label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('displays error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(<Input helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender, container } = render(<Input size="sm" />);
    // Responsive classes: text-xs sm:text-sm px-2 sm:px-3 py-1.5
    expect(container.querySelector('input')).toHaveClass('text-xs', 'sm:text-sm', 'px-2', 'sm:px-3', 'py-1.5');

    rerender(<Input size="md" />);
    // Responsive classes: text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-2.5
    expect(container.querySelector('input')).toHaveClass('text-sm', 'sm:text-base', 'px-3', 'sm:px-4', 'py-2', 'sm:py-2.5');

    rerender(<Input size="lg" />);
    // Responsive classes: text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4
    expect(container.querySelector('input')).toHaveClass('text-base', 'sm:text-lg', 'px-4', 'sm:px-6', 'py-3', 'sm:py-4');
  });

  it('applies fullWidth class when fullWidth is true', () => {
    const { container } = render(<Input fullWidth />);
    expect(container.querySelector('div')).toHaveClass('w-full');
  });

  it('applies error styling when error prop is provided', () => {
    const { container } = render(<Input error="Error message" />);
    expect(container.querySelector('input')).toHaveClass('border-red-500');
  });

  it('disables input when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('applies disabled styling', () => {
    const { container } = render(<Input disabled />);
    expect(container.querySelector('input')).toHaveClass('bg-gray-100', 'cursor-not-allowed');
  });

  it('renders left icon', () => {
    const { container } = render(<Input leftIcon={<span>Icon</span>} />);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('renders right icon', () => {
    const { container } = render(<Input rightIcon={<span>Icon</span>} />);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('handles onChange event', async () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Input ref={ref as any} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(<Input className="custom-class" />);
    expect(container.querySelector('div')).toHaveClass('custom-class');
  });

  it('passes additional HTML attributes', () => {
    render(<Input type="email" name="email" placeholder="Email" />);
    const input = screen.getByPlaceholderText('Email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('name', 'email');
  });
});
