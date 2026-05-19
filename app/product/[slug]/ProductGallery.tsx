'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const AUTOPLAY_MS = 2000;
const MIN_SCALE = 1;
const MAX_SCALE = 4;
const WHEEL_SENSITIVITY = 0.0025; // scale-units per wheel pixel
const PINCH_DEAD_ZONE = 1.02;     // ignore tiny pinch jitter near 1.0

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
 * Product image gallery with:
 *   • 2-second autoplay (pauses on first interaction)
 *   • Carousel: native scroll-snap swipe (mobile) + mouse drag + arrows / dots / thumbnails
 *   • Zoom: mouse-wheel on desktop, two-finger pinch on mobile — user controls the level
 *   • Pan: while zoomed, single-finger drag (mobile) or mouse drag (desktop) repositions the view
 */
export default function ProductGallery({
  name,
  primaryImage,
  hoverImage,
  image3,
  image4,
  image5,
  image6,
}: ProductGalleryProps) {
  const images = [primaryImage, hoverImage, image3, image4, image5, image6].filter(Boolean) as string[];

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Continuous zoom — 1.0 = no zoom; max 4×.
  const [zoomScale, setZoomScale] = useState(1);
  // Origin in 0–100 % coords inside the visible slide.
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const isZoomed = zoomScale > 1.001;

  // ── Gesture refs (no re-render needed for these) ──────────────────
  // Carousel-drag (mouse-only; touch uses native scroll when not zoomed)
  const dragRef = useRef<{ startX: number; scrollLeft: number; moved: boolean } | null>(null);
  // All active pointers — used to detect 2-finger pinch
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  // Pinch session
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  // Pan-while-zoomed session
  const panRef = useRef<{ startX: number; startY: number; startOriginX: number; startOriginY: number } | null>(null);
  // Autoplay
  const autoplayPausedRef = useRef(false);
  const pauseAutoplay = useCallback(() => { autoplayPausedRef.current = true; }, []);

  // Active-gesture flag — disables the CSS transition so the finger maps 1:1
  // onto the zoom level (transitions feel like rubber-banding mid-pinch).
  const [gesturing, setGesturing] = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────
  const clampScale = (s: number) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
  const clampPct = (n: number) => Math.max(0, Math.min(100, n));

  /** Apply a new scale value; resets origin to center when fully zoomed-out. */
  const applyScale = useCallback((next: number, origin?: { x: number; y: number }) => {
    const clamped = clampScale(next);
    setZoomScale(clamped);
    if (origin) setZoomOrigin({ x: clampPct(origin.x), y: clampPct(origin.y) });
    if (clamped <= MIN_SCALE + 0.001) setZoomOrigin({ x: 50, y: 50 });
  }, []);

  /** Active slide derived from scroll position. */
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex((prev) => (prev === next ? prev : next));
    // A genuine slide change exits zoom — safe no-op if scale was already 1.
    setZoomScale(1);
    setZoomOrigin({ x: 50, y: 50 });
  }, []);

  const scrollToIndex = useCallback((i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }, [images.length]);

  // ── Autoplay ──────────────────────────────────────────────────────
  useEffect(() => {
    if (images.length < 2) return;
    const tick = () => {
      if (autoplayPausedRef.current) return;
      if (typeof document !== 'undefined' && document.hidden) return;
      const el = trackRef.current;
      if (!el || el.clientWidth === 0) return;
      const current = Math.round(el.scrollLeft / el.clientWidth);
      const next = (current + 1) % images.length;
      el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    };
    const id = window.setInterval(tick, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [images.length]);

  // ── Block iOS Safari native pinch-zoom on the gallery ─────────────
  // Even with the right touch-action, mobile Safari can still fire its
  // non-standard `gesturestart` and zoom the whole page. Calling
  // preventDefault on those events keeps the gesture local to the image.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const stop = (e: Event) => e.preventDefault();
    el.addEventListener('gesturestart', stop, { passive: false });
    el.addEventListener('gesturechange', stop, { passive: false });
    el.addEventListener('gestureend', stop, { passive: false });
    return () => {
      el.removeEventListener('gesturestart', stop);
      el.removeEventListener('gesturechange', stop);
      el.removeEventListener('gestureend', stop);
    };
  }, []);

  // ── Wheel = desktop zoom ──────────────────────────────────────────
  // We attach via native addEventListener so we can call preventDefault()
  // (React's synthetic wheel handler is passive by default in modern React).
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      pauseAutoplay();
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      // Negative deltaY = wheel-up = zoom in.
      const delta = -e.deltaY * WHEEL_SENSITIVITY;
      setZoomScale((prev) => {
        const next = clampScale(prev + delta);
        if (next <= MIN_SCALE + 0.001) {
          setZoomOrigin({ x: 50, y: 50 });
        } else {
          setZoomOrigin({ x: clampPct(x), y: clampPct(y) });
        }
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [pauseAutoplay]);

  // ── Pointer events: pinch, pan, and drag-carousel coexist here ────
  const getPinchState = () => {
    const points = Array.from(pointersRef.current.values()).slice(0, 2);
    if (points.length < 2) return null;
    const dist = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const el = trackRef.current;
    if (!el) return { dist, midX: 50, midY: 50 };
    const rect = el.getBoundingClientRect();
    const midX = ((points[0].x + points[1].x) / 2 - rect.left) / rect.width * 100;
    const midY = ((points[0].y + points[1].y) / 2 - rect.top) / rect.height * 100;
    return { dist, midX, midY };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // ANY pointerdown counts as customer interaction — stop the autoplay.
    // Even for native-scroll touch swipes (which we don't capture explicitly
    // below) we still want to freeze the auto-advance — Amazon / Flipkart
    // behaviour.
    pauseAutoplay();
    setGesturing(true);

    // 2 fingers → pinch session
    if (pointersRef.current.size >= 2) {
      const ps = getPinchState();
      if (ps) {
        pinchRef.current = { startDist: ps.dist, startScale: zoomScale };
        setZoomOrigin({ x: clampPct(ps.midX), y: clampPct(ps.midY) });
        // Cancel any in-progress single-pointer gesture
        dragRef.current = null;
        panRef.current = null;
      }
      return;
    }

    // Single pointer while zoomed → pan the magnified image
    if (zoomScale > MIN_SCALE + 0.001) {
      panRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startOriginX: zoomOrigin.x,
        startOriginY: zoomOrigin.y,
      };
      const el = trackRef.current;
      if (el) el.setPointerCapture(e.pointerId);
      return;
    }

    // Single mouse-pointer & not zoomed → carousel drag.
    // Touch single-finger swipe uses the browser's native scroll-snap below.
    if (e.pointerType !== 'mouse') return;
    const el = trackRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Pinch in progress
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const ps = getPinchState();
      if (!ps) return;
      const ratio = ps.dist / pinchRef.current.startDist;
      // Apply a small dead-zone so resting fingers don't drift the scale
      const next = Math.abs(ratio - 1) < (PINCH_DEAD_ZONE - 1)
        ? pinchRef.current.startScale
        : clampScale(pinchRef.current.startScale * ratio);
      setZoomScale(next);
      setZoomOrigin({ x: clampPct(ps.midX), y: clampPct(ps.midY) });
      return;
    }

    // Pan while zoomed (single pointer)
    if (panRef.current && zoomScale > MIN_SCALE + 0.001) {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dx = e.clientX - panRef.current.startX;
      const dy = e.clientY - panRef.current.startY;
      // Convert pixel drag into transform-origin percentage drift.
      // At higher zoom levels a small movement reveals more, so scale the
      // factor by (zoom - 1) — feels natural at any zoom level.
      const denom = Math.max(zoomScale - 1, 0.001);
      const factorX = 100 / (rect.width * denom);
      const factorY = 100 / (rect.height * denom);
      setZoomOrigin({
        x: clampPct(panRef.current.startOriginX - dx * factorX),
        y: clampPct(panRef.current.startOriginY - dy * factorY),
      });
      return;
    }

    // Normal mouse carousel-drag
    if (!dragRef.current) return;
    const el = trackRef.current;
    if (!el) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) dragRef.current.moved = true;
    el.scrollLeft = dragRef.current.scrollLeft - dx;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);

    // End pinch when we're back below two fingers
    if (pinchRef.current && pointersRef.current.size < 2) {
      pinchRef.current = null;
      if (zoomScale < MIN_SCALE + 0.05) applyScale(MIN_SCALE);
    }

    // End pan
    if (panRef.current) {
      panRef.current = null;
      const el = trackRef.current;
      if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    } else {
      // End carousel drag
      const el = trackRef.current;
      if (el && el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (dragRef.current?.moved && el) {
        const idx = Math.round(el.scrollLeft / el.clientWidth);
        scrollToIndex(idx);
      }
      dragRef.current = null;
    }

    // No more active pointers → gesture finished. Re-enable the smooth
    // transition so the next state change animates rather than jumps.
    if (pointersRef.current.size === 0) setGesturing(false);
  };

  /** Hover-to-pan on desktop: when zoomed, just moving the mouse repositions the view too. */
  const onTrackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    if (panRef.current) return; // active drag-pan wins
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: clampPct(x), y: clampPct(y) });
  };

  // Slide-change shortcut — pauses autoplay then forwards to scrollToIndex.
  const jumpTo = useCallback((i: number) => {
    pauseAutoplay();
    scrollToIndex(i);
  }, [pauseAutoplay, scrollToIndex]);

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
              onMouseMove={onTrackMouseMove}
              onMouseLeave={() => { if (isZoomed) applyScale(MIN_SCALE); }}
              className={`flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth select-none [&::-webkit-scrollbar]:hidden [scrollbar-width:none] ${
                isZoomed
                  ? 'cursor-grab active:cursor-grabbing overflow-hidden'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
              // touch-action *deliberately omits* pinch-zoom so two-finger
              // gestures land in our handlers instead of zooming the page.
              // When zoomed, we own all touch handling — set 'none' so the
              // browser stops trying to scroll the underlying track.
              style={{ touchAction: isZoomed ? 'none' : 'pan-x pan-y' }}
            >
              {images.map((src, i) => {
                const showZoom = isZoomed && i === activeIndex;
                return (
                  <div key={i} className="relative w-full h-full shrink-0 snap-center overflow-hidden">
                    <Image
                      src={src}
                      alt={`${name} — image ${i + 1}`}
                      fill
                      // No CSS transition while a gesture is active — that
                      // 150ms interpolation is what made the pinch / wheel
                      // feel laggy. Settle smoothly only when fingers lift.
                      className={`object-cover pointer-events-none ${gesturing ? '' : 'transition-transform duration-150 ease-out'}`}
                      style={{
                        transform: showZoom ? `scale(${zoomScale})` : undefined,
                        transformOrigin: showZoom ? `${zoomOrigin.x}% ${zoomOrigin.y}%` : undefined,
                        willChange: showZoom ? 'transform' : undefined,
                      }}
                      sizes="(max-width: 768px) 100vw, 416px"
                      priority={i === 0}
                      draggable={false}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-silver-400 text-sm">Product Image</span>
            </div>
          )}

          {/* Prev / Next arrows */}
          {hasMultiple && !isZoomed && (
            <>
              {activeIndex > 0 && (
                <button
                  type="button"
                  onClick={() => jumpTo(activeIndex - 1)}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-warm-black shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-100"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {activeIndex < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => jumpTo(activeIndex + 1)}
                  aria-label="Next image"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 backdrop-blur-md text-warm-black shadow-[0_4px_14px_-2px_rgba(0,0,0,0.18)] flex items-center justify-center hover:bg-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 md:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </>
          )}

          {/* Slide counter */}
          {hasMultiple && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-warm-black/55 backdrop-blur text-white text-[10px] font-medium tabular-nums tracking-wider pointer-events-none">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {/* Zoom-level badge — shows the live zoom level while zoomed,
              or the affordance hint when not. */}
          <div
            className="absolute top-3 left-3 px-2 h-7 rounded-full bg-warm-black/60 backdrop-blur text-white text-[10px] font-medium flex items-center gap-1.5 pointer-events-none tabular-nums"
            aria-hidden="true"
          >
            <ZoomIn size={12} />
            {isZoomed ? `${zoomScale.toFixed(1)}×` : <span className="hidden sm:inline">Scroll · Pinch</span>}
          </div>

          {/* Dot indicators */}
          {hasMultiple && !isZoomed && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warm-black/35 backdrop-blur">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => jumpTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    activeIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="flex gap-2 sm:gap-2.5 mt-4 max-w-[416px] mx-auto overflow-x-auto justify-start sm:justify-center pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
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
