/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.ctfassets.net' },
      { protocol: 'https', hostname: 'images.ctfassets.net' }
    ]
  }
};
module.exports = nextConfig;
