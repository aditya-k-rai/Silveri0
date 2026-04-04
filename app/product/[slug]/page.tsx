'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Star, Shield, Truck, RotateCcw, ShoppingCart, Heart } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { updateProductDoc } from '@/lib/firebase/products';
import ProductGallery from './ProductGallery';
import ReviewCard from '@/components/product/ReviewCard';

const sampleReviews = [
  { userName: 'Priya S.', rating: 5, comment: 'Absolutely beautiful! The craftsmanship is excellent.', date: '2 weeks ago' },
  { userName: 'Rahul M.', rating: 4, comment: 'Great quality silver. Lovely design.', date: '1 month ago' },
];

export default function ProductPage({ params }: { params: { slug: string } }) {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const incrementViews = useProductStore((s) => s.incrementViews);
  const addItem = useCartStore((s) => s.addItem);
  const { items: wishlistItems, addToWishlist, removeFromWishlist } = useWishlistStore();

  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  const product = products.find((p) => toSlug(p.name) === params.slug);

  // Track view once on mount
  useEffect(() => {
    if (product) {
      incrementViews(product.id);
      updateProductDoc(product.id, { views: (product.views ?? 0) + 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const [addedToCart, setAddedToCart] = useState(false);

  if (loading) return null;

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

            {/* Add to Cart / Wishlist */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-gold text-warm-black py-3.5 rounded-lg font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-colors ${
                  isWishlisted ? 'border-red-400 bg-red-50' : 'border-silver hover:border-gold'
                }`}
              >
                <Heart size={20} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted'} />
              </button>
            </div>

            {/* Engagement stats */}
            <div className="flex items-center gap-4 text-xs text-muted mb-6">
              <span>{product.views.toLocaleString('en-IN')} views</span>
              <span>{product.likes.toLocaleString('en-IN')} likes</span>
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
