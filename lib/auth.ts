// Cookie-based auth shared by middleware (Edge) and route handlers.
// Uses Web Crypto (HMAC-SHA256) so it runs in the Edge runtime.

export const SITE_COOKIE = "wc_site";
export const ADMIN_COOKIE = "wc_admin";

const enc = new TextEncoder();

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not set");
  return s;
}

async function hmac(value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Buffer.from(new Uint8Array(sig)).toString("base64url");
}

// Token format: <scope>.<sig>, where sig = HMAC(scope).
export async function makeToken(scope: "site" | "admin"): Promise<string> {
  return `${scope}.${await hmac(scope)}`;
}

export async function verifyToken(
  token: string | undefined,
  scope: "site" | "admin"
): Promise<boolean> {
  if (!token) return false;
  const [tokenScope, sig] = token.split(".");
  if (tokenScope !== scope || !sig) return false;
  const expected = await hmac(scope);
  return timingSafeEqual(sig, expected);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function checkSitePassword(input: string): boolean {
  const expected = process.env.SITE_PASSWORD || "";
  return expected.length > 0 && constantTimeStr(input, expected);
}

export function checkAdminPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  return expected.length > 0 && constantTimeStr(input, expected);
}

function constantTimeStr(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < max; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}
