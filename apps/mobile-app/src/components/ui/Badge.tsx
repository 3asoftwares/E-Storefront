import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSizes, FontWeights } from '../../constants/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Badge({ text, variant = 'default', size = 'md', style, icon }: BadgeProps) {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.light.primary + '20', text: Colors.light.primary };
      case 'success':
        return { bg: Colors.light.success + '20', text: Colors.light.success };
      case 'warning':
        return { bg: Colors.light.warning + '20', text: Colors.light.warningDark };
      case 'error':
        return { bg: Colors.light.error + '20', text: Colors.light.error };
      case 'info':
        return { bg: Colors.light.info + '20', text: Colors.light.info };
      case 'secondary':
        return { bg: Colors.light.secondary + '20', text: Colors.light.secondary };
      default:
        return { bg: Colors.light.surfaceSecondary, text: Colors.light.textSecondary };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: Spacing.sm,
          fontSize: FontSizes.xs,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          fontSize: FontSizes.base,
        };
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: Spacing.sm,
          fontSize: FontSizes.sm,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, { color: colors.text, fontSize: sizeStyles.fontSize }]}>
        {text}
      </Text>
    </View>
  );
}

// Dot Badge - for notification dots
interface DotBadgeProps {
  count?: number;
  showZero?: boolean;
  max?: number;
  style?: ViewStyle;
}

export function DotBadge({ count, showZero = false, max = 99, style }: DotBadgeProps) {
  if (!count && !showZero) return null;
  if (count === 0 && !showZero) return null;

  const displayCount = count && count > max ? `${max}+` : count;

  return (
    <View style={[styles.dotBadge, style]}>
      {count !== undefined ? <Text style={styles.dotText}>{displayCount}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: FontWeights.medium,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  dotBadge: {
    backgroundColor: Colors.light.error,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    color: Colors.light.textInverse,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
  },
});
