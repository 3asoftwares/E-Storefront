import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { formatPrice } from '@3asoftwares/utils/client';
import type { OrderGraphQL } from '@3asoftwares/types';

interface OrderCardProps {
  order: OrderGraphQL;
  onPress: () => void;
}

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

export const OrderCard: React.FC<OrderCardProps> = ({ order, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const statusColor = getStatusColor(order.status, colors);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.orderId, { color: colors.textSecondary }]}>
            Order #{order.id.slice(-8).toUpperCase()}
          </Text>
          <Text style={[styles.date, { color: colors.textMuted }]}>
            {new Date(order.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
          <Ionicons name={getStatusIcon(order.status)} size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Items</Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {order.items?.length || 0}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {formatPrice(order.totalAmount)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: Layout.spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
});
