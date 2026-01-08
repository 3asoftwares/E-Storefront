import React from 'react';
import { View, Text, StyleSheet, FlatList, useColorScheme, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { ProductCard, EmptyState } from '@/components';
import { useCartStore } from '@/store/cartStore';
import { useToast } from '@/components/ToastProvider';

export default function WishlistScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();

  const { wishlist, removeFromWishlist, addItem, items } = useCartStore();

  const handleRemoveFromWishlist = (id: string, name: string) => {
    removeFromWishlist(id);
    showToast(`${name} removed from wishlist`, 'info');
  };

  const handleAddToCart = (item: (typeof wishlist)[0]) => {
    addItem({
      id: `cart-${item.id}`,
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.imageUrl,
    });
    showToast(`${item.name} added to cart`, 'success');
  };

  const isInCart = (productId: string) => items.some((item) => item.productId === productId);

  if (wishlist.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Your Wishlist is Empty"
        description="Save items you love by tapping the heart icon on any product."
        actionText="Discover Products"
        onAction={() => router.push('/products')}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={
              {
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
              } as any
            }
            onPress={() => router.push(`/product/${item.id}`)}
            onAddToCart={() => handleAddToCart(item)}
            onWishlistToggle={() => handleRemoveFromWishlist(item.id, item.name)}
            isInWishlist={true}
            isInCart={isInCart(item.id)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Layout.spacing.md,
  },
  row: {
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: Layout.spacing.md,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
