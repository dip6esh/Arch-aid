import type { NextConfig } from "next";

const YEAR = 60 * 60 * 24 * 365;
const config: NextConfig = {
  reactStrictMode: true,
  images: {
    // WebP only: AVIF encoding is several times slower on the first request of every image, which shows up as blank / late images.
    formats: ["image/webp"],
    // Optimised copies are kept for 30 days instead of the 60-second default, so they are not re-generated again and again.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // The source photos are at most 1200px wide, so never ask the optimiser for anything bigger (it would only upscale and slow things down).
    deviceSizes: [480, 640, 828, 1080, 1200],
  },
  async headers() {
    return [
      // Hero frames never change: cache them for a year so repeat visits do not re-download or even re-check them.
      { source: "/frames/:path*", headers: [{ key: "Cache-Control", value: `public, max-age=${YEAR}, immutable` }] },
      // Other photos: cache for a week and refresh quietly in the background. (If you replace a photo, give it a new file name.)
      { source: "/images/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }] },
    ];
  },
};
export default config;
