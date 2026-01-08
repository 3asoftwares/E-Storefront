import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useCartStore } from '@/store/cartStore';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showCart?: boolean;
  showSearch?: boolean;
  onSearchPress?: () => void;
  rightIcon?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title = '3A Softwares',
  showBack = false,
  showCart = true,
  showSearch = true,
  onSearchPress,
  rightIcon,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { items } = useCartStore();
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.surface }]}>
      <View style={[styles.container, { borderBottomColor: colors.border }]}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <Ionicons name="bag" size={24} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {showSearch && (
            <TouchableOpacity
              onPress={onSearchPress || (() => router.push('/products?search=true'))}
              style={styles.iconButton}
            >
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          {showCart && (
            <TouchableOpacity
              onPress={() => router.push('/cart')}
              style={styles.iconButton}
            >
              <Ionicons name="cart-outline" size={24} color={colors.text} />
              {cartItemCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.badgeText, { color: colors.textInverse }]}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          {rightIcon}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
