import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack } from 'expo-router';
import { useCartStore } from '../src/store/cartStore';
import { useCreateOrder, useAddresses, useValidateCoupon } from '../src/lib/hooks';

// Order Item Component
function OrderItem({ item }: { item: any }) {
  return (
    <View style={styles.orderItem}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/60' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );
}

// Step Indicator Component
function StepIndicator({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <View style={styles.stepItem}>
            <View style={[styles.stepCircle, index <= currentStep && styles.stepCircleActive]}>
              {index < currentStep ? (
                <Text style={styles.stepCheckmark}>✓</Text>
              ) : (
                <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, index <= currentStep && styles.stepLabelActive]}>
              {step}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={[styles.stepLine, index < currentStep && styles.stepLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// Main Checkout Screen
export default function CheckoutScreen() {
  const cart = useCartStore((state) => state.cart);
  const userProfile = useCartStore((state) => state.userProfile);
  const clearCart = useCartStore((state) => state.clearCart);

  const [currentStep, setCurrentStep] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Shipping Info State
  const [shippingInfo, setShippingInfo] = useState({
    fullName: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  // Payment Info State
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const { createOrder } = useCreateOrder();
  const { validateCoupon, isLoading: isValidatingCoupon } = useValidateCoupon();
  const { data: savedAddresses = [] } = useAddresses();

  const steps = ['Shipping', 'Payment', 'Review'];

  // Calculate totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum:any, item:any) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return subtotal * (appliedCoupon.discountValue / 100);
    }
    return appliedCoupon.discountValue;
  }, [appliedCoupon, subtotal]);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const result = await validateCoupon({ code: couponCode.trim(), orderTotal: subtotal });
      if (result?.valid) {
        setAppliedCoupon(result.coupon);
        Alert.alert('Success', 'Coupon applied successfully!');
      } else {
        Alert.alert('Invalid Coupon', result?.message || 'This coupon is not valid');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to validate coupon');
    }
  };

  const validateShipping = () => {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingInfo[field as keyof typeof shippingInfo].trim()) {
        Alert.alert(
          'Missing Information',
          `Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
        );
        return false;
      }
    }
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      if (!paymentInfo.cardNumber || paymentInfo.cardNumber.length < 16) {
        Alert.alert('Invalid Card', 'Please enter a valid card number');
        return false;
      }
      if (!paymentInfo.cardName) {
        Alert.alert('Missing Information', 'Please enter the name on card');
        return false;
      }
      if (!paymentInfo.expiryDate || !/^\d{2}\/\d{2}$/.test(paymentInfo.expiryDate)) {
        Alert.alert('Invalid Date', 'Please enter expiry date as MM/YY');
        return false;
      }
      if (!paymentInfo.cvv || paymentInfo.cvv.length < 3) {
        Alert.alert('Invalid CVV', 'Please enter a valid CVV');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !validateShipping()) return;
    if (currentStep === 1 && !validatePayment()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant,
      }));

      const orderInput = {
        items: orderItems,
        shippingAddress: {
          fullName: shippingInfo.fullName,
          address: shippingInfo.address,
          city: shippingInfo.city,
          state: shippingInfo.state,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
          phone: shippingInfo.phone,
        },
        paymentMethod,
        subtotal,
        discount,
        shipping,
        tax,
        total,
        couponCode: appliedCoupon?.code,
      };

      const order = await createOrder(orderInput);

      Alert.alert(
        'Order Placed!',
        `Your order #${order.orderNumber || order.id} has been placed successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => router.replace(`/orders/${order.id}`),
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Order Failed', err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/products')}>
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Step Indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step 1: Shipping */}
        {currentStep === 0 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Shipping Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={shippingInfo.fullName}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                value={shippingInfo.email}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 234 567 8900"
                value={shippingInfo.phone}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main Street"
                value={shippingInfo.address}
                onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="New York"
                  value={shippingInfo.city}
                  onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="NY"
                  value={shippingInfo.state}
                  onChangeText={(text) => setShippingInfo({ ...shippingInfo, state: text })}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10001"
                  value={shippingInfo.zipCode}
                  onChangeText={(text) => setShippingInfo({ ...shippingInfo, zipCode: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="United States"
                  value={shippingInfo.country}
                  onChangeText={(text) => setShippingInfo({ ...shippingInfo, country: text })}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Payment */}
        {currentStep === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Payment Method</Text>

            {/* Payment Method Selection */}
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'card' && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod('card')}
              >
                <Text style={styles.paymentOptionIcon}>💳</Text>
                <Text style={styles.paymentOptionText}>Credit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'paypal' && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod('paypal')}
              >
                <Text style={styles.paymentOptionIcon}>🅿️</Text>
                <Text style={styles.paymentOptionText}>PayPal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cod' && styles.paymentOptionActive,
                ]}
                onPress={() => setPaymentMethod('cod')}
              >
                <Text style={styles.paymentOptionIcon}>💵</Text>
                <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
              </TouchableOpacity>
            </View>

            {paymentMethod === 'card' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Card Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1234 5678 9012 3456"
                    value={paymentInfo.cardNumber}
                    onChangeText={(text) =>
                      setPaymentInfo({
                        ...paymentInfo,
                        cardNumber: text.replace(/\D/g, '').slice(0, 16),
                      })
                    }
                    keyboardType="numeric"
                    maxLength={19}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name on Card</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    value={paymentInfo.cardName}
                    onChangeText={(text) => setPaymentInfo({ ...paymentInfo, cardName: text })}
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="MM/YY"
                      value={paymentInfo.expiryDate}
                      onChangeText={(text) => {
                        const cleaned = text.replace(/\D/g, '');
                        if (cleaned.length >= 2) {
                          setPaymentInfo({
                            ...paymentInfo,
                            expiryDate: `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`,
                          });
                        } else {
                          setPaymentInfo({ ...paymentInfo, expiryDate: cleaned });
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={5}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="123"
                      value={paymentInfo.cvv}
                      onChangeText={(text) =>
                        setPaymentInfo({ ...paymentInfo, cvv: text.replace(/\D/g, '').slice(0, 4) })
                      }
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
              </>
            )}

            {paymentMethod === 'paypal' && (
              <View style={styles.paypalNotice}>
                <Text style={styles.paypalText}>
                  You will be redirected to PayPal to complete your payment.
                </Text>
              </View>
            )}

            {paymentMethod === 'cod' && (
              <View style={styles.codNotice}>
                <Text style={styles.codText}>💵 Pay with cash when your order is delivered.</Text>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Review */}
        {currentStep === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            {/* Order Items */}
            <View style={styles.orderItems}>
              {cart.map((item) => (
                <OrderItem key={item.productId} item={item} />
              ))}
            </View>

            {/* Shipping Info Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Shipping Address</Text>
              <Text style={styles.summaryText}>{shippingInfo.fullName}</Text>
              <Text style={styles.summaryText}>{shippingInfo.address}</Text>
              <Text style={styles.summaryText}>
                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
              </Text>
              <Text style={styles.summaryText}>{shippingInfo.country}</Text>
            </View>

            {/* Payment Method Summary */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Payment Method</Text>
              <Text style={styles.summaryText}>
                {paymentMethod === 'card' &&
                  `💳 Credit Card ****${paymentInfo.cardNumber.slice(-4)}`}
                {paymentMethod === 'paypal' && '🅿️ PayPal'}
                {paymentMethod === 'cod' && '💵 Cash on Delivery'}
              </Text>
            </View>

            {/* Coupon */}
            {!appliedCoupon && (
              <View style={styles.couponSection}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChangeText={setCouponCode}
                  autoCapitalize="characters"
                  placeholderTextColor="#9CA3AF"
                />
                <TouchableOpacity
                  style={styles.couponButton}
                  onPress={handleApplyCoupon}
                  disabled={isValidatingCoupon}
                >
                  {isValidatingCoupon ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.couponButtonText}>Apply</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
              </View>
              {discount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Discount</Text>
                  <Text style={[styles.priceValue, styles.discountValue]}>
                    -${discount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Shipping</Text>
                <Text style={styles.priceValue}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Tax (8%)</Text>
                <Text style={styles.priceValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backStepButton} onPress={handlePreviousStep}>
            <Text style={styles.backStepButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, currentStep === 0 && { flex: 1 }]}
          onPress={handleNextStep}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Place Order' : 'Continue'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#4F46E5',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepCheckmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  stepLabelActive: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  stepLineActive: {
    backgroundColor: '#4F46E5',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputRow: {
    flexDirection: 'row',
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  paymentOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentOptionText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  paypalNotice: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 8,
  },
  paypalText: {
    color: '#92400E',
    fontSize: 14,
  },
  codNotice: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
  },
  codText: {
    color: '#065F46',
    fontSize: 14,
  },
  orderItems: {
    marginBottom: 20,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summarySection: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  couponSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  couponButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    marginLeft: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  couponButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priceBreakdown: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  discountValue: {
    color: '#059669',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  backStepButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  backStepButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  nextButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  shopButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
