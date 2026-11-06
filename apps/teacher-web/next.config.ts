import type { NextConfig } from "next";

// Pure client-side app (Supabase JS in the browser), so a static export is enough.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
