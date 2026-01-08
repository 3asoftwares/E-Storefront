import React, { useState } from 'react';
import { useUsers, useDeleteUser, useUpdateUserRole } from '../api/queries';
import {
  Button,
  Table,
  Badge,
  Spinner,
  Pagination,
  Input,
  Select,
  Confirm,
  ToasterBox,
} from '@3asoftwares/ui-library';
import type { UserGraphQL as User } from '@3asoftwares/types';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const Users: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUserId, setConfirmUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  // Reset page to 1 when search term changes (with debounce)
  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Use server-side filtering with search and role
  const debouncedSearch = searchTerm;
  const { data, isLoading, refetch } = useUsers(
    page,
    10,
    debouncedSearch || undefined,
    roleFilter !== 'all' ? roleFilter : undefined
  );
  const deleteUser = useDeleteUser();
  const updateUserRole = useUpdateUserRole();

  // Reset page to 1 when role filter changes
  const handleRoleFilterChange = (newRole: string) => {
    setRoleFilter(newRole);
    setPage(1);
  };

  const handleDelete = async (userId: string) => {
    setConfirmUserId(userId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmUserId) {
      setIsDeleting(true);
      try {
        await deleteUser.mutateAsync(confirmUserId);
        showToast('User deleted successfully', 'success');
        refetch();
      } catch (error) {
        showToast('Failed to delete user', 'error');
      } finally {
        setIsDeleting(false);
        setConfirmOpen(false);
        setConfirmUserId(null);
      }
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole.mutateAsync({ id: userId, role: newRole });
      showToast(`User role changed to ${newRole}`, 'success');
      refetch();
    } catch (error) {
      showToast('Failed to update user role', 'error');
    }
  };

  // Get users directly from server (server-side filtering and pagination)
  const users = data?.users.users || [];
  const totalPages = data?.users.pagination.pages || 1;

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <Select
          value={user.role}
          onChange={(val: any) => handleRoleChange(user.id, val as string)}
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'seller', label: 'Seller' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (user: User) => (
        <Badge variant={user.isActive ? 'success' : 'error'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'emailVerified',
      header: 'Email',
      render: (user: User) => (
        <Badge variant={user.emailVerified ? 'success' : 'warning'}>
          {user.emailVerified ? 'Verified' : 'Unverified'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (user: User) => (
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
          {user.lastLogin && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Last: {new Date(user.lastLogin).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDelete(user.id)}
            disabled={user.role === 'admin'}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast.show && (
        <ToasterBox
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'info' })}
        />
      )}
      <div className="flex justify-between items-center">
        <h1 className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
          User & Role Management
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Users</h3>
          <p className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
            {data?.users.pagination.total || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Admins</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {data?.users.pagination.adminCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Sellers</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {data?.users.pagination.sellerCount || 0}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Customers</h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {data?.users.pagination.customerCount || 0}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1"
        />
        <Select
          value={roleFilter}
          onChange={handleRoleFilterChange}
          options={[
            { value: 'all', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            { value: 'seller', label: 'Seller' },
            { value: 'customer', label: 'Customer' },
          ]}
          className="w-48"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Table data={users} columns={columns} />
      </div>

      {totalPages > 0 && (
        <div className="flex justify-center">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Confirm
        open={confirmOpen}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmUserId(null);
        }}
        loading={isDeleting}
        loadingText="Deleting..."
      />
    </div>
  );
};
