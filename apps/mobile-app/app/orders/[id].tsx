import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useOrder } from '../../src/lib/hooks';

// Order Status Badge
function OrderStatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'processing':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      case 'shipped':
        return { bg: '#E0E7FF', text: '#4338CA' };
      case 'delivered':
        return { bg: '#ECFDF5', text: '#065F46' };
      case 'cancelled':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F3F4F6', text: '#374151' };
    }
  };

  const style = getStatusStyle();

  return (
    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
      <Text style={[styles.statusText, { color: style.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}

// Order Timeline
function OrderTimeline({ status }: { status: string }) {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'processing', label: 'Processing', icon: '⚙️' },
    { key: 'shipped', label: 'Shipped', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const getCurrentStep = () => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'cancelled') return -1;
    return steps.findIndex((s) => s.key === statusLower);
  };

  const currentStep = getCurrentStep();

  if (currentStep === -1) {
    return (
      <View style={styles.cancelledBanner}>
        <Text style={styles.cancelledText}>❌ This order has been cancelled</Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.timelineStep}>
          <View style={styles.timelineIconContainer}>
            <View style={[styles.timelineIcon, index <= currentStep && styles.timelineIconActive]}>
              <Text style={styles.timelineEmoji}>{step.icon}</Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[styles.timelineLine, index < currentStep && styles.timelineLineActive]}
              />
            )}
          </View>
          <Text style={[styles.timelineLabel, index <= currentStep && styles.timelineLabelActive]}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Order Item
function OrderItemCard({ item }: { item: any }) {
  return (
    <View style={styles.orderItem}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.productName || item.name || 'Product'}
        </Text>
        {item.variant && <Text style={styles.itemVariant}>{item.variant}</Text>}
        <View style={styles.itemPriceRow}>
          <Text style={styles.itemPrice}>${item.price?.toFixed(2)}</Text>
          <Text style={styles.itemQuantity}>× {item.quantity}</Text>
        </View>
      </View>
      <Text style={styles.itemTotal}>${((item.price || 0) * item.quantity).toFixed(2)}</Text>
    </View>
  );
}

// Main Order Detail Screen
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, error } = useOrder(id || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Order not found</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.push('/orders')}>
            <Text style={styles.errorButtonText}>View All Orders</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Order #{order.orderNumber || order.id.slice(-8)}</Text>
            <Text style={styles.orderDate}>{orderDate}</Text>
          </View>
          <OrderStatusBadge status={order.status} />
        </View>

        {/* Order Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <OrderTimeline status={order.status} />
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
          {order.items?.map((item: any, index: number) => (
            <OrderItemCard key={item.id || index} item={item} />
          ))}
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressName}>{order.shippingAddress.fullName}</Text>
              <Text style={styles.addressLine}>{order.shippingAddress.address}</Text>
              <Text style={styles.addressLine}>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </Text>
              <Text style={styles.addressLine}>{order.shippingAddress.country}</Text>
              {order.shippingAddress.phone && (
                <Text style={styles.addressPhone}>📞 {order.shippingAddress.phone}</Text>
              )}
            </View>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'card' && '💳 Credit Card'}
              {order.paymentMethod === 'paypal' && '🅿️ PayPal'}
              {order.paymentMethod === 'cod' && '💵 Cash on Delivery'}
              {!order.paymentMethod && '💳 Card'}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${order.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
            {order.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -${order.discount?.toFixed(2)}
                </Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {order.shipping === 0 ? 'Free' : `$${order.shipping?.toFixed(2) || '0.00'}`}
              </Text>
            </View>
            {order.tax > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>${order.tax?.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${order.total?.toFixed(2) || '0.00'}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {order.status === 'delivered' && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Write a Review</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => {
              /* Navigate to support */
            }}
          >
            <Text style={styles.supportButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorEmoji: {
    fontSize: 64,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  orderInfo: {},
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconActive: {
    backgroundColor: '#EEF2FF',
  },
  timelineEmoji: {
    fontSize: 18,
  },
  timelineLine: {
    position: 'absolute',
    right: 0,
    width: '40%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  timelineLineActive: {
    backgroundColor: '#4F46E5',
  },
  timelineLabel: {
    marginTop: 8,
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  timelineLabelActive: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  cancelledBanner: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
  },
  cancelledText: {
    color: '#991B1B',
    fontSize: 14,
    textAlign: 'center',
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  itemVariant: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    alignSelf: 'center',
  },
  addressCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  addressLine: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
  },
  paymentCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  paymentMethod: {
    fontSize: 16,
    color: '#111827',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
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
    marginBottom: 0,
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
  actions: {
    padding: 16,
  },
  actionButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});
