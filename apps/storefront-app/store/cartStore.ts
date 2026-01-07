import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartStore } from '3a-ecommerce-types';
import { getCurrentUser } from '3a-ecommerce-utils/client';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      recentlyViewed: [],
      userProfile: null,

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity > 0
              ? state.items.map((item) => (item.id === id ? { ...item, quantity } : item))
              : state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      addToWishlist: (item) =>
        set((state) => {
          const exists = state.wishlist.find((w) => w.productId === item.productId);
          if (exists) return state;
          return {
            wishlist: [...state.wishlist, { ...item, addedAt: Date.now() }],
          };
        }),

      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.filter((w) => w.productId !== productId),
        })),

      isInWishlist: (productId) => {
        return get().wishlist.some((w) => w.productId === productId);
      },

      addRecentlyViewed: (item) => {
        const { recentlyViewed } = get();
        const filtered = recentlyViewed.filter((i) => i.productId !== item.productId);
        set({ recentlyViewed: [item, ...filtered].slice(0, 12) });
      },

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      setUserProfile: (profile) => set({ userProfile: profile }),

      loadUserFromStorage: () => {
        if (typeof window === 'undefined') return;

        try {
          const user = getCurrentUser();
          if (user) {
            set({
              userProfile: {
                id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                addresses: user.addresses || [],
                defaultAddressId: user.defaultAddressId,
                phone: user.phone,
              },
            });
          }
        } catch (error) {}
      },

      addAddress: (address) =>
        set((state) => {
          if (!state.userProfile) return state;
          const newAddresses = [...(state.userProfile.addresses || []), address];
          return {
            userProfile: {
              ...state.userProfile,
              addresses: newAddresses,
              defaultAddressId: address.isDefault ? address.id : state.userProfile.defaultAddressId,
            },
          };
        }),

      removeAddress: (addressId) =>
        set((state) => {
          if (!state.userProfile) return state;
          return {
            userProfile: {
              ...state.userProfile,
              addresses: state.userProfile.addresses.filter((a) => a.id !== addressId),
              defaultAddressId:
                state.userProfile.defaultAddressId === addressId
                  ? state.userProfile.addresses[0]?.id
                  : state.userProfile.defaultAddressId,
            },
          };
        }),

      setDefaultAddress: (addressId) =>
        set((state) => {
          if (!state.userProfile) return state;
          return {
            userProfile: {
              ...state.userProfile,
              defaultAddressId: addressId,
            },
          };
        }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
