import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID fallback
const firestoreDbId =
  (firebaseConfig as any).firestoreDatabaseId ||
  'ai-studio-chronosuniversal-dad05d97-958b-46a1-b38f-20f488f155b6';

export const db = getFirestore(app, firestoreDbId);

// Initialize Authentication
export const auth = getAuth(app);

// In-memory access token caches
let cachedGoogleAccessToken: string | null = null;
let cachedGithubAccessToken: string | null = null;
let isSigningIn = false;

// Google Auth Provider requesting Workspace permissions directly on the Google OAuth consent page
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/tasks');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// Permitting personal, enterprise, and educational accounts (@company.com, @university.edu)
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Fallback Basic Google Provider (Profile & Email only) if unverified restrictions occur
export const basicGoogleProvider = new GoogleAuthProvider();
basicGoogleProvider.setCustomParameters({
  prompt: 'select_account',
});

// GitHub Auth Provider
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');
githubProvider.addScope('repo');

// Test connection silently
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline check:', error.message);
    }
  }
}
testConnection();

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    cachedGoogleAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signInWithBasicGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, basicGoogleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    cachedGoogleAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Basic Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signInWithGithub = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    cachedGithubAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.warn('GitHub Sign-In Firebase provider error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedGoogleAccessToken;
};

export const getGithubAccessToken = (): string | null => {
  return cachedGithubAccessToken;
};

export const setGithubAccessToken = (token: string) => {
  cachedGithubAccessToken = token;
};

export const signOutUser = async () => {
  cachedGoogleAccessToken = null;
  cachedGithubAccessToken = null;
  return await firebaseSignOut(auth);
};
