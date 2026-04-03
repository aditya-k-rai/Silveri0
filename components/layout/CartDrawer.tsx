'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sample cart items for demonstration
const sampleItems: CartItem[] = [];

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [items] = useState<CartItem[]>(sampleItems);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Drawer - Right on desktop, Bottom sheet on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col md:block hidden"
          >
            <CartContent items={items} subtotal={subtotal} onClose={onClose} />
          </motion.div>

          {/* Mobile Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 right-0 bottom-0 bg-white z-50 shadow-2xl flex flex-col md:hidden rounded-t-2xl max-h-[85vh]"
          >
            <div className="w-12 h-1.5 bg-silver rounded-full mx-auto mt-3" />
            <CartContent items={items} subtotal={subtotal} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CartContent({
  items,
  subtotal,
  onClose,
}: {
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-silver/30">
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-gold" />
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-medium text-warm-black">
            Your Cart
          </h2>
          <span className="text-muted text-sm">({items.length})</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-silver/30 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag size={48} className="text-silver mb-4" />
            <p className="font-[family-name:var(--font-heading)] text-lg text-warm-black mb-2">
              Your cart is empty
            </p>
            <p className="text-muted text-sm mb-6">
              Discover our beautiful collection
            </p>
            <Link
              href="/category/all"
              onClick={onClose}
              className="bg-gold text-warm-black px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gold-light transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 pb-4 border-b border-silver/20"
              >
                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-silver/20 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-muted text-[10px]">Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-warm-black truncate">
                    {item.name}
                  </h3>
                  <p className="text-gold font-semibold text-sm mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border border-silver/50 rounded">
                      <button className="w-7 h-7 flex items-center justify-center hover:bg-silver/20 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button className="w-7 h-7 flex items-center justify-center hover:bg-silver/20 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button className="text-muted hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="border-t border-silver/30 px-5 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-muted text-sm">Subtotal</span>
            <span className="text-warm-black font-semibold">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-muted text-xs">Shipping calculated at checkout</p>
          <Link
            href="/checkout"
            onClick={onClose}
            className="block w-full bg-gold text-warm-black text-center py-3 rounded-full text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Proceed to Checkout
          </Link>
          <button
            onClick={onClose}
            className="block w-full text-center text-muted text-sm hover:text-warm-black transition-colors py-1"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  );
}
