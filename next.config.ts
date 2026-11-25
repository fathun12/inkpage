import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async redirects() {
    return [
      // Old Vercel address goes to the main domain. /api is left alone so cron and webhooks keep working.
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "inkpage-delta.vercel.app" }],
        destination: "https://mfniam.com/:path",
        permanent: true,
      },
      // The main domain opens the profile page directly.
      {
        source: "/",
        has: [{ type: "host", value: "mfniam.com" }],
        destination: "/zdtzer0",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
