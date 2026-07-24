import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.zareoon.ir" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "zareoon.ir" },
      { protocol: "https", hostname: "dl.zareoon.ir" },
      { protocol: "http", hostname: "dl.zareoon.ir" },
      { protocol: "https", hostname: "2193182645.cloudydl.com" },
    ],
    formats: ["image/webp", "image/avif"],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/dl-media/:path*",
        destination: "http://dl.zareoon.ir/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/farmer/:path*",
        destination: "/dashboard/supplier/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    optimizePackageImports: ["@heroicons/react", "react-leaflet"],
  },
  allowedDevOrigins: ["10.16.239.78"],
  generateEtags: false,
  poweredByHeader: false,
  compress: true,
  // Custom webpack is only used when building with --webpack.
  // Turbopack is the default bundler in Next.js 16.
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      };
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

export default withNextIntl(nextConfig);
