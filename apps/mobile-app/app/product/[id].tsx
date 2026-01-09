import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { useProduct, useProductReviews } from '../../src/lib/hooks';
import { useCartStore } from '../../src/store/cartStore';

const { width } = Dimensions.get('window');

// Image Carousel Component
function ImageCarousel({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setActiveIndex(index);
  };

  const displayImages = images?.length > 0 ? images : ['https://via.placeholder.com/400'];

  return (
    <View style={styles.carousel}>
      <FlatList
        data={displayImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="contain" />
        )}
      />
      {displayImages.length > 1 && (
        <View style={styles.pagination}>
          {displayImages.map((_, index) => (
            <View
              key={index}
              style={[styles.paginationDot, index === activeIndex && styles.paginationDotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Rating Stars Component
function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <View style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={{ fontSize: size }}>
          {star <= fullStars ? '⭐' : star === fullStars + 1 && hasHalfStar ? '⭐' : '☆'}
        </Text>
      ))}
    </View>
  );
}

// Review Card Component
function ReviewCard({ review }: { review: any }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAuthor}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {review.userName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text style={styles.reviewName}>{review.userName || 'Anonymous'}</Text>
            <RatingStars rating={review.rating} size={12} />
          </View>
        </View>
        <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
      </View>
      {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
}

// Quantity Selector Component
function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max,
}: {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max: number;
}) {
  return (
    <View style={styles.quantitySelector}>
      <TouchableOpacity
        style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
        onPress={onDecrease}
        disabled={quantity <= 1}
      >
        <Text style={styles.quantityButtonText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.quantityValue}>{quantity}</Text>
      <TouchableOpacity
        style={[styles.quantityButton, quantity >= max && styles.quantityButtonDisabled]}
        onPress={onIncrease}
        disabled={quantity >= max}
      >
        <Text style={styles.quantityButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

// Main Product Detail Screen
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const { data: product, isLoading, error } = useProduct(id || '');
  const { data: reviewsData } = useProductReviews(id || '');

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlistItem = useCartStore((state) => state.toggleWishlistItem);
  const addToRecentlyViewed = useCartStore((state) => state.addToRecentlyViewed);
  const isInWishlist = useCartStore((state) => state.wishlist.some((item) => item.id === id));

  const reviews = reviewsData?.data || [];

  // Add to recently viewed
  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id,
        name: product.name,
        price: product.salePrice || product.price,
        image: product.images?.[0] || 'https://via.placeholder.com/200',
      });
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/200',
      quantity,
      variant: selectedVariant || undefined,
    });

    Alert.alert('Added to Cart', `${product.name} has been added to your cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Product not found</Text>
          <Text style={styles.errorText}>
            The product you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => router.push('/products')}>
            <Text style={styles.errorButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;
  const inStock = (product.stock || 0) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() =>
            toggleWishlistItem({
              id: product.id,
              name: product.name,
              price: product.salePrice || product.price,
              image: product.images?.[0] || 'https://via.placeholder.com/200',
            })
          }
        >
          <Text style={styles.headerButtonText}>{isInWishlist ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <ImageCarousel images={product.images || []} />

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Category Badge */}
          {product.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category.name}</Text>
            </View>
          )}

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          {product.rating && (
            <View style={styles.ratingContainer}>
              <RatingStars rating={product.rating} />
              <Text style={styles.ratingText}>
                {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={styles.salePrice}>${product.salePrice.toFixed(2)}</Text>
                <Text style={styles.originalPrice}>${product.price.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{discountPercentage}%</Text>
                </View>
              </>
            ) : (
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <View
              style={[styles.stockIndicator, { backgroundColor: inStock ? '#10B981' : '#EF4444' }]}
            />
            <Text style={styles.stockText}>
              {inStock ? `${product.stock} in stock` : 'Out of stock'}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Variants (if any) */}
          {product.variants && product.variants.length > 0 && (
            <View style={styles.variantsContainer}>
              <Text style={styles.sectionTitle}>Variants</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {product.variants.map((variant: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.variantChip,
                      selectedVariant === variant.name && styles.variantChipSelected,
                    ]}
                    onPress={() => setSelectedVariant(variant.name)}
                  >
                    <Text
                      style={[
                        styles.variantText,
                        selectedVariant === variant.name && styles.variantTextSelected,
                      ]}
                    >
                      {variant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.quantityContainer}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock || 10))}
              onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
              max={product.stock || 10}
            />
          </View>

          {/* Reviews Section */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllLink}>See All</Text>
              </TouchableOpacity>
            </View>
            {reviews.length > 0 ? (
              reviews
                .slice(0, 3)
                .map((review: any) => <ReviewCard key={review.id} review={review} />)
            ) : (
              <Text style={styles.noReviews}>No reviews yet. Be the first to review!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.addToCartButton, !inStock && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={!inStock}
        >
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.buyNowButton, !inStock && styles.buttonDisabled]}
          onPress={handleBuyNow}
          disabled={!inStock}
        >
          <Text style={styles.buyNowButtonText}>Buy Now</Text>
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
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonText: {
    fontSize: 20,
  },
  carousel: {
    backgroundColor: '#F9FAFB',
  },
  carouselImage: {
    width: width,
    height: 400,
    backgroundColor: '#F3F4F6',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#4F46E5',
    width: 24,
  },
  productInfo: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  salePrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  discountBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 12,
  },
  discountText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stockText: {
    fontSize: 14,
    color: '#374151',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  variantsContainer: {
    marginBottom: 20,
  },
  variantChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  variantChipSelected: {
    backgroundColor: '#4F46E5',
  },
  variantText: {
    fontSize: 14,
    color: '#374151',
  },
  variantTextSelected: {
    color: '#FFFFFF',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 20,
  },
  reviewsSection: {
    marginBottom: 100,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  noReviews: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buyNowButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
