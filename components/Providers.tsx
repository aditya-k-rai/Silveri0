'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { useProductStore } from '@/store/productStore';
import { subscribeToProducts } from '@/lib/firebase/products';

function ProductSync() {
  const setProducts = useProductStore((s) => s.setProducts);

  useEffect(() => {
    const unsub = subscribeToProducts((products) => {
      setProducts(products);
    });
    return () => {
      if (unsub) unsub();
    };
  }, [setProducts]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProductSync />
      {children}
    </AuthProvider>
  );
}
