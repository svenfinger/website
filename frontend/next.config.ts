import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname, // explicitly anchors Turbopack to the frontend/ directory
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
