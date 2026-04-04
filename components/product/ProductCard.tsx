'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, ThumbsUp, Eye } from 'lucide-react';
import { Product, useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { updateProductDoc } from '@/lib/firebase/products';

interface ProductCardProps {
  product: Product;
  variant?: 'light' | 'dark';
}

export default function ProductCard({ product, variant = 'light' }: ProductCardProps) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const incrementLikes = useProductStore((s) => s.incrementLikes);
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.includes(product.id);
  const [liked, setLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const isDark = variant === 'dark';

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
    router.push('/checkout');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (liked) return;
    setLiked(true);
    incrementLikes(product.id);
    updateProductDoc(product.id, { likes: (product.likes ?? 0) + 1 });
  };

  const views = product.views ?? 0;
  const likes = product.likes ?? 0;

  return (
    <div className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
      isDark
        ? 'bg-silver-800/80 border border-silver-700/50 hover:border-silver-600 hover:shadow-2xl hover:shadow-black/20'
        : 'bg-white border border-silver-200/80 hover:shadow-2xl hover:shadow-silver-300/40 hover:-translate-y-1'
    }`}>
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
          isWishlisted
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
            : isDark
              ? 'bg-black/40 backdrop-blur-md text-white/80 hover:bg-red-500 hover:text-white'
              : 'bg-white/80 backdrop-blur-md text-silver-400 shadow-sm hover:bg-red-500 hover:text-white'
        }`}
      >
        <Heart size={18} className={isWishlisted ? 'fill-current' : ''} />
      </button>

      {/* Stock Badge */}
      {product.stock <= 0 && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
          Sold Out
        </span>
      )}

      {/* Product Image — 1:1 Square */}
      <Link href={`/product/${product.id}`} className="block">
        <div className={`relative aspect-square overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-silver-700 to-silver-800'
            : 'bg-gradient-to-br from-silver-100 to-silver-50'
        }`}>
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={90}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={`text-xs ${isDark ? 'text-silver-500' : 'text-silver-400'}`}>
                Product Image
              </span>
            </div>
          )}

          {/* Hover Overlay with Quick Actions (desktop) */}
          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex items-end ${
            isDark ? 'bg-gradient-to-t from-black/60 via-transparent' : 'bg-gradient-to-t from-black/50 via-transparent'
          }`}>
            <div className="w-full p-3 flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-silver-900 hover:bg-gold hover:text-white'
                }`}
              >
                <ShoppingCart size={14} />
                {product.stock <= 0 ? 'Sold Out' : addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-gold text-white hover:bg-gold-dark transition-all disabled:opacity-40"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Meta Row */}
        <div className="flex items-center justify-between mb-1.5">
          <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-medium ${
            isDark ? 'text-gold/80' : 'text-gold-dark'
          }`}>
            {product.carat} &middot; {product.colour}
          </span>
          <div className={`flex items-center gap-2 text-[10px] ${isDark ? 'text-silver-500' : 'text-silver-400'}`}>
            <span className="flex items-center gap-0.5"><Eye size={10} /> {views > 999 ? `${(views / 1000).toFixed(1)}k` : views}</span>
            <span className="flex items-center gap-0.5"><ThumbsUp size={10} /> {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>
          </div>
        </div>

        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className={`font-[family-name:var(--font-heading)] text-sm sm:text-base font-medium line-clamp-1 transition-colors ${
            isDark ? 'text-silver-100 hover:text-gold-light' : 'text-silver-800 hover:text-gold-dark'
          }`}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <p className={`font-semibold text-lg sm:text-xl mt-1 ${isDark ? 'text-white' : 'text-silver-900'}`}>
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        {/* Mobile Action Buttons */}
        <div className="flex gap-2 mt-3 md:hidden">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
              liked
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'border border-silver-600 text-silver-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                  : 'border border-silver-200 text-silver-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
            }`}
          >
            <ThumbsUp size={14} className={liked ? 'fill-current' : ''} />
          </button>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
              addedToCart
                ? 'bg-green-500 text-white'
                : isDark
                  ? 'border border-silver-600 text-silver-200 hover:bg-silver-700'
                  : 'border border-silver-200 text-silver-700 hover:bg-silver-100'
            }`}
          >
            <ShoppingCart size={13} />
            {product.stock <= 0 ? 'Sold Out' : addedToCart ? 'Added!' : 'Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
              isDark
                ? 'bg-gold text-silver-900 hover:bg-gold-light'
                : 'bg-silver-900 text-white hover:bg-silver-800'
            }`}
          >
            Buy Now
          </button>
        </div>

        {/* Desktop Like Button (below card actions) */}
        <div className="hidden md:flex items-center gap-2 mt-3">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
              liked
                ? 'bg-blue-500 text-white'
                : isDark
                  ? 'border border-silver-600 text-silver-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                  : 'border border-silver-200 text-silver-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
            }`}
          >
            <ThumbsUp size={14} className={liked ? 'fill-current' : ''} />
          </button>
          <span className={`text-[11px] ${isDark ? 'text-silver-500' : 'text-silver-400'}`}>
            {liked ? 'You liked this' : 'Like this product'}
          </span>
        </div>
      </div>
    </div>
  );
}
