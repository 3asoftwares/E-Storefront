import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  CartStore,
  WishlistItem,
  RecentlyViewedItem,
  StoreUserProfile,
} from '@3asoftwares/types';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartStoreState {
  items: CartItem[];
  wishlist: WishlistItem[];
  recentlyViewed: RecentlyViewedItem[];
  userProfile: StoreUserProfile | null;

  // Cart actions
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Wishlist actions
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;

  // Recently viewed actions
  addToRecentlyViewed: (item: RecentlyViewedItem) => void;
  clearRecentlyViewed: () => void;

  // User profile actions
  setUserProfile: (profile: StoreUserProfile | null) => void;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      recentlyViewed: [],
      userProfile: null,

      // Cart actions
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.productId === item.productId);

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }

          return { items: [...state.items, item] };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) return;

        set((state) => ({
          items: state.items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      // Wishlist actions
      addToWishlist: (item) => {
        set((state) => {
          if (state.wishlist.some((i) => i.id === item.id)) {
            return state;
          }
          return { wishlist: [...state.wishlist, { ...item, addedAt: new Date() }] };
        });
      },

      removeFromWishlist: (itemId) => {
        set((state) => ({
          wishlist: state.wishlist.filter((i) => i.id !== itemId),
        }));
      },

      isInWishlist: (itemId) => {
        return get().wishlist.some((i) => i.id === itemId);
      },

      // Recently viewed actions
      addToRecentlyViewed: (item) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((i) => i.id !== item.id);
          const newRecentlyViewed = [{ ...item, viewedAt: new Date() }, ...filtered].slice(0, 20);
          return { recentlyViewed: newRecentlyViewed };
        });
      },

      clearRecentlyViewed: () => {
        set({ recentlyViewed: [] });
      },

      // User profile actions
      setUserProfile: (profile) => {
        set({ userProfile: profile });
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        wishlist: state.wishlist,
        recentlyViewed: state.recentlyViewed,
        userProfile: state.userProfile,
      }),
    }
  )
);
