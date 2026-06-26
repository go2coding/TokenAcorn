import { createHmac } from "crypto";
import { cookies } from "next/headers";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const COOKIE_NAME = "admin_session";

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const secret = process.env.ADMIN_PASSWORD!;
  const hmac = createHmac("sha256", secret).update(timestamp).digest("hex");
  return `${timestamp}:${hmac}`;
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;
  const [timestamp, hmac] = token.split(":");
  if (!timestamp || !hmac) return false;

  const tokenTime = parseInt(timestamp, 10);
  if (Date.now() - tokenTime > TOKEN_EXPIRY_MS) return false;

  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const expectedHmac = createHmac("sha256", secret).update(timestamp).digest("hex");
  return hmac === expectedHmac;
}

export async function setAdminSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function verifyAdminRequest(): Promise<boolean> {
  const token = await getAdminSession();
  return token ? verifySessionToken(token) : false;
}
