'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { User } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

interface AuthContextType {
  user: FirebaseUser | null;
  userDoc: User | null;
  loading: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userDoc: null,
  loading: true,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userDoc, setUserDoc] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const prevUidRef = useRef<string | null>(null);

  useEffect(() => {
    // Guard: if Firebase isn't initialized (missing keys), skip auth
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const prevUid = prevUidRef.current;
      const newUid = firebaseUser?.uid ?? null;

      // Save previous user's data to their personal key before switching
      if (prevUid && prevUid !== newUid) {
        localStorage.setItem(
          `silveri-cart-${prevUid}`,
          JSON.stringify(useCartStore.getState().items)
        );
        localStorage.setItem(
          `silveri-wishlist-${prevUid}`,
          JSON.stringify(useWishlistStore.getState().items)
        );
      }

      // Load new user's data from their personal key (or start empty)
      if (newUid && newUid !== prevUid) {
        const savedCart = localStorage.getItem(`silveri-cart-${newUid}`);
        const savedWishlist = localStorage.getItem(`silveri-wishlist-${newUid}`);
        useCartStore.setState({ items: savedCart ? JSON.parse(savedCart) : [] });
        useWishlistStore.getState().setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      }

      // User logged out — clear stores
      if (!newUid && prevUid) {
        useCartStore.getState().clearCart();
        useWishlistStore.getState().setWishlist([]);
      }

      prevUidRef.current = newUid;

      setUser(firebaseUser);

      if (firebaseUser && db) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserDoc(userSnap.data() as User);
        } else {
          const newUser: Omit<User, 'orderCount' | 'totalSpent'> = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            phone: '',
            role: 'customer',
            addresses: [],
            wishlist: [],
            blocked: false,
            createdAt: new Date(),
          };
          await setDoc(userRef, newUser);
          setUserDoc(newUser as User);
        }
      } else {
        setUserDoc(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-save cart & wishlist to user-specific keys whenever they change
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;

    const unsubCart = useCartStore.subscribe((state) => {
      localStorage.setItem(`silveri-cart-${uid}`, JSON.stringify(state.items));
    });
    const unsubWishlist = useWishlistStore.subscribe((state) => {
      localStorage.setItem(`silveri-wishlist-${uid}`, JSON.stringify(state.items));
    });

    return () => {
      unsubCart();
      unsubWishlist();
    };
  }, [user]);

  const isAdmin = userDoc?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
