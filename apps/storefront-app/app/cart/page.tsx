'use client';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useToast } from '@/lib/hooks/useToast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBox, faSmile, faCheckCircle, faCreditCard, faBuilding, faMobileAlt, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { formatPrice } from '3a-ecommerce-utils/client';
import { PageHeader, EmptyState } from '@/components';
import { Button } from '3a-ecommerce-ui-library';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { showToast } = useToast();

  const subtotal = items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          icon={faShoppingCart}
          title="Shopping Cart"
          badge={
            items.length > 0
              ? {
                  count: items.length,
                  label: items.length === 1 ? 'item' : 'items',
                }
              : undefined
          }
          iconGradient="from-gray-700 to-gray-900"
          titleGradient="from-gray-900 to-black"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {items.length === 0 ? (
            <EmptyState
              icon={faShoppingCart}
              title="Your Cart is Empty"
              description="Looks like you haven't added anything yet. Discover amazing products now!"
              actionText="Start Shopping →"
              actionHref="/products"
              iconColor="text-indigo-600"
              iconBgColor="from-indigo-100 to-purple-100"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  {items.map((item: any, index: number) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex gap-4 p-6 border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faBox} className="w-10 h-10 text-gray-400" />
                        </div>
                      </div>

                      <div className="flex-grow min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 block mb-1"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600 mb-3">SKU: {item.productId}</p>
                        <p className="text-lg font-bold text-blue-600">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                          <Button
                            onClick={() => {
                              updateQuantity(item.id, Math.max(1, item.quantity - 1));
                              if (item.quantity > 1) {
                                showToast('Quantity updated', 'info');
                              }
                            }}
                            variant="ghost"
                            size="sm"
                            className="!no-underline"
                            disabled={item.quantity <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                          </Button>
                          <span className="px-3 py-1 font-semibold text-gray-900 min-w-[2.5rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            onClick={() => {
                              updateQuantity(item.id, item.quantity + 1);
                              showToast('Quantity updated', 'info');
                            }}
                            variant="ghost"
                            size="sm"
                            className="!no-underline"
                            disabled={item.quantity >= 99}
                          >
                            <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 mb-2">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                          <Button
                            onClick={() => {
                              removeItem(item.id);
                              showToast('Item removed from cart', 'success');
                            }}
                            variant="ghost"
                            size="sm"
                            fullWidth={false}
                            className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-6 bg-gray-50 border-t border-gray-100 text-right">
                    <Button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear the cart?')) {
                          clearCart();
                          showToast('Cart cleared', 'success');
                        }
                      }}
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
                      className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  className="!no-underline"
                  onClick={() => router.push('/products')}
                >
                  ← Continue Shopping
                </Button>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-semibold">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Tax (8%)</span>
                      <span className="font-semibold">{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Shipping</span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-bold flex items-center gap-1">
                          FREE <FontAwesomeIcon icon={faCheckCircle} className="text-green-600" />
                        </span>
                      ) : (
                        <span className="font-semibold">{formatPrice(shipping)}</span>
                      )}
                    </div>
                  </div>

                  {shipping > 0 && subtotal < 100 && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                      <p className="font-semibold text-blue-900 mb-1">
                        <FontAwesomeIcon icon={faSmile} className="mr-2" />
                        Free Shipping Alert!
                      </p>
                      <p className="text-sm text-blue-800">
                        Add {formatPrice(100 - subtotal)} more for free shipping.
                      </p>
                    </div>
                  )}

                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <p className="text-gray-700 text-sm font-medium mb-1">Total Amount</p>
                    <p className="text-4xl font-bold text-gray-900">{formatPrice(total)}</p>
                  </div>

                  <Button onClick={() => router.push('/checkout')}>Proceed to Checkout</Button>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="font-semibold text-gray-900 text-sm mb-2">We Accept:</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                        <FontAwesomeIcon icon={faCreditCard} />
                        Card
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                        <FontAwesomeIcon icon={faBuilding} />
                        Bank
                      </span>
                      <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 flex items-center gap-1">
                        <FontAwesomeIcon icon={faMobileAlt} />
                        UPI
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-0.5" />
                      <span>Secure SSL encrypted checkout</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-0.5" />
                      <span>Free returns within 30 days</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 mt-0.5" />
                      <span>24/7 customer support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
