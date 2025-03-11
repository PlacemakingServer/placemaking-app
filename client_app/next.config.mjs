// next.config.mjs
import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
};

export default withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true, 
  runtimeCaching: [
    {
      // Aplica para todas as requisições HTTP/HTTPS
      urlPattern: /^https?.*/,
      handler: 'StaleWhileRevalidate', // Estratégia que retorna o cache imediatamente e atualiza em segundo plano
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 dias
        },
      },
    },
  ],
})(nextConfig);
