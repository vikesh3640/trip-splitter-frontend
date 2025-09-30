// lib/firebaseClient.js
"use client";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, getIdToken } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export async function firebaseSignInWithGoogle() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const idToken = await getIdToken(cred.user, /* forceRefresh */ true);
  return { idToken, user: cred.user };
}

export async function firebaseSignOut() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  await signOut(auth);
}
