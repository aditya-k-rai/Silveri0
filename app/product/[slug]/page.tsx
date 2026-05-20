'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Shield, Truck, RotateCcw, ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthContext } from '@/context/AuthContext';
import { updateProductDoc } from '@/lib/firebase/products';
import { logActivity } from '@/lib/firebase/activityLog';
import { subscribeToProductReviews } from '@/lib/firebase/reviews';
import type { Review } from '@/types';
import ProductGallery from './ProductGallery';
import ReviewCard from '@/components/product/ReviewCard';
import ProductCard from '@/components/product/ProductCard';
import ProductJsonLd from '@/components/seo/ProductJsonLd';
import OptionPill from '@/components/ui/OptionPill';
import Spinner from '@/components/ui/Spinner';
import { formatINR } from '@/lib/utils/format';

type ReviewSort = 'newest' | 'oldest' | 'rating-high' | 'rating-low';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const incrementViews = useProductStore((s) => s.incrementViews);
  const addItem = useCartStore((s) => s.addItem);
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user, userDoc } = useAuthContext();

  const product = products.find((p) => p.id === slug);

  useEffect(() => {
    if (product) {
      incrementViews(product.id);
      updateProductDoc(product.id, { views: (product.views ?? 0) + 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColour, setSelectedColour] = useState(product?.colour || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState<'with' | 'without'>('with');
  // Every product offers a plating choice. Silver is the default (no surcharge).
  const [selectedPlating, setSelectedPlating] = useState<'silver' | 'gold'>('silver');

  // Reviews — live from Firestore, with client-side sort
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSort, setReviewSort] = useState<ReviewSort>('newest');

  useEffect(() => {
    if (!product?.id) return;
    const unsub = subscribeToProductReviews(product.id, (data) => setReviews(data));
    return () => { if (unsub) unsub(); };
  }, [product?.id]);

  const sortedReviews: Review[] = (() => {
    const copy = [...reviews];
    switch (reviewSort) {
      case 'oldest':       return copy.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      case 'rating-high':  return copy.sort((a, b) => b.rating - a.rating || b.createdAt.getTime() - a.createdAt.getTime());
      case 'rating-low':   return copy.sort((a, b) => a.rating - b.rating || b.createdAt.getTime() - a.createdAt.getTime());
      case 'newest':
      default:             return copy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  })();

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-silver-50">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-silver-50">
        <div className="text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl text-warm-black mb-2">Product Not Found</h1>
          <p className="text-muted mb-4">The product you are looking for does not exist.</p>
          <Link href="/category/all" className="text-gold hover:underline">Browse All Products</Link>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistItems.includes(product.id);

  // Parse comma-separated ring sizes from the admin field. Empty string → no selector.
  const sizeOptions: string[] = (product.ringSizes || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const requiresSize = sizeOptions.length > 0;
  const showsChainToggle = !!product.chainOption;
  const chainPrice = Math.max(0, Number(product.chainPrice ?? 0) || 0);
  // Gold plating surcharge — defaults to ₹200 when admin hasn't customised it.
  const goldPlatingPrice = Math.max(0, Number(product.goldPlatingPrice ?? 200) || 0);
  // Live price: base + chain surcharge (if selected) + gold-plating surcharge (if selected)
  const effectivePrice =
    product.price +
    (showsChainToggle && selectedChain === 'with' ? chainPrice : 0) +
    (selectedPlating === 'gold' ? goldPlatingPrice : 0);

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

  const handleAddToCart = () => {
    // Force size selection for ring products that expose ringSizes.
    if (requiresSize && !selectedSize) {
      // Scroll the size selector into view & flash a brief "added" state off
      setAddedToCart(false);
      const el = document.getElementById('size-selector');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      quantity: 1,
      image: product.primaryImage || '',
      ...(requiresSize ? { size: selectedSize } : {}),
      ...(showsChainToggle ? { chain: selectedChain } : {}),
      plating: selectedPlating,
    });
    if (activityBase) logActivity({ ...activityBase, type: 'cart', action: 'added' });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      if (activityBase) logActivity({ ...activityBase, type: 'wishlist', action: 'removed' });
    } else {
      addToWishlist(product.id);
      if (activityBase) logActivity({ ...activityBase, type: 'wishlist', action: 'added' });
    }
  };

  const specs = [
    { label: 'Category', value: product.category },
    { label: 'SKU', value: product.sku, mono: true },
    { label: 'Purity', value: product.carat, highlight: true },
    { label: 'Metal', value: product.colour2 ? `${product.colour}, ${product.colour2}` : product.colour },
    { label: 'Plating', value: product.plating, highlight: true },
    { label: 'Size', value: product.size },
    { label: 'Weight', value: product.weight },
    { label: 'Height', value: product.height },
    { label: 'Width', value: product.width },
    { label: 'Radius', value: product.radius },
    { label: 'Warranty', value: product.warranty },
  ].filter((s) => s.value);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';
  const productUrl = `${siteUrl}/product/${product.id}`;
  const productDescription = product.description
    ? product.description.slice(0, 160)
    : `${product.name} — ${product.carat} ${product.colour} silver jewelry by Silveri. ₹${product.price.toLocaleString('en-IN')}. ${product.weight ? `Weight: ${product.weight}.` : ''}`;

  return (
    <div className="bg-silver-50 min-h-screen">
      <title>{`${product.name} | Silveri`}</title>
      <meta name="description" content={productDescription} />
      <meta property="og:title" content={`${product.name} | Silveri`} />
      <meta property="og:description" content={productDescription} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={productUrl} />
      {product.primaryImage && <meta property="og:image" content={product.primaryImage} />}
      <meta property="product:price:amount" content={String(product.price)} />
      <meta property="product:price:currency" content="INR" />
      <meta property="product:availability" content={product.stock > 0 ? 'in stock' : 'out of stock'} />
      <ProductJsonLd product={product} url={`/product/${product.id}`} />
      <div className="max-w-6xl mx-auto px-4 py-4 md:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-silver-400 mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-gold transition-colors">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-silver-700 truncate max-w-[150px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* ====== MAIN LAYOUT ====== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-14">

          {/* LEFT — Gallery */}
          <ProductGallery
            name={product.name}
            primaryImage={product.primaryImage}
            hoverImage={product.hoverImage}
            image3={product.image3}
            image4={product.image4}
            image5={product.image5}
            image6={product.image6}
          />

          {/* RIGHT — Product Info */}
          <div className="space-y-5">
            {/* Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-gold/10 text-gold-dark text-xs font-semibold px-3 py-1 rounded-full border border-gold/20">
                {product.carat}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-silver-100 text-silver-600 text-xs font-medium px-3 py-1 rounded-full">
                {product.colour}
              </span>
              {product.plating && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
                  {product.plating}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-medium text-silver-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <a href="#reviews" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    className={s <= Math.round(averageRating) ? 'fill-gold text-gold' : 'text-silver-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-silver-500">
                {reviewCount > 0
                  ? `${averageRating.toFixed(1)} · ${reviewCount} review${reviewCount === 1 ? '' : 's'}`
                  : 'No reviews yet'}
              </span>
            </a>

            {/* Price + Stock */}
            <div className="flex items-baseline gap-4 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-silver-900">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {(() => {
                const chainAdd = showsChainToggle && selectedChain === 'with' ? chainPrice : 0;
                const platingAdd = selectedPlating === 'gold' ? goldPlatingPrice : 0;
                const hasExtras = chainAdd > 0 || platingAdd > 0;
                if (!hasExtras) return null;
                return (
                  <span className="text-xs text-silver-500">
                    ₹{product.price.toLocaleString('en-IN')}
                    {chainAdd > 0 && <> + ₹{chainAdd.toLocaleString('en-IN')} chain</>}
                    {platingAdd > 0 && <> + ₹{platingAdd.toLocaleString('en-IN')} gold plating</>}
                  </span>
                );
              })()}
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>

            {/* Metal Selector */}
            {product.colour2 && (
              <div>
                <p className="text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Select Metal</p>
                <div className="flex gap-2">
                  {[product.colour, product.colour2].map((c) => (
                    <OptionPill
                      key={c}
                      compact
                      active={selectedColour === c}
                      label={c}
                      onClick={() => setSelectedColour(c)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ring Size Selector — only when admin has set ringSizes (rings) */}
            {requiresSize && (
              <div id="size-selector">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-xs font-semibold text-silver-500 uppercase tracking-wider">Select Ring Size</p>
                  {!selectedSize && (
                    <span className="text-[10px] font-medium text-red-500">Required</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((s) => (
                    <OptionPill
                      key={s}
                      compact
                      active={selectedSize === s}
                      label={s}
                      onClick={() => setSelectedSize(s)}
                      className="min-w-[44px] text-center"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pendant Chain Toggle — only when admin enabled chainOption */}
            {showsChainToggle && (
              <div>
                <p className="text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Chain</p>
                <div className="flex gap-2 flex-wrap">
                  {(['with', 'without'] as const).map((opt) => {
                    const optPrice = opt === 'with' ? product.price + chainPrice : product.price;
                    return (
                      <OptionPill
                        key={opt}
                        active={selectedChain === opt}
                        label={opt === 'with' ? 'With Chain' : 'Without Chain'}
                        detail={
                          <>
                            {formatINR(optPrice)}
                            {opt === 'with' && chainPrice > 0 && (
                              <span className="ml-1 text-[10px]">(+{formatINR(chainPrice)})</span>
                            )}
                          </>
                        }
                        minWidth={150}
                        onClick={() => setSelectedChain(opt)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Plating Toggle — every product offers Silver (base) or Gold (+ surcharge) */}
            <div>
              <p className="text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">Plating</p>
              <div className="flex gap-2 flex-wrap">
                {(['silver', 'gold'] as const).map((opt) => {
                  const surcharge = opt === 'gold' ? goldPlatingPrice : 0;
                  const optPrice = product.price + (showsChainToggle && selectedChain === 'with' ? chainPrice : 0) + surcharge;
                  return (
                    <OptionPill
                      key={opt}
                      active={selectedPlating === opt}
                      label={opt === 'silver' ? 'Silver Plated' : 'Gold Plated'}
                      detail={
                        <>
                          {formatINR(optPrice)}
                          {opt === 'gold' && goldPlatingPrice > 0 && (
                            <span className="ml-1 text-[10px]">(+{formatINR(goldPlatingPrice)})</span>
                          )}
                        </>
                      }
                      minWidth={150}
                      onClick={() => setSelectedPlating(opt)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Quick Specs */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-silver-600">
              {product.weight && (
                <span>Weight: <strong className="text-silver-900">{product.weight}</strong></span>
              )}
              {product.size && (
                <span>Size: <strong className="text-silver-900">{product.size}</strong></span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'border-2 border-silver-900 text-silver-900 hover:bg-silver-900 hover:text-white'
                }`}
              >
                <ShoppingCart size={18} />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={() => { handleAddToCart(); router.push('/checkout?step=address'); }}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gold text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                  isWishlisted
                    ? 'border-red-400 bg-red-50 text-red-500 scale-105'
                    : 'border-silver-200 text-silver-400 hover:border-red-400 hover:text-red-500'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Engagement — Views only */}
            <div className="flex items-center gap-4 pt-1 text-xs text-silver-500">
              <span className="flex items-center gap-1">
                <Eye size={13} /> {(product.views ?? 0).toLocaleString('en-IN')} views
              </span>
            </div>

            {/* Trust Badges + Description were moved below the hero so the
                Similar Products row can claim the higher visual real-estate.
                See the full-width sections after </MAIN LAYOUT>. */}
          </div>
        </div>

        {/* ====== SIMILAR PRODUCTS — moved above the description, 2 rows ====== */}
        {(() => {
          const similarProducts = products
            .filter(
              (p) =>
                p.id !== product.id &&
                p.category === product.category &&
                p.status === 'Active'
            )
            .slice(0, 8);
          if (similarProducts.length === 0) return null;
          // Two full rows: 2 cols × 2 rows on mobile (4 items visible),
          // 4 cols × 2 rows on desktop (8 items visible). Items 4–7 hide
          // below `lg` so the mobile grid stays as exactly 2 rows.
          const DESKTOP_ONLY = new Set([4, 5, 6, 7]);
          return (
            <section className="mt-10 md:mt-14">
              <div className="flex items-end justify-between mb-5 md:mb-6">
                <div>
                  <p className="text-gold-dark text-xs uppercase tracking-[0.25em] mb-1.5">
                    You may also like
                  </p>
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl font-medium text-silver-900">
                    Similar {product.category}
                  </h2>
                </div>
                <Link
                  href={`/category/${product.category.toLowerCase()}`}
                  className="text-silver-500 text-xs sm:text-sm font-medium hover:text-silver-800 transition-colors flex items-center gap-1 shrink-0"
                >
                  View all <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {similarProducts.map((p, idx) => (
                  <div key={p.id} className={DESKTOP_ONLY.has(idx) ? 'hidden lg:block' : ''}>
                    <ProductCard product={p} variant="light" />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ====== TRUST BADGES (full-width) ====== */}
        <section className="mt-10 md:mt-14 grid grid-cols-3 gap-3 md:gap-5">
          <div className="flex flex-col items-center gap-2 py-5 bg-white rounded-2xl border border-silver-100">
            <Shield size={20} className="text-gold" />
            <p className="text-xs sm:text-sm text-silver-700 font-medium text-center">Certified Silver</p>
          </div>
          <div className="flex flex-col items-center gap-2 py-5 bg-white rounded-2xl border border-silver-100">
            <Truck size={20} className="text-gold" />
            <p className="text-xs sm:text-sm text-silver-700 font-medium text-center">Free Shipping ₹999+</p>
          </div>
          <div className="flex flex-col items-center gap-2 py-5 bg-white rounded-2xl border border-silver-100">
            <RotateCcw size={20} className="text-gold" />
            <p className="text-xs sm:text-sm text-silver-700 font-medium text-center">7-Day Returns</p>
          </div>
        </section>

        {/* ====== DESCRIPTION (full-width) ====== */}
        {product.description && (
          <section className="mt-8 md:mt-10 bg-white rounded-2xl border border-silver-200 p-6 md:p-8">
            <p className="text-xs font-semibold text-silver-500 uppercase tracking-wider mb-3">Description</p>
            <p className="text-sm md:text-base text-silver-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </section>
        )}

        {/* ====== SPECIFICATIONS TABLE ====== */}
        <section className="mt-10 md:mt-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-silver-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-silver-100 bg-silver-50">
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900">
                  Specifications
                </h3>
              </div>
              <div className="divide-y divide-silver-100">
                {specs.map(({ label, value, mono }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className="text-silver-500">{label}</span>
                    <span className={`text-silver-900 font-medium ${mono ? 'font-mono text-xs' : ''}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Care, Shipping & Info */}
            <div className="space-y-6">
              {/* Care */}
              <div className="bg-white rounded-2xl border border-silver-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-silver-100 bg-silver-50">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900">
                    Care Instructions
                  </h3>
                </div>
                <ul className="px-5 py-4 space-y-2.5 text-sm text-silver-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    Store in a cool, dry place away from direct sunlight
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    Clean with a soft, dry cloth after wearing
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    Avoid contact with perfume, lotion, or chemicals
                  </li>
                </ul>
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-2xl border border-silver-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-silver-100 bg-silver-50">
                  <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900">
                    Shipping Info
                  </h3>
                </div>
                <ul className="px-5 py-4 space-y-2.5 text-sm text-silver-600">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    Free shipping on orders above ₹999
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    Standard delivery: 5-7 business days
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                    Express delivery: 2-3 business days
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ====== REVIEWS ====== */}
        <section id="reviews" className="mt-10 md:mt-14 pb-8 scroll-mt-24">
          <div className="bg-white rounded-2xl border border-silver-200 overflow-hidden">
            {/* Header — title + average summary + sort */}
            <div className="px-5 py-4 border-b border-silver-100 bg-silver-50 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900">
                  Customer Reviews
                </h3>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={13}
                          className={s <= Math.round(averageRating) ? 'fill-gold text-gold' : 'text-silver-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-silver-500">
                      {averageRating.toFixed(1)} out of 5 — {reviewCount} review{reviewCount === 1 ? '' : 's'}
                    </span>
                  </div>
                )}
              </div>
              {reviewCount > 1 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="review-sort" className="text-xs font-medium text-silver-500">Sort:</label>
                  <select
                    id="review-sort"
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value as ReviewSort)}
                    className="bg-white border border-silver-200 rounded-lg px-3 py-1.5 text-xs font-medium text-silver-800 focus:outline-none focus:ring-2 focus:ring-gold/40"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="rating-high">Highest rated</option>
                    <option value="rating-low">Lowest rated</option>
                  </select>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {reviewCount === 0 ? (
                <div className="text-center py-8">
                  <Star size={32} className="mx-auto text-silver-300 mb-3" />
                  <p className="text-sm text-silver-700 font-medium mb-1">No reviews yet</p>
                  <p className="text-xs text-silver-500">
                    Be the first to share your thoughts after your order is delivered.
                  </p>
                </div>
              ) : (
                <div>
                  {sortedReviews.map((r) => (
                    <ReviewCard
                      key={r.id}
                      userName={r.userName}
                      userPhoto={r.userPhoto}
                      rating={r.rating}
                      title={r.title}
                      comment={r.comment}
                      date={r.createdAt}
                      verified={!!r.orderId}
                      adminReply={r.adminReply}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom padding so the last block doesn't kiss the footer */}
        <div className="h-8" />
      </div>

    </div>
  );
}
