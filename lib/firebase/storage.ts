import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage';
import app from './client';

function getStorageInstance() {
  if (!app) throw new Error('Firebase not initialized');
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

export async function deleteStoragePath(path: string): Promise<void> {
  if (!app) return;
  try {
    const s = getStorage(app);
    await deleteObject(ref(s, path));
  } catch {
    // File may not exist
  }
}
