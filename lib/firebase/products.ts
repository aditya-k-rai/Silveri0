import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './client';
import { Product } from '@/store/productStore';

const COLLECTION = 'products';

function getProductsRef() {
  if (!db) return null;
  return collection(db, COLLECTION);
}

export async function fetchProducts(): Promise<Product[]> {
  const ref = getProductsRef();
  if (!ref) return [];
  const snap = await getDocs(query(ref, orderBy('name')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

export function subscribeToProducts(
  callback: (products: Product[]) => void
): Unsubscribe | null {
  const ref = getProductsRef();
  if (!ref) return null;
  return onSnapshot(query(ref, orderBy('name')), (snap) => {
    const products = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    callback(products);
  });
}

export async function saveProduct(product: Product): Promise<void> {
  if (!db) return;
  const { id, ...data } = product;
  await setDoc(doc(db, COLLECTION, id), data);
}

export async function updateProductDoc(
  id: string,
  updates: Partial<Product>
): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, COLLECTION, id), updates);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!db) return;
  await deleteDoc(doc(db, COLLECTION, id));
}
