import { useEffect, useState } from 'react';
import { openDB } from 'idb';

export default function Home() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [name, setName] = useState('');
  const [serverNames, setServerNames] = useState([]); // Nomes salvos no servidor
  const [localNames, setLocalNames] = useState([]); // Nomes temporários no IndexedDB
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallButton(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', () => setIsOnline(false));

      fetchNamesFromJson(); // Sempre carrega nomes do servidor
      loadLocalNames(); // Carrega nomes do IndexedDB apenas se offline

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', () => setIsOnline(false));
      };
    }
  }, []);

  const handleOnline = () => {
    setIsOnline(true);
    syncData(); // Sincroniza dados ao voltar online
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  // Inicializa IndexedDB
  const initDB = async () => {
    return openDB('offlineDB', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('names')) {
          db.createObjectStore('names', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  };

  // Salva nome no IndexedDB quando offline
  const addLocalName = async (name) => {
    const db = await initDB();
    const tx = db.transaction('names', 'readwrite');
    await tx.objectStore('names').add({ name });
    setLocalNames((prev) => [...prev, name]);
  };

  // Carrega nomes do IndexedDB
  const loadLocalNames = async () => {
    const db = await initDB();
    const tx = db.transaction('names', 'readonly');
    const store = tx.objectStore('names');
    const allNames = await store.getAll();
    setLocalNames(allNames.map((item) => item.name));
  };

  // Sincroniza IndexedDB com o servidor quando online
  const syncData = async () => {
    const db = await initDB();
    const tx = db.transaction('names', 'readonly');
    const store = tx.objectStore('names');
    const allNames = await store.getAll();

    if (allNames.length > 0) {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ names: allNames.map((item) => item.name) }),
      });

      if (response.ok) {
        const txDelete = db.transaction('names', 'readwrite');
        const storeDelete = txDelete.objectStore('names');
        await storeDelete.clear();
        setLocalNames([]);
        fetchNamesFromJson(); // Atualiza os nomes do servidor
      }
    }
  };

  // Salva nome diretamente no servidor quando online
  const addServerName = async (name) => {
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names: [name] }),
    });

    if (response.ok) {
      setServerNames((prev) => [...prev, name]);
    }
  };

  // Adiciona nome dependendo do estado online/offline
  const handleAddName = (e) => {
    e.preventDefault();
    if (name.trim()) {
      if (isOnline) {
        addServerName(name);
      } else {
        addLocalName(name);
      }
      setName('');
    }
  };

  // Carrega nomes do JSON (servidor)
  const fetchNamesFromJson = async () => {
    try {
      const response = await fetch('/names.json');
      if (response.ok) {
        const json = await response.json();
        setServerNames(json);
      }
    } catch (error) {
      console.error('Erro ao carregar os nomes do JSON:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold text-white mb-5">PWA com IndexedDB e JSON</h1>

      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          className="bg-gray-800 text-white px-4 py-2 rounded mb-5 border border-gray-600"
        >
          Instalar Aplicativo
        </button>
      )}

      <form onSubmit={handleAddName} className="mb-5 flex flex-col w-full max-w-sm gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite um nome"
          className="border border-gray-500 p-2 rounded bg-gray-900 text-white"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Salvar
        </button>
      </form>

      <p className="text-lg font-semibold">
        Status da Conexão:{' '}
        <span className={isOnline ? 'text-green-400' : 'text-red-400'}>
          {isOnline ? 'Online ✅' : 'Offline ❌'}
        </span>
      </p>

      <div className="mt-5 flex flex-col sm:flex-row gap-5 w-full max-w-3xl">
        {/* Box IndexedDB */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex-1 border border-gray-700">
          <h2 className="text-xl font-bold text-yellow-400">Salvo no IndexedDB</h2>
          {localNames.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-300">
              {localNames.map((n, index) => (
                <li key={index}>{n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum nome salvo offline.</p>
          )}
        </div>

        {/* Box Servidor */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md flex-1 border border-gray-700">
          <h2 className="text-xl font-bold text-blue-400">Salvos no Servidor</h2>
          {serverNames.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-300">
              {serverNames.map((n, index) => (
                <li key={index}>{n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum nome salvo no servidor.</p>
          )}
        </div>
      </div>
    </div>
  );
}
