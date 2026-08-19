/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF first: at a given quality it holds detail far better than WebP for
    // photographic content, which is the whole site. Falls back to WebP.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
