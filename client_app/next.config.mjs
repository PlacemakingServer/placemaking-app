// next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // (Opcional) se estiver tendo erro do ESLint, ignore no build:
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        // Removido "networkFallback" para evitar incompatibilidades.
        // Se quiser fallback offline, será preciso configurá-lo de outra forma.
      },
    },
  ],
})(nextConfig);
