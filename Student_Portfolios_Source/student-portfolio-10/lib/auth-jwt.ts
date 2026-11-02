/**
 * Zero-dependency JSON Web Token (JWT) implementation using native Web Crypto API (HMAC-SHA256).
 * Compatible with Node.js 18+, Cloudflare Workers, Edge Runtimes, and modern browsers.
 */

const DEFAULT_SECRET = "student10-techxera-jwt-secret-key-2026-ultra-secure-sign";

function base64UrlEncode(str: string | Uint8Array): string {
  let base64: string;
  if (typeof str === "string") {
    const bytes = new TextEncoder().encode(str);
    base64 = btoa(String.fromCharCode(...bytes));
  } else {
    base64 = btoa(String.fromCharCode(...str));
  }
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export interface JWTPayload {
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Signs a payload with HMAC-SHA256 and returns a JWT token string.
 */
export async function signJWT(
  payload: JWTPayload,
  secret: string = DEFAULT_SECRET,
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days default
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(dataToSign)
  );

  const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));
  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a JWT token. Returns the decoded payload if valid and unexpired, or null if invalid.
 */
export async function verifyJWT(
  token: string,
  secret: string = DEFAULT_SECRET
): Promise<JWTPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToSign = `${encodedHeader}.${encodedPayload}`;

    // Recompute and verify signature
    const key = await getCryptoKey(secret);
    const signatureBytes = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0)
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(dataToSign)
    );

    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      // Token has expired
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Extracts the JWT token from request cookies or Authorization header.
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }

  // 2. Check Cookie header: admin_token=<token>
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith("admin_token=")) {
        return cookie.slice("admin_token=".length).trim();
      }
    }
  }

  return null;
}

