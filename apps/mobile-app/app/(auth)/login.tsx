import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button, Input } from '@/components';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';
import { validateEmail, validatePassword } from '@3asoftwares/utils/client';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await login(email, password);
      showToast('Welcome back!', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Login failed. Please try again.',
        'error'
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.primary }]}>
            <Ionicons name="bag" size={48} color="white" />
            <Text style={styles.headerTitle}>3A Softwares</Text>
            <Text style={styles.headerSubtitle}>Welcome back to your favorite store</Text>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={errors.email}
              leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoComplete="password"
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="large"
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textMuted }]}>or</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <Button
              title="Continue with Google"
              onPress={() => showToast('Google sign-in coming soon', 'info')}
              variant="outline"
              fullWidth
              icon={<Ionicons name="logo-google" size={20} color={colors.primary} />}
            />

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={[styles.signupLink, { color: colors.primary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: Layout.spacing.xxl,
    paddingHorizontal: Layout.spacing.lg,
    alignItems: 'center',
    borderBottomLeftRadius: Layout.borderRadius.xl,
    borderBottomRightRadius: Layout.borderRadius.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginTop: Layout.spacing.md,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: Layout.spacing.xs,
  },
  formContainer: {
    flex: 1,
    padding: Layout.spacing.lg,
    marginTop: -Layout.spacing.lg,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Layout.spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Layout.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Layout.spacing.md,
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Layout.spacing.lg,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
