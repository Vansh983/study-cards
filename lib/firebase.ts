// firebase.ts

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    connectAuthEmulator,
    browserLocalPersistence,
    setPersistence,
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Auth Persistence with Proper Error Handling
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log('Firebase Auth persistence set to browserLocalPersistence');
    })
    .catch((error) => {
        console.error('Error setting Firebase Auth persistence:', error);
    });

// Initialize Firestore
export const db = getFirestore(app);