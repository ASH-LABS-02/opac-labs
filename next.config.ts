import type { NextConfig } from "next";
import { isProjectPlannerEnabled } from './lib/features';

const nextConfig: NextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  async redirects() {
    return [
      ...(!isProjectPlannerEnabled() ? [{ source: '/build-project', destination: '/request-project', permanent: false }] : []),
      { source: '/project', destination: '/our-works', permanent: true },
      { source: '/projects', destination: '/our-works', permanent: true },
      { source: '/projects/portfolio-websites', destination: '/our-works/portfolio-websites', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;

