'use client';

import { useWishlistStore } from '@/store/wishlistStore';

export function useWishlist() {
  const items = useWishlistStore((state) => state.items);
  const addToWishlist = useWishlistStore((state) => state.addToWishlist);
  const removeFromWishlist = useWishlistStore((state) => state.removeFromWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const setWishlist = useWishlistStore((state) => state.setWishlist);

  return { items, itemCount: items.length, addToWishlist, removeFromWishlist, isInWishlist, setWishlist };
}
