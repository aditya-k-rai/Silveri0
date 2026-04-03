"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  material: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
  { id: "w1", slug: "silver-elegance-ring", name: "Silver Elegance Ring", price: 2499, material: "925 Sterling Silver" },
  { id: "w2", slug: "luna-necklace", name: "Luna Necklace", price: 3899, material: "Pure Silver" },
  { id: "w3", slug: "aria-earrings", name: "Aria Earrings", price: 1899, material: "925 Sterling Silver" },
  { id: "w4", slug: "charm-bracelet", name: "Charm Bracelet", price: 4299, material: "Pure Silver" },
];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleMoveToCart = (id: string) => {
    // In production, add to cart then remove from wishlist
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="bg-white border border-silver/40 rounded-2xl p-10 text-center">
        <Heart size={48} className="mx-auto text-muted mb-4" />
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-2">Your Wishlist is Empty</h2>
        <p className="text-sm text-muted mb-6">Save items you love to buy them later.</p>
        <Link href="/" className="inline-block px-6 py-3 bg-gold text-white font-medium rounded-xl hover:bg-gold-dark transition-colors">
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold mb-6">
        My Wishlist <span className="text-sm text-muted font-normal">({items.length} items)</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border border-silver/40 rounded-xl overflow-hidden group">
            <Link href={`/product/${item.slug}`}>
              <div className="aspect-square bg-silver/30 flex items-center justify-center">
                <span className="text-muted text-xs">Image</span>
              </div>
            </Link>
            <div className="p-3">
              <span className="text-[10px] uppercase tracking-wider text-gold font-medium">{item.material}</span>
              <Link href={`/product/${item.slug}`}>
                <h3 className="text-sm font-[family-name:var(--font-heading)] font-semibold mt-1 hover:text-gold transition-colors line-clamp-1">
                  {item.name}
                </h3>
              </Link>
              <p className="font-medium text-sm mt-1">₹{item.price.toLocaleString("en-IN")}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleMoveToCart(item.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
                >
                  <ShoppingBag size={12} /> Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-2 border border-silver/40 rounded-lg text-muted hover:text-red-600 hover:border-red-200 transition-colors"
                  aria-label="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
