import type { NextConfig } from "next";

const sections = "projects|writing|biblia|shop|about|order|terms|privacy|refund";

// Supabase address (from the same env variable the app already uses), so Vercel may resize its public images.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/media/**" }]
      : [],
    // Only quality 90 is allowed. Files have random names and never change, so keep copies for a year.
    qualities: [90],
    minimumCacheTTL: 31536000,
  },
  experimental: {
    // Gallery uploads: up to 6 images of 2 MB each travel in one request.
    serverActions: { bodySizeLimit: "14mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // On the main domain the owner's name is not shown: /zdtzer0/projects becomes /projects.
  async redirects() {
    return [
      {
        source: "/zdtzer0",
        has: [{ type: "host", value: "mfniam.com" }],
        destination: "/",
        permanent: false,
      },
      {
        source: `/zdtzer0/:section(${sections})/:rest*`,
        has: [{ type: "host", value: "mfniam.com" }],
        destination: "/:section/:rest*",
        permanent: false,
      },
    ];
  },
  // The page behind the clean address. The address bar keeps showing mfniam.com.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "mfniam.com" }],
          destination: "/zdtzer0",
        },
        {
          source: `/:section(${sections})/:rest*`,
          has: [{ type: "host", value: "mfniam.com" }],
          destination: "/zdtzer0/:section/:rest*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;