import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
};

const pwaOptions = {
  dest: 'public',
  // Define o fallback para navegações offline
  fallbacks: {
    document: '/home_offline',
  },
  runtimeCaching: [
    {
      // Cache para a home
      urlPattern: /^\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'home-page',
        expiration: { maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    {
      // Cache para a página offline
      urlPattern: /^\/home_offline$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-page',
        expiration: { maxEntries: 1, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Cache para componentes estáticos
      urlPattern: /\/static\/components\/.*\.js$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'components-cache',
        expiration: { maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      // Cache para demais requisições HTTP(S)
      urlPattern: /^https?.*/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'generic-cache',
      },
    },
  ],
};

export default withPWA(pwaOptions)(nextConfig);
