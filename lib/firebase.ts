import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  // This is the URL you get from the "Realtime Database" section in Firebase Console
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL 
};

// Initialize Firebase
let app;

if (!getApps().length) {
  if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
  } else {
      console.warn("Firebase config missing. Using dummy config.");
      app = initializeApp({
          apiKey: "dummy",
          authDomain: "dummy.firebaseapp.com",
          projectId: "dummy",
          databaseURL: "https://dummy.firebaseio.com",
      });
  }
} else {
  app = getApp();
}

// Initialize Realtime Database (We need this one, not Firestore!)
export const db = getDatabase(app);

export default app;
