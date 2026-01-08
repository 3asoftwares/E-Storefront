import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { formatPrice } from '@3asoftwares/utils/client';
import type { ProductGraphQL } from '@3asoftwares/types';

interface ProductCardProps {
  product: ProductGraphQL;
  onPress?: () => void;
  onAddToCart?: () => void;
  onWishlistToggle?: () => void;
  isInWishlist?: boolean;
  isInCart?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Layout.spacing.md * 3) / 2;

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart,
  onWishlistToggle,
  isInWishlist = false,
  isInCart = false,
  variant = 'default',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isOutOfStock = product.stock === 0;

  const imageHeight = variant === 'compact' ? 100 : variant === 'large' ? 200 : 140;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="cube-outline" size={48} color={colors.textMuted} />
          </View>
        )}

        {/* Wishlist Button */}
        {onWishlistToggle && (
          <TouchableOpacity
            style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
            onPress={onWishlistToggle}
          >
            <Ionicons
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? colors.secondary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <View style={[styles.outOfStockBadge, { backgroundColor: colors.error }]}>
            <Text style={[styles.outOfStockText, { color: colors.textInverse }]}>
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <Text
          style={[styles.name, { color: colors.text }]}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {product.rating !== undefined && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.textSecondary }]}>
              {product.rating.toFixed(1)}
            </Text>
            {product.reviewCount !== undefined && (
              <Text style={[styles.reviewCount, { color: colors.textMuted }]}>
                ({product.reviewCount})
              </Text>
            )}
          </View>
        )}

        <Text style={[styles.price, { color: colors.primary }]}>
          {formatPrice(product.price)}
        </Text>

        {/* Add to Cart Button */}
        {onAddToCart && !isOutOfStock && (
          <TouchableOpacity
            style={[
              styles.addToCartButton,
              { backgroundColor: isInCart ? colors.success : colors.primary },
            ]}
            onPress={onAddToCart}
            disabled={isInCart}
          >
            <Ionicons
              name={isInCart ? 'checkmark' : 'cart-outline'}
              size={16}
              color={colors.textInverse}
            />
            <Text style={[styles.addToCartText, { color: colors.textInverse }]}>
              {isInCart ? 'In Cart' : 'Add'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Layout.spacing.md,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
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
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  infoContainer: {
    padding: Layout.spacing.sm,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    marginLeft: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Layout.borderRadius.sm,
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
