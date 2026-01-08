import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button, Input, LoadingSpinner } from '@/components';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';
import { formatPrice } from '@3asoftwares/utils/client';

type PaymentMethod = 'card' | 'upi' | 'cod';

export default function CheckoutScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();

  const { items, clearCart, userProfile } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Address State
  const [address, setAddress] = useState({
    fullName: userProfile?.name || user?.name || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'USA',
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const validateForm = () => {
    if (!address.fullName.trim()) return 'Full name is required';
    if (!address.phone.trim()) return 'Phone number is required';
    if (!address.street.trim()) return 'Street address is required';
    if (!address.city.trim()) return 'City is required';
    if (!address.state.trim()) return 'State is required';
    if (!address.postalCode.trim()) return 'Postal code is required';
    return null;
  };

  const handlePlaceOrder = async () => {
    const error = validateForm();
    if (error) {
      showToast(error, 'error');
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to place your order', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate order creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearCart();
      showToast('Order placed successfully!', 'success');
      router.replace('/profile');
    } catch (error) {
      showToast('Failed to place order. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="cart-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No items to checkout</Text>
        <Button title="Continue Shopping" onPress={() => router.push('/products')} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Shipping Address */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
          </View>

          <Input
            label="Full Name"
            value={address.fullName}
            onChangeText={(text) => setAddress({ ...address, fullName: text })}
            placeholder="John Doe"
          />
          <Input
            label="Phone Number"
            value={address.phone}
            onChangeText={(text) => setAddress({ ...address, phone: text })}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
          />
          <Input
            label="Street Address"
            value={address.street}
            onChangeText={(text) => setAddress({ ...address, street: text })}
            placeholder="123 Main Street, Apt 4B"
          />
          <View style={styles.row}>
            <Input
              label="City"
              value={address.city}
              onChangeText={(text) => setAddress({ ...address, city: text })}
              placeholder="New York"
              style={{ flex: 1, marginRight: Layout.spacing.sm }}
            />
            <Input
              label="State"
              value={address.state}
              onChangeText={(text) => setAddress({ ...address, state: text })}
              placeholder="NY"
              style={{ flex: 1 }}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Postal Code"
              value={address.postalCode}
              onChangeText={(text) => setAddress({ ...address, postalCode: text })}
              placeholder="10001"
              keyboardType="number-pad"
              style={{ flex: 1, marginRight: Layout.spacing.sm }}
            />
            <Input
              label="Country"
              value={address.country}
              onChangeText={(text) => setAddress({ ...address, country: text })}
              placeholder="USA"
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'card' ? colors.primary : colors.border },
              paymentMethod === 'card' && { backgroundColor: `${colors.primary}10` },
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Ionicons name="card-outline" size={24} color={colors.text} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>Credit/Debit Card</Text>
              <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                Visa, Mastercard, Amex
              </Text>
            </View>
            {paymentMethod === 'card' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'upi' ? colors.primary : colors.border },
              paymentMethod === 'upi' && { backgroundColor: `${colors.primary}10` },
            ]}
            onPress={() => setPaymentMethod('upi')}
          >
            <Ionicons name="phone-portrait-outline" size={24} color={colors.text} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>UPI</Text>
              <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                Google Pay, PhonePe, Paytm
              </Text>
            </View>
            {paymentMethod === 'upi' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              { borderColor: paymentMethod === 'cod' ? colors.primary : colors.border },
              paymentMethod === 'cod' && { backgroundColor: `${colors.primary}10` },
            ]}
            onPress={() => setPaymentMethod('cod')}
          >
            <Ionicons name="cash-outline" size={24} color={colors.text} />
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentTitle, { color: colors.text }]}>Cash on Delivery</Text>
              <Text style={[styles.paymentDesc, { color: colors.textSecondary }]}>
                Pay when you receive
              </Text>
            </View>
            {paymentMethod === 'cod' && (
              <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                {item.name} x{item.quantity}
              </Text>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(subtotal)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(shipping)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(tax)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Place Order Button */}
      <View
        style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}
      >
        <Button
          title={isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          fullWidth
          size="large"
          icon={!isProcessing && <Ionicons name="lock-closed" size={18} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: Layout.spacing.lg,
  },
  section: {
    margin: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: Layout.spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    marginBottom: Layout.spacing.sm,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  itemName: {
    fontSize: 14,
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: Layout.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: Layout.spacing.xl,
  },
  footer: {
    padding: Layout.spacing.md,
    borderTopWidth: 1,
  },
});
