// Firebase configuration - Update these with your Firebase project credentials
// Go to https://firebase.google.com/docs/web/setup to get your config

'use client';

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

let db: Database | null = null;

const isConfigured = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
  );
};

const initializeFirebase = (): Database => {
  if (db) {
    return db;
  }

  if (!isConfigured()) {
    throw new Error(
      'Firebase not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables in .env.local'
    );
  }

  try {
    const existingApps = getApps();
    const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
    db = getDatabase(app);
    return db;
  } catch (error) {
    throw new Error(`Firebase initialization failed: ${error}`);
  }
};

let firebaseError: Error | null = null;

try {
  if (isConfigured() && typeof window !== 'undefined') {
    initializeFirebase();
  }
} catch (error) {
  firebaseError = error as Error;
}

export const database: Database = new Proxy({} as Database, {
  get(target, prop) {
    try {
      const firebaseDb = initializeFirebase();
      const value = Reflect.get(firebaseDb, prop);
      return typeof value === 'function' ? value.bind(firebaseDb) : value;
    } catch (error) {
      // Return a function that throws the error when called
      if (firebaseError) {
        return function() {
          throw firebaseError;
        };
      }
      throw error;
    }
  },
}) as Database;

export { isConfigured };
