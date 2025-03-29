import { initCachedDB } from "@/lib/db";


export async function getCachedData(storeName, { paginated = false, page = 1, perPage = 20 } = {}) {
  const db = await initCachedDB();
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const allItems = await store.getAll();

  if (!paginated) return allItems;

  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedItems = allItems.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    total: allItems.length,
    page,
    perPage,
    totalPages: Math.ceil(allItems.length / perPage),
  };
}

export async function syncCachedData(storeName) {
  const config = {
    users: {
      endpoint: "/api/users",
      method: "GET",
      extract: (res) => res.users || [],
    },
    researchs: {
      endpoint: "/api/research",
      method: "GET",
      extract: (res) => res.researchs || [],
    },
  };

  const settings = config[storeName];
  if (!settings) throw new Error(`Sem configuração de sync para a store: ${storeName}`);

  try {
    const response = await fetch(settings.endpoint, { method: settings.method });
    if (!response.ok) throw new Error("Erro ao sincronizar dados de " + storeName);

    const data = await response.json();
    const items = settings.extract(data);

    const db = await initCachedDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);

    const existing = await store.getAllKeys();
    for (const key of existing) {
      await store.delete(key);
    }

    for (const item of items) {
      await store.put(item);
    }

    await tx.done;
    return { success: true, updated: items.length };
  } catch (err) {
    console.error(`[syncCachedData:${storeName}]`, err);
    throw err;
  }
}


export async function updateCachedItemById(storeName, id, updatedData) {
    const db = await initCachedDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
  
    const existingItem = await store.get(id);
    if (!existingItem) {
      throw new Error(`Item com id ${id} não encontrado na store ${storeName}`);
    }
  
    const updatedItem = { ...existingItem, ...updatedData };
    await store.put(updatedItem);
  
    await tx.done;
    return updatedItem;
  }
  
