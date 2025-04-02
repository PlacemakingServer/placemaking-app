// /services/registerServiceWorker.js
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/workers/app/sw.js', { scope: '/workers/app/' })
      .then(reg => console.log('✅ Service Worker registrado no escopo /app/', reg))
      .catch(err => console.error('❌ Erro ao registrar SW /app/:', err));
  
    navigator.serviceWorker.register('/workers/other/service_worker.js', { scope: '/workers/other/' })
      .then(reg => console.log('✅ Service Worker registrado no escopo /other/', reg))
      .catch(err => console.error('❌ Erro ao registrar SW /other/:', err));
  }
  
  }
  