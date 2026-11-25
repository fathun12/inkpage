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