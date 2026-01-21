import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    // Force these variables to be available at runtime
    LUMINA_ACCESS_KEY_ID: process.env.LUMINA_ACCESS_KEY_ID,
    LUMINA_SECRET_ACCESS_KEY: process.env.LUMINA_SECRET_ACCESS_KEY,
    LUMINA_REGION: process.env.LUMINA_REGION,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
  },
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
