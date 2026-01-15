import { describe, it, expect } from 'vitest';
import { UserRole } from '../../src/enums/userRole';

describe('UserRole Enum', () => {
  it('should have CUSTOMER role', () => {
    expect(UserRole.CUSTOMER).toBe('customer');
  });

  it('should have SELLER role', () => {
    expect(UserRole.SELLER).toBe('seller');
  });

  it('should have ADMIN role', () => {
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should have SUPPORT role', () => {
    expect(UserRole.SUPPORT).toBe('support');
  });

  it('should have SUPER_ADMIN role', () => {
    expect(UserRole.SUPER_ADMIN).toBe('super_admin');
  });

  it('should contain exactly 5 roles', () => {
    const roleCount = Object.keys(UserRole).length;
    expect(roleCount).toBe(5);
  });

  it('should have all roles as lowercase strings', () => {
    Object.values(UserRole).forEach((role) => {
      expect(role).toBe(role.toLowerCase());
    });
  });
});
