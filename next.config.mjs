/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'poszabayeh.com' },
      { protocol: 'https', hostname: 'zabayeh.b-cdn.net' },
    ],
    // Mock mode serves local placeholder images, so skip the optimizer there.
    unoptimized: process.env.MOCK_API === '1',
  },
};
export default nextConfig;
