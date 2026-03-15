import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || "").trim().replace(/^["']|["']$/g, ''),
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "").trim().replace(/^["']|["']$/g, ''),
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").trim().replace(/^["']|["']$/g, ''),
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "").trim().replace(/^["']|["']$/g, ''),
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim().replace(/^["']|["']$/g, ''),
  appId: (import.meta.env.VITE_FIREBASE_APP_ID || "").trim().replace(/^["']|["']$/g, '')
};

// Debug: Check which variables are missing (logs to browser console)
if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    console.warn("Missing Firebase variables:", missing.join(", "));
  } else {
    console.log("Firebase configuration detected.");
  }
}

// Only initialize if we have a non-empty API key to avoid "invalid-api-key" error on startup
const hasConfig = !!firebaseConfig.apiKey;
const app = hasConfig ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : ({
  onAuthStateChanged: () => () => {},
  onIdTokenChanged: () => () => {},
  onBeforeAuthStateChanged: () => () => {},
  signOut: async () => {},
  sendPasswordResetEmail: async () => { 
    console.warn("Firebase not configured. Password reset skipped.");
    throw new Error("Firebase is not configured. Please add your API keys in Settings.");
  },
} as any);
export const googleProvider = new GoogleAuthProvider();

export const isFirebaseConfigured = hasConfig;
