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
    if (isWishlisted) removeFromWishlist(product.id);
    else addToWishlist(product.id);
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

      {/* ====== IMAGE SECTION ====== */}
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
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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

          {/* Like Button — Top Left */}
          <button
            onClick={handleLike}
            disabled={liked}
            title={liked ? 'Liked!' : 'Like this product'}
            className={`absolute top-3 left-3 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              liked
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : isDark
                  ? 'bg-black/40 backdrop-blur-md text-white/80 hover:bg-blue-500 hover:text-white'
                  : 'bg-white/80 backdrop-blur-md text-silver-400 shadow-sm hover:bg-blue-500 hover:text-white'
            }`}
          >
            <ThumbsUp size={16} className={liked ? 'fill-current' : ''} />
          </button>

          {/* Wishlist Heart — Top Right */}
          <button
            onClick={handleWishlist}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`absolute top-3 right-3 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 scale-110'
                : isDark
                  ? 'bg-black/40 backdrop-blur-md text-white/80 hover:bg-red-500 hover:text-white'
                  : 'bg-white/80 backdrop-blur-md text-silver-400 shadow-sm hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
          </button>

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
          <h3 className={`font-[family-name:var(--font-heading)] text-sm sm:text-base font-semibold line-clamp-1 transition-colors ${
            isDark ? 'text-white hover:text-gold-light' : 'text-silver-900 hover:text-gold-dark'
          }`}>
            {product.name}
          </h3>
        </Link>

        {/* Details Row: Size + Weight | Carat Badge */}
        <div className="flex items-center justify-between mt-1.5">
          <div className={`flex items-center gap-1 text-[11px] sm:text-xs ${isDark ? 'text-silver-400' : 'text-silver-500'}`}>
            {product.size && <span>Size: {product.size}</span>}
            {product.size && product.weight && <span>&middot;</span>}
            {product.weight && <span>Wt: {product.weight}</span>}
          </div>
          {product.carat && (
            <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isDark
                ? 'bg-gold/20 text-gold-light'
                : 'bg-gold/10 text-gold-dark border border-gold/20'
            }`}>
              {product.carat}
            </span>
          )}
        </div>

        {/* Colour Options */}
        {product.colour && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              isDark ? 'bg-silver-700 text-silver-300' : 'bg-silver-100 text-silver-600'
            }`}>
              {product.colour}
            </span>
            {product.colour2 && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isDark ? 'bg-silver-700 text-silver-300' : 'bg-silver-100 text-silver-600'
              }`}>
                {product.colour2}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <p className={`font-bold text-base sm:text-lg mt-2 ${isDark ? 'text-white' : 'text-silver-900'}`}>
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        {/* Stats Row: Views + Likes */}
        <div className={`flex items-center gap-4 mt-2 text-[11px] ${isDark ? 'text-silver-500' : 'text-silver-400'}`}>
          <span className="flex items-center gap-1">
            <Eye size={12} /> {views > 999 ? `${(views / 1000).toFixed(1)}k` : views}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} /> {likes > 999 ? `${(likes / 1000).toFixed(1)}k` : likes}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              addedToCart
                ? 'bg-green-500 text-white'
                : isDark
                  ? 'border border-silver-500 text-silver-200 hover:bg-silver-700'
                  : 'border-2 border-silver-900 text-silver-900 hover:bg-silver-900 hover:text-white'
            }`}
          >
            <ShoppingCart size={14} />
            {product.stock <= 0 ? 'Sold Out' : addedToCart ? 'Added!' : 'Add to Cart'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-gold text-silver-900 hover:bg-gold-light'
                : 'bg-gold text-white hover:bg-gold-dark'
            }`}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
