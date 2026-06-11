'use client';

import { ReactNode, useEffect } from 'react';
import { AuthProvider, useAuthContext } from '@/context/AuthContext';
import { useProductStore } from '@/store/productStore';
import { subscribeToProducts } from '@/lib/firebase/products';
import { usePathname, useRouter } from 'next/navigation';

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

function ProfileCompletionGuard() {
  const { user, userDoc, loading } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user && userDoc) {
      // Admins do not need customer profile completion
      if (userDoc.role === 'admin') return;

      // If phone is missing/empty, redirect to login page for completion
      if (!userDoc.phone && pathname !== '/login') {
        const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${redirectUrl}`);
      }
    }
  }, [user, userDoc, loading, pathname, router]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProductSync />
      <ProfileCompletionGuard />
      {children}
    </AuthProvider>
  );
}

