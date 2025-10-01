// lib/firebaseAdmin.js
import "server-only";
import admin from "firebase-admin";

// Parse the PRIVATE KEY regardless of how it's stored on Vercel
function normalizePrivateKey(raw) {
  if (!raw) return raw;
  // If it already contains real newlines, keep as-is
  if (raw.includes("\n")) return raw;
  // Convert \n sequences to real newlines
  return raw.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "[firebaseAdmin] Missing FIREBASE_* env vars (PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY)"
    );
  } else {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
}

export function verifyIdToken(idToken) {
  if (!admin.apps.length) {
    throw new Error("Firebase Admin not initialized");
  }
  return admin.auth().verifyIdToken(idToken);
}
