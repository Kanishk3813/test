import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  modularizeImports: {
    '@/components/module': {
      transform: '@/components/module/{{member}}',
    },
  },
};

export default nextConfig;
