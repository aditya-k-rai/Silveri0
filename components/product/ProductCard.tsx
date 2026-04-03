'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string;
  material?: string;
  isFeatured?: boolean;
}

export default function ProductCard({
  name,
  slug,
  price,
  comparePrice,
  image,
  material,
}: ProductCardProps) {
  const discount = comparePrice
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-silver/30">
      {/* Image */}
      <Link href={`/product/${slug}`} className="block relative aspect-square overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full bg-silver/30 flex items-center justify-center">
            <span className="text-muted text-sm">No Image</span>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-[#E53935] text-white text-xs font-semibold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}

        {/* Quick Actions (on hover) */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="flex-1 bg-gold text-warm-black py-2 rounded text-xs font-medium hover:bg-gold-light transition-colors flex items-center justify-center gap-1">
            <ShoppingCart size={14} />
            Add to Cart
          </button>
          <button className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-cream transition-colors shadow-sm">
            <Heart size={16} className="text-warm-black" />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        {material && (
          <span className="text-muted text-[10px] uppercase tracking-wider">
            {material}
          </span>
        )}
        <Link href={`/product/${slug}`}>
          <h3 className="font-[family-name:var(--font-heading)] text-base font-medium text-warm-black mt-0.5 line-clamp-1 hover:text-gold transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-warm-black font-semibold">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {comparePrice && comparePrice > price && (
            <span className="text-muted text-sm line-through">
              ₹{comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
