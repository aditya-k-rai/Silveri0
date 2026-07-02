'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthContext } from '@/context/AuthContext';
import { logActivity } from '@/lib/firebase/activityLog';
import { trackAddToCart, trackSelectItem } from '@/lib/analytics/gtm';

interface ProductCardProps {
  product: Product;
  variant?: 'light' | 'dark';
  /** Name of the list this card appears in, e.g. "Featured Products" */
  listName?: string;
}

export default function ProductCard({ product, variant = 'light', listName = 'Product List' }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user, userDoc } = useAuthContext();
  const isWishlisted = wishlistItems.includes(product.id);
  const [addedToCart, setAddedToCart] = useState(false);

  const isDark = variant === 'dark';

  const activityBase = user
    ? {
        userId: user.uid,
        userName: userDoc?.name || user.displayName || 'Unknown User',
        userEmail: user.email || '',
        userPhoto: user.photoURL || '',
        productId: product.id,
        productName: product.name,
        productImage: product.primaryImage || '',
        productPrice: product.price,
      }
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.primaryImage || '',
    });
    if (activityBase) {
      logActivity({ ...activityBase, type: 'cart', action: 'added' });
    }
    trackAddToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.primaryImage || '',
    });
    if (activityBase) {
      logActivity({ ...activityBase, type: 'cart', action: 'added' });
    }
    trackAddToCart(product, 1);

    const redirectPath = user
      ? '/checkout?step=address'
      : `/login?redirect=${encodeURIComponent('/checkout?step=address')}`;

    // Wait for the store to reflect the new item before navigating.
    // Prevents the mobile race condition where router.push fires before
    // Zustand/persist has flushed the update, causing checkout to show
    // an empty cart (only delivery charges).
    const timeout = setTimeout(() => {
      router.push(redirectPath);
    }, 400);

    const unsub = useCartStore.subscribe((state) => {
      const found = state.items.some((i) => i.productId === product.id);
      if (found) {
        clearTimeout(timeout);
        unsub();
        router.push(redirectPath);
      }
    });
  };


  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      if (activityBase) {
        logActivity({ ...activityBase, type: 'wishlist', action: 'removed' });
      }
    } else {
      addToWishlist(product.id);
      if (activityBase) {
        logActivity({ ...activityBase, type: 'wishlist', action: 'added' });
      }
    }
  };

  const views = product.views ?? 0;

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-silver-50 border border-silver-200/80 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300">

      {/* ====== IMAGE SECTION ====== */}
      <Link href={`/product/${product.id}`} className="block" onClick={() => trackSelectItem(product, listName)}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-silver-100 to-silver-50">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={90}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xs text-silver-500">
                Product Image
              </span>
            </div>
          )}

          {/* Wishlist Heart — Top Right */}
          <button
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`absolute top-3 right-3 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                : 'bg-black/40 backdrop-blur-md text-white/80 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </button>

          {/* New Arrival Ribbon */}
          {product.isNewArrival && (
            <div className="absolute top-0 left-0 z-20 overflow-hidden">
              <div className="bg-[#D6006E] text-white text-[10px] font-bold tracking-wider px-4 py-1 shadow-md"
                style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)' }}
              >
                NEW
              </div>
            </div>
          )}

          {/* Sold Out Badge */}
          {product.stock <= 0 && (
            <span className="absolute bottom-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
              Sold Out
            </span>
          )}

        </div>
      </Link>

      {/* ====== PRODUCT INFO ====== */}
      <div className="p-3 sm:p-4">
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold line-clamp-1 transition-colors text-silver-900 hover:text-gold">
            {product.name}
          </h3>
        </Link>

        {/* Details Row: Size + Weight | Carat Badge */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-silver-500">
            {product.size && <span>Size: {product.size}</span>}
            {product.size && product.weight && <span>&middot;</span>}
            {product.weight && <span>Wt: {product.weight}</span>}
          </div>
          {product.carat && (
            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gold/10 text-gold-light border border-gold/20">
              {product.carat}
            </span>
          )}
        </div>

        {/* Colour Options */}
        {product.colour && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-silver-100 text-silver-600">
              {product.colour}
            </span>
            {product.colour2 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-silver-100 text-silver-600">
                {product.colour2}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <p className="font-bold text-base sm:text-lg mt-2 text-silver-900">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        {/* Stats Row: Views only */}
        <div className="flex items-center gap-4 mt-2 text-[11px] text-silver-500">
          <span className="flex items-center gap-1">
            <Eye size={12} /> {views > 999 ? `${(views / 1000).toFixed(1)}k` : views} views
          </span>
        </div>

        {/* Action Buttons — square cart icon + full-width Buy Now on mobile;
            both side-by-side with text on desktop. */}
        <div className="flex gap-2 mt-3">
          {/* Add to Cart — icon-only square on mobile, full text from sm */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            aria-label={addedToCart ? 'Added to cart' : 'Add to cart'}
            style={{ touchAction: 'manipulation' }}
            className={`shrink-0 w-11 sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-0 sm:px-3 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              addedToCart
                ? 'bg-green-500 text-white border-2 border-green-500'
                : 'border border-silver-200 text-silver-300 hover:bg-silver-100 hover:text-white'
            }`}
          >
            <ShoppingCart size={16} className="shrink-0" />
            <span className="hidden sm:inline">
              {product.stock <= 0 ? 'Sold Out' : addedToCart ? 'Added!' : 'Add to Cart'}
            </span>
          </button>

          {/* Buy Now — primary gold, full width on mobile */}
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            style={{ touchAction: 'manipulation' }}
            className="flex-1 inline-flex items-center justify-center py-2.5 sm:py-3 px-3 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-gold text-white hover:bg-gold-dark"
          >
            {product.stock <= 0 ? 'Sold Out' : 'Buy Now'}
          </button>
        </div>
      </div>
    </div>
  );
}
