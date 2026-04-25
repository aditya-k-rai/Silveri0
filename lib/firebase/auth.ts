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

const SESSION_TIMEOUT_MS = 8000;

async function createSessionCookie(idToken: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);
  try {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`Session creation failed (${res.status})`);
    }
  } finally {
    clearTimeout(timer);
  }
}

async function clearSessionCookie(): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SESSION_TIMEOUT_MS);
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      signal: controller.signal,
      cache: 'no-store',
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  await createSessionCookie(idToken);
  return result.user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  const idToken = await result.user.getIdToken();
  await createSessionCookie(idToken);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();
  await createSessionCookie(idToken);
  return result.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email, {
    url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'https://silveri.in/login',
    handleCodeInApp: false,
  });
}

export async function signOutUser() {
  // 1. Sign out of Firebase first — onAuthStateChanged fires and AuthContext clears local state
  try {
    await signOut(auth);
  } catch (err) {
    console.error('[signOutUser] Firebase signOut failed:', err);
  }
  // 2. Then clear the server session cookie. Independent of Firebase result.
  try {
    await clearSessionCookie();
  } catch (err) {
    console.error('[signOutUser] Session cookie cleanup failed:', err);
  }
}
