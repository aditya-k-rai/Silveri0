"use client";

import { useState } from "react";
import { Plus, Search, Star, Sparkles } from "lucide-react";

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
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "P001", name: "Silver Elegance Ring", sku: "SLV-RNG-001", price: 2499, stock: 34, category: "Rings", status: "Active", isFeatured: true, isNewArrival: false },
  { id: "P002", name: "Luna Necklace", sku: "SLV-NCK-002", price: 3899, stock: 22, category: "Necklaces", status: "Active", isFeatured: false, isNewArrival: true },
  { id: "P003", name: "Aria Earrings", sku: "SLV-EAR-003", price: 1899, stock: 45, category: "Earrings", status: "Active", isFeatured: true, isNewArrival: true },
  { id: "P004", name: "Charm Bracelet", sku: "SLV-BRC-004", price: 4299, stock: 18, category: "Bracelets", status: "Active", isFeatured: false, isNewArrival: false },
  { id: "P005", name: "Twist Anklet", sku: "SLV-ANK-005", price: 1299, stock: 0, category: "Anklets", status: "Draft", isFeatured: false, isNewArrival: false },
  { id: "P006", name: "Solitaire Ring", sku: "SLV-RNG-006", price: 5499, stock: 12, category: "Rings", status: "Active", isFeatured: false, isNewArrival: false },
  { id: "P007", name: "Pearl Pendant", sku: "SLV-NCK-007", price: 2899, stock: 8, category: "Necklaces", status: "Active", isFeatured: false, isNewArrival: false },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const toggleToggle = (id: string, field: 'isFeatured' | 'isNewArrival') => {
    setProducts((prev) => prev.map(p => p.id === id ? { ...p, [field]: !p[field] } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7585]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8E8E8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-white text-sm font-medium rounded-xl hover:bg-[#8A6E2F] transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium text-center">Featured</th>
                <th className="px-5 py-3 font-medium text-center">New Arrival</th>
                <th className="px-5 py-3 font-medium text-right">Price</th>
                <th className="px-5 py-3 font-medium text-right">Stock</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-[#E8E8E8]/50 hover:bg-[#FDFAF5]/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E8E8E8]/40 flex items-center justify-center text-[10px] text-[#7A7585] shrink-0">
                        IMG
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#7A7585]">{p.sku}</td>
                  
                  {/* Toggles */}
                  <td className="px-5 py-3 text-center">
                    <button 
                      onClick={() => toggleToggle(p.id, 'isFeatured')}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        p.isFeatured ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title="Toggle Featured on Home"
                    >
                      <Star size={16} className={p.isFeatured ? "fill-current" : ""} />
                    </button>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button 
                      onClick={() => toggleToggle(p.id, 'isNewArrival')}
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        p.isNewArrival ? 'bg-purple-100 text-purple-600 hover:bg-purple-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title="Toggle New Arrival"
                    >
                      <Sparkles size={16} />
                    </button>
                  </td>

                  <td className="px-5 py-3 text-right">₹{p.price.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={p.stock === 0 ? "text-red-600 font-medium" : ""}>
                      {p.stock === 0 ? "Out of stock" : p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      p.status === "Active" ? "bg-green-50 text-green-700" : "bg-[#E8E8E8]/40 text-[#7A7585]"
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
    </div>
  );
}
