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
      // On the main domain the owner's name is not shown in the address: /zdtzer0/projects becomes /projects.
      {
        source: "/zdtzer0",
        has: [{ type: "host", value: "mfniam.com" }],
        destination: "/",
        permanent: false,
      },
      {
        source: "/zdtzer0/:section(projects|writing|biblia|shop|about|order|terms|privacy|refund)/:rest*",
        has: [{ type: "host", value: "mfniam.com" }],
        destination: "/:section/:rest*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // The page behind the clean address. The address bar keeps showing mfniam.com.
        {
          source: "/",
          has: [{ type: "host", value: "mfniam.com" }],
          destination: "/zdtzer0",
        },
        {
          source: "/:section(projects|writing|biblia|shop|about|order|terms|privacy|refund)/:rest*",
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
