// Shim for cloudflare:workers when deploying or building on Vercel / standard Node.js
export const env: Record<string, any> = (typeof process !== 'undefined' ? process.env : {}) || {};
export default { env };
