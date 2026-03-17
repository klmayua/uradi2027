/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Disable eslint during build (optional - remove if you want strict checking)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable typescript errors during build (optional - remove for strict checking)
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
