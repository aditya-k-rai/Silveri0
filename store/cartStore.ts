import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

/** Build a stable unique cart-line key from product + selected variant options. */
function makeCartLineId(productId: string, size?: string, chain?: string) {
  return `${productId}__${size ?? ''}__${chain ?? ''}`;
}

/** Backfill cartLineId on legacy persisted items that don't have it. */
function ensureCartLineId(item: CartItem): CartItem {
  if (item.cartLineId) return item;
  return { ...item, cartLineId: makeCartLineId(item.productId, item.size, item.chain) };
}

interface CartState {
  items: CartItem[];
  /** Caller passes a CartItem without `cartLineId`; the store computes it. */
  addItem: (item: Omit<CartItem, 'cartLineId'> & { cartLineId?: string }) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (raw) =>
        set((state) => {
          const cartLineId =
            raw.cartLineId ?? makeCartLineId(raw.productId, raw.size, raw.chain);
          const newItem: CartItem = { ...raw, cartLineId };
          const existing = state.items.find((i) => ensureCartLineId(i).cartLineId === cartLineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                ensureCartLineId(i).cartLineId === cartLineId
                  ? { ...i, cartLineId, quantity: i.quantity + raw.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        }),

      removeItem: (cartLineId) =>
        set((state) => ({
          items: state.items.filter((i) => ensureCartLineId(i).cartLineId !== cartLineId),
        })),

      updateQuantity: (cartLineId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => ensureCartLineId(i).cartLineId !== cartLineId)
              : state.items.map((i) =>
                  ensureCartLineId(i).cartLineId === cartLineId ? { ...i, quantity } : i
                ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'silveri-cart',
    }
  )
);
