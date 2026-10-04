import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/sales',
        destination: '/sales/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
