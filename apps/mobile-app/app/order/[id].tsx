import React from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, FlatList, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { LoadingSpinner, EmptyState, Button } from '@/components';
import { useOrder } from '@/hooks';
import { formatPrice } from '@3asoftwares/utils/client';

const getStatusColor = (status: string, colors: typeof Colors.light) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return colors.success;
    case 'shipped':
    case 'processing':
      return colors.info;
    case 'cancelled':
      return colors.error;
    case 'pending':
    default:
      return colors.warning;
  }
};

const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'checkmark-circle';
    case 'shipped':
      return 'airplane';
    case 'processing':
      return 'refresh';
    case 'cancelled':
      return 'close-circle';
    case 'pending':
    default:
      return 'time';
  }
};

export default function OrderDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: order, isLoading, error } = useOrder(id || '');

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading order details..." />;
  }

  if (error || !order) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="Order Not Found"
        description="The order you're looking for doesn't exist or has been removed."
        actionText="View All Orders"
        onAction={() => router.back()}
      />
    );
  }

  const statusColor = getStatusColor(order.status, colors);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.statusIcon, { backgroundColor: `${statusColor}20` }]}>
            <Ionicons name={getStatusIcon(order.status)} size={40} color={statusColor} />
          </View>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
          <Text style={[styles.orderId, { color: colors.textSecondary }]}>
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={[styles.orderDate, { color: colors.textMuted }]}>
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Progress</Text>
            <View style={styles.timeline}>
              {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                const steps = ['pending', 'processing', 'shipped', 'delivered'];
                const currentIndex = steps.indexOf(order.status.toLowerCase());
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;

                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isCompleted ? colors.success : colors.border,
                            borderColor: isActive ? colors.success : 'transparent',
                          },
                          isActive && styles.activeDot,
                        ]}
                      >
                        {isCompleted && <Ionicons name="checkmark" size={12} color="white" />}
                      </View>
                      {index < 3 && (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isCompleted ? colors.success : colors.border },
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text
                        style={[
                          styles.timelineTitle,
                          { color: isCompleted ? colors.text : colors.textMuted },
                        ]}
                      >
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Items ({order.items?.length || 0})
          </Text>
          {order.items?.map((item: any, index: number) => (
            <View key={index} style={styles.orderItem}>
              <View style={[styles.itemImage, { backgroundColor: colors.borderLight }]}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.image} />
                ) : (
                  <Ionicons name="cube-outline" size={24} color={colors.textMuted} />
                )}
              </View>
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        {order.shippingAddress && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 8 }]}>
                Delivery Address
              </Text>
            </View>
            <Text style={[styles.addressText, { color: colors.text }]}>
              {order.shippingAddress.name}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {order.shippingAddress.street}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              Phone: {order.shippingAddress.phone}
            </Text>
          </View>
        )}

        {/* Order Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.subtotal || order.totalAmount * 0.92)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.shippingCost || 0)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.tax || order.totalAmount * 0.08)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              {formatPrice(order.totalAmount)}
            </Text>
          </View>

          <View style={[styles.paymentMethod, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="card" size={18} color={colors.textSecondary} />
            <Text style={[styles.paymentText, { color: colors.textSecondary }]}>
              {order.paymentMethod || 'Paid via Credit Card'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {order.status === 'delivered' && (
            <Button
              title="Write a Review"
              onPress={() => {}}
              variant="outline"
              fullWidth
              icon={<Ionicons name="star-outline" size={18} color={colors.primary} />}
            />
          )}
          <Button
            title="Need Help?"
            onPress={() => {}}
            variant="ghost"
            fullWidth
            style={{ marginTop: Layout.spacing.sm }}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusCard: {
    margin: Layout.spacing.md,
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
  },
  section: {
    margin: Layout.spacing.md,
    marginTop: 0,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  timeline: {
    paddingLeft: Layout.spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    borderWidth: 3,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemQty: {
    fontSize: 12,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    marginBottom: 2,
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
  divider: {
    height: 1,
    marginVertical: Layout.spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.md,
  },
  paymentText: {
    fontSize: 12,
    marginLeft: Layout.spacing.xs,
  },
  actions: {
    padding: Layout.spacing.md,
  },
  bottomSpacing: {
    height: Layout.spacing.xl,
  },
});
