import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../src/test-utils';
import { Modal } from '../../src/components/Modal/Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('displays title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal', () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    const backdrop = container.querySelector('.fixed');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    fireEvent.click(screen.getByText('Content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides close button when showCloseButton is false', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
        <div>Content</div>
      </Modal>
    );
    expect(container.querySelector('button')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { rerender, container } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <div>Content</div>
      </Modal>
    );
    // Responsive classes: max-w-[95vw] sm:max-w-md
    expect(container.querySelector('.sm\\:max-w-md')).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="md">
        <div>Content</div>
      </Modal>
    );
    // Responsive classes: max-w-[95vw] sm:max-w-lg
    expect(container.querySelector('.sm\\:max-w-lg')).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        <div>Content</div>
      </Modal>
    );
    // Responsive classes: max-w-[95vw] sm:max-w-2xl
    expect(container.querySelector('.sm\\:max-w-2xl')).toBeInTheDocument();

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        <div>Content</div>
      </Modal>
    );
    // Responsive classes: max-w-[95vw] sm:max-w-4xl
    expect(container.querySelector('.sm\\:max-w-4xl')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <button>Custom Button</button>
        <p>Custom Text</p>
      </Modal>
    );
    expect(screen.getByText('Custom Button')).toBeInTheDocument();
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });
});
