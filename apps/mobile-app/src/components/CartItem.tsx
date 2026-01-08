import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { formatPrice } from '@3asoftwares/utils/client';

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onPress?: () => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.imageContainer} onPress={onPress}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="cube-outline" size={32} color={colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.content}>
        <TouchableOpacity onPress={onPress}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.price, { color: colors.primary }]}>
          {formatPrice(item.price)}
        </Text>

        <View style={styles.actions}>
          <View style={[styles.quantityControl, { borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
              style={styles.quantityButton}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => onUpdateQuantity(item.quantity + 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.total, { color: colors.text }]}>
        {formatPrice(item.price * item.quantity)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: Layout.spacing.sm,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
  },
  quantityButton: {
    padding: 8,
  },
  quantity: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Layout.spacing.sm,
  },
});
