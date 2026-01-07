'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/lib/hooks';
import { Button } from '3a-ecommerce-ui-library';
import { formatPrice } from '3a-ecommerce-utils/client';
import { useCartStore } from '@/store/cartStore';
import {
  faClipboardList,
  faShoppingBag,
  faClock,
  faCheckCircle,
  faCog,
  faBox,
  faSmile,
  faTimesCircle,
  faClose,
} from '@fortawesome/free-solid-svg-icons';
import { PageHeader, EmptyState } from '@/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const isValidStatus = (status: string | undefined): status is OrderStatus => {
  return (
    status !== undefined &&
    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)
  );
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_ICONS = {
  pending: faClock,
  confirmed: faCheckCircle,
  processing: faCog,
  shipped: faBox,
  delivered: faSmile,
  cancelled: faTimesCircle,
};

export default function OrdersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { userProfile } = useCartStore();

  const { data, isLoading, error } = useOrders(page, 10, userProfile?.id);

  const orders = data?.orders || [];
  const totalPages = data?.pagination.pages || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Orders</h2>
            <p className="text-red-700 mb-4">Failed to load your orders. Please try again later.</p>
            <Button className="!no-underline" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={faClipboardList}
        title="My Orders"
        subtitle={`${orders.length} order(s) found`}
        iconGradient="from-gray-700 to-gray-900"
        titleGradient="from-gray-900 to-black"
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <EmptyState
            icon={faShoppingBag}
            title="No Orders Yet"
            description="Start shopping to create your first order!"
            actionText="Browse Products"
            actionHref="/products"
            iconColor="text-gray-600"
            iconBgColor="from-gray-100 to-gray-200"
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      {isValidStatus(order.status) && (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium gap-2 ${
                            STATUS_COLORS[order.status as OrderStatus]
                          }`}
                        >
                          <FontAwesomeIcon icon={STATUS_ICONS[order.status as OrderStatus]} />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b">
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Items ({order.items.length})
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded"
                        >
                          <span className="">{item.productName}</span>
                          <span className="text-gray-500 font-bold"><FontAwesomeIcon icon={faClose}/> {item.quantity}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          <span className="font-medium">+{order.items.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="flex-1"
                      size="sm"
                    >
                      View Details
                    </Button>
                    {isValidStatus(order.status) &&
                    (order.status === 'shipped' || order.status === 'processing') ? (
                      <Button
                        onClick={() => router.push(`/orders/${order.id}/track`)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        Track Package
                      </Button>
                    ) : null}
                    {isValidStatus(order.status) && order.status === 'delivered' ? (
                      <Button
                        onClick={() => router.push(`/products?reorder=${order.id}`)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        Reorder
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    variant={page === i + 1 ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {i + 1}
                  </Button>
                ))}
                <Button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
