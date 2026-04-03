import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setWishlist: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (productId) =>
        set((state) => {
          if (state.items.includes(productId)) return state;
          return { items: [...state.items, productId] };
        }),

      removeFromWishlist: (productId) =>
        set((state) => ({
          items: state.items.filter((id) => id !== productId),
        })),

      isInWishlist: (productId) => get().items.includes(productId),

      setWishlist: (items) => set({ items }),
    }),
    {
      name: 'silveri-wishlist',
    }
  )
);
