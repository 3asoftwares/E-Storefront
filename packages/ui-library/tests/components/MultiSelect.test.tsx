import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../src/test-utils';
import userEvent from '@testing-library/user-event';
import { MultiSelect } from '../../src/components/MultiSelect/MultiSelect';

const mockOptions = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
  { value: '4', label: 'Option 4', disabled: true },
];

describe('MultiSelect', () => {
  it('renders multiselect component', () => {
    render(<MultiSelect options={mockOptions} />);
    expect(screen.getByText('Select options')).toBeInTheDocument();
  });

  it('displays custom placeholder', () => {
    render(<MultiSelect options={mockOptions} placeholder="Choose items" />);
    expect(screen.getByText('Choose items')).toBeInTheDocument();
  });

  it('shows selected values as badges', () => {
    render(<MultiSelect options={mockOptions} value={['1', '2']} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', async () => {
    render(<MultiSelect options={mockOptions} />);
    const container = screen.getByText('Select options').parentElement;
    await userEvent.click(container!);
    
    const allOption1 = screen.getAllByText('Option 1');
    expect(allOption1.length).toBeGreaterThan(0);
  });

  it('calls onChange when option is selected', async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={mockOptions} onChange={onChange} />);
    const container = screen.getByText('Select options').parentElement;
    await userEvent.click(container!);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalled();
  });

  it('removes value when badge close button is clicked', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={mockOptions} value={['1', '2']} onChange={onChange} />);

    // The close buttons are ghost buttons inside the selected badges
    const closeBadgeButtons = screen.getAllByRole('button');
    fireEvent.click(closeBadgeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(['2']);
  });

  it('applies correct size classes', () => {
    const { rerender, container } = render(<MultiSelect options={mockOptions} size="sm" />);
    // Responsive classes: px-2 sm:px-3 py-1.5 text-xs sm:text-sm
    expect(container.firstChild?.firstChild).toHaveClass('px-2', 'sm:px-3', 'py-1.5', 'text-xs', 'sm:text-sm');

    rerender(<MultiSelect options={mockOptions} size="md" />);
    // Responsive classes: px-3 sm:px-4 py-2 text-sm sm:text-base
    expect(container.firstChild?.firstChild).toHaveClass('px-3', 'sm:px-4', 'py-2', 'text-sm', 'sm:text-base');

    rerender(<MultiSelect options={mockOptions} size="lg" />);
    // Responsive classes: px-4 sm:px-5 py-2.5 sm:py-3 text-base sm:text-lg
    expect(container.firstChild?.firstChild).toHaveClass('px-4', 'sm:px-5', 'py-2.5', 'sm:py-3', 'text-base', 'sm:text-lg');
  });

  it('applies correct variant classes', () => {
    const { rerender, container } = render(<MultiSelect options={mockOptions} variant="outline" />);
    expect(container.firstChild?.firstChild).toHaveClass('border-2', 'border-gray-300', 'bg-white');

    rerender(<MultiSelect options={mockOptions} variant="filled" />);
    expect(container.firstChild?.firstChild).toHaveClass('border-0', 'bg-gray-100');

    rerender(<MultiSelect options={mockOptions} variant="underline" />);
    expect(container.firstChild?.firstChild).toHaveClass('border-0', 'border-b-2');
  });

  it('disables component when disabled prop is true', () => {
    const { container } = render(<MultiSelect options={mockOptions} disabled />);
    expect(container.firstChild?.firstChild).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('applies error styling', () => {
    const { container } = render(<MultiSelect options={mockOptions} error />);
    expect(container.firstChild?.firstChild).toHaveClass('border-red-500');
  });

  it('disables specific options', async () => {
    render(<MultiSelect options={mockOptions} />);
    const container = screen.getByText('Select options').parentElement;
    await userEvent.click(container!);

    const checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxes[3]).toBeDisabled();
  });

  it('applies custom className', () => {
    const { container } = render(<MultiSelect options={mockOptions} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('toggles selected values correctly', async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={mockOptions} value={['1']} onChange={onChange} />);

    expect(screen.getByText('Option 1')).toBeInTheDocument();

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('does not open dropdown when disabled', async () => {
    render(<MultiSelect options={mockOptions} disabled />);
    const container = screen.getByText('Select options').parentElement;
    await userEvent.click(container!);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
