/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com', // Twitter profile images
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net', // Facebook/Instagram images
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com', // LinkedIn images
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Google/YouTube images
      },
      {
        protocol: 'https',
        hostname: 'p16-sign-sg.tiktokcdn.com', // TikTok images
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Enable WASM for FFmpeg
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Optimize for production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    return config
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // For video uploads
    },
  },

  // Output configuration
  output: 'standalone',

  // Enable compression
  compress: true,

  // Disable x-powered-by header
  poweredByHeader: false,
}

module.exports = nextConfig

