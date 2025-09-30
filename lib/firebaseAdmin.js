// lib/firebaseAdmin.js
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let adminApp = null;
let initTried = false;

function initAdmin() {
  if (initTried) return adminApp; 
  initTried = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  try {
    if (!projectId || !clientEmail || !privateKey) {
      console.warn("[firebaseAdmin] Missing service-account env; admin disabled");
      return null;
    }
    // Vercel stores multiline keys with escaped \n
    privateKey = privateKey.replace(/\\n/g, "\n");

    adminApp =
      getApps()[0] ||
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });

    return adminApp;
  } catch (err) {
    console.error("[firebaseAdmin] init failed:", err?.message || err);
    adminApp = null;
    return null;
  }
}

export async function verifyIdToken(idToken) {
  const app = initAdmin();
  if (!app) throw new Error("FIREBASE_ADMIN_NOT_CONFIGURED");
  const auth = getAuth(app);
  return auth.verifyIdToken(idToken);
}
