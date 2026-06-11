import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;

function getAdminApp(): App | null {
  if (adminApp) return adminApp;
  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey || privateKey.includes('YOUR_PRIVATE_KEY')) {
    console.warn('Firebase Admin SDK: Missing or placeholder credentials. Server-side Firebase features will not work until you add real credentials to .env.local');
    return null;
  }

  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    return adminApp;
  } catch (error) {
    console.warn('Firebase Admin SDK initialization failed:', error);
    return null;
  }
}

const app = getAdminApp();

export const adminDb: Firestore | null = app ? getFirestore(app) : null;
export const adminAuth: Auth | null = app ? getAuth(app) : null;

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns the decoded token (uid, email, etc.) or null if invalid / missing.
 */
export async function verifyIdToken(authHeader: string | null): Promise<import('firebase-admin/auth').DecodedIdToken | null> {
  if (!adminAuth) return null;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}
