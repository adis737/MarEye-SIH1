/** @type {import('next').NextConfig} */
const nextConfig = {
  // Simplified config for faster compilation
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Webpack optimizations (simplified)
  webpack: (config, { dev }) => {
    // fixes wallet connect dependency issue
    config.externals.push("pino-pretty", "lokijs", "encoding");
    
    // Faster development builds
    if (dev) {
      config.watchOptions = {
        poll: false, // Disable polling for faster builds
        aggregateTimeout: 200,
      };
    }
    
    // Essential aliases only
    config.resolve.alias = {
      ...config.resolve.alias,
      'crypto': 'crypto-browserify',
      'stream': 'stream-browserify',
    };
    
    // Add fallbacks for missing modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'tslib': require.resolve('tslib'),
      'use-sidecar': require.resolve('use-sidecar'),
    };
    
    return config;
  },
};

export default nextConfig;
