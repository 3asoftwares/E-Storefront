import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCartStore } from '../../src/store/cartStore';
import { useCurrentUser, useLogout, useOrders } from '../../src/lib/hooks';

// Menu Item Component
function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
  showBadge,
  badgeCount,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {showBadge && badgeCount && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// Stats Card Component
function StatsCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.statsCard}>
      <Text style={styles.statsIcon}>{icon}</Text>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );
}

// Guest View Component
function GuestView() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.guestContainer}>
        <Text style={styles.guestEmoji}>👤</Text>
        <Text style={styles.guestTitle}>Welcome, Guest!</Text>
        <Text style={styles.guestSubtitle}>Sign in to access your profile, orders, and more</Text>
        <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/login')}>
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpButton} onPress={() => router.push('/signup')}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <MenuItem
          icon="🛒"
          title="View Cart"
          subtitle="Check your shopping cart"
          onPress={() => router.push('/cart')}
        />
        <MenuItem
          icon="❤️"
          title="Wishlist"
          subtitle="Items you've saved"
          onPress={() => router.push('/wishlist')}
        />
        <MenuItem
          icon="🔍"
          title="Browse Products"
          subtitle="Explore our catalog"
          onPress={() => router.push('/products')}
        />
      </View>
    </SafeAreaView>
  );
}

// Main Profile Screen
export default function ProfileScreen() {
  const userProfile = useCartStore((state) => state.userProfile);
  const cart = useCartStore((state) => state.cart);
  const wishlist = useCartStore((state) => state.wishlist);

  const { data: currentUser, isLoading: userLoading, refetch: refetchUser } = useCurrentUser();
  const { data: ordersData, isLoading: ordersLoading } = useOrders(1, 10);
  const { logout, isLoading: logoutLoading } = useLogout();

  const orders = ordersData?.data || [];
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // If no user profile and not loading, show guest view
  if (!userProfile && !userLoading) {
    return <GuestView />;
  }

  if (userLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const user = currentUser || userProfile;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <StatsCard icon="📦" label="Orders" value={orders.length} />
          <StatsCard icon="🛒" label="Cart" value={cartItemCount} />
          <StatsCard icon="❤️" label="Wishlist" value={wishlist.length} />
        </View>

        {/* Menu Sections */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <MenuItem
            icon="📦"
            title="My Orders"
            subtitle="View your order history"
            onPress={() => router.push('/orders')}
            showBadge
            badgeCount={orders.filter((o: any) => o.status === 'pending').length}
          />
          <MenuItem
            icon="📍"
            title="Addresses"
            subtitle="Manage your addresses"
            onPress={() => router.push('/addresses')}
          />
          <MenuItem
            icon="❤️"
            title="Wishlist"
            subtitle={`${wishlist.length} items saved`}
            onPress={() => router.push('/wishlist')}
          />
          <MenuItem
            icon="🛒"
            title="Shopping Cart"
            subtitle={`${cartItemCount} items`}
            onPress={() => router.push('/cart')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <MenuItem
            icon="🔔"
            title="Notifications"
            subtitle="Manage notifications"
            onPress={() =>
              Alert.alert('Coming Soon', 'Notification settings will be available soon')
            }
          />
          <MenuItem
            icon="🔒"
            title="Privacy & Security"
            subtitle="Password, 2FA, and more"
            onPress={() => Alert.alert('Coming Soon', 'Security settings will be available soon')}
          />
          <MenuItem
            icon="🌙"
            title="Appearance"
            subtitle="Theme and display"
            onPress={() => Alert.alert('Coming Soon', 'Theme settings will be available soon')}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <MenuItem
            icon="💬"
            title="Help Center"
            subtitle="FAQs and support"
            onPress={() => Alert.alert('Help Center', 'Contact us at support@store.com')}
          />
          <MenuItem
            icon="📝"
            title="Terms of Service"
            subtitle="Legal information"
            onPress={() => Alert.alert('Terms of Service', 'Terms and conditions apply')}
          />
          <MenuItem
            icon="🔐"
            title="Privacy Policy"
            subtitle="How we use your data"
            onPress={() => Alert.alert('Privacy Policy', 'Your privacy is important to us')}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Sign Out</Text>
            </>
          )}
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  guestContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  guestEmoji: {
    fontSize: 64,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    padding: 16,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  editProfileButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
  },
  editProfileText: {
    color: '#4F46E5',
    fontWeight: '500',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statsCard: {
    alignItems: 'center',
    minWidth: 80,
  },
  statsIcon: {
    fontSize: 24,
  },
  statsValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuSection: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 22,
    width: 32,
  },
  menuTextContainer: {
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 24,
  },
});
