/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Optionally, you can also set domains: ['*'] if you want, but remotePatterns is more flexible
  },
};

module.exports = nextConfig; 