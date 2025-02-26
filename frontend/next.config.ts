/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.clerk.com","res.cloudinary.com"], // Cho phép tải ảnh từ Clerk
  },
  experimental: {
    serverActions: true, // Nếu dùng Next.js 15 với server actions
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
