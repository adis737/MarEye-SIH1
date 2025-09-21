import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

let app: FirebaseApp | undefined;

export function getFirebaseClientApp(): FirebaseApp {
  if (!app) {
    const existing = getApps();
    if (existing.length) {
      app = existing[0]!;
    } else {
      const config = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
      };
      app = initializeApp(config);
    }
  }
  return app!;
}

export const clientAuth = () => getAuth(getFirebaseClientApp());
export const clientDb = () => getFirestore(getFirebaseClientApp());
export const clientStorage = () => getStorage(getFirebaseClientApp());







