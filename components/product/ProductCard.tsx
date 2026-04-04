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
    <div className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
      isDark
        ? 'bg-silver-800 border border-silver-700 hover:border-silver-500 hover:shadow-lg hover:shadow-silver-900/50'
        : 'bg-white border border-silver-200 hover:shadow-xl hover:shadow-silver-200/60'
    }`}>
      {/* Wishlist button — top right */}
      <button
        onClick={handleWishlist}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
          isWishlisted
            ? 'bg-red-500 text-white scale-110'
            : isDark
              ? 'bg-silver-900/70 backdrop-blur-sm text-silver-300 hover:bg-red-500 hover:text-white'
              : 'bg-white/90 backdrop-blur-sm text-silver-400 hover:bg-red-500 hover:text-white'
        }`}
      >
        <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
      </button>

      {/* Product Link — Image + Info */}
      <Link href={`/product/${product.id}`} className="block">
        <div className={`relative aspect-[4/5] overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-silver-700 to-silver-800'
            : 'bg-gradient-to-br from-silver-100 to-silver-50'
        }`}>
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className={isDark ? 'text-silver-500 text-xs' : 'text-silver-400 text-xs'}>
                Product Image
              </span>
            </div>
          )}

          {/* Stock badge */}
          {product.stock <= 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 pb-2">
          <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-silver-500' : 'text-silver-400'}`}>
            {product.carat} · {product.colour}
          </p>
          <h3 className={`font-[family-name:var(--font-heading)] text-sm font-medium mt-0.5 line-clamp-1 ${
            isDark ? 'text-silver-100' : 'text-silver-800'
          }`}>
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-1.5">
            <span className={`font-semibold text-base ${isDark ? 'text-white' : 'text-silver-900'}`}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {/* Views & Likes */}
            <div className={`flex items-center gap-2.5 text-[10px] ${isDark ? 'text-silver-500' : 'text-silver-400'}`}>
              <span className="flex items-center gap-0.5"><Eye size={11} /> {views > 999 ? `${(views / 1000).toFixed(1)}k` : views}</span>
              <span className="flex items-center gap-0.5"><ThumbsUp size={11} /> {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action buttons */}
      <div className="px-3 pb-3 flex gap-2">
        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={liked}
          title={liked ? 'Liked!' : 'Like this product'}
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
            liked
              ? 'bg-blue-500 text-white'
              : isDark
                ? 'border border-silver-600 text-silver-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                : 'border border-silver-200 text-silver-400 hover:bg-blue-500 hover:text-white hover:border-blue-500'
          }`}
        >
          <ThumbsUp size={14} className={liked ? 'fill-current' : ''} />
        </button>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            addedToCart
              ? 'bg-green-500 text-white'
              : isDark
                ? 'border border-silver-600 text-silver-200 hover:bg-silver-600'
                : 'border border-silver-200 text-silver-700 hover:bg-silver-100'
          }`}
        >
          <ShoppingCart size={13} />
          {product.stock <= 0 ? 'Sold Out' : addedToCart ? 'Added!' : 'Cart'}
        </button>

        {/* Buy Now */}
        <button
          onClick={handleBuyNow}
          disabled={product.stock <= 0}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isDark
              ? 'bg-gold text-silver-900 hover:bg-gold-light'
              : 'bg-silver-900 text-white hover:bg-silver-800'
          }`}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
