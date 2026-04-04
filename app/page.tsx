'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useProductStore } from '@/store/productStore';

const exploreCategories = [
  { name: 'Wedding', slug: 'wedding', image: '' },
  { name: 'Gift', slug: 'gift', image: '' },
  { name: 'Anniversary', slug: 'anniversary', image: '' },
];

export default function HomePage() {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const activeProducts = products.filter((p) => p.status === 'Active');
  const featuredProducts = activeProducts.filter((p) => p.isFeatured);
  const newArrivals = activeProducts.filter((p) => p.isNewArrival);

  if (loading) return null;

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <section className="relative bg-gradient-to-br from-silver-200 via-silver-100 to-silver-300 min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent silver-shimmer opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <p className="text-silver-500 text-xs uppercase tracking-[0.3em] mb-4">Luxury Silver Jewelry</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl lg:text-7xl font-light text-silver-900 mb-4">
            Timeless <span className="font-medium bg-gradient-to-r from-silver-600 to-silver-400 bg-clip-text text-transparent">Elegance</span>
          </h1>
          <p className="text-silver-600 text-lg md:text-xl max-w-xl mx-auto mb-8 font-light">
            Discover our handcrafted collection of luxury silver jewelry for every occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/category/all"
              className="inline-flex items-center gap-2 bg-silver-900 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-silver-800 transition-colors"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/category/new-arrivals"
              className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm text-silver-800 px-8 py-3.5 rounded-full text-sm font-medium hover:bg-white/80 transition-colors border border-silver-300"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ====== FEATURED PRODUCTS SECTION ====== */}
      <section className="bg-gradient-to-b from-silver-800 to-silver-900 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-silver-400 text-xs uppercase tracking-[0.2em] mb-2">Curated Selection</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-white mb-2">
              Featured Products
            </h2>
            <p className="text-silver-400 text-sm">Handpicked pieces from our collection</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-silver-800 border border-silver-700 rounded-xl overflow-hidden hover:border-silver-500 transition-all duration-300 hover:shadow-lg hover:shadow-silver-900/50"
              >
                <div className="relative aspect-square bg-gradient-to-br from-silver-700 to-silver-800">
                  {product.primaryImage ? (
                    <Image src={product.primaryImage} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-silver-500 text-xs">Product Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-silver-500">{product.carat} · {product.colour}</p>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-medium text-silver-100 mt-0.5 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-white font-semibold text-sm">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/category/all" className="inline-flex items-center gap-2 text-silver-300 border border-silver-600 px-6 py-2.5 rounded-full text-sm hover:bg-silver-800 hover:border-silver-400 transition-colors">
              View All Products
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== EXPLORE PRODUCTS SECTION ====== */}
      <section className="bg-silver-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-silver-400 text-xs uppercase tracking-[0.2em] mb-2">Shop by Occasion</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-silver-900 mb-2">
              Explore Products
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {exploreCategories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="group text-center">
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-silver-700 mb-3 group-hover:text-silver-900 transition-colors">
                  {cat.name}
                </h3>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-silver-200 to-silver-300 shadow-md group-hover:shadow-xl transition-all duration-300 border border-silver-200">
                  {cat.image ? (
                    <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-silver-400 text-sm">Category Image</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== NEW ARRIVALS SECTION ====== */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-silver-400 text-xs uppercase tracking-[0.2em] mb-1">Fresh Additions</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-silver-900">
                New Arrivals
              </h2>
            </div>
            <Link href="/category/new-arrivals" className="text-silver-500 text-sm font-medium hover:text-silver-800 transition-colors flex items-center gap-1">
              View All
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map((product) => (
              <Link
                key={`new-${product.id}`}
                href={`/product/${product.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-silver-200"
              >
                <div className="relative aspect-square bg-gradient-to-br from-silver-100 to-silver-50">
                  {product.primaryImage ? (
                    <Image src={product.primaryImage} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-silver-400 text-xs">Product Image</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-silver-900 text-white text-[10px] font-medium px-2 py-0.5 rounded">
                    NEW
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-medium text-silver-800 line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-silver-900 font-semibold text-sm">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== ALL PRODUCTS SECTION ====== */}
      <section className="bg-silver-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-silver-400 text-xs uppercase tracking-[0.2em] mb-2">Complete Collection</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-silver-900 mb-2">
              All Products
            </h2>
            <p className="text-silver-500 text-sm">{activeProducts.length} pieces available</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {activeProducts.map((product) => (
              <Link
                key={`all-${product.id}`}
                href={`/product/${product.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-silver-200"
              >
                <div className="relative aspect-square bg-gradient-to-br from-silver-100 to-silver-50">
                  {product.primaryImage ? (
                    <Image src={product.primaryImage} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-silver-400 text-xs">Product Image</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-wider text-silver-500">{product.carat} · {product.colour}</p>
                  <h3 className="font-[family-name:var(--font-heading)] text-sm font-medium text-silver-800 mt-0.5 line-clamp-1">
                    {product.name}
                  </h3>
                  <span className="text-silver-900 font-semibold text-sm">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/category/all" className="inline-flex items-center gap-2 text-silver-700 border border-silver-300 px-6 py-2.5 rounded-full text-sm hover:bg-white hover:border-silver-400 transition-colors">
              Browse Full Collection
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== NEWSLETTER CTA ====== */}
      <section className="bg-gradient-to-r from-silver-900 to-silver-800 py-12 md:py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-silver-200 mb-3">
            Stay Connected
          </h2>
          <p className="text-silver-400 text-sm mb-6">
            Subscribe for exclusive offers, new arrivals, and styling tips.
          </p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-silver-800 border border-silver-700 rounded-full px-5 py-3 text-sm text-white placeholder-silver-500 outline-none focus:border-silver-400 transition-colors"
            />
            <button
              type="button"
              className="bg-white text-silver-900 px-6 py-3 rounded-full text-sm font-medium hover:bg-silver-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
