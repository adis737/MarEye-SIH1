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
  // Disable static optimization for API routes that use dynamic features
  output: 'standalone',
}

export default nextConfig
