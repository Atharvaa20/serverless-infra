import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lumina-assets-2026.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lumina-assets-2026.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};


export default nextConfig;
