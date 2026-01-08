import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { ToastProvider } from '@/components/ToastProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                  fontWeight: '600',
                },
                contentStyle: {
                  backgroundColor: colors.background,
                },
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen
                name="product/[id]"
                options={{
                  title: 'Product Details',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="checkout"
                options={{
                  title: 'Checkout',
                  headerBackTitle: 'Cart',
                }}
              />
              <Stack.Screen
                name="order/[id]"
                options={{
                  title: 'Order Details',
                  headerBackTitle: 'Orders',
                }}
              />
            </Stack>
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
