import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'cloudflare:workers': path.resolve(__dirname, 'lib/cloudflare-mock.ts'),
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      'cloudflare:workers': './lib/cloudflare-mock.ts',
    },
  },
};

export default nextConfig;

