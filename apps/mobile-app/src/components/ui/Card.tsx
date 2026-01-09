import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export function Card({ children, style, variant = 'elevated', padding = 'md' }: CardProps) {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.light.surface,
          ...Shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.light.surface,
          borderWidth: 1,
          borderColor: Colors.light.border,
        };
      case 'filled':
        return {
          backgroundColor: Colors.light.surfaceSecondary,
        };
      default:
        return {
          backgroundColor: Colors.light.surface,
          ...Shadows.md,
        };
    }
  };

  const getPaddingValue = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Spacing.sm;
      case 'lg':
        return Spacing.lg;
      default:
        return Spacing.base;
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), { padding: getPaddingValue() }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
});
