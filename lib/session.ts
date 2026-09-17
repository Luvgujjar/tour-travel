import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless signed session token: base64url(payload).base64url(hmac).
 * Kept dependency-free so both proxy.ts and server code can import it.
 */
export const SESSION_COOKIE = "he_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ chars)");
    return "dev-only-insecure-session-secret-change-me";
  }
  return s;
}

const sign = (data: string) => createHmac("sha256", secret()).update(data).digest("base64url");

export function createToken(username: string) {
  const payload = Buffer.from(JSON.stringify({ u: username, exp: Date.now() + SESSION_TTL_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): { u: string } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { u: string; exp: number };
    return data.exp > Date.now() ? { u: data.u } : null;
  } catch {
    return null;
  }
}

/** Constant-time string comparison for credentials. */
export function safeEqual(a: string, b: string) {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}
