// next.config.mjs
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const baseConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  devIndicators: false
};

const nextConfig = withPWA({
  dest: 'public',
  disable: true,               
  register: false,  
  buildExcludes: [/\/sw\.js$/],       
  skipWaiting: true
})(baseConfig);

export default nextConfig;
