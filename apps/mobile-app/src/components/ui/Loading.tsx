import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, FontSizes } from '../../constants/theme';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  fullScreen?: boolean;
}

export function Loading({
  size = 'large',
  color = Colors.light.primary,
  text,
  style,
  fullScreen = false,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, style]}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
}

// Skeleton loader for placeholder content
interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <View style={styles.productSkeleton}>
      <Skeleton height={160} style={styles.productImageSkeleton} />
      <View style={styles.productSkeletonContent}>
        <Skeleton width="80%" height={16} />
        <Skeleton width="60%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="40%" height={18} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

// List skeleton
interface ListSkeletonProps {
  count?: number;
  itemHeight?: number;
}

export function ListSkeleton({ count = 5, itemHeight = 60 }: ListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItem, { height: itemHeight }]}>
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={styles.listItemContent}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="40%" height={12} style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
  },
  text: {
    marginTop: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.light.textSecondary,
  },
  skeleton: {
    backgroundColor: Colors.light.borderLight,
  },
  productSkeleton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  productImageSkeleton: {
    borderRadius: 0,
  },
  productSkeletonContent: {
    padding: Spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  listItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
