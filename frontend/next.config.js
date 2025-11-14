/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Removed rewrites since we're using direct API calls via NEXT_PUBLIC_API_URL
  // The frontend connects directly to the backend using the environment variable
};

module.exports = nextConfig;

