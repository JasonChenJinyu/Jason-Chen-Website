/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'github.com',
      'via.placeholder.com',
      'placehold.co',
      '47.106.67.151'
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '47.106.67.151',
        port: '8080',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
}

module.exports = nextConfig;
