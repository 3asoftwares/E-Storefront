import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button, LoadingSpinner, EmptyState } from '@/components';
import { useProduct } from '@/hooks';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ToastProvider';
import { formatPrice } from '@3asoftwares/utils/client';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { showToast } = useToast();

  const { data: product, isLoading, error } = useProduct(id || '');
  const { addItem, isInWishlist, addToWishlist, removeFromWishlist, items, addToRecentlyViewed } =
    useCartStore();

  const [quantity, setQuantity] = useState(1);
  const isInCart = items.some((item) => item.productId === product?.id);
  const inWishlist = product ? isInWishlist(product.id) : false;

  // Add to recently viewed
  React.useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: `cart-${product.id}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.imageUrl,
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (inWishlist) {
      removeFromWishlist(product.id);
      showToast('Removed from wishlist', 'info');
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      });
      showToast('Added to wishlist', 'success');
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading product..." />;
  }

  if (error || !product) {
    return (
      <EmptyState
        icon="cube-outline"
        title="Product Not Found"
        description="The product you're looking for doesn't exist or has been removed."
        actionText="Browse Products"
        onAction={() => router.replace('/products')}
      />
    );
  }

  const isOutOfStock = product.stock === 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.borderLight }]}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Ionicons name="cube-outline" size={100} color={colors.textMuted} />
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            style={[styles.wishlistButton, { backgroundColor: colors.surface }]}
            onPress={handleWishlistToggle}
          >
            <Ionicons
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={24}
              color={inWishlist ? colors.secondary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Stock Badge */}
          {isOutOfStock && (
            <View style={[styles.stockBadge, { backgroundColor: colors.error }]}>
              <Text style={styles.stockBadgeText}>Out of Stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          {/* Category */}
          {product.category && (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/products?category=${encodeURIComponent(product.category?.name || '')}`
                )
              }
            >
              <Text style={[styles.category, { color: colors.primary }]}>
                {product.category.name}
              </Text>
            </TouchableOpacity>
          )}

          {/* Name */}
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>

          {/* Rating */}
          {product.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(product.rating || 0) ? 'star' : 'star-outline'}
                    size={18}
                    color="#F59E0B"
                  />
                ))}
              </View>
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {formatPrice(product.price)}
            </Text>
            {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
              <Text style={[styles.lowStock, { color: colors.warning }]}>
                Only {product.stock} left!
              </Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {product.description || 'No description available for this product.'}
            </Text>
          </View>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <View style={styles.quantitySection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
              <View style={[styles.quantityControl, { borderColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityButton}
                >
                  <Ionicons name="remove" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity
                  onPress={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  style={styles.quantityButton}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomActions,
          { backgroundColor: colors.surface, borderTopColor: colors.border },
        ]}
      >
        <View style={styles.totalContainer}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.totalPrice, { color: colors.text }]}>
            {formatPrice(product.price * quantity)}
          </Text>
        </View>

        {isOutOfStock ? (
          <Button title="Out of Stock" onPress={() => {}} disabled fullWidth />
        ) : isInCart ? (
          <Button
            title="View Cart"
            onPress={() => router.push('/cart')}
            variant="secondary"
            icon={<Ionicons name="cart" size={18} color="white" />}
            style={{ flex: 1 }}
          />
        ) : (
          <View style={styles.actionButtons}>
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              variant="outline"
              icon={<Ionicons name="cart-outline" size={18} color={colors.primary} />}
              style={{ flex: 1, marginRight: Layout.spacing.sm }}
            />
            <Button
              title="Buy Now"
              onPress={handleBuyNow}
              icon={<Ionicons name="flash" size={18} color="white" />}
              style={{ flex: 1 }}
            />
          </View>
        )}
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
  imageContainer: {
    width,
    height: width,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  wishlistButton: {
    position: 'absolute',
    top: Layout.spacing.md,
    right: Layout.spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stockBadge: {
    position: 'absolute',
    bottom: Layout.spacing.md,
    left: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  stockBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: Layout.spacing.lg,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    marginTop: -Layout.spacing.lg,
  },
  category: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Layout.spacing.xs,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: Layout.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: Layout.spacing.sm,
  },
  ratingText: {
    fontSize: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
  },
  lowStock: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: Layout.spacing.md,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  quantitySection: {
    marginBottom: Layout.spacing.lg,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
  },
  quantityButton: {
    padding: Layout.spacing.md,
  },
  quantity: {
    paddingHorizontal: Layout.spacing.lg,
    fontSize: 18,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderTopWidth: 1,
  },
  totalContainer: {
    marginRight: Layout.spacing.lg,
  },
  totalLabel: {
    fontSize: 12,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
  },
});
