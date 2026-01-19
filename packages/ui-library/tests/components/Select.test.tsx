import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../src/test-utils';
import { Select } from '../../src/components/Select/Select';

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3', disabled: true },
];

describe('Select', () => {
  it('renders select trigger button', () => {
    render(<Select options={mockOptions} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('displays placeholder', () => {
    render(<Select options={mockOptions} placeholder="Select option" />);
    expect(screen.getByText('Select option')).toBeInTheDocument();
  });

  it('shows options when clicked', () => {
    render(<Select options={mockOptions} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Select options={mockOptions} onChange={handleChange} />);
    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    // Click option
    fireEvent.click(screen.getByText('Option 1'));
    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('displays selected value', () => {
    render(<Select options={mockOptions} value="2" />);
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('applies correct size classes to trigger button', () => {
    const { rerender } = render(<Select options={mockOptions} size="sm" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('min-h-[36px]');

    rerender(<Select options={mockOptions} size="md" />);
    expect(screen.getByRole('button')).toHaveClass('min-h-[40px]');

    rerender(<Select options={mockOptions} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('min-h-[48px]');
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Select options={mockOptions} variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('border-2');

    rerender(<Select options={mockOptions} variant="filled" />);
    expect(screen.getByRole('button')).toHaveClass('border-0');
  });

  it('disables select when disabled prop is true', () => {
    render(<Select options={mockOptions} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies error styling', () => {
    render(<Select options={mockOptions} error />);
    expect(screen.getByRole('button')).toHaveClass('border-red-600');
  });

  it('closes dropdown when option is selected', () => {
    render(<Select options={mockOptions} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Option 1'));
    // After selection, dropdown should close - options should not be visible
    expect(screen.queryAllByRole('button').length).toBe(1); // Only trigger button remains
  });

  it('applies custom className', () => {
    render(<Select options={mockOptions} className="custom-class" />);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
