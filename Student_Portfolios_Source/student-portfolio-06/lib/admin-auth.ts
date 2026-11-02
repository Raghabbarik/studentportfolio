import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET || "antigravity-scroll-chapters-jwt-secret-2026";
export const ADMIN_USER = (process.env.ADMIN_USER || "student6techxera@gmail.com").toLowerCase();
export const ADMIN_PASS = process.env.ADMIN_PASS || "Student6@2026";

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function base64urlDecode(str: string): string {
  return Buffer.from(str, "base64url").toString("utf-8");
}

export function signJWT(payload: object, expiresInSec = 7 * 86400): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = base64url(JSON.stringify({
    ...payload,
    iat: now,
    exp: now + expiresInSec,
  }));
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

export function verifyJWT(token: string | null | undefined): any {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/(?:^|;\s*)admin_jwt=([^;]+)/);
  if (match) return decodeURIComponent(match[1]);
  return null;
}

