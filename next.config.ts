import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product imagery is served by Storekit from whichever CDN / object store
    // the merchant uploaded to. This allowlist covers Storekit plus the common
    // storage providers. If your product images live on a host that isn't
    // matched here, add its hostname below (e.g. "cdn.your-store.com") —
    // otherwise next/image will respond 400 for that source.
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**.storekit.app" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.imagekit.io" },
      { protocol: "https", hostname: "**.googleapis.com" },
      { protocol: "https", hostname: "**.digitaloceanspaces.com" },
      { protocol: "https", hostname: "**.backblazeb2.com" },
    ],
  },
};

export default nextConfig;
