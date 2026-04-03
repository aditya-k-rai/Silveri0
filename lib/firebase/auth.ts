import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from './client';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);

  try {
    const idToken = await result.user.getIdToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // Session cookie failed or timed out
  }

  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });

  try {
    const idToken = await result.user.getIdToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // Session cookie failed or timed out
  }

  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  // Best-effort session creation with timeout — don't block login
  try {
    const idToken = await result.user.getIdToken();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
  } catch {
    // Session cookie failed or timed out — login still works via Firebase client auth
  }

  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email, {
    url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://silveri.in/login',
    handleCodeInApp: false,
  });
}

export async function signOutUser() {
  await fetch('/api/auth/session', { method: 'DELETE' });
  await signOut(auth);
}
