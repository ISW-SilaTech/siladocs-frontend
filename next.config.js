/**@type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  basePath: "",
  async redirects() {
    return [
      { source: "/core/trazabilidad", destination: "/core/blockchain", permanent: true },
      { source: "/core/auditoria", destination: "/core/blockchain", permanent: true },
    ];
  },
};

module.exports = nextConfig;