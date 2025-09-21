/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/outputs/:path*',
        destination: '/api/static/outputs/:path*',
      },
    ];
  },
};

module.exports = nextConfig;