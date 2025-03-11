import "@/styles/globals.css";

// Em _app.js
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service Worker registrado com sucesso.'))
        .catch((err) => console.error('Erro ao registrar o SW:', err));
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;

