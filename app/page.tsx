'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import ProductCard from '@/components/product/ProductCard';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* ====== HERO SECTION ====== */}
      <section className="relative bg-gradient-to-br from-silver-100 via-white to-silver-200 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-36 text-center">
          <p className="text-silver-500 text-xs uppercase tracking-[0.3em] mb-5">Luxury Silver Jewelry</p>
          <h1 className="font-[family-name:var(--font-heading)] text-5xl md:text-6xl lg:text-7xl font-light text-silver-900 mb-5 leading-tight">
            Timeless{' '}
            <span className="font-medium bg-gradient-to-r from-gold-dark via-gold to-gold-light bg-clip-text text-transparent">
              Elegance
            </span>
          </h1>
          <p className="text-silver-500 text-base md:text-lg max-w-lg mx-auto mb-10 font-light leading-relaxed">
            Discover our handcrafted collection of luxury silver jewelry for every occasion
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/category/all"
              className="inline-flex items-center justify-center gap-2 bg-silver-900 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-silver-800 transition-all hover:shadow-xl hover:shadow-silver-900/20"
            >
              Shop Now <ArrowRight size={16} />
            </Link>
            <Link
              href="/category/new-arrivals"
              className="inline-flex items-center justify-center gap-2 bg-white/70 backdrop-blur-sm text-silver-800 px-8 py-3.5 rounded-full text-sm font-medium hover:bg-white transition-all border border-silver-300 hover:border-silver-400 hover:shadow-lg"
            >
              New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ====== FEATURED PRODUCTS ====== */}
      {featuredProducts.length > 0 && (
        <section className="bg-gradient-to-b from-silver-900 via-silver-800 to-silver-900 py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-gold/70 text-xs uppercase tracking-[0.25em] mb-3">Curated Selection</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-light text-white">
                Featured Products
              </h2>
              <p className="text-silver-500 text-sm mt-3">Handpicked pieces from our collection</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} variant="dark" />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/category/all"
                className="inline-flex items-center gap-2 text-silver-300 border border-silver-600 px-7 py-3 rounded-full text-sm font-medium hover:bg-silver-800 hover:border-silver-400 hover:text-white transition-all"
              >
                View All Products <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ====== EXPLORE BY OCCASION ====== */}
      <section className="bg-silver-50 py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-silver-400 text-xs uppercase tracking-[0.25em] mb-3">Shop by Occasion</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-light text-silver-900">
              Explore Products
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {exploreCategories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-silver-200 to-silver-300 border border-silver-200 group-hover:shadow-2xl group-hover:shadow-silver-400/30 transition-all duration-500">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-silver-400 text-sm">Category Image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-[family-name:var(--font-heading)] text-xl md:text-2xl text-white font-medium">
                      {cat.name}
                    </h3>
                    <span className="text-white/70 text-xs flex items-center gap-1 mt-1 group-hover:text-white transition-colors">
                      Explore <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== NEW ARRIVALS ====== */}
      {newArrivals.length > 0 && (
        <section className="bg-white py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-end mb-8 md:mb-12">
              <div>
                <p className="text-gold-dark text-xs uppercase tracking-[0.25em] mb-2">Fresh Additions</p>
                <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-light text-silver-900">
                  New Arrivals
                </h2>
              </div>
              <Link
                href="/category/new-arrivals"
                className="text-silver-500 text-sm font-medium hover:text-silver-800 transition-colors flex items-center gap-1"
              >
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={`new-${product.id}`} product={product} variant="light" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== ALL PRODUCTS ====== */}
      {activeProducts.length > 0 && (
        <section className="bg-silver-50 py-14 md:py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10 md:mb-14">
              <p className="text-silver-400 text-xs uppercase tracking-[0.25em] mb-3">Complete Collection</p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-light text-silver-900">
                All Products
              </h2>
              <p className="text-silver-500 text-sm mt-3">{activeProducts.length} pieces available</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {activeProducts.map((product) => (
                <ProductCard key={`all-${product.id}`} product={product} variant="light" />
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/category/all"
                className="inline-flex items-center gap-2 text-silver-700 border border-silver-300 px-7 py-3 rounded-full text-sm font-medium hover:bg-white hover:border-silver-400 hover:shadow-lg transition-all"
              >
                Browse Full Collection <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ====== NEWSLETTER CTA ====== */}
      <section className="bg-gradient-to-r from-silver-900 via-silver-800 to-silver-900 py-14 md:py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-silver-200 mb-3">
            Stay Connected
          </h2>
          <p className="text-silver-500 text-sm mb-8">Subscribe for exclusive offers, new arrivals, and styling tips.</p>
          <form className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-silver-800 border border-silver-700 rounded-full px-5 py-3 text-sm text-white placeholder-silver-500 outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/20 transition-all"
            />
            <button
              type="button"
              className="bg-gold text-silver-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gold-light transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
