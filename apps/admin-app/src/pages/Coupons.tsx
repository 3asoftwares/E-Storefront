import React, { useState } from 'react';
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '../api/queries';
import {
  Button,
  Input,
  Modal,
  Table,
  Badge,
  Confirm,
  Spinner,
  ToasterBox,
  Textarea,
  Select,
} from '@3asoftwares/ui-library';
import type { CouponGraphQL as Coupon, CreateCouponInput } from '@3asoftwares/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const Coupons: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmCouponId, setConfirmCouponId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const { data, isLoading, refetch } = useCoupons(1, 10);
  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [formData, setFormData] = useState<CreateCouponInput>({
    code: '',
    description: '',
    discountType: 'percentage',
    discount: 0,
    minPurchase: undefined,
    maxDiscount: undefined,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: undefined,
  });

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discount: coupon.discount,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
        validFrom: coupon.validFrom.split('T')[0],
        validTo: coupon.validTo.split('T')[0],
        usageLimit: coupon.usageLimit,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discount: 0,
        minPurchase: undefined,
        maxDiscount: undefined,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await updateCoupon.mutateAsync({ id: editingCoupon.id, input: formData });
        showToast('Coupon updated successfully', 'success');
      } else {
        await createCoupon.mutateAsync(formData);
        showToast('Coupon created successfully', 'success');
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      showToast('Failed to save coupon', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmCouponId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (confirmCouponId) {
      setIsDeleting(true);
      try {
        await deleteCoupon.mutateAsync(confirmCouponId);
        showToast('Coupon deleted successfully', 'success');
        refetch();
      } catch (error) {
        showToast('Failed to delete coupon', 'error');
      } finally {
        setIsDeleting(false);
        setConfirmOpen(false);
        setConfirmCouponId(null);
      }
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon.mutateAsync({
        id: coupon.id,
        input: {
          isActive: !coupon.isActive,
        },
      });
      showToast(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated', 'success');
      refetch();
    } catch (error) {
      showToast('Failed to update coupon status', 'error');
    }
  };

  const columns = [
    {
      key: 'code',
      header: 'Coupon Code',
      render: (coupon: Coupon) => (
        <span className="font-mono font-bold text-gray-900 dark:text-white">{coupon.code}</span>
      ),
    },
    { key: 'description', header: 'Description' },
    {
      key: 'discount',
      header: 'Discount',
      render: (coupon: Coupon) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {coupon.discountType === 'percentage' ? `${coupon.discount}%` : `$${coupon.discount}`}
        </span>
      ),
    },
    {
      key: 'validFrom',
      header: 'Valid Period',
      render: (coupon: Coupon) => (
        <div className="text-sm">
          <p>{new Date(coupon.validFrom).toLocaleDateString()}</p>
          <p className="text-gray-500 dark:text-gray-400">
            to {new Date(coupon.validTo).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'usage',
      header: 'Usage',
      render: (coupon: Coupon) => (
        <span className="text-sm">
          {coupon.usageCount} / {coupon.usageLimit || '∞'}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (coupon: Coupon) => (
        <Badge variant={coupon.isActive ? 'success' : 'error'}>
          {coupon.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (coupon: Coupon) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenModal(coupon)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant={coupon.isActive ? 'secondary' : 'primary'}
            onClick={() => handleToggleActive(coupon)}
          >
            {coupon.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleDelete(coupon.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
          Offers & Coupons Management
        </h1>
        <Button className="!w-auto" onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          Create Coupon
        </Button>
      </div>

      {data?.coupons && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Coupons
            </h3>
            <p className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
              {data.coupons.pagination.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Active Coupons
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {data.coupons.coupons.filter((c: Coupon) => c.isActive).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Total Redemptions
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {data.coupons.coupons.reduce((sum: number, c: Coupon) => sum + c.usageCount, 0)}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {data?.coupons?.coupons && data.coupons.coupons.length > 0 ? (
              <Table data={data.coupons.coupons} columns={columns} />
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">No coupons created yet</p>
                <Button className="!w-auto" onClick={() => handleOpenModal()}>
                  Create Your First Coupon
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
      >
        <div className="bg-white dark:bg-gray-800 overflow-hidden">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Coupon Code"
              value={formData.code}
              onChange={(e: any) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g., SUMMER2024"
              required
            />
            <Textarea
              label="Description"
              required
              rows={2}
              value={formData.description}
              onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Discount Type"
                value={formData.discountType}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    discountType: e.target.value as 'percentage' | 'fixed',
                  })
                }
                options={[
                  { value: 'percentage', label: 'Percentage' },
                  { value: 'fixed', label: 'Fixed Amount' },
                ]}
              />
              <Input
                label="Discount Value"
                type="number"
                step="0.01"
                value={formData.discount}
                onChange={(e: any) =>
                  setFormData({ ...formData, discount: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Order Value"
                type="number"
                step="0.01"
                value={formData.minPurchase || ''}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    minPurchase: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="Optional"
              />
              <Input
                label="Max Discount"
                type="number"
                step="0.01"
                value={formData.maxDiscount || ''}
                onChange={(e: any) =>
                  setFormData({
                    ...formData,
                    maxDiscount: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="Optional"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Valid From"
                type="date"
                value={formData.validFrom}
                onChange={(e: any) => setFormData({ ...formData, validFrom: e.target.value })}
                required
              />
              <Input
                label="Valid To"
                type="date"
                value={formData.validTo}
                onChange={(e: any) => setFormData({ ...formData, validTo: e.target.value })}
                required
              />
            </div>
            <Input
              label="Usage Limit"
              type="number"
              value={formData.usageLimit || ''}
              onChange={(e: any) =>
                setFormData({
                  ...formData,
                  usageLimit: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Unlimited if empty"
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCoupon.isPending || updateCoupon.isPending}>
                {createCoupon.isPending || updateCoupon.isPending
                  ? 'Saving...'
                  : editingCoupon
                  ? 'Update'
                  : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <Confirm
        open={confirmOpen}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon?"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmCouponId(null);
        }}
        loading={isDeleting}
        loadingText="Deleting..."
      />
    </div>
  );
};
