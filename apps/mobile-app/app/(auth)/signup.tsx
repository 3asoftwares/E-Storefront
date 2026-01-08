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

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();
  const { register, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;

    try {
      await register(name, email, password);
      showToast('Account created successfully! Please verify your email.', 'success');
      router.replace('/(tabs)');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Signup failed. Please try again.',
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
            <Ionicons name="person-add" size={48} color="white" />
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSubtitle}>Join us and start shopping today</Text>
          </View>

          {/* Form */}
          <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              error={errors.name}
              leftIcon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />}
            />

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
              autoComplete="new-password"
              error={errors.password}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            />

            <Input
              label="Confirm Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoComplete="new-password"
              error={errors.confirmPassword}
              leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />}
            />

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={isLoading}
              fullWidth
              size="large"
              style={{ marginTop: Layout.spacing.md }}
            />

            <Text style={[styles.termsText, { color: colors.textMuted }]}>
              By signing up, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>

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

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
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
    paddingVertical: Layout.spacing.xl,
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
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
    lineHeight: 18,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
