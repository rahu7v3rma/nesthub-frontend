/** @type {import('next').NextConfig} */
const API_URL = 'http://127.0.0.1:8000';

const nextConfig = {
  experimental: {},
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        async rewrites() {
          return [
            {
              source: '/api/media/:path*',
              destination: `${API_URL}/media/:path*`,
            },
            {
              source: '/api/:path*',
              destination: `${API_URL}/:path*`,
            },
          ];
        },
      }
    : {}),
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'realtor.test.nh.caas.ai',
        pathname: '/**',
      },
      ...(process.env.NODE_ENV === 'development'
        ? [
            {
              protocol: 'http',
              hostname: '127.0.0.1',
              port: '8000',
              pathname: '/media/**',
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
