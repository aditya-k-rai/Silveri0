'use client';

import { use, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { useProductStore } from '@/store/productStore';
import { subscribeToCategories, Category } from '@/lib/firebase/categories';
import ProductCard from '@/components/product/ProductCard';
import { trackViewItemList, trackSearch } from '@/lib/analytics/gtm';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [categories, setCategories] = useState<Category[]>([]);

  // Track whether view_item_list has fired for the current filter state
  const listFiredRef = useRef<string>('');

  // Subscribe to Firestore categories so we can match by slug
  useEffect(() => {
    const unsub = subscribeToCategories((cats) => setCategories(cats));
    return () => { if (unsub) unsub(); };
  }, []);

  // Build a set of category NAMES whose Firestore slug matches the URL slug.
  // Products store category as a name (e.g. "Bracelets & Bangles"), not a slug.
  const matchingCategoryNames = new Set(
    categories
      .filter((c) => c.slug === slug)
      .map((c) => c.name)
  );

  // Filter active products, then by category slug
  const activeProducts = products.filter((p) => p.status === 'Active');
  const categoryFiltered = slug === 'all'
    ? activeProducts
    : slug === 'new-arrivals'
      ? activeProducts.filter((p) => p.isNewArrival)
      : activeProducts.filter((p) => {
          // Primary match: use Firestore slug→name lookup (handles "Bracelets & Bangles" → "bracelets")
          if (matchingCategoryNames.size > 0) {
            return matchingCategoryNames.has(p.category);
          }
          // Fallback: direct lowercase comparison (for single-word categories before Firestore loads)
          return p.category.toLowerCase() === slug;
        });

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
    trackSearch(`Metal: ${c}`);
  };

  // Fire view_item_list once per unique filtered result set
  useEffect(() => {
    if (loading || filteredProducts.length === 0) return;
    const listName = `Category: ${categoryTitle}`;
    const key = `${listName}::${filteredProducts.map((p) => p.id).join(',')}}`;
    if (listFiredRef.current === key) return;
    listFiredRef.current = key;
    // Small delay to avoid firing during rapid filter changes
    const t = setTimeout(() => trackViewItemList(filteredProducts, listName), 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProducts.length, slug, selectedColours.join(','), sortBy, loading]);

  const categoryTitle = slug === 'all'
    ? 'Our Collection'
    : slug === 'new-arrivals'
      ? 'New Arrivals'
      : categories.find((c) => c.slug === slug)?.name
        ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                if (e.target.value !== 'newest') trackSearch(`Sort: ${e.target.value} in ${categoryTitle}`);
              }}
              className="border border-silver rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-gold"
            >
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
                <h4 className="font-medium text-sm text-warm-black mb-3">Metal</h4>
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
                    <h4 className="font-medium text-sm text-warm-black mb-3">Metal</h4>
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
                <ProductCard
                  key={product.id}
                  product={product}
                  listName={`Category: ${categoryTitle}`}
                />
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
