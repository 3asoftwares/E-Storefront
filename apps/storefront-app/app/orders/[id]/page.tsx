'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder, useCancelOrder } from '@/lib/hooks';
import { formatPrice } from '@3asoftwares/utils/client';
import { Button, Confirm } from '@3asoftwares/ui';
import {
  faClipboard,
  faCheckCircle,
  faCog,
  faBox,
  faSmile,
  faArrowLeft,
  faBan,
  faSpinner,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: faClipboard },
  { key: 'confirmed', label: 'Confirmed', icon: faCheckCircle },
  { key: 'processing', label: 'Processing', icon: faCog },
  { key: 'shipped', label: 'Shipped', icon: faBox },
  { key: 'delivered', label: 'Delivered', icon: faSmile },
];

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const { data: order, isLoading, error } = useOrder(id);
  const { mutateAsync: cancelOrder } = useCancelOrder();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find this order.</p>
          <Button onClick={() => router.push('/orders')} variant="primary" size="md">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex((step) => step.key === order.status);
  const isCompleted = (stepIndex: number) => stepIndex <= currentStepIndex;

  // Check if order can be cancelled (only pending or confirmed orders)
  const canCancel = ['pending', 'confirmed', 'PENDING', 'CONFIRMED'].includes(
    order.status || order.orderStatus
  );
  const isCancelled = ['cancelled', 'CANCELLED'].includes(order.status || order.orderStatus);

  const handleCancelOrder = async () => {
    try {
      await cancelOrder(id);
      setShowCancelConfirm(false);
    } catch (error: any) {
      alert(error.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="flex justify-between max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <Button
            onClick={() => router.push('/orders')}
            variant="ghost"
            size="sm"
            fullWidth={false}
            className="!no-underline"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Orders
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
              <div className="relative">
                <div className="flex items-center">
                  {STATUS_STEPS.map((step, idx) => (
                    <div key={step.key} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition ${
                            isCompleted(idx)
                              ? 'bg-green-500 text-white'
                              : idx === currentStepIndex
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          <FontAwesomeIcon icon={step.icon} />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mt-2 text-center">
                          {step.label}
                        </p>
                      </div>

                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`absolute top-6 left-1/2 right-0 h-0.5 ${
                            isCompleted(idx + 1) ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ width: 'calc(100% - 24px)' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {order.estimatedDelivery && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Estimated Delivery: </span>
                    {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>

              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-2xl">
                      📦
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-600">SKU: {item.productId}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-600">{formatPrice(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Shipping Address</h2>

              <div className="p-4 bg-gray-50 rounded-lg">
                {order.shippingAddress.name && (
                  <p className="font-semibold text-gray-900">{order.shippingAddress.name}</p>
                )}
                {(order.shippingAddress.mobile || order.shippingAddress.email) && (
                  <p className="text-gray-600 text-sm mb-2">
                    {order.shippingAddress.mobile && <span className="mr-3">📱 {order.shippingAddress.mobile}</span>}
                    {order.shippingAddress.email && <span>✉️ {order.shippingAddress.email}</span>}
                  </p>
                )}
                <p className="text-gray-700">{order.shippingAddress.street}</p>
                <p className="text-gray-700">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zip}
                </p>
                <p className="text-gray-700">{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount
                      {order.couponCode && (
                        <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {order.couponCode}
                        </span>
                      )}
                    </span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatPrice(order.total)}</span>
              </div>

              <div className="space-y-3 text-sm text-gray-600 pt-6 border-t">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Order Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Order Number</p>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Status</p>
                  <p className="font-medium text-gray-900 capitalize">{order.orderStatus}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button variant="outline" size="md">
                  Print Order
                </Button>

                {isCancelled ? (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-red-700">
                      <FontAwesomeIcon icon={faBan} className="w-4 h-4" />
                      <span className="font-medium">Order Cancelled</span>
                    </div>
                  </div>
                ) : canCancel ? (
                  <>
                    {!showCancelConfirm ? (
                      <Button
                        onClick={() => setShowCancelConfirm(true)}
                        variant="primary"
                        size="md"
                        className="!text-red-600 !hover:text-red-700 !bg-red-100 !hover:bg-red-50 !border-red-600"
                      >
                        <FontAwesomeIcon icon={faBan} className="" />
                        Cancel Order
                      </Button>
                    ) : (
                      <Confirm
                        open={showCancelConfirm}
                        title="Cancel Order"
                        message={
                          <>
                            <span>Are you sure you want to cancel this order?</span>
                          </>
                        }
                        confirmText="Yes, Cancel Order"
                        cancelText="Keep Order"
                        onConfirm={handleCancelOrder}
                        onCancel={() => {
                          setShowCancelConfirm(false);
                        }}
                      />
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
