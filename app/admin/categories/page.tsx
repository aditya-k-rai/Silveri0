"use client";

import React, { useState } from "react";
import { Plus, X, Upload, Image as ImageIcon, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  image: string | null;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: "c1", name: "Rings", slug: "rings", productCount: 24, image: null },
  { id: "c2", name: "Necklaces", slug: "necklaces", productCount: 18, image: null },
  { id: "c3", name: "Earrings", slug: "earrings", productCount: 22, image: null },
  { id: "c4", name: "Bracelets", slug: "bracelets", productCount: 15, image: null },
  { id: "c5", name: "Anklets", slug: "anklets", productCount: 10, image: null },
  { id: "c6", name: "Pendants", slug: "pendants", productCount: 12, image: null },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);

  const openEditor = (cat: Category | null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormName(cat.name);
      setFormSlug(cat.slug);
      setFormImage(cat.image);
    } else {
      setEditingCategory({ id: "NEW", name: "", slug: "", productCount: 0, image: null });
      setFormName("");
      setFormSlug("");
      setFormImage(null);
    }
  };

  const closeEditor = () => {
    setEditingCategory(null);
  };

  const handleSave = () => {
    if (!editingCategory) return;
    
    if (editingCategory.id === "NEW") {
      const newCat: Category = {
        id: `c${Date.now()}`,
        name: formName,
        slug: formSlug,
        productCount: 0,
        image: formImage
      };
      setCategories([...categories, newCat]);
    } else {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? {
        ...c, name: formName, slug: formSlug, image: formImage
      } : c));
    }
    closeEditor();
  };

  const handleImageSimulate = () => {
    setFormImage("https://images.unsplash.com/photo-1599643478514-4a52023961c2?w=500&q=80");
  };

  return (
    <div className="relative space-y-6 min-h-screen">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#7A7585]">{categories.length} categories</p>
        <button 
          onClick={() => openEditor(null)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#8A6E2F] transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => openEditor(cat)}
            className="bg-white border border-[#E8E8E8] rounded-2xl overflow-hidden hover:shadow-md transition-all hover:border-[#C9A84C] cursor-pointer group"
          >
            <div className={`aspect-[2/1] flex items-center justify-center relative bg-[#E8E8E8]/30 ${cat.image ? 'overflow-hidden' : ''}`}>
              {cat.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-sm text-[#7A7585] flex flex-col items-center gap-2">
                  <ImageIcon size={20} className="opacity-50" />
                  No Image Set
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">{cat.name}</h3>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-[#7A7585]">{cat.productCount} products</p>
                <p className="text-xs text-[#A09DAB]">/{cat.slug}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLIDE OVER EDITOR */}
      {editingCategory && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
            onClick={closeEditor}
          />
          
          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform transform translate-x-0">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E8]">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">
                {editingCategory.id === "NEW" ? "Create Category" : "Edit Category"}
              </h2>
              <button 
                onClick={closeEditor}
                className="p-2 text-[#7A7585] hover:bg-[#E8E8E8]/50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Image Editor */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Category Image</label>
                <div 
                  onClick={handleImageSimulate}
                  className={`w-full aspect-[2/1] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${formImage ? 'border-[#C9A84C]' : 'border-[#E8E8E8] hover:border-[#C9A84C]/50 bg-[#FDFAF5]/50'}`}
                >
                  {formImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={24} className="text-[#A09DAB] mb-2" />
                      <span className="text-sm text-[#7A7585]">Click to upload image</span>
                    </>
                  )}
                </div>
                {formImage && (
                  <button onClick={() => setFormImage(null)} className="text-xs text-red-500 mt-2 hover:underline">
                    Remove Image
                  </button>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Category Name</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (editingCategory.id === "NEW") {
                      setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  className="w-full bg-white border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 transition-shadow"
                  placeholder="e.g. Diamond Rings"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-2">URL Slug</label>
                <input 
                  type="text" 
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  className="w-full bg-[#FDFAF5] border border-[#E8E8E8] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 transition-shadow font-mono text-[#7A7585]"
                  placeholder="e.g. diamond-rings"
                />
              </div>

            </div>

            <div className="p-6 border-t border-[#E8E8E8] bg-[#FDFAF5]/30">
              <button 
                onClick={handleSave}
                disabled={!formName || !formSlug}
                className="w-full flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
              >
                <Save size={16} /> Save Category
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
