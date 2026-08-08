import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lwfubyziqibxigycvqqy.supabase.co",
        pathname: "/storage/v1/object/public/experience-images/**",
      },
    ],
  },
};

export default nextConfig;
