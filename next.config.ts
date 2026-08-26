import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Dev server blocks cross-origin requests (JS chunks, HMR) by default.
  // Wildcarded so it survives ngrok handing out a new random subdomain.
  allowedDevOrigins: ["*.ngrok-free.dev", "*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io"],
};

export default nextConfig;
