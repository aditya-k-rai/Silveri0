'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  name: string;
  primaryImage: string | null;
  hoverImage: string | null;
  image3?: string | null;
  image4?: string | null;
  image5?: string | null;
  image6?: string | null;
}

/**
 * Swipeable image carousel for the product page. Uses native CSS scroll-snap
 * for the horizontal track — gives free touch / inertia / momentum on mobile
 * and trackpad gestures on desktop, no JS gesture library needed. Arrow
 * buttons + dots + thumbnails all programmatically scroll the same track so
 * the active index stays in sync.
 */
export default function ProductGallery({ name, primaryImage, hoverImage, image3, image4, image5, image6 }: ProductGalleryProps) {
  const images = [primaryImage, hoverImage, image3, image4, image5, image6].filter(Boolean) as string[];

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Mouse drag-to-pan state — desktop affordance, doesn't intercept touch
  // because native scroll already handles swipe on mobile.
  const dragRef = useRef<{ startX: number; scrollLeft: number; moved: boolean } | null>(null);

  // Read scroll position and derive the active slide. `Math.round` ensures we
  // snap to the nearest slide even mid-swipe.
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex((prev) => (prev === next ? prev : next));
  }, []);

  const scrollToIndex = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }, [images.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return; // touch swipe is native
    const el = trackRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    // Snap to the nearest slide once the drag finishes
    if (dragRef.current?.moved && el) {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      scrollToIndex(idx);
    }
    dragRef.current = null;
  };

  const hasMultiple = images.length > 1;

  return (
    <div className="md:sticky md:top-24 md:max-w-[416px] md:mx-auto">
      <div className="relative w-full max-w-[416px] mx-auto">
        {/* Main slider */}
        <div className="aspect-square bg-gradient-to-br from-silver-50 to-silver-100 rounded-3xl overflow-hidden relative ring-1 ring-silver-200/60 shadow-sm group">
          {images.length > 0 ? (
            <div
              ref={trackRef}
              onScroll={handleScroll}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-y cursor-grab active:cursor-grabbing select-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            >
              {images.map((src, i) => (
                <div key={i} className="relative w-full h-full shrink-0 snap-center">
                  <Image
                    src={src}
                    alt={`${name} — image ${i + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 768px) 100vw, 416px"
                    priority={i === 0}
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-silver-400 text-sm">Product Image</span>
            </div>
          )}

          {/* Prev / Next arrows (hidden on the boundary slides) */}
          {hasMultiple && (
            <>
              {activeIndex > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToIndex(activeIndex - 1)}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-warm-black shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-100"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {activeIndex < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => scrollToIndex(activeIndex + 1)}
                  aria-label="Next image"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-warm-black shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>
              )}

              {/* Slide counter */}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-warm-black/55 backdrop-blur text-white text-[10px] font-medium tabular-nums tracking-wider">
                {activeIndex + 1} / {images.length}
              </div>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-black/35 backdrop-blur">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToIndex(i)}
                    aria-label={`Go to image ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      activeIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails — sync with the slider, give a quick-jump on desktop */}
        {hasMultiple && (
          <div className="flex gap-2 sm:gap-2.5 mt-4 max-w-[416px] mx-auto overflow-x-auto justify-start sm:justify-center pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                aria-label={`View image ${i + 1}`}
                aria-current={activeIndex === i}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 overflow-hidden relative cursor-pointer transition-all duration-200 shrink-0 ${
                  activeIndex === i
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
    </div>
  );
}
