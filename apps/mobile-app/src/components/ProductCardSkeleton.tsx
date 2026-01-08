import React from 'react';
import { View, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - Layout.spacing.md * 3) / 2;

export const ProductCardSkeleton: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={[styles.imagePlaceholder, { backgroundColor: colors.borderLight }]} />
      <View style={styles.content}>
        <View style={[styles.titlePlaceholder, { backgroundColor: colors.borderLight }]} />
        <View style={[styles.titlePlaceholder2, { backgroundColor: colors.borderLight }]} />
        <View style={[styles.pricePlaceholder, { backgroundColor: colors.borderLight }]} />
        <View style={[styles.buttonPlaceholder, { backgroundColor: colors.borderLight }]} />
      </View>
    </View>
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
  imagePlaceholder: {
    height: 140,
    width: '100%',
  },
  content: {
    padding: Layout.spacing.sm,
  },
  titlePlaceholder: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  titlePlaceholder2: {
    height: 14,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  pricePlaceholder: {
    height: 18,
    width: '40%',
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonPlaceholder: {
    height: 32,
    width: '100%',
    borderRadius: Layout.borderRadius.sm,
  },
});
