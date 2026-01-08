import React, { useState } from 'react';
import {
  useOrders,
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
  useCancelOrder,
  useOrder,
} from '../api/queries';
import {
  Button,
  Modal,
  Badge,
  Table,
  Spinner,
  Pagination,
  Select,
  Confirm,
} from '@3asoftwares/ui-library';
import type { OrderGraphQL as Order, OrderStatus, PaymentStatus } from '@3asoftwares/types';
import { PaymentMethodReverse } from '@3asoftwares/types';
import { formatIndianCompact } from '@3asoftwares/utils';

export const Orders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const { data, isLoading, refetch } = useOrders(page, 10);
  const { data: orderDetail } = useOrder(selectedOrder || '');
  const updateOrderStatus = useUpdateOrderStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();
  const cancelOrder = useCancelOrder();

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status });
      refetch();
    } catch (error) {}
  };

  const handlePaymentStatusChange = async (id: string, status: PaymentStatus) => {
    try {
      await updatePaymentStatus.mutateAsync({ id, status });
      refetch();
    } catch (error) {}
  };

  const handleCancelOrder = async (id: string) => {
    setConfirmOrderId(id);
    setConfirmOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (confirmOrderId) {
      setIsCancelling(true);
      try {
        await cancelOrder.mutateAsync(confirmOrderId);
        refetch();
      } catch (error) {
      } finally {
        setIsCancelling(false);
        setConfirmOpen(false);
        setConfirmOrderId(null);
      }
    }
  };

  const handleViewDetails = (orderId: string) => {
    setSelectedOrder(orderId);
    setIsDetailModalOpen(true);
  };

  const orders = data?.orders.orders || [];
  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order: Order) => order.orderStatus.toLowerCase() === statusFilter);

  const columns = [
    {
      key: 'orderNumber',
      header: 'Order #',
      render: (order: Order) => (
        <span className="font-mono">#{order.orderNumber || order.id.substring(0, 8)}</span>
      ),
    },
    {
      key: 'customerEmail',
      header: 'Customer',
      render: (order: Order) => order.customerEmail,
    },
    {
      key: 'total',
      header: 'Total',
      render: (order: Order) => (
        <span className="font-semibold">{formatIndianCompact(order.total)}</span>
      ),
    },
    {
      key: 'orderStatus',
      header: 'Order Status',
      render: (order: Order) => (
        <Select
          value={order.orderStatus}
          onChange={(val: any) => handleStatusChange(order.id, val as OrderStatus)}
          options={[
            { value: 'PENDING', label: 'Pending' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'PROCESSING', label: 'Processing' },
            { value: 'SHIPPED', label: 'Shipped' },
            { value: 'DELIVERED', label: 'Delivered' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (order: Order) => (
        <Badge
          variant={
            order.paymentStatus === 'PAID'
              ? 'success'
              : order.paymentStatus === 'FAILED'
              ? 'error'
              : order.paymentStatus === 'REFUNDED'
              ? 'warning'
              : 'info'
          }
        >
          {order.paymentStatus}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (order: Order) => new Date(order.createdAt).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (order: Order) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleViewDetails(order.id)}>
            View
          </Button>
          {order.orderStatus !== 'CANCELLED' && (
            <Button size="sm" variant="outline" onClick={() => handleCancelOrder(order.id)}>
              Cancel
            </Button>
          )}
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
      <div className="flex justify-between items-center">
        <h1 className="ml-12 lg:ml-0 text-3xl font-bold text-gray-900 dark:text-white">
          Order Management
        </h1>
      </div>

      <div className="flex gap-4">
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'processing', label: 'Processing' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          className="w-48"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <Table data={filteredOrders} columns={columns} />
      </div>

      {data?.orders.pagination && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={data.orders.pagination.pages}
            onPageChange={setPage}
          />
        </div>
      )}

      <Modal
        title="Order Details"
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      >
        {orderDetail && orderDetail.order ? (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Order #{orderDetail.order.orderNumber || orderDetail.order.id.substring(0, 8)}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(orderDetail.order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge
                variant={
                  orderDetail.order.orderStatus === 'DELIVERED'
                    ? 'success'
                    : orderDetail.order.orderStatus === 'CANCELLED'
                    ? 'error'
                    : 'info'
                }
              >
                {orderDetail.order.orderStatus}
              </Badge>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
              <div className="space-y-2">
                {orderDetail.order.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Qty: {item.quantity} × {formatIndianCompact(item.price)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatIndianCompact(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>{formatIndianCompact(orderDetail.order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Tax:</span>
                  <span>{formatIndianCompact(orderDetail.order.tax)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Shipping:</span>
                  <span>{formatIndianCompact(orderDetail.order.shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                  <span>Discount:</span>
                  <span>{formatIndianCompact(orderDetail.order.discount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total:</span>
                  <span>{formatIndianCompact(orderDetail.order.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Payment Method:</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {PaymentMethodReverse[orderDetail.order.paymentMethod]}
                </p>
              </div>
              <Select
                value={orderDetail.order.paymentStatus as PaymentStatus}
                onChange={(val: any) =>
                  handlePaymentStatusChange(orderDetail.order.id, val as PaymentStatus)
                }
                options={[
                  { value: 'PENDING', label: 'PENDING' },
                  { value: 'PROCESSING', label: 'PROCESSING' },
                  { value: 'PAID', label: 'PAID' },
                  { value: 'COMPLETED', label: 'COMPLETED' },
                  { value: 'FAILED', label: 'FAILED' },
                  { value: 'PARTIALLY_REFUNDED', label: 'PARTIALLY_REFUNDED' },
                  { value: 'REFUNDED', label: 'REFUNDED' },
                ]}
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Customer Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Shipping Address:
                <br />
                {orderDetail.order.shippingAddress.street}
                <br />
                {orderDetail.order.shippingAddress.city}, {orderDetail.order.shippingAddress.state}{' '}
                {orderDetail.order.shippingAddress.zip}
                <br />
                {orderDetail.order.shippingAddress.country}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        )}
      </Modal>

      <Confirm
        open={confirmOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        confirmText="Cancel Order"
        cancelText="Back"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmOrderId(null);
        }}
        loading={isCancelling}
        loadingText="Cancelling..."
      />
    </div>
  );
};
