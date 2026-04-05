import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './client';

export async function uploadProductImage(productId: string, file: File, index: number): Promise<string> {
  const { app } = await import('./client');
  if (!app) throw new Error('Firebase not initialized. Check NEXT_PUBLIC_FIREBASE_* env variables.');
  const { getStorage: getStorageInstance } = await import('firebase/storage');
  const s = getStorageInstance(app);
  const storageRef = ref(s, `products/${productId}/${index}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `users/${userId}/avatar`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `categories/${categoryId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadBannerImage(file: File, index: number): Promise<string> {
  const storageRef = ref(storage, `banners/${index}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function upload3DModel(productId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `3d-models/${productId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadBase64Image(path: string, base64: string): Promise<string> {
  if (!storage) return '';
  // Convert base64 data URL to Uint8Array for fast binary upload
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/webp';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, bytes, { contentType: mime });
  return getDownloadURL(snapshot.ref);
}

export async function deleteStoragePath(path: string): Promise<void> {
  if (!storage) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // File may not exist — ignore
  }
}
