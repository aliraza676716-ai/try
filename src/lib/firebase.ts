import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Firestore,
  onSnapshot
} from 'firebase/firestore';
import type { ImageGenerationRecord } from '../types';
import { saveRecordToStorage, fetchRecordsFromStorage } from './storage';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  // Read config from injected file
  const firebaseConfig = {
    apiKey: "AIzaSyA51lX9eur8UknqsXqUY37lBtDGB8OZoDY",
    authDomain: "gen-lang-client-0256121232.firebaseapp.com",
    projectId: "gen-lang-client-0256121232",
    storageBucket: "gen-lang-client-0256121232.firebasestorage.app",
    messagingSenderId: "1034368941908",
    appId: "1:1034368941908:web:3ddf7deea3a331da1b92c1"
  };

  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (err) {
  console.warn('Firebase initialization notice:', err);
}

export { app, auth, db };

// Google Sign In
export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) throw new Error('Firebase Auth not initialized');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Guest Sign In
export async function loginAsGuest(): Promise<User | null> {
  if (!auth) throw new Error('Firebase Auth not initialized');
  const result = await signInAnonymously(auth);
  return result.user;
}

// Sign Out
export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

// Save generation record to IndexedDB & Firestore safely
export async function saveGeneratedImage(record: ImageGenerationRecord, userId?: string) {
  // Always save to IndexedDB (safe from localStorage 5MB quota errors)
  await saveRecordToStorage(record);

  // Save to Firestore if available
  if (db && userId) {
    try {
      await addDoc(collection(db, 'user_generations'), {
        ...record,
        userId,
        serverTimestamp: Date.now()
      });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }
  }
}

// Fetch user image generation history safely
export async function fetchUserGenerations(userId?: string): Promise<ImageGenerationRecord[]> {
  const localItems = await fetchRecordsFromStorage();

  if (db && userId) {
    try {
      const q = query(
        collection(db, 'user_generations'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(30)
      );
      const snapshot = await getDocs(q);
      const cloudItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ImageGenerationRecord));
      if (cloudItems.length > 0) {
        return cloudItems;
      }
    } catch (err) {
      console.warn('Firestore fetch fallback to local:', err);
    }
  }

  return localItems;
}
