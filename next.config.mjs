/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // WebP only. AVIF compresses a little better but encodes ~5x slower, and
    // each format is a separate transformation — on Vercel that doubles the
    // optimisation count billed against the plan for little visible gain.
    formats: ["image/webp"],
    // 1600 replaces 1920: the widest photo column on the site is 760px, which
    // needs 1520px at 2x. 1920 was always overshooting.
    deviceSizes: [640, 750, 828, 1080, 1200, 1600, 2048],
    // Default is 60 seconds, which expired every optimised image a minute after
    // it was built and re-ran the transform on the next visitor. The URL already
    // encodes src/width/quality, so a long TTL is safe.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
