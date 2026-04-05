import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import app from './client';

function getStorageInstance() {
  if (!app) throw new Error('Firebase not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.');
  return getStorage(app);
}

export async function uploadProductImage(productId: string, file: File, index: number): Promise<string> {
  const s = getStorageInstance();
  const storageRef = ref(s, `products/${productId}/${index}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadUserAvatar(userId: string, file: File): Promise<string> {
  const s = getStorageInstance();
  const storageRef = ref(s, `users/${userId}/avatar`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadCategoryImage(categoryId: string, file: File): Promise<string> {
  const s = getStorageInstance();
  const storageRef = ref(s, `categories/${categoryId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadBannerImage(file: File, index: number): Promise<string> {
  const s = getStorageInstance();
  const storageRef = ref(s, `banners/${index}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function upload3DModel(productId: string, file: File): Promise<string> {
  const s = getStorageInstance();
  const storageRef = ref(s, `3d-models/${productId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return getDownloadURL(snapshot.ref);
}

export async function uploadBase64Image(path: string, base64: string): Promise<string> {
  const s = getStorageInstance();
  const [header, data] = base64.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/webp';
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const storageRef = ref(s, path);
  const snapshot = await uploadBytes(storageRef, bytes, { contentType: mime });
  return getDownloadURL(snapshot.ref);
}

export async function deleteStoragePath(path: string): Promise<void> {
  if (!app) return;
  const s = getStorage(app);
  try {
    await deleteObject(ref(s, path));
  } catch {
    // File may not exist
  }
}
