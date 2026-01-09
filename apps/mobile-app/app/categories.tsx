import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCategories } from '../src/lib/hooks';
import { Loading, EmptyState } from '../src/components/ui';
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Shadows,
  CategoryEmojis,
} from '../src/constants/theme';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

export default function CategoriesScreen() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useCategories();

  const categories: Category[] = data?.categories || [];

  const getCategoryEmoji = (slug: string) => {
    const key = slug.toLowerCase();
    return CategoryEmojis[key] || CategoryEmojis.default;
  };

  const handleCategoryPress = (category: Category) => {
    // Navigate to products screen with category filter
    router.push({
      pathname: '/(tabs)/products',
      params: { category: category.id },
    });
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading categories..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <EmptyState
          icon="❌"
          title="Error loading categories"
          description="Please try again later"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </SafeAreaView>
    );
  }

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryCard, Shadows.sm]}
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{getCategoryEmoji(item.slug)}</Text>
          </View>
        )}
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        {item.productCount !== undefined && (
          <Text style={styles.productCount}>
            {item.productCount} product{item.productCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Categories</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Categories List */}
      {categories.length === 0 ? (
        <EmptyState
          icon="📂"
          title="No categories found"
          description="Categories will appear here"
        />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: Colors.light.text,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.light.text,
  },
  placeholder: {
    width: 32,
  },
  list: {
    padding: Spacing.base,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emojiContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  categoryName: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  categoryDescription: {
    fontSize: FontSizes.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  productCount: {
    fontSize: FontSizes.xs,
    color: Colors.light.textTertiary,
  },
  arrow: {
    fontSize: 18,
    color: Colors.light.textTertiary,
  },
  separator: {
    height: Spacing.md,
  },
});
