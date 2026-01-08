import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { CartItem, Button, EmptyState } from '@/components';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ToastProvider';
import { formatPrice } from '@3asoftwares/utils/client';

export default function CartScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();

  const { items, removeItem, updateQuantity, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : subtotal > 0 ? 10 : 0;
  const total = subtotal + tax + shipping;

  const handleRemoveItem = (itemId: string, name: string) => {
    removeItem(itemId);
    showToast(`${name} removed from cart`, 'info');
  };

  const handleClearCart = () => {
    clearCart();
    showToast('Cart cleared', 'info');
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Your Cart is Empty"
        description="Looks like you haven't added anything yet. Discover amazing products now!"
        actionText="Start Shopping"
        onAction={() => router.push('/products')}
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.id, qty)}
            onRemove={() => handleRemoveItem(item.id, item.name)}
            onPress={() => router.push(`/product/${item.productId}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {items.length} {items.length === 1 ? 'item' : 'items'} in cart
            </Text>
            <TouchableOpacity onPress={handleClearCart}>
              <Text style={[styles.clearText, { color: colors.error }]}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.summaryContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(subtotal)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Shipping {shipping === 0 && subtotal > 0 && '(Free)'}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {formatPrice(shipping)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Tax (8%)</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(tax)}</Text>
            </View>

            {shipping === 0 && subtotal > 0 && (
              <View style={[styles.freeShippingBanner, { backgroundColor: colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={[styles.freeShippingText, { color: colors.success }]}>
                  You qualify for free shipping!
                </Text>
              </View>
            )}

            {subtotal > 0 && subtotal < 100 && (
              <View style={[styles.freeShippingBanner, { backgroundColor: colors.infoLight }]}>
                <Ionicons name="information-circle" size={16} color={colors.info} />
                <Text style={[styles.freeShippingText, { color: colors.info }]}>
                  Add {formatPrice(100 - subtotal)} more for free shipping!
                </Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        }
      />

      {/* Checkout Button */}
      <View
        style={[
          styles.checkoutContainer,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.checkoutTotal}>
          <Text style={[styles.checkoutTotalLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.checkoutTotalValue, { color: colors.text }]}>
            {formatPrice(total)}
          </Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          icon={<Ionicons name="arrow-forward" size={18} color="white" />}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    marginTop: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  freeShippingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.sm,
  },
  freeShippingText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: Layout.spacing.xs,
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
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  checkoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderTopWidth: 1,
  },
  checkoutTotal: {
    marginRight: Layout.spacing.lg,
  },
  checkoutTotalLabel: {
    fontSize: 12,
  },
  checkoutTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
