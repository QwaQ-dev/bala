/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["birlik-bala-website"],
    unoptimized: true,
  },
  output: 'standalone',
}

module.exports = nextConfig
