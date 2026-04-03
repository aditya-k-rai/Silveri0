import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  verifyPasswordResetCode,
  confirmPasswordReset,
  getAuth,
  type Auth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { auth } from './client';

const googleProvider = new GoogleAuthProvider();

function getAuthSafe(): Auth {
  // First try the pre-initialized auth
  if (auth) return auth;

  // Fallback: initialize Firebase directly (handles cases where client.ts init failed)
  let firebaseApp;
  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    if (!config.apiKey) throw new Error('Firebase API key is missing');
    firebaseApp = initializeApp(config);
  }
  return getAuth(firebaseApp);
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();

  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });

  const idToken = await result.user.getIdToken();
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();

  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email, {
    url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://silveri.in/login',
    handleCodeInApp: false,
  });
}

export async function verifyResetCode(code: string) {
  return verifyPasswordResetCode(getAuthSafe(), code);
}

export async function confirmReset(code: string, newPassword: string) {
  await confirmPasswordReset(getAuthSafe(), code, newPassword);
}

export async function signOutUser() {
  await fetch('/api/auth/session', { method: 'DELETE' });
  await signOut(auth);
}
