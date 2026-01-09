import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Shadows,
} from '../src/constants/theme';
import { useCartStore } from '../src/store/cartStore';

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showArrow?: boolean;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  danger?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  showArrow = true,
  value,
  onValueChange,
  danger = false,
}: SettingItemProps) {
  const isToggle = value !== undefined && onValueChange !== undefined;

  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={isToggle ? undefined : onPress}
      activeOpacity={isToggle ? 1 : 0.7}
      disabled={isToggle}
    >
      <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {isToggle ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
          thumbColor={value ? Colors.light.textInverse : Colors.light.textTertiary}
        />
      ) : showArrow ? (
        <Text style={styles.arrow}>→</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { clearCart, clearRecentlyViewed, clearRecentSearches, userProfile, clearUser } =
    useCartStore();

  // Settings state (these would typically be persisted)
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to remove all items from your cart?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          clearCart();
          Alert.alert('Success', 'Cart cleared successfully');
        },
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will clear your recently viewed products and search history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            clearRecentlyViewed();
            clearRecentSearches();
            Alert.alert('Success', 'History cleared successfully');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          clearUser();
          clearCart();
          router.replace('/');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // In production, call API to delete account
            Alert.alert('Info', 'Account deletion request submitted');
          },
        },
      ]
    );
  };

  const openURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="👤"
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
            />
            <SettingItem
              icon="🔐"
              title="Change Password"
              subtitle="Update your password"
              onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')}
            />
            <SettingItem
              icon="📍"
              title="Addresses"
              subtitle="Manage delivery addresses"
              onPress={() => router.push('/addresses')}
            />
            <SettingItem
              icon="💳"
              title="Payment Methods"
              subtitle="Manage cards and payment options"
              onPress={() => Alert.alert('Coming Soon', 'Payment methods will be available soon')}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="🔔"
              title="Push Notifications"
              subtitle="Receive order and promo updates"
              value={notifications}
              onValueChange={setNotifications}
            />
            <SettingItem
              icon="📧"
              title="Email Updates"
              subtitle="Receive newsletters and offers"
              value={emailUpdates}
              onValueChange={setEmailUpdates}
            />
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="🔒"
              title="Biometric Login"
              subtitle="Use fingerprint or face ID"
              value={biometric}
              onValueChange={setBiometric}
            />
            <SettingItem
              icon="🛡️"
              title="Two-Factor Authentication"
              subtitle="Add extra security to your account"
              onPress={() => Alert.alert('Coming Soon', '2FA will be available soon')}
            />
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="🌙"
              title="Dark Mode"
              subtitle="Use dark theme"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            <SettingItem
              icon="🌐"
              title="Language"
              subtitle="English (US)"
              onPress={() => Alert.alert('Coming Soon', 'Language settings coming soon')}
            />
            <SettingItem
              icon="💵"
              title="Currency"
              subtitle="USD ($)"
              onPress={() => Alert.alert('Coming Soon', 'Currency settings coming soon')}
            />
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="🛒"
              title="Clear Cart"
              subtitle="Remove all items from cart"
              onPress={handleClearCart}
            />
            <SettingItem
              icon="🕐"
              title="Clear History"
              subtitle="Clear recently viewed & search history"
              onPress={handleClearHistory}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="❓"
              title="Help Center"
              subtitle="Get help and find answers"
              onPress={() => openURL('https://help.example.com')}
            />
            <SettingItem
              icon="💬"
              title="Contact Support"
              subtitle="Chat with our team"
              onPress={() => openURL('mailto:support@example.com')}
            />
            <SettingItem
              icon="⭐"
              title="Rate App"
              subtitle="Share your feedback"
              onPress={() => Alert.alert('Thank you!', 'Your feedback helps us improve')}
            />
          </View>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={[styles.sectionContent, Shadows.sm]}>
            <SettingItem
              icon="📄"
              title="Terms of Service"
              onPress={() => openURL('https://example.com/terms')}
            />
            <SettingItem
              icon="🔏"
              title="Privacy Policy"
              onPress={() => openURL('https://example.com/privacy')}
            />
            <SettingItem
              icon="📋"
              title="Licenses"
              onPress={() => Alert.alert('Licenses', 'Open source licenses used in this app')}
            />
          </View>
        </View>

        {/* Danger Zone */}
        {userProfile && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.dangerText]}>Danger Zone</Text>
            <View style={[styles.sectionContent, Shadows.sm]}>
              <SettingItem
                icon="🚪"
                title="Log Out"
                onPress={handleLogout}
                showArrow={false}
                danger
              />
              <SettingItem
                icon="🗑️"
                title="Delete Account"
                subtitle="Permanently delete your account"
                onPress={handleDeleteAccount}
                showArrow={false}
                danger
              />
            </View>
          </View>
        )}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>3A Storefront v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 3A Softwares</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
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
  content: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.base,
  },
  sectionTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  dangerIcon: {
    backgroundColor: Colors.light.error + '15',
  },
  icon: {
    fontSize: 18,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    color: Colors.light.text,
  },
  settingSubtitle: {
    fontSize: FontSizes.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 16,
    color: Colors.light.textTertiary,
  },
  dangerText: {
    color: Colors.light.error,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  versionText: {
    fontSize: FontSizes.sm,
    color: Colors.light.textTertiary,
  },
  copyrightText: {
    fontSize: FontSizes.xs,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs,
  },
});
