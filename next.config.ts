import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Tree-shake the named-export entry points of these packages so unused
  // icons / chart primitives / motion components are dropped from the bundle.
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'framer-motion',
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      '@vercel/analytics',
      '@vercel/speed-insights',
      'zustand',
      'react-hook-form',
      'zod',
    ],
  },
  // Production-only compiler tweaks. Strips dev-only console.* and assert()
  // calls (keeps console.error/warn) so logs don't bloat the prod bundle.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  // Don't ship browser source maps to production — they triple the asset bytes
  // and aren't needed at runtime (Sentry / similar tools fetch them separately).
  productionBrowserSourceMaps: false,
  // Gzip/Brotli on Vercel handles this, but flipping it on explicitly also
  // covers self-hosted runs.
  compress: true,
  poweredByHeader: false,
  // React strict-mode catches doubled effects early — enabling here is free in
  // production builds and surfaces hidden re-renders in dev.
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async rewrites() {
    // Proxy Firebase Auth helper endpoints to <projectId>.firebaseapp.com so
    // they appear same-origin with the site. This is required for Google
    // sign-in to complete in privacy-strict browsers (Brave, Safari, Chrome
    // with strict 3rd-party-cookie blocking) — the auth-result iframe must
    // be first-party to read its own IndexedDB.
    const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!project) return [];
    return [
      { source: '/__/auth/:path*',     destination: `https://${project}.firebaseapp.com/__/auth/:path*` },
      { source: '/__/firebase/:path*', destination: `https://${project}.firebaseapp.com/__/firebase/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.vercel-scripts.com *.vercel.com *.googleapis.com *.google.com *.gstatic.com *.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "img-src 'self' data: blob: https: firebasestorage.googleapis.com *.firebasestorage.app lh3.googleusercontent.com images.unsplash.com",
              "font-src 'self' fonts.gstatic.com",
              "connect-src 'self' *.googleapis.com *.google.com *.firebaseio.com *.firebasestorage.app *.firebaseapp.com *.googletagmanager.com *.google-analytics.com *.analytics.google.com *.vercel.com *.vercel-insights.com wss://*.firebaseio.com api.postalpincode.in",
              "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
