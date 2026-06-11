'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig, isFirebaseConfigValid } from './config';

/**
 * Initializes Firebase services if a valid configuration is present.
 * Returns null for services if the configuration is missing to prevent runtime crashes.
 */
export function initializeFirebase() {
  if (!isFirebaseConfigValid()) {
    console.warn('Firebase configuration is missing or invalid. Services will be null.');
    return { app: null, db: null, auth: null };
  }

  try {
    let app: FirebaseApp;
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }

    const db = getFirestore(app);
    const auth = getAuth(app);

    return { app, db, auth };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { app: null, db: null, auth: null };
  }
}

export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
