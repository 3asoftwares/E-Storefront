import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button, EmptyState } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useOrders } from '@/hooks';
import { formatPrice } from '@3asoftwares/utils/client';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
  iconColor?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showBadge,
  badgeCount,
  iconColor,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${iconColor || colors.primary}15` }]}>
        <Ionicons name={icon} size={22} color={iconColor || colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.menuRight}>
        {showBadge && badgeCount !== undefined && badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const { items: cartItems, wishlist, recentlyViewed, clearCart } = useCartStore();
  const { data: ordersData } = useOrders();

  const pendingOrders =
    ordersData?.orders?.filter(
      (order: any) => order.status !== 'delivered' && order.status !== 'cancelled'
    ).length || 0;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearCart();
          router.replace('/(tabs)');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.guestContainer}>
          <View style={[styles.guestIconContainer, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="person" size={64} color={colors.textMuted} />
          </View>
          <Text style={[styles.guestTitle, { color: colors.text }]}>Welcome to 3A Softwares</Text>
          <Text style={[styles.guestSubtitle, { color: colors.textSecondary }]}>
            Sign in to access your orders, wishlist, and personalized recommendations
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            size="large"
            style={{ marginTop: Layout.spacing.lg }}
          />
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/signup')}
            variant="outline"
            fullWidth
            style={{ marginTop: Layout.spacing.md }}
          />
        </View>

        {/* Quick Links for Guest */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <MenuItem
            icon="cube-outline"
            title="Browse Products"
            onPress={() => router.push('/products')}
          />
          <MenuItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/cart')}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{cartItems.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Cart</Text>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/wishlist')}>
            <Text style={[styles.statValue, { color: colors.secondary }]}>{wishlist.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Wishlist</Text>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.statItem} onPress={() => {}}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {ordersData?.orders?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Account</Text>
          <MenuItem
            icon="bag-outline"
            title="My Orders"
            subtitle={pendingOrders > 0 ? `${pendingOrders} active orders` : undefined}
            onPress={() => {}}
            showBadge={pendingOrders > 0}
            badgeCount={pendingOrders}
          />
          <MenuItem
            icon="location-outline"
            title="Addresses"
            subtitle="Manage delivery addresses"
            onPress={() => {}}
          />
          <MenuItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage saved cards"
            onPress={() => {}}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shopping</Text>
          <MenuItem
            icon="heart-outline"
            title="Wishlist"
            subtitle={`${wishlist.length} items saved`}
            onPress={() => router.push('/wishlist')}
            iconColor={colors.secondary}
          />
          <MenuItem
            icon="time-outline"
            title="Recently Viewed"
            subtitle={`${recentlyViewed.length} products`}
            onPress={() => router.push('/products')}
          />
          <MenuItem
            icon="pricetag-outline"
            title="Offers & Coupons"
            onPress={() => {}}
            iconColor={colors.warning}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          <MenuItem icon="notifications-outline" title="Notifications" onPress={() => {}} />
          <MenuItem
            icon="moon-outline"
            title="Appearance"
            subtitle={colorScheme === 'dark' ? 'Dark mode' : 'Light mode'}
            onPress={() => {}}
          />
          <MenuItem icon="globe-outline" title="Language" subtitle="English" onPress={() => {}} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          <MenuItem icon="help-circle-outline" title="Help Center" onPress={() => {}} />
          <MenuItem icon="chatbubble-outline" title="Contact Us" onPress={() => {}} />
          <MenuItem icon="document-text-outline" title="Terms & Policies" onPress={() => {}} />
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            loading={isLoading}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.error} />}
            textStyle={{ color: colors.error }}
            style={{ borderColor: colors.error }}
          />
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
  },
  guestIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  guestSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    margin: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    margin: Layout.spacing.md,
    marginTop: 0,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  section: {
    margin: Layout.spacing.md,
    marginTop: 0,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: Layout.spacing.lg,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderBottomWidth: 0.5,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: Layout.spacing.md,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  logoutContainer: {
    padding: Layout.spacing.lg,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: Layout.spacing.xl,
  },
});
