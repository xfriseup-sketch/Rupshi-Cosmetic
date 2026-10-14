/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Seeded demo products use picsum.photos URLs. That host does not support
    // the Accept: image/avif header Next/Image sends (it answers 405), so we
    // skip optimization for it and let <Image> pass the URL through as-is.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Allow http too — some seed data / admin-entered URLs may be plain http
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
