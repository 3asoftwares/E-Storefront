import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../src/test-utils';
import { Header } from '../../src/components/Header/Header';

describe('Header', () => {
  it('renders logo and title', () => {
    render(<Header />);
    expect(screen.getByRole('img', { name: '3A Softwares' })).toBeInTheDocument();
    expect(screen.getByText('3A Softwares')).toBeInTheDocument();
  });

  it('shows login buttons when no user', () => {
    render(<Header onLogin={vi.fn()} onCreateAccount={vi.fn()} />);
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows user avatar when user is logged in', () => {
    const user = { name: 'John Doe' };
    render(<Header user={user} onLogout={vi.fn()} />);
    // User avatar button should be present
    expect(screen.getByLabelText('User menu')).toBeInTheDocument();
  });

  it('calls onLogin when login button is clicked', () => {
    const handleLogin = vi.fn();
    render(<Header onLogin={handleLogin} />);
    fireEvent.click(screen.getByText('Log In'));
    expect(handleLogin).toHaveBeenCalledTimes(1);
  });

  it('shows logout option in user dropdown', () => {
    const handleLogout = vi.fn();
    const user = { name: 'John Doe' };
    render(<Header user={user} onLogout={handleLogout} />);
    // Open user dropdown
    fireEvent.click(screen.getByLabelText('User menu'));
    // Logout button should be visible in dropdown (text is "Log Out" with space)
    expect(screen.getByText('Log Out')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Log Out'));
    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateAccount when sign up button is clicked', () => {
    const handleCreateAccount = vi.fn();
    render(<Header onCreateAccount={handleCreateAccount} />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(handleCreateAccount).toHaveBeenCalledTimes(1);
  });

  it('does not show login buttons when user is logged in', () => {
    const user = { name: 'John Doe' };
    render(<Header user={user} />);
    expect(screen.queryByText('Log In')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Up')).not.toBeInTheDocument();
  });

  it('does not show user menu when no user', () => {
    render(<Header />);
    expect(screen.queryByLabelText('User menu')).not.toBeInTheDocument();
  });
});
