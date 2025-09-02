/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image configuration
  images: {
    domains: ["birlik-bala-website", "localhost"],
    unoptimized: true,
  },
  
  // Performance optimizations
  compress: true,
  
  // Disable static optimization for dynamic routes
  trailingSlash: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
