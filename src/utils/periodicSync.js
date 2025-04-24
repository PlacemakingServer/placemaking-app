// utils/periodicSync.js
export async function initBackgroundSync() {
    if (!('serviceWorker' in navigator)) return;
  
    const reg = await navigator.serviceWorker.ready;
  
    if ('periodicSync' in reg) {
      const perm = await navigator.permissions.query({
        name: 'periodic-background-sync'
      });
  
      if (perm.state === 'granted') {
        const tags = await reg.periodicSync.getTags();
  
        if (!tags.includes('pull-updates')) {
          await reg.periodicSync.register('pull-updates', {
            minInterval: 24 * 60 * 60 * 1000 // 24h
          });
        }
  
        if (!tags.includes('push-pending')) {
          await reg.periodicSync.register('push-pending', {
            minInterval: 24 * 60 * 60 * 1000 // 24h
          });
        }
  
        console.log('[App] PeriodicSync registrado');
      }
    }
  

    if ('sync' in reg) {
      try {
        await reg.sync.register('push-pending');
        console.log('[App] SyncManager registrado');
      } catch (e) {
        console.warn('SyncManager indisponível', e);
      }
    }
  
    const trigger = () => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('TRIGGER_PULL');
      }
    };
  
    window.addEventListener('online', trigger);
    setInterval(trigger, 30 * 60 * 1000); // 30 min
  }
  