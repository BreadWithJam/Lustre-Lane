import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Content Security Policy — allows Supabase, Firebase, Google Fonts, and self-hosted assets.
// Uses 'unsafe-inline' for styles (required by Tailwind CSS inline styles) and
// 'unsafe-eval' only in development (React DevTools requirement).
const cspHeader = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Supabase storage + Firebase storage for gallery images
  "img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in https://firebasestorage.googleapis.com",
  // Supabase realtime + Firebase (Firestore, Auth, Storage) + Resend
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.firebaseio.com wss://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://api.resend.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  isDev ? "" : "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
];

const nextConfig: NextConfig = {
  // firebase-admin uses gRPC native bindings — must not be bundled by webpack
  serverExternalPackages: [
    'firebase-admin',
    'firebase-admin/app',
    'firebase-admin/auth',
    'firebase-admin/firestore',
    'firebase-admin/storage',
    '@google-cloud/firestore',
    '@grpc/grpc-js',
    '@grpc/proto-loader',
  ],

  // Compress responses for better performance
  compress: true,

  // Power header reveals implementation details — remove it
  poweredByHeader: false,

  images: {
    // Restrict to known trusted image hosts rather than wildcard
    remotePatterns: [
      // Supabase storage
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      // Firebase storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      // Local development
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
    // Modern formats for better compression
    formats: ["image/avif", "image/webp"],
    // Reasonable device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Long-lived cache for immutable static assets
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // No caching for API routes
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  // Redirect bare /admin to login when not authenticated
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
