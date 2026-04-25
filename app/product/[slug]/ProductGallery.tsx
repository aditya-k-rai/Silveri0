'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  name: string;
  primaryImage: string | null;
  hoverImage: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
}

export default function ProductGallery({ name, primaryImage, hoverImage, image3, image4, image5, image6 }: ProductGalleryProps) {
  const [activeThumb, setActiveThumb] = useState(0);

  const images = [primaryImage, hoverImage, image3, image4, image5, image6].filter(Boolean) as string[];

  return (
    <div className="sticky top-24">
      {/* Main Display */}
      <div className="relative w-full max-w-[520px]">
        <div className="aspect-square bg-silver-100 rounded-2xl overflow-hidden relative">
          {images.length > 0 ? (
            <Image
              src={images[activeThumb] || images[0]}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 520px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-silver-400 text-sm">Product Image</span>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div className="flex gap-2 sm:gap-3 mt-4 max-w-[520px] overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveThumb(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 overflow-hidden relative cursor-pointer transition-all duration-200 shrink-0 ${
                activeThumb === i
                  ? 'border-gold shadow-md shadow-gold/20 scale-105'
                  : 'border-silver-200 hover:border-gold/50'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
