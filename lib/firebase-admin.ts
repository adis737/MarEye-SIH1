import * as admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

export function getFirebaseAdminApp(): admin.app.App {
  if (adminApp) return adminApp;

  if (admin.apps.length) {
    adminApp = admin.apps[0]!;
    return adminApp;
  }

  // Prefer a single JSON blob for service account
  const svcAccountJson = (() => {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (raw && raw.trim().length > 0) return raw;
    if (b64 && b64.trim().length > 0) {
      try { return Buffer.from(b64, "base64").toString("utf8"); } catch {}
    }
    return null;
  })();

  if (svcAccountJson) {
    try {
      const parsed = JSON.parse(svcAccountJson);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(parsed as admin.ServiceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
      return adminApp;
    } catch (e) {
      const hint = "Invalid FIREBASE_SERVICE_ACCOUNT JSON. If using base64, ensure it decodes to the exact downloaded JSON.";
      if (e instanceof Error) e.message = `${e.message} (${hint})`;
      throw e;
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const resolvedKey = (() => {
    const base64 = process.env.FIREBASE_PRIVATE_KEY_BASE64;
    if (base64 && base64.trim().length > 0) {
      try {
        return Buffer.from(base64, "base64").toString("utf8");
      } catch {}
    }
    return process.env.FIREBASE_PRIVATE_KEY || "";
  })();
  const privateKey = resolvedKey
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin credentials in environment variables");
  }

  try {
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (e) {
    const hint = "Invalid FIREBASE_PRIVATE_KEY format. Ensure newlines are escaped as \\n or use FIREBASE_PRIVATE_KEY_BASE64.";
    if (e instanceof Error) e.message = `${e.message} (${hint})`;
    throw e;
  }
  return adminApp;
}

export const adminAuth = () => getFirebaseAdminApp().auth();
export const adminDb = () => getFirebaseAdminApp().firestore();
export const adminStorage = () => getFirebaseAdminApp().storage();





