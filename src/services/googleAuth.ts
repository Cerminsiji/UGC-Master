import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { GoogleUserProfile } from '../types';

// Standard Google Profile Scopes (Always approved without app verification)
export const STANDARD_SCOPES = [
  'profile',
  'email',
];

// Initialize Firebase App safely (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Standard Provider for login (never blocked by Google verification screen)
const standardProvider = new GoogleAuthProvider();
standardProvider.setCustomParameters({
  prompt: 'select_account',
});

// Drive-specific Provider for optional Google Drive export
const driveProvider = new GoogleAuthProvider();
driveProvider.addScope('https://www.googleapis.com/auth/drive.file');
driveProvider.setCustomParameters({
  prompt: 'consent',
});

// In-memory token cache (NEVER in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Check if Firebase configuration has valid credentials
 */
export function hasGoogleConfig(): boolean {
  return Boolean(firebaseConfig?.apiKey && firebaseConfig?.projectId);
}

/**
 * Initialize Firebase Auth listener. Call this on app mount.
 */
export function initAuth(
  onUserChange?: (user: GoogleUserProfile | null) => void,
  onTokenChange?: (token: string | null) => void
) {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const profile: GoogleUserProfile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };

      if (onUserChange) onUserChange(profile);

      // If we have in-memory access token, broadcast it
      if (cachedAccessToken && onTokenChange) {
        onTokenChange(cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onUserChange) onUserChange(null);
      if (onTokenChange) onTokenChange(null);
    }
  });
}

/**
 * Interactive Sign In with Google popup.
 * By default requests standard profile & email so it is NEVER blocked by Google's verification process.
 * If requestDriveScope is explicitly true, attempts to grant Drive file access.
 */
export async function googleSignIn(requestDriveScope = false): Promise<{
  profile: GoogleUserProfile;
  accessToken: string;
} | null> {
  try {
    isSigningIn = true;
    const targetProvider = requestDriveScope ? driveProvider : standardProvider;
    const result = await signInWithPopup(auth, targetProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    const token = credential?.accessToken || '';
    if (token) {
      cachedAccessToken = token;
    }

    const profile: GoogleUserProfile = {
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
    };

    return {
      profile,
      accessToken: cachedAccessToken || token,
    };
  } catch (error: any) {
    // Graceful handling for user cancellation (closing popup or clicking outside)
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      console.info('Login popup Google ditutup oleh pengguna.');
      return null;
    }

    // Popup window blocked by the browser
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Jendela pop-up Google login diblokir oleh browser. Izinkan pop-up untuk melanjutkan.');
    }

    // Network disconnection
    if (error?.code === 'auth/network-request-failed') {
      throw new Error('Koneksi internet bermasalah saat menghubungi server Google. Silakan coba lagi.');
    }

    // Blocked by Google unverified app (sensitive scope)
    const errString = String(error?.message || '');
    if (errString.includes('verification') || errString.includes('unverified') || error?.code === 'auth/admin-restricted-operation') {
      throw new Error('Akses Google Drive dibatasi karena aplikasi dalam mode pengujian. Gunakan tombol "Download Video" untuk simpan langsung ke perangkat.');
    }

    console.warn('Google Sign-In warning:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

/**
 * Get current in-memory OAuth Access Token for Google APIs (Drive, etc.)
 */
export async function getAccessToken(): Promise<string | null> {
  return cachedAccessToken;
}

/**
 * Sign out current user
 */
export async function googleSignOut(): Promise<void> {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (err) {
    console.error('Sign out error:', err);
    throw err;
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
