'use client';

import { useState } from 'react';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductDetailClientProps {
  product: { id: string; name: string; price: number; stock: number; images: string[] };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleAddToCart}
        disabled={product.stock <= 0}
        className="flex-1 flex items-center justify-center gap-2 bg-gold text-warm-black py-3.5 rounded-lg font-medium hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart size={18} />
        {addedToCart ? 'Added!' : 'Add to Cart'}
      </button>
      <button
        onClick={() => setWishlisted(!wishlisted)}
        className={`w-14 h-14 flex items-center justify-center rounded-lg border-2 transition-colors ${
          wishlisted ? 'border-red-400 bg-red-50' : 'border-silver hover:border-gold'
        }`}
      >
        <Heart size={20} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-muted'} />
      </button>
    </div>
  );
}
