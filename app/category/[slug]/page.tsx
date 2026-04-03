'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';

const sampleProducts = [
  { id: '1', name: 'Silver Moonlight Ring', slug: 'silver-moonlight-ring', price: 2499, comparePrice: 3999, image: '', material: 'Sterling Silver' },
  { id: '2', name: 'Gold Plated Pendant', slug: 'gold-plated-pendant', price: 3499, comparePrice: 4999, image: '', material: 'Gold Plated' },
  { id: '3', name: 'Pearl Drop Earrings', slug: 'pearl-drop-earrings', price: 1999, comparePrice: 2999, image: '', material: 'Silver & Pearl' },
  { id: '4', name: 'Twisted Silver Bracelet', slug: 'twisted-silver-bracelet', price: 2999, comparePrice: 4499, image: '', material: 'Sterling Silver' },
  { id: '5', name: 'Diamond Cut Anklet', slug: 'diamond-cut-anklet', price: 1799, comparePrice: 2499, image: '', material: 'Sterling Silver' },
  { id: '6', name: 'Rose Gold Hoop Earrings', slug: 'rose-gold-hoop-earrings', price: 2299, comparePrice: 3499, image: '', material: 'Rose Gold' },
];

const materials = ['Sterling Silver', 'Gold Plated', 'Rose Gold', 'Silver & Pearl', 'Oxidized Silver'];

export default function CategoryPage() {
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const filteredProducts = sampleProducts
    .filter((p) => selectedMaterials.length === 0 || selectedMaterials.includes(p.material || ''))
    .filter((p) => !priceRange.min || p.price >= Number(priceRange.min))
    .filter((p) => !priceRange.max || p.price <= Number(priceRange.max))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-warm-black capitalize">Collection</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-light text-warm-black capitalize">
            Our Collection
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
                <h4 className="font-medium text-sm text-warm-black mb-3">Material</h4>
                <div className="space-y-2">
                  {materials.map((mat) => (
                    <label key={mat} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={selectedMaterials.includes(mat)} onChange={() => toggleMaterial(mat)} className="rounded border-silver text-gold focus:ring-gold" />
                      <span className="text-sm text-muted">{mat}</span>
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
                    <h4 className="font-medium text-sm text-warm-black mb-3">Material</h4>
                    {materials.map((mat) => (
                      <label key={mat} className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={selectedMaterials.includes(mat)} onChange={() => toggleMaterial(mat)} className="rounded" />
                        <span className="text-sm text-muted">{mat}</span>
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
                <ProductCard key={product.id} {...product} />
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
