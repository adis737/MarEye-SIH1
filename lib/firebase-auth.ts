import { NextRequest } from "next/server";
import { adminAuth } from "./firebase-admin";

export type AuthenticatedUser = {
  uid: string;
  name?: string | null;
  email?: string | null;
};

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      name: decoded.name ?? null,
      email: decoded.email ?? null,
    };
  } catch {
    return null;
  }
}







