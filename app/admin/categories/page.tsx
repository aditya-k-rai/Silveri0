"use client";

import { Plus } from "lucide-react";

const CATEGORIES = [
  { id: "c1", name: "Rings", slug: "rings", productCount: 24, image: null },
  { id: "c2", name: "Necklaces", slug: "necklaces", productCount: 18, image: null },
  { id: "c3", name: "Earrings", slug: "earrings", productCount: 22, image: null },
  { id: "c4", name: "Bracelets", slug: "bracelets", productCount: 15, image: null },
  { id: "c5", name: "Anklets", slug: "anklets", productCount: 10, image: null },
  { id: "c6", name: "Pendants", slug: "pendants", productCount: 12, image: null },
];

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A7585]">{CATEGORIES.length} categories</p>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#8A6E2F] transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="aspect-[2/1] bg-[#E8E8E8]/30 flex items-center justify-center">
              <span className="text-sm text-[#7A7585]">Category Image</span>
            </div>
            <div className="p-4">
              <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">{cat.name}</h3>
              <p className="text-sm text-[#7A7585] mt-1">{cat.productCount} products</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
