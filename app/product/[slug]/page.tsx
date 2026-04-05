'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Shield, Truck, RotateCcw, ShoppingCart, Heart, ThumbsUp, Eye, X, Star, Box } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthContext } from '@/context/AuthContext';
import { updateProductDoc } from '@/lib/firebase/products';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import ProductGallery from './ProductGallery';
import ReviewCard from '@/components/product/ReviewCard';
import ProductJsonLd from '@/components/seo/ProductJsonLd';

const sampleReviews = [
  { userName: 'Priya S.', rating: 5, comment: 'Absolutely beautiful! The craftsmanship is excellent.', date: '2 weeks ago' },
  { userName: 'Rahul M.', rating: 4, comment: 'Great quality silver. Lovely design.', date: '1 month ago' },
];

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const incrementViews = useProductStore((s) => s.incrementViews);
  const incrementLikes = useProductStore((s) => s.incrementLikes);
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
  const [liked, setLiked] = useState(false);
  const [likedBy, setLikedBy] = useState<{ name: string; photo?: string }[]>([]);
  const [showLikedBy, setShowLikedBy] = useState(false);

  useEffect(() => {
    if (!product || !db) return;
    getDoc(doc(db, 'products', product.id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikedBy(data.likedBy || []);
        if (user && (data.likedBy || []).some((u: { uid?: string }) => u.uid === user.uid)) {
          setLiked(true);
        }
      }
    });
  }, [product?.id, user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-silver-50">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
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

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.primaryImage || '',
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlist = () => {
    if (isWishlisted) removeFromWishlist(product.id);
    else addToWishlist(product.id);
  };

  const handleLike = async () => {
    if (liked || !user) return;
    setLiked(true);
    incrementLikes(product.id);
    const likeEntry = { uid: user.uid, name: userDoc?.name || user.displayName || 'User', photo: user.photoURL || '' };
    setLikedBy((prev) => [...prev, likeEntry]);
    if (db) {
      await updateDoc(doc(db, 'products', product.id), {
        likes: (product.likes ?? 0) + 1,
        likedBy: arrayUnion(likeEntry),
      });
    }
  };

  const specs = [
    { label: 'Category', value: product.category },
    { label: 'SKU', value: product.sku, mono: true },
    { label: 'Purity', value: product.carat },
    { label: 'Colour', value: product.colour },
    { label: 'Size', value: product.size },
    { label: 'Weight', value: product.weight },
    { label: 'Height', value: product.height },
    { label: 'Width', value: product.width },
    { label: 'Radius', value: product.radius },
    { label: 'Warranty', value: product.warranty },
  ].filter((s) => s.value);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://silveri.in';
  const productUrl = `${siteUrl}/product/${product.id}`;
  const productDescription = `${product.name} — ${product.carat} ${product.colour} silver jewelry by Silveri. ₹${product.price.toLocaleString('en-IN')}. ${product.weight ? `Weight: ${product.weight}.` : ''}`;

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
            colour={product.colour}
            model3dFileName={product.model3dFileName}
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
              {product.model3dFileName && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                  <Box size={12} /> 3D Available
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-3xl md:text-4xl font-medium text-silver-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= 4 ? 'fill-gold text-gold' : 'text-silver-300'} />
                ))}
              </div>
              <span className="text-sm text-silver-500">({sampleReviews.length} reviews)</span>
            </div>

            {/* Price + Stock */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl sm:text-4xl font-bold text-silver-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${
                product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
              }`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
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
                onClick={() => { handleAddToCart(); router.push('/checkout'); }}
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

            {/* Engagement — Like + Stats */}
            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={handleLike}
                disabled={liked || !user}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  liked
                    ? 'bg-blue-500 text-white'
                    : !user
                      ? 'border border-silver-200 text-silver-400 opacity-50 cursor-not-allowed'
                      : 'border border-silver-200 text-silver-500 hover:bg-blue-500 hover:text-white hover:border-blue-500'
                }`}
                title={!user ? 'Login to like' : liked ? 'Already liked' : 'Like this product'}
              >
                <ThumbsUp size={15} className={liked ? 'fill-current' : ''} />
                {liked ? 'Liked!' : 'Like'}
              </button>
              <div className="flex items-center gap-4 text-xs text-silver-500">
                <span className="flex items-center gap-1"><Eye size={13} /> {(product.views ?? 0).toLocaleString('en-IN')} views</span>
                <button
                  onClick={() => likedBy.length > 0 && setShowLikedBy(true)}
                  className={`flex items-center gap-1 ${likedBy.length > 0 ? 'hover:text-blue-500 cursor-pointer transition-colors' : ''}`}
                >
                  <ThumbsUp size={13} /> {(product.likes ?? 0).toLocaleString('en-IN')} likes
                </button>
              </div>
            </div>

            {/* Liked By Preview */}
            {likedBy.length > 0 && (
              <button
                onClick={() => setShowLikedBy(true)}
                className="text-xs text-silver-500 hover:text-silver-800 transition-colors flex items-center gap-1.5"
              >
                <div className="flex -space-x-2">
                  {likedBy.slice(0, 3).map((u, i) => (
                    u.photo ? (
                      <img key={i} src={u.photo} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                    ) : (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                    )
                  ))}
                </div>
                <span>
                  {likedBy.length === 1
                    ? `${likedBy[0].name} liked this`
                    : likedBy.length <= 3
                      ? `${likedBy.map(u => u.name).join(', ')} liked this`
                      : `${likedBy.slice(0, 2).map(u => u.name).join(', ')} and ${likedBy.length - 2} others liked this`
                  }
                </span>
              </button>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-silver-200">
              <div className="flex flex-col items-center gap-1.5 py-3 bg-white rounded-xl border border-silver-100">
                <Shield size={18} className="text-gold" />
                <p className="text-[11px] text-silver-600 font-medium text-center">Certified Silver</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 bg-white rounded-xl border border-silver-100">
                <Truck size={18} className="text-gold" />
                <p className="text-[11px] text-silver-600 font-medium text-center">Free Shipping ₹999+</p>
              </div>
              <div className="flex flex-col items-center gap-1.5 py-3 bg-white rounded-xl border border-silver-100">
                <RotateCcw size={18} className="text-gold" />
                <p className="text-[11px] text-silver-600 font-medium text-center">7-Day Returns</p>
              </div>
            </div>
          </div>
        </div>

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
        <section className="mt-10 md:mt-14 pb-8">
          <div className="bg-white rounded-2xl border border-silver-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-silver-100 bg-silver-50">
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-silver-900">
                Customer Reviews
              </h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              {sampleReviews.map((review, i) => (<ReviewCard key={i} {...review} />))}
            </div>
          </div>
        </section>
      </div>

      {/* ====== LIKED BY MODAL ====== */}
      {showLikedBy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLikedBy(false)} />
          <div className="bg-white rounded-2xl w-full max-w-sm relative z-10 shadow-2xl border border-silver-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-silver-200">
              <div>
                <h3 className="font-[family-name:var(--font-heading)] font-semibold text-silver-900">Liked By</h3>
                <p className="text-xs text-silver-500 mt-0.5">{likedBy.length} {likedBy.length === 1 ? 'person' : 'people'} liked this</p>
              </div>
              <button onClick={() => setShowLikedBy(false)} className="p-2 hover:bg-silver-100 rounded-full text-silver-400 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto px-5 py-3">
              {likedBy.map((u, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-silver-100 last:border-0">
                  {u.photo ? (
                    <img src={u.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-silver-900">{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
