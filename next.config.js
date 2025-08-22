/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'development'
  },
  experimental: {
    optimizePackageImports: ['lucide-react']
  }
}

module.exports = nextConfig