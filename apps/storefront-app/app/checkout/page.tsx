'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useCreateOrder, useAddresses, useAddAddress } from '@/lib/hooks';
import { Button, Input, Radio, ToasterBox } from '@3asoftwares/ui';
import { apolloClient } from '@/lib/apollo/client';
import { GQL_QUERIES } from '@/lib/apollo/queries/queries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faLock,
  faShippingFast,
  faCreditCard,
  faBuilding,
  faMobileAlt,
  faTag,
  faCheck,
  faTimes,
  faPlus,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { formatPrice, Logger } from '@3asoftwares/utils/client';
import { PageHeader } from '@/components';

interface Address {
  id: string;
  userId?: string;
  name?: string;
  mobile?: string;
  email?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
  label?: string;
}

interface CouponValidation {
  valid: boolean;
  discount: number;
  discountValue: number;
  finalTotal: number;
  discountType: string | null;
  message: string;
  code: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, userProfile, clearCart } = useCartStore();
  const { mutateAsync: createOrder, isPending: loading } = useCreateOrder();
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const { mutateAsync: addAddressMutation, isPending: addingAddress } = useAddAddress();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderNotes, setOrderNotes] = useState('');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Toast states
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showToastBox, setShowToastBox] = useState(false);

  // Address validation states
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });

  // Set default address on load
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a: Address) => a.isDefault);
      setSelectedAddressId(defaultAddr?.id || addresses[0].id);
    }
  }, [addresses]);

  const subtotal = items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.08;
  const shipping = deliveryMethod === 'express' ? 80 : subtotal > 100 ? 0 : 10;
  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal + tax + shipping - discount);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setShowToastBox(true);
  };

  const validateNewAddress = (): boolean => {
    const errors: Record<string, string> = {};

    if (!newAddress.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!newAddress.mobile.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(newAddress.mobile.trim())) {
      errors.mobile = 'Invalid mobile number (10 digits required)';
    }
    if (newAddress.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAddress.email.trim())) {
      errors.email = 'Invalid email address';
    }
    if (!newAddress.street.trim()) {
      errors.street = 'Street address is required';
    }
    if (!newAddress.city.trim()) {
      errors.city = 'City is required';
    }
    if (!newAddress.state.trim()) {
      errors.state = 'State is required';
    }
    if (!newAddress.zip.trim()) {
      errors.zip = 'ZIP code is required';
    } else if (!/^\d{5,6}$/.test(newAddress.zip.trim())) {
      errors.zip = 'Invalid ZIP code';
    }
    if (!newAddress.country.trim()) {
      errors.country = 'Country is required';
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveNewAddress = async () => {
    if (!validateNewAddress()) {
      showToastMessage('Please fill in all address fields correctly', 'error');
      return;
    }

    try {
      const result = await addAddressMutation({
        name: newAddress.name.trim(),
        mobile: newAddress.mobile.trim(),
        email: newAddress.email.trim() || undefined,
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        zip: newAddress.zip.trim(),
        country: newAddress.country.trim(),
        isDefault: addresses.length === 0,
      });

      if (result?.success && result?.address) {
        setSelectedAddressId(result.address.id);
        setUseNewAddress(false);
        setNewAddress({ name: '', mobile: '', email: '', street: '', city: '', state: '', zip: '', country: '' });
        setAddressErrors({});
        showToastMessage('Address added successfully!', 'success');
      } else {
        showToastMessage(result?.message || 'Failed to add address', 'error');
      }
    } catch (error: any) {
      showToastMessage(error.message || 'Failed to add address', 'error');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const { data } = await apolloClient.query({
        query: GQL_QUERIES.VALIDATE_COUPON_QUERY,
        variables: {
          code: couponCode.trim().toUpperCase(),
          orderTotal: subtotal,
        },
        fetchPolicy: 'network-only',
      });

      if (data?.validateCoupon?.valid) {
        setAppliedCoupon(data.validateCoupon);
        showToastMessage(
          `Coupon applied! You save ${formatPrice(data.validateCoupon.discount)}`,
          'success'
        );
      } else {
        setCouponError(data?.validateCoupon?.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error: any) {
      setCouponError('Failed to validate coupon. Please try again.');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    showToastMessage('Coupon removed', 'info');
  };

  const handleSubmitOrder = async () => {
    // Validation checks
    if (!userProfile) {
      showToastMessage('Please log in to place an order', 'error');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (items.length === 0) {
      showToastMessage('Your cart is empty', 'error');
      return;
    }

    // Check if address is selected or new address is being used
    let shippingAddress: Address | null = null;

    if (useNewAddress) {
      // Validate new address
      if (!validateNewAddress()) {
        showToastMessage('Please fill in all address fields correctly', 'error');
        return;
      }
      shippingAddress = {
        id: `temp_${Date.now()}`,
        userId: userProfile.id,
        name: newAddress.name.trim(),
        mobile: newAddress.mobile.trim(),
        email: newAddress.email.trim() || undefined,
        street: newAddress.street.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        zip: newAddress.zip.trim(),
        country: newAddress.country.trim(),
        isDefault: false,
      };
    } else {
      // Check if an address is selected
      if (!selectedAddressId) {
        showToastMessage('Please select a shipping address or add a new one', 'error');
        return;
      }
      shippingAddress = addresses?.find((a: Address) => a.id === selectedAddressId) || null;

      if (!shippingAddress) {
        showToastMessage('Selected address not found. Please select another address.', 'error');
        return;
      }
    }

    if (!paymentMethod) {
      showToastMessage('Please select a payment method', 'error');
      return;
    }

    try {
      const orderData = {
        customerId: userProfile.id,
        customerEmail: userProfile.email,
        items: items.map((item: any) => ({
          productId: item.productId || item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          sellerId: item.sellerId || '',
          subtotal: item.price * item.quantity,
        })),
        subtotal,
        tax,
        shipping,
        discount,
        total,
        shippingAddress: {
          name: shippingAddress.name,
          mobile: shippingAddress.mobile,
          email: shippingAddress.email,
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zip: shippingAddress.zip,
          country: shippingAddress.country,
        },
        paymentMethod,
        notes: orderNotes,
        couponCode: appliedCoupon?.valid ? couponCode.trim().toUpperCase() : undefined,
      };

      const order = await createOrder(orderData);
      clearCart();
      showToastMessage('Order placed successfully!', 'success');
      router.push(`/orders/${order.id}`);
    } catch (error: any) {
      Logger.error('Order creation error', error, 'Checkout');
      showToastMessage(error.message || 'Error creating order. Please try again.', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md text-center border border-gray-200">
          <div className="inline-block p-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-6">
            <FontAwesomeIcon icon={faShoppingCart} className="w-16 h-16 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Cart is Empty</h1>
          <p className="text-gray-600 mb-8 text-lg">Add items to your cart before checking out.</p>
          <Button variant="ghost" onClick={() => router.push('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        icon={faLock}
        title="Secure Checkout"
        subtitle="SSL Encrypted • Safe & Secure"
        iconGradient="from-gray-700 to-gray-900"
        titleGradient="from-gray-900 to-black"
      />
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <FontAwesomeIcon icon={faShippingFast} className="text-indigo-600" />
                Shipping Address
              </h2>

              {addressesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="w-6 h-6 animate-spin text-indigo-600"
                  />
                  <span className="ml-2 text-gray-600">Loading addresses...</span>
                </div>
              ) : addresses && addresses.length > 0 && !useNewAddress ? (
                <div className="space-y-3 mb-4">
                  {addresses.map((address: Address) => (
                    <label
                      key={address.id}
                      className="flex items-start p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-indigo-50 hover:scale-[1.02]"
                      style={{
                        borderColor:
                          selectedAddressId === address.id ? 'rgb(99, 102, 241)' : '#e5e7eb',
                        backgroundColor:
                          selectedAddressId === address.id ? 'rgb(238, 242, 255)' : 'white',
                      }}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                        className="mt-1 w-5 h-5 text-indigo-600"
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {address.label && (
                            <span className="text-indigo-600 mr-2">[{address.label}]</span>
                          )}
                          {address.name || 'No name'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.mobile && <span className="mr-2">📱 {address.mobile}</span>}
                          {address.email && <span>✉️ {address.email}</span>}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {address.street}, {address.city}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.state}, {address.zip}, {address.country}
                        </p>
                        {address.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                            Default
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                !useNewAddress && (
                  <p className="text-gray-500 mb-4">
                    No saved addresses. Please add a new address.
                  </p>
                )
              )}

              <Button
                onClick={() => setUseNewAddress(!useNewAddress)}
                variant="ghost"
                size="sm"
                fullWidth={false}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-4"
              >
                {useNewAddress ? '← Use saved address' : '+ Add new address'}
              </Button>

              {useNewAddress && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      size="md"
                      type="text"
                      placeholder="Full Name *"
                      value={newAddress.name}
                      onChange={(e: any) => setNewAddress({ ...newAddress, name: e.target.value })}
                    />
                    <Input
                      size="md"
                      type="tel"
                      placeholder="Mobile Number *"
                      value={newAddress.mobile}
                      onChange={(e: any) => setNewAddress({ ...newAddress, mobile: e.target.value })}
                    />
                  </div>
                  <Input
                    size="md"
                    type="email"
                    placeholder="Email Address (Optional)"
                    value={newAddress.email}
                    onChange={(e: any) => setNewAddress({ ...newAddress, email: e.target.value })}
                  />
                  <Input
                    size="md"
                    type="text"
                    placeholder="Street Address *"
                    value={newAddress.street}
                    onChange={(e: any) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e: any) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e: any) => setNewAddress({ ...newAddress, state: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      placeholder="ZIP Code"
                      value={newAddress.zip}
                      onChange={(e: any) => setNewAddress({ ...newAddress, zip: e.target.value })}
                    />
                    <Input
                      type="text"
                      placeholder="Country"
                      value={newAddress.country}
                      onChange={(e: any) =>
                        setNewAddress({ ...newAddress, country: e.target.value })
                      }
                    />
                  </div>

                  {/* Address validation errors */}
                  {Object.keys(addressErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                      <ul className="text-sm text-red-600 space-y-1">
                        {Object.values(addressErrors).map((error, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Save Address Button */}
                  <div className="flex justify-end mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSaveNewAddress}
                      disabled={addingAddress}
                      className="flex items-center gap-2"
                    >
                      {addingAddress ? (
                        <>
                          <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                          Save Address
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Radio
                name="delivery"
                label="Delivery Method"
                value={deliveryMethod}
                onChange={setDeliveryMethod}
                variant="card"
                options={[
                  {
                    value: 'standard',
                    label: 'Standard Delivery',
                    description: `5-7 business days • ${subtotal > 100 ? 'FREE' : '₹100'}`,
                  },
                  {
                    value: 'express',
                    label: 'Express Delivery',
                    description: '2-3 business days • ₹80',
                  },
                ]}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <Radio
                name="payment"
                label="Payment Method"
                value={paymentMethod}
                onChange={setPaymentMethod}
                variant="card"
                options={[
                  {
                    value: 'card',
                    label: 'Credit/Debit Card',
                    icon: <FontAwesomeIcon icon={faCreditCard} />,
                  },
                  {
                    value: 'bank',
                    label: 'Bank Transfer',
                    icon: <FontAwesomeIcon icon={faBuilding} />,
                  },
                  {
                    value: 'upi',
                    label: 'UPI',
                    icon: <FontAwesomeIcon icon={faMobileAlt} />,
                  },
                ]}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h2>
              <textarea
                value={orderNotes}
                onChange={(e: any) => setOrderNotes(e.target.value)}
                placeholder="Add any special instructions for delivery..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-2 mb-6 pb-6 border-b max-h-48 overflow-y-auto">
                {items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code Section */}
              <div className="mb-6 pb-6 border-b">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTag} className="text-indigo-600" />
                  Have a coupon?
                </h3>

                {appliedCoupon?.valid ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCheck} className="text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-green-600">
                      {appliedCoupon.discountType === 'percentage' ? (
                        <span>
                          {appliedCoupon.discountValue}% off - You save{' '}
                          {formatPrice(appliedCoupon.discount)}
                        </span>
                      ) : (
                        <span>Flat {formatPrice(appliedCoupon.discount)} off</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col">
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e: any) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        className="whitespace-nowrap"
                      >
                        {couponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">Free</span>
                  ) : (
                    <span>{formatPrice(shipping)}</span>
                  )}
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                {appliedCoupon?.valid && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faTag} className="w-3 h-3" />
                      Discount ({appliedCoupon.code})
                    </span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="font-semibold text-gray-700">Total</span>
                <span className="text-3xl font-bold text-gray-900">{formatPrice(total)}</span>
              </div>

              <Button onClick={handleSubmitOrder} disabled={loading}>
                {loading ? 'Processing...' : 'Place Order'}
              </Button>

              <Button
                variant="ghost"
                className="mt-2 !no-underline"
                onClick={() => router.push('/cart')}
              >
                ← Back to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showToastBox && (
        <ToasterBox
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToastBox(false)}
        />
      )}
    </div>
  );
}
