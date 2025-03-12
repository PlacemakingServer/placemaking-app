'use client';
import "@/styles/globals.css";
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
   useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('✅ Service Worker registrado!', reg))
          .catch(err => console.error('❌ Erro ao registrar o Service Worker:', err));
      }
    }, []);
  return <Component {...pageProps} />;
}

export default MyApp;

