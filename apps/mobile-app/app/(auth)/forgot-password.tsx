import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { Button, Input } from '@/components';
import { useToast } from '@/components/ToastProvider';
import { validateEmail } from '@3asoftwares/utils/client';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement password reset API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      showToast('Reset link sent to your email', 'success');
    } catch (err) {
      showToast('Failed to send reset link. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
            <Ionicons name="mail" size={64} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Check Your Email</Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            We've sent a password reset link to {email}. Please check your inbox and follow the
            instructions.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
            style={{ marginTop: Layout.spacing.xl }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: colors.borderLight }]}>
            <Ionicons name="key" size={64} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Forgot Password?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          <Input
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={error}
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textMuted} />}
          />

          <Button
            title="Send Reset Link"
            onPress={handleSubmit}
            loading={isLoading}
            fullWidth
            size="large"
          />

          <Button
            title="Back to Login"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            style={{ marginTop: Layout.spacing.md }}
          />
        </View>
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
  content: {
    flex: 1,
    padding: Layout.spacing.lg,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: 20,
  },
  successContainer: {
    flex: 1,
    padding: Layout.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
