// pages/index.js
import { useEffect, useState } from 'react';
import { openDB } from 'idb';

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIosInstallTip, setShowIosInstallTip] = useState(false);

  const [name, setName] = useState('');
  const [serverNames, setServerNames] = useState([]); 
  const [localNames, setLocalNames] = useState([]);   
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // --- Detecta se é iOS (iPhone/iPad/iPod) ---
  const isIos = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verifica status de conexão
    setIsOnline(navigator.onLine);

    // Se for iOS, não existe 'beforeinstallprompt', mas podemos exibir instruções
    if (isIos()) {
      // Exibe um botão para instruir o usuário
      setShowIosInstallTip(true);
    } else {
      // Caso não seja iOS, tentamos usar o evento nativo (Android/Chrome/Edge, etc.)
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallButton(true);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // Cleanup do event listener
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  useEffect(() => {
    // Listeners de online/offline
    const handleOnline = () => {
      setIsOnline(true);
      syncData(); 
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Carrega dados iniciais
    fetchNamesFromServer();
    loadLocalNames();

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Botão de instalação (funciona em navegadores que suportam beforeinstallprompt) ---
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // --- Mostrar instruções para iOS ---
  const handleIosInstallClick = () => {
    alert(
      'Para instalar no iOS:\n\n1) Abra o menu de compartilhamento no Safari (ícone de compartilhar).\n2) Escolha "Adicionar à Tela de Início".'
    );
  };

  // --- IndexedDB: inicializar DB ---
  const initDB = async () => {
    return openDB('offlineDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('names')) {
          db.createObjectStore('names', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  };

  // --- Adiciona nome local ---
  const addLocalName = async (newName) => {
    const db = await initDB();
    const tx = db.transaction('names', 'readwrite');
    const store = tx.objectStore('names');
    await store.add({ name: newName });
    await tx.done;
    setLocalNames((prev) => [...prev, newName]);
  };

  // --- Carrega nomes do IndexedDB ---
  const loadLocalNames = async () => {
    const db = await initDB();
    const tx = db.transaction('names', 'readonly');
    const store = tx.objectStore('names');
    const allNames = await store.getAll();
    await tx.done;
    setLocalNames(allNames.map((item) => item.name));
  };

  // --- Sincroniza IndexedDB -> Supabase ---
  const syncData = async () => {
    const db = await initDB();
    const tx = db.transaction('names', 'readonly');
    const store = tx.objectStore('names');
    const allItems = await store.getAll();
    await tx.done;

    if (allItems.length > 0) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: allItems.map((item) => item.name) }),
        });
        if (response.ok) {
          // Limpa o IndexedDB após sincronizar
          const txDelete = db.transaction('names', 'readwrite');
          const storeDelete = txDelete.objectStore('names');
          await storeDelete.clear();
          await txDelete.done;
          setLocalNames([]);
          fetchNamesFromServer();
        }
      } catch (error) {
        console.error('Erro ao sincronizar dados:', error);
      }
    }
  };

  // --- Busca nomes no Supabase ---
  const fetchNamesFromServer = async () => {
    try {
      const response = await fetch('/api/sync');
      if (response.ok) {
        const data = await response.json();
        setServerNames(data);
      }
    } catch (error) {
      console.error('Erro ao carregar nomes do Supabase:', error);
    }
  };

  // --- Envio do formulário ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isOnline) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ names: [name] }),
        });
        if (response.ok) {
          fetchNamesFromServer();
        } else {
          // Se falhar online, salva local
          addLocalName(name);
        }
      } catch (error) {
        console.error('Erro ao salvar online, salvando offline...', error);
        addLocalName(name);
      }
    } else {
      // Offline: salva no IndexedDB
      addLocalName(name);
    }

    setName('');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center py-6 px-4">
      <h1 className="text-2xl font-semibold mb-4">PWA com Supabase</h1>

      {/* BOTÃO DE INSTALAÇÃO - se suportado (Android / Chrome / Edge etc.) */}
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          className="border border-gray-600 py-1 px-3 mb-4"
        >
          Instalar Aplicativo
        </button>
      )}

      {/* BOTÃO DE INSTRUÇÕES iOS - caso seja iPhone/iPad */}
      {showIosInstallTip && (
        <button
          onClick={handleIosInstallClick}
          className="border border-gray-600 py-1 px-3 mb-4"
        >
          Instalar no iOS
        </button>
      )}

      <p className="mb-4">
        Status da Conexão:{' '}
        <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um nome"
          required
          className="px-2 py-1 text-black rounded-sm"
        />
        <button
          type="submit"
          className="bg-gray-700 py-1 px-3 rounded-sm"
        >
          Adicionar
        </button>
      </form>

      <section className="w-full max-w-md flex flex-col gap-6">
        {/* IndexedDB */}
        <div className="border border-gray-600 p-3">
          <h2 className="text-lg font-semibold mb-2">Offline (IndexedDB)</h2>
          {localNames.length ? (
            <ul className="list-disc list-inside">
              {localNames.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Nenhum nome salvo offline.</p>
          )}
        </div>

        {/* Supabase */}
        <div className="border border-gray-600 p-3">
          <h2 className="text-lg font-semibold mb-2">Online (Supabase)</h2>
          {serverNames.length ? (
            <ul className="list-disc list-inside">
              {serverNames.map((item, idx) => (
                <li key={idx}>{item.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">Nenhum nome salvo no Supabase.</p>
          )}
        </div>
      </section>
    </main>
  );
}
