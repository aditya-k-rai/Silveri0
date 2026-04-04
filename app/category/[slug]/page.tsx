'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, SlidersHorizontal, X, Heart, ShoppingCart } from 'lucide-react';
import { useProductStore } from '@/store/productStore';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Filter active products, then by category slug
  const activeProducts = products.filter((p) => p.status === 'Active');
  const categoryFiltered = params.slug === 'all'
    ? activeProducts
    : params.slug === 'new-arrivals'
      ? activeProducts.filter((p) => p.isNewArrival)
      : activeProducts.filter((p) => p.category.toLowerCase() === params.slug);

  // Get unique colours for filter sidebar
  const allColours = [...new Set(categoryFiltered.map((p) => p.colour))];

  const filteredProducts = categoryFiltered
    .filter((p) => selectedColours.length === 0 || selectedColours.includes(p.colour))
    .filter((p) => !priceRange.min || p.price >= Number(priceRange.min))
    .filter((p) => !priceRange.max || p.price <= Number(priceRange.max))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  const toggleColour = (c: string) => {
    setSelectedColours((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const categoryTitle = params.slug === 'all'
    ? 'Our Collection'
    : params.slug === 'new-arrivals'
      ? 'New Arrivals'
      : params.slug.charAt(0).toUpperCase() + params.slug.slice(1);

  if (loading) return null;

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-warm-black capitalize">{categoryTitle}</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-warm-black capitalize">
            {categoryTitle}
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden flex items-center gap-2 px-3 py-2 border border-silver rounded-lg text-sm">
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-silver rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-gold">
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-warm-black mb-3">Price Range</h4>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full border border-silver rounded px-3 py-2 text-sm outline-none focus:border-gold" />
                  <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full border border-silver rounded px-3 py-2 text-sm outline-none focus:border-gold" />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-warm-black mb-3">Colour</h4>
                <div className="space-y-2">
                  {allColours.map((c) => (
                    <label key={c} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedColours.includes(c)} onChange={() => toggleColour(c)} className="rounded border-silver text-gold focus:ring-gold" />
                      <span className="text-sm text-muted">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {showFilters && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Filters</h3>
                  <button onClick={() => setShowFilters(false)}><X size={20} /></button>
                </div>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-sm text-warm-black mb-3">Colour</h4>
                    {allColours.map((c) => (
                      <label key={c} className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={selectedColours.includes(c)} onChange={() => toggleColour(c)} className="rounded" />
                        <span className="text-sm text-muted">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            <p className="text-muted text-sm mb-4">{filteredProducts.length} products</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-silver/30">
                  <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
                    {product.primaryImage ? (
                      <Image
                        src={product.primaryImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-silver/30 flex items-center justify-center">
                        <span className="text-muted text-sm">No Image</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="flex-1 bg-gold text-warm-black py-2 rounded text-xs font-medium hover:bg-gold-light transition-colors flex items-center justify-center gap-1">
                        <ShoppingCart size={14} />
                        Add to Cart
                      </button>
                      <button className="w-9 h-9 bg-white rounded flex items-center justify-center hover:bg-cream transition-colors shadow-sm">
                        <Heart size={16} className="text-warm-black" />
                      </button>
                    </div>
                  </Link>
                  <div className="p-3">
                    <span className="text-muted text-[10px] uppercase tracking-wider">
                      {product.carat} · {product.colour}
                    </span>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-[family-name:var(--font-heading)] text-base font-medium text-warm-black mt-0.5 line-clamp-1 hover:text-gold transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-warm-black font-semibold">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20"><p className="text-muted text-lg">No products match your filters</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
