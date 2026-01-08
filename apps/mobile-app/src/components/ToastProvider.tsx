import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [toasts, setToasts] = useState<Toast[]>([]);

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.success, icon: 'checkmark-circle' as const };
      case 'error':
        return { backgroundColor: colors.error, icon: 'alert-circle' as const };
      case 'warning':
        return { backgroundColor: colors.warning, icon: 'warning' as const };
      case 'info':
      default:
        return { backgroundColor: colors.info, icon: 'information-circle' as const };
    }
  };

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((toast) => {
          const { backgroundColor, icon } = getToastStyle(toast.type);
          return (
            <Animated.View
              key={toast.id}
              style={[styles.toast, { backgroundColor }]}
            >
              <Ionicons name={icon} size={20} color="white" />
              <Text style={styles.toastText}>{toast.message}</Text>
              <TouchableOpacity onPress={() => removeToast(toast.id)}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.sm,
    minWidth: 200,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginHorizontal: Layout.spacing.sm,
  },
});
