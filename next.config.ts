import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - devIndicators can be set to false at runtime to hide the static indicator
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/dashboard",
        destination: "/vault",
        permanent: true,
      },
      {
        source: "/modules",
        destination: "/groups",
        permanent: true,
      },
      {
        source: "/modules/:path*",
        destination: "/groups/:path*",
        permanent: true,
      },
      {
        source: "/group",
        destination: "/groups",
        permanent: true,
      },
      {
        source: "/group/:path*",
        destination: "/groups/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
