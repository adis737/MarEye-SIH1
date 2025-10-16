/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    workerThreads: false,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@mongodb-js/zstd', 'kerberos', 'mongodb-client-encryption');
    }
    return config;
  },
  // Enable static optimization for better performance
  output: 'standalone',
  // Ensure proper asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // Enable trailing slash for better routing
  trailingSlash: false,
}

export default nextConfig
