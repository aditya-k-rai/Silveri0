'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Star, Shield, Truck, RotateCcw, ShoppingCart, Heart, ThumbsUp, Eye } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthContext } from '@/context/AuthContext';
import { updateProductDoc } from '@/lib/firebase/products';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import ProductGallery from './ProductGallery';
import ReviewCard from '@/components/product/ReviewCard';

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

  // Track view once on mount
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

  // Fetch likedBy list from Firestore
  useEffect(() => {
    if (!product || !db) return;
    getDoc(doc(db, 'products', product.id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLikedBy(data.likedBy || []);
        // Check if current user already liked
        if (user && (data.likedBy || []).some((u: { uid?: string }) => u.uid === user.uid)) {
          setLiked(true);
        }
      }
    });
  }, [product?.id, user?.uid]);

  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
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
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-gold transition-colors">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-warm-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Product Gallery with 3D viewer */}
          <ProductGallery
            name={product.name}
            primaryImage={product.primaryImage}
            hoverImage={product.hoverImage}
            colour={product.colour}
            model3dFileName={product.model3dFileName}
          />

          {/* Product Info */}
          <div>
            <span className="inline-block bg-gold/15 text-gold-dark text-xs font-medium px-3 py-1 rounded-full mb-3">
              {product.carat} · {product.colour}
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-medium text-warm-black mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= 4 ? 'fill-gold text-gold' : 'text-silver'} />
                ))}
              </div>
              <span className="text-sm text-muted">({sampleReviews.length} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-semibold text-warm-black">₹{product.price.toLocaleString('en-IN')}</span>
            </div>

            <p className={`text-sm mb-4 ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </p>

            {product.weight && <p className="text-sm text-muted mb-6">Weight: {product.weight}</p>}

            {/* Add to Cart / Buy Now / Wishlist */}
            <div className="flex gap-3 mb-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  addedToCart ? 'bg-green-500 text-white' : 'border-2 border-silver text-warm-black hover:border-gold hover:bg-gold/5'
                }`}
              >
                <ShoppingCart size={18} />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  router.push('/checkout');
                }}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gold text-warm-black py-3.5 rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-lg border-2 transition-all duration-200 ${
                  isWishlisted ? 'border-red-400 bg-red-50 scale-105' : 'border-silver hover:border-red-400'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted'} />
              </button>
            </div>

            {/* Engagement — Like + Stats + Liked By */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
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
                  }}
                  disabled={liked || !user}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    liked
                      ? 'bg-blue-500 text-white'
                      : !user
                        ? 'border border-silver text-muted opacity-50 cursor-not-allowed'
                        : 'border border-silver text-muted hover:bg-blue-500 hover:text-white hover:border-blue-500'
                  }`}
                  title={!user ? 'Login to like' : liked ? 'Already liked' : 'Like this product'}
                >
                  <ThumbsUp size={15} className={liked ? 'fill-current' : ''} />
                  {liked ? 'Liked!' : 'Like'}
                </button>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1"><Eye size={13} /> {(product.views ?? 0).toLocaleString('en-IN')} views</span>
                  <span className="flex items-center gap-1"><ThumbsUp size={13} /> {(product.likes ?? 0).toLocaleString('en-IN')} likes</span>
                </div>
              </div>

              {/* Liked by section */}
              {likedBy.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowLikedBy(!showLikedBy)}
                    className="text-xs text-muted hover:text-warm-black transition-colors flex items-center gap-1.5"
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

                  {/* Expanded liked by list */}
                  {showLikedBy && (
                    <div className="mt-2 bg-white border border-silver/40 rounded-xl p-3 max-h-48 overflow-y-auto">
                      {likedBy.map((u, i) => (
                        <div key={i} className="flex items-center gap-2.5 py-1.5">
                          {u.photo ? (
                            <img src={u.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-sm text-warm-black">{u.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-silver/30">
              <div className="text-center"><Shield size={20} className="mx-auto text-gold mb-1" /><p className="text-xs text-muted">Certified Silver</p></div>
              <div className="text-center"><Truck size={20} className="mx-auto text-gold mb-1" /><p className="text-xs text-muted">Free Shipping ₹999+</p></div>
              <div className="text-center"><RotateCcw size={20} className="mx-auto text-gold mb-1" /><p className="text-xs text-muted">7-Day Returns</p></div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-12 border-t border-silver/30 pt-8 max-w-3xl">
          <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Product Details</h3>
          <div className="grid grid-cols-2 gap-3 text-sm mb-8">
            <div className="flex justify-between py-2 border-b border-silver/20">
              <span className="text-muted">Category</span><span className="text-warm-black">{product.category}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-silver/20">
              <span className="text-muted">SKU</span><span className="text-warm-black font-mono">{product.sku}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-silver/20">
              <span className="text-muted">Purity</span><span className="text-warm-black">{product.carat}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-silver/20">
              <span className="text-muted">Colour</span><span className="text-warm-black">{product.colour}</span>
            </div>
            {product.size && (
              <div className="flex justify-between py-2 border-b border-silver/20">
                <span className="text-muted">Size</span><span className="text-warm-black">{product.size}</span>
              </div>
            )}
            {product.weight && (
              <div className="flex justify-between py-2 border-b border-silver/20">
                <span className="text-muted">Weight</span><span className="text-warm-black">{product.weight}</span>
              </div>
            )}
          </div>

          {product.warranty && (
            <>
              <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Warranty</h3>
              <p className="text-muted text-sm leading-relaxed mb-8">{product.warranty}</p>
            </>
          )}

          <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Care & Details</h3>
          <ul className="text-muted text-sm leading-relaxed space-y-2 mb-8">
            <li>Store in a cool, dry place away from direct sunlight</li>
            <li>Clean with a soft, dry cloth after wearing</li>
            <li>Avoid contact with perfume, lotion, or chemicals</li>
          </ul>

          <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black mb-4">Shipping Info</h3>
          <ul className="text-muted text-sm leading-relaxed space-y-2">
            <li>Free shipping on orders above ₹999</li>
            <li>Standard delivery: 5-7 business days</li>
            <li>Express delivery: 2-3 business days</li>
          </ul>
        </div>

        {/* Reviews */}
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-medium text-warm-black mb-6">Customer Reviews</h2>
          <div className="max-w-2xl">
            {sampleReviews.map((review, i) => (<ReviewCard key={i} {...review} />))}
          </div>
        </section>
      </div>
    </div>
  );
}
