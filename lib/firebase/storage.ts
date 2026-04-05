import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

export async function uploadProductImage(productId: string, file: File, index: number): Promise<string> {
  const storageRef = ref(storage, `products/${productId}/${index}-${file.name}`);
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
  const storageRef = ref(storage, path);
  const snapshot = await uploadString(storageRef, base64, 'data_url');
  return getDownloadURL(snapshot.ref);
}
