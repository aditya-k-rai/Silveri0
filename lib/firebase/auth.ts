import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
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
  // Redirect-based flow — far more reliable than popups in privacy-strict
  // browsers (Brave, Safari, mobile). The browser navigates to Google,
  // and on return the result is consumed by `consumeGoogleRedirectResult()`
  // (called from AuthContext on mount).
  await signInWithRedirect(auth, googleProvider);
}

// Call this once on app mount. If the user is returning from a Google
// redirect, this completes the sign-in and creates the server session
// cookie. Returns the signed-in user, or null if no redirect was pending.
export async function consumeGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    const idToken = await result.user.getIdToken();
    await createSessionCookie(idToken);
    return result.user;
  } catch (err) {
    console.error('[consumeGoogleRedirectResult] Failed:', err);
    return null;
  }
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
