// Robust local storage using IndexedDB for high-capacity Base64 image caching
// with automatic fallback and localStorage quota management.

import type { ImageGenerationRecord } from '../types';

const DB_NAME = 'lumina_image_db';
const STORE_NAME = 'generations';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('IndexedDB open error, falling back to safe local storage');
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

// Save image record to IndexedDB
export async function saveRecordToStorage(record: ImageGenerationRecord): Promise<void> {
  // 1. Try IndexedDB first (no 5MB quota constraint, handles large base64 images easily)
  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
      await new Promise((resolve) => {
        tx.oncomplete = resolve;
        tx.onerror = resolve;
      });
      return;
    } catch (e) {
      console.warn('IndexedDB write warning:', e);
    }
  }

  // 2. Safe LocalStorage Fallback with auto-pruning to prevent QuotaExceededError
  try {
    // Clear out legacy overloaded key if present
    localStorage.removeItem('gridscape_history');

    // Keep only the 2 most recent items in fallback localStorage
    const existingStr = localStorage.getItem('lumina_history_recent');
    const existing: ImageGenerationRecord[] = existingStr ? JSON.parse(existingStr) : [];
    const updated = [record, ...existing.filter((item) => item.id !== record.id)].slice(0, 2);

    try {
      localStorage.setItem('lumina_history_recent', JSON.stringify(updated));
    } catch (quotaError) {
      // If quota still exceeded, store only the latest single item
      try {
        localStorage.removeItem('lumina_history_recent');
        localStorage.setItem('lumina_history_recent', JSON.stringify([record]));
      } catch {
        // Clear all non-essential keys
        localStorage.removeItem('lumina_history_recent');
      }
    }
  } catch (e) {
    console.warn('Safe localStorage write fallback notice:', e);
  }
}

// Fetch all saved image records from IndexedDB / LocalStorage
export async function fetchRecordsFromStorage(): Promise<ImageGenerationRecord[]> {
  // Clean up any oversized legacy key
  try {
    if (localStorage.getItem('gridscape_history')) {
      localStorage.removeItem('gridscape_history');
    }
  } catch {
    // ignore
  }

  // 1. Try IndexedDB
  const db = await openDB();
  if (db) {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      const items: ImageGenerationRecord[] = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });

      if (items.length > 0) {
        // Sort descending by createdAt
        return items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      }
    } catch (e) {
      console.warn('IndexedDB read warning:', e);
    }
  }

  // 2. Safe LocalStorage Fallback
  try {
    const cached = localStorage.getItem('lumina_history_recent');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('LocalStorage read warning:', e);
  }

  return [];
}
