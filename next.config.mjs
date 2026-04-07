/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path((?!google$|google/callback$).*)",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/:path`,
      },
      {
        source: "/api/:path((?!auth/).*)",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/:path`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image-url.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yourcdn.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  allowedDevOrigins: [
    "nonextensional-donita-drinkably.ngrok-free.dev",
  ],

  reactCompiler: true,
};

export default nextConfig;