import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import type { CategoryGraphQL } from '@3asoftwares/types';

interface CategoryCardProps {
  category: CategoryGraphQL;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.borderLight }]}>
        {category.imageUrl ? (
          <Image source={{ uri: category.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name="grid-outline" size={32} color={colors.textMuted} />
        )}
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
        {category.name}
      </Text>
      {category.productCount !== undefined && (
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {category.productCount} items
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    alignItems: 'center',
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginRight: Layout.spacing.sm,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: Layout.spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  count: {
    fontSize: 10,
    marginTop: 2,
  },
});
