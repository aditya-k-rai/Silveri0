"use client";

import React, { useState } from "react";
import { Plus, Search, Star, Sparkles, X, Image as ImageIcon, Box, Upload, Save, Tag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  carat: string;
  colour: string;
  size: string;
  height: string;
  weight: string;
  width: string;
  radius: string;
  warranty: string;
  tags: string;
  primaryImage: string | null;
  hoverImage: string | null;
  model3dFileName: string | null;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "P001", name: "Silver Elegance Ring", sku: "SLV-RNG-001", price: 2499, stock: 34, category: "Rings", status: "Active", isFeatured: true, isNewArrival: false, carat: "22K", colour: "Silver", size: "US 7", height: "0.2cm", weight: "4.2g", width: "0.8cm", radius: "0.85cm", warranty: "1 Year Polish Guarantee", tags: "wedding, elegant, classic", primaryImage: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=500&q=80", hoverImage: null, model3dFileName: "ring_elegance.obj" },
  { id: "P002", name: "Luna Necklace", sku: "SLV-NCK-002", price: 3899, stock: 22, category: "Necklaces", status: "Active", isFeatured: false, isNewArrival: true, carat: "18K", colour: "Rose Gold", size: "18 inch chain", height: "N/A", weight: "12g", width: "0.4cm", radius: "", warranty: "Lifetime Clasp Replacement", tags: "daily wear, trendy", primaryImage: null, hoverImage: null, model3dFileName: "luna.3dm" },
  { id: "P003", name: "Aria Earrings", sku: "SLV-EAR-003", price: 1899, stock: 45, category: "Earrings", status: "Active", isFeatured: true, isNewArrival: true, carat: "24K", colour: "Gold", size: "Regular", height: "2.5cm", weight: "6g", width: "1.2cm", radius: "", warranty: "6 Month Manufacturer Defect Guarantee", tags: "party, gold", primaryImage: null, hoverImage: null, model3dFileName: null },
  { id: "P004", name: "Charm Bracelet", sku: "SLV-BRC-004", price: 4299, stock: 18, category: "Bracelets", status: "Active", isFeatured: false, isNewArrival: false, carat: "18K", colour: "Silver", size: "7.5 inch lock", height: "0.5cm", weight: "18g", width: "0.8cm", radius: "", warranty: "No warranty on charms", tags: "casual, charm", primaryImage: null, hoverImage: null, model3dFileName: null },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Name");

  // Editor State
  const [editingParams, setEditingParams] = useState<Product | null>(null);

  const filtered = products
    .filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "Name") return a.name.localeCompare(b.name);
      if (sortBy === "PriceAsc") return a.price - b.price;
      if (sortBy === "PriceDesc") return b.price - a.price;
      if (sortBy === "StockAsc") return a.stock - b.stock;
      if (sortBy === "StockDesc") return b.stock - a.stock;
      if (sortBy === "Carat") return a.carat.localeCompare(b.carat);
      return 0;
    });

  const toggleFlag = (e: React.MouseEvent, id: string, field: 'isFeatured' | 'isNewArrival') => {
    e.stopPropagation();
    setProducts((prev) => prev.map(p => p.id === id ? { ...p, [field]: !p[field] } : p));
  };

  const openEditor = (prod: Product | null) => {
    if (prod) {
      setEditingParams({ ...prod });
    } else {
      setEditingParams({
        id: "NEW",
        name: "",
        sku: `SLV-NEW-${Math.floor(1000 + Math.random() * 9000)}`,
        price: 0,
        stock: 0,
        category: "Rings",
        status: "Draft",
        isFeatured: false,
        isNewArrival: false,
        carat: "22K",
        colour: "Silver",
        size: "",
        height: "",
        weight: "",
        width: "",
        radius: "",
        warranty: "",
        tags: "",
        primaryImage: null,
        hoverImage: null,
        model3dFileName: null
      });
    }
  };

  const closeEditor = () => setEditingParams(null);

  const saveProduct = () => {
    if (!editingParams) return;
    if (editingParams.id === "NEW") {
      const newProd = { ...editingParams, id: `P${Date.now()}` };
      setProducts([newProd, ...products]);
    } else {
      setProducts(prev => prev.map(p => p.id === editingParams.id ? editingParams : p));
    }
    closeEditor();
  };

  const simulateMediaUpload = (type: 'primary' | 'hover' | '3d') => {
    if (!editingParams) return;
    if (type === 'primary') {
      setEditingParams({ ...editingParams, primaryImage: "https://images.unsplash.com/photo-1605100804763-247f67b2548e?w=500&q=80" });
    } else if (type === 'hover') {
      setEditingParams({ ...editingParams, hoverImage: "https://images.unsplash.com/photo-1515562141207-7a8ea4114e17?w=500&q=80" });
    } else {
      setEditingParams({ ...editingParams, model3dFileName: `model_${Date.now()}.obj` });
    }
  };

  return (
    <div className="relative space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7585]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 text-[#1A1A1A] font-medium cursor-pointer"
          >
            <option value="Name">Sort by: Name (A-Z)</option>
            <option value="PriceAsc">Sort by: Price (Low to High)</option>
            <option value="PriceDesc">Sort by: Price (High to Low)</option>
            <option value="StockAsc">Sort by: Stock (Low to High)</option>
            <option value="StockDesc">Sort by: Stock (High to Low)</option>
            <option value="Carat">Sort by: Carat / Purity</option>
          </select>
        </div>
        <button 
          onClick={() => openEditor(null)}
          className="inline-flex items-center w-full sm:w-auto justify-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#8A6E2F] transition-colors shrink-0"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU / Specs</th>
                <th className="px-5 py-3 font-medium text-center">Media</th>
                <th className="px-5 py-3 font-medium text-center">Featured</th>
                <th className="px-5 py-3 font-medium text-center">New</th>
                <th className="px-5 py-3 font-medium text-right">Price</th>
                <th className="px-5 py-3 font-medium text-right">Stock</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} onClick={() => openEditor(p)} className="border-t border-[#E8E8E8]/50 hover:bg-[#FDFAF5]/50 transition-colors cursor-pointer">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E8E8E8]/40 flex items-center justify-center text-[#A09DAB] shrink-0 overflow-hidden">
                        {p.primaryImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.primaryImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                      </div>
                      <span className="font-medium text-[#1A1A1A]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#7A7585]">{p.sku}</p>
                    <p className="text-[10px] text-amber-600 font-semibold">{p.carat} • {p.colour}</p>
                  </td>
                  
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                       {p.primaryImage && <span title="Has Image"><ImageIcon size={14} className="text-[#1A1A1A]" /></span>}
                       {p.model3dFileName && <span title="Has 3D Model"><Box size={14} className="text-[#C9A84C]" /></span>}
                    </div>
                  </td>

                  {/* Toggles */}
                  <td className="px-5 py-4 text-center">
                    <button 
                      onClick={(e) => toggleFlag(e, p.id, 'isFeatured')}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        p.isFeatured ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star size={16} className={p.isFeatured ? "fill-current" : ""} />
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button 
                      onClick={(e) => toggleFlag(e, p.id, 'isNewArrival')}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        p.isNewArrival ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles size={16} />
                    </button>
                  </td>

                  <td className="px-5 py-4 text-right font-medium">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={p.stock === 0 ? "text-red-600 font-medium" : ""}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.status === "Active" ? "bg-green-50 text-green-700" : p.status === "Draft" ? "bg-amber-50 text-amber-700" : "bg-[#E8E8E8]/40 text-[#7A7585]"
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-10 text-[#7A7585] text-sm">No products found.</p>
        )}
      </div>

      {/* PRODUCT EDITOR SLIDE-OVER */}
      {editingParams && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity" onClick={closeEditor} />
          
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-[#F5F3EF] z-50 shadow-2xl flex flex-col transition-transform transform translate-x-0">
            <div className="flex bg-white items-center justify-between px-6 py-4 border-b border-[#E8E8E8] shrink-0">
              <h2 className="text-lg font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A] flex items-center gap-2">
                <Tag size={18} className="text-[#C9A84C]" />
                {editingParams.id === "NEW" ? "New Product" : "Edit Product"}
              </h2>
              <button onClick={closeEditor} className="p-2 text-[#7A7585] hover:bg-[#E8E8E8]/50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Media Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">Product Media</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Primary Image */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E8E8]">
                    <label className="block text-xs font-medium text-[#7A7585] mb-2 text-center">Primary Image (Default)</label>
                    <div 
                      onClick={() => simulateMediaUpload('primary')}
                      className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group ${editingParams.primaryImage ? 'border-[#C9A84C]' : 'border-[#E8E8E8] hover:border-[#C9A84C]/50 bg-[#FDFAF5]'}`}
                    >
                      {editingParams.primaryImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={editingParams.primaryImage} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">Replace</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <Upload size={20} className="text-[#A09DAB] mb-2 mx-auto" />
                          <span className="text-[10px] text-[#7A7585]">Upload Primary</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Image */}
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E8E8]">
                    <label className="block text-xs font-medium text-[#7A7585] mb-2 text-center">Secondary Image (Hover)</label>
                    <div 
                      onClick={() => simulateMediaUpload('hover')}
                      className={`w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group ${editingParams.hoverImage ? 'border-purple-400' : 'border-[#E8E8E8] hover:border-purple-300 bg-[#FDFAF5]'}`}
                    >
                      {editingParams.hoverImage ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={editingParams.hoverImage} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">Replace</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon size={20} className="text-[#A09DAB] mb-2 mx-auto" />
                          <span className="text-[10px] text-[#7A7585]">Upload Hover</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3D Model Configurator */}
                <div className="bg-white p-5 rounded-2xl border border-[#E8E8E8] flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center shrink-0">
                    <Box className="text-[#C9A84C]" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">3D Model View (.obj / .3dm)</p>
                    <p className="text-xs text-[#7A7585] truncate">
                      {editingParams.model3dFileName ? `Attached: ${editingParams.model3dFileName}` : "No 3D file attached for Interactive AR/Viewer."}
                    </p>
                  </div>
                  <button 
                    onClick={() => simulateMediaUpload('3d')}
                    className="px-4 py-2 border border-[#E8E8E8] rounded-lg text-xs font-medium hover:bg-[#F5F3EF] transition-colors"
                  >
                    {editingParams.model3dFileName ? "Replace File" : "Upload File"}
                  </button>
                </div>
              </div>

              {/* Core Details */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">Product Context</h3>
                <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Product Name</label>
                    <input 
                      type="text" 
                      value={editingParams.name}
                      onChange={(e) => setEditingParams({...editingParams, name: e.target.value})}
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Category</label>
                      <select 
                        value={editingParams.category}
                        onChange={(e) => setEditingParams({...editingParams, category: e.target.value})}
                        className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                      >
                        <option value="Rings">Rings</option>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Anklets">Anklets</option>
                        <option value="Pendants">Pendants</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Colour</label>
                      <input 
                        type="text" 
                        value={editingParams.colour}
                        onChange={(e) => setEditingParams({...editingParams, colour: e.target.value})}
                        placeholder="e.g. Silver, Rose Gold"
                        className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Carat (Purity)</label>
                      <input 
                        type="text" 
                        value={editingParams.carat}
                        onChange={(e) => setEditingParams({...editingParams, carat: e.target.value})}
                        placeholder="e.g. 18K"
                        className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-amber-700 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Dimensions */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">Physical Dimensions</h3>
                <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Size/Length</label>
                    <input 
                      type="text" 
                      value={editingParams.size}
                      onChange={(e) => setEditingParams({...editingParams, size: e.target.value})}
                      placeholder="e.g. US 7, 18in"
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Weight</label>
                    <input 
                      type="text" 
                      value={editingParams.weight}
                      onChange={(e) => setEditingParams({...editingParams, weight: e.target.value})}
                      placeholder="e.g. 4.2g"
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Height</label>
                    <input 
                      type="text" 
                      value={editingParams.height}
                      onChange={(e) => setEditingParams({...editingParams, height: e.target.value})}
                      placeholder="e.g. 1.2cm"
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Width</label>
                    <input 
                      type="text" 
                      value={editingParams.width}
                      onChange={(e) => setEditingParams({...editingParams, width: e.target.value})}
                      placeholder="e.g. 0.4cm"
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Radius (Optional for Rings)</label>
                    <input 
                      type="text" 
                      value={editingParams.radius}
                      onChange={(e) => setEditingParams({...editingParams, radius: e.target.value})}
                      placeholder="e.g. 0.85cm"
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Policies & Tags */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-[#1A1A1A] uppercase tracking-wider">Policies & Tags</h3>
                <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Search Tags</label>
                    <input 
                      type="text" 
                      value={editingParams.tags}
                      onChange={(e) => setEditingParams({...editingParams, tags: e.target.value})}
                      placeholder="e.g. classic, wedding, silver"
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Guarantee / Warranty Note</label>
                    <textarea 
                      value={editingParams.warranty}
                      onChange={(e) => setEditingParams({...editingParams, warranty: e.target.value})}
                      placeholder="e.g. 1 Year free polish replacement"
                      rows={2}
                      className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="grid grid-cols-3 gap-4 bg-white p-6 rounded-2xl border border-[#E8E8E8]">
                <div>
                  <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">M.R.P (₹)</label>
                  <input 
                    type="number" 
                    value={editingParams.price}
                    onChange={(e) => setEditingParams({...editingParams, price: Number(e.target.value)})}
                    className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/40 text-green-700 font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Stock Unit</label>
                  <input 
                    type="number" 
                    value={editingParams.stock}
                    onChange={(e) => setEditingParams({...editingParams, stock: Number(e.target.value)})}
                    className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7A7585] mb-1.5">Status</label>
                  <select 
                    value={editingParams.status}
                    onChange={(e) => setEditingParams({...editingParams, status: e.target.value})}
                    className="w-full bg-[#F5F3EF] border border-transparent rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
                  >
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="px-6 py-5 border-t border-[#E8E8E8] bg-white gap-3 flex shrink-0">
              <button 
                onClick={closeEditor}
                className="flex-1 py-3 rounded-xl text-sm font-medium border border-[#E8E8E8] text-[#1A1A1A] hover:bg-[#F5F3EF] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveProduct}
                disabled={!editingParams.name || !editingParams.price}
                className="flex-[2] flex items-center justify-center gap-2 bg-[#1A1A1A] text-white py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
              >
                <Save size={16} /> Save Product Specs
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
