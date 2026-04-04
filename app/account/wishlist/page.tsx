"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, Loader2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useProductStore } from "@/store/productStore";
import { useCartStore } from "@/store/cartStore";

export default function WishlistPage() {
  const wishlistIds = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);
  const { products, loading } = useProductStore();
  const addItem = useCartStore((s) => s.addItem);

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleRemove = (productId: string) => {
    removeFromWishlist(productId);
  };

  const handleMoveToCart = (productId: string) => {
    const product = wishlistProducts.find((p) => p.id === productId);
    if (product) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.primaryImage || "",
      });
      removeFromWishlist(productId);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-silver/40 rounded-2xl p-10 text-center">
        <Loader2 size={32} className="mx-auto text-gold animate-spin mb-4" />
        <p className="text-sm text-muted">Loading wishlist...</p>
      </div>
    );
  }

  if (wishlistProducts.length === 0) {
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
        My Wishlist <span className="text-sm text-muted font-normal">({wishlistProducts.length} items)</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {wishlistProducts.map((product) => (
          <div key={product.id} className="bg-white border border-silver/40 rounded-xl overflow-hidden group">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-square bg-silver/30 flex items-center justify-center relative overflow-hidden">
                {product.primaryImage ? (
                  <Image
                    src={product.primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <span className="text-muted text-xs">Image</span>
                )}
              </div>
            </Link>
            <div className="p-3">
              <span className="text-[10px] uppercase tracking-wider text-gold font-medium">
                {product.carat} · {product.colour}
              </span>
              <Link href={`/product/${product.id}`}>
                <h3 className="text-sm font-[family-name:var(--font-heading)] font-semibold mt-1 hover:text-gold transition-colors line-clamp-1">
                  {product.name}
                </h3>
              </Link>
              <p className="font-medium text-sm mt-1">₹{product.price.toLocaleString("en-IN")}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleMoveToCart(product.id)}
                  className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 bg-gold text-white rounded-lg hover:bg-gold-dark transition-colors"
                >
                  <ShoppingBag size={12} /> Add to Cart
                </button>
                <button
                  onClick={() => handleRemove(product.id)}
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
