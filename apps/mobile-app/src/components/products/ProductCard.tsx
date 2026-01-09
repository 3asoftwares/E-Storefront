import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Colors,
  BorderRadius,
  Spacing,
  FontSizes,
  FontWeights,
  Shadows,
} from '../../constants/theme';
import { useCartStore } from '../../store/cartStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Spacing.base * 3) / 2;

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    compareAtPrice?: number;
    images?: string[];
    image?: string;
    rating?: number;
    reviewCount?: number;
    stock?: number;
    category?: { name: string };
  };
  variant?: 'grid' | 'horizontal' | 'compact';
  onPress?: () => void;
}

export function ProductCard({ product, variant = 'grid', onPress }: ProductCardProps) {
  const router = useRouter();
  const { addItem, addToWishlist, removeFromWishlist, isInWishlist } = useCartStore();

  const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/200';
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock === 0;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl,
      });
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      quantity: 1,
    });
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, Shadows.sm]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalContent}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          {product.category && <Text style={styles.category}>{product.category.name}</Text>}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.compareAtPrice && (
              <Text style={styles.comparePrice}>${product.compareAtPrice.toFixed(2)}</Text>
            )}
          </View>
          {product.rating && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
              {product.reviewCount && (
                <Text style={styles.reviewCount}>({product.reviewCount})</Text>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.horizontalWishlist} onPress={handleWishlistToggle}>
          <Text style={styles.wishlistIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        style={[styles.compactCard, Shadows.sm]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: imageUrl }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactName} numberOfLines={1}>
            {product.name}
          </Text>
          <Text style={styles.compactPrice}>${product.price.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid variant (default)
  return (
    <TouchableOpacity
      style={[styles.gridCard, Shadows.sm]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.gridImage} />

        {/* Discount badge */}
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discount}%</Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}

        {/* Wishlist button */}
        <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
          <Text style={styles.wishlistIcon}>{isWishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContent}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.compareAtPrice && (
            <Text style={styles.comparePrice}>${product.compareAtPrice.toFixed(2)}</Text>
          )}
        </View>

        {product.rating && (
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {product.rating.toFixed(1)}</Text>
            {product.reviewCount && <Text style={styles.reviewCount}>({product.reviewCount})</Text>}
          </View>
        )}

        <TouchableOpacity
          style={[styles.addToCartButton, isOutOfStock && styles.disabledButton]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={styles.addToCartText}>{isOutOfStock ? 'Unavailable' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Grid card styles
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: CARD_WIDTH,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.light.error,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: Colors.light.textInverse,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: {
    color: Colors.light.textInverse,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  wishlistButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  wishlistIcon: {
    fontSize: 16,
  },
  gridContent: {
    padding: Spacing.md,
  },
  productName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.light.primary,
  },
  comparePrice: {
    fontSize: FontSizes.sm,
    color: Colors.light.textTertiary,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingText: {
    fontSize: FontSizes.xs,
    color: Colors.light.text,
  },
  reviewCount: {
    fontSize: FontSizes.xs,
    color: Colors.light.textTertiary,
    marginLeft: Spacing.xs,
  },
  category: {
    fontSize: FontSizes.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  addToCartButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.light.borderDark,
  },
  addToCartText: {
    color: Colors.light.textInverse,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
  },

  // Horizontal card styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  horizontalImage: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
  },
  horizontalContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },
  horizontalWishlist: {
    padding: Spacing.md,
    justifyContent: 'flex-start',
  },

  // Compact card styles
  compactCard: {
    width: 140,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  compactImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  compactContent: {
    padding: Spacing.sm,
  },
  compactName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    color: Colors.light.text,
    marginBottom: 2,
  },
  compactPrice: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.light.primary,
  },
});
