import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './client';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();

  // Set session cookie via API route
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  return result.user;
}

export async function signOutUser() {
  await fetch('/api/auth/session', { method: 'DELETE' });
  await signOut(auth);
}
