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
    <div className="sticky top-24 md:max-w-[416px] md:mx-auto">
      {/* Main Display — 20% smaller than before (520 → 416) */}
      <div className="relative w-full max-w-[416px] mx-auto">
        <div className="aspect-square bg-gradient-to-br from-silver-50 to-silver-100 rounded-3xl overflow-hidden relative ring-1 ring-silver-200/60 shadow-sm hover:shadow-md transition-shadow duration-300">
          {images.length > 0 ? (
            <Image
              key={activeThumb}
              src={images[activeThumb] || images[0]}
              alt={name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 768px) 100vw, 416px"
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
      {images.length > 1 && (
        <div className="flex gap-2 sm:gap-2.5 mt-4 max-w-[416px] mx-auto overflow-x-auto justify-start sm:justify-center pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveThumb(i)}
              aria-label={`View image ${i + 1}`}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden relative cursor-pointer transition-all duration-200 shrink-0 ${
                activeThumb === i
                  ? 'border-gold shadow-md shadow-gold/20 scale-105'
                  : 'border-silver-200 hover:border-gold/60 opacity-80 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
