export const ADMIN_COOKIE = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function encoder() {
  return new TextEncoder();
}

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(value) {
  const secret = process.env.ADMIN_PASSWORD || "";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder().encode(value));
  return toHex(signature);
}

export function sessionCookieOptions(maxAge = MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export async function passwordsMatch(input) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || typeof input !== "string" || input.length === 0) return false;
  const [left, right] = await Promise.all([sign(`pw:${input}`), sign(`pw:${expected}`)]);
  return safeEqual(left, right);
}

export async function createSessionToken() {
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `admin.${exp}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token) {
  if (!process.env.ADMIN_PASSWORD || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [role, exp, signature] = parts;
  const expiresAt = Number(exp);
  if (role !== "admin" || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await sign(`${role}.${exp}`);
  return safeEqual(expected, signature);
}
