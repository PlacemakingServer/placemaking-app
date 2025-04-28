import { initCachedDB } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// ======================
// UTILS
// ======================

const getStore = async (storeName, mode = "readonly") => {
  const db = await initCachedDB();
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

const configMap = {
  users: {
    endpoint: "/api/users", // Usado para leitura e sincronização geral
    createEndpoint: "/api/auth/register", // Usado para criar usuário
    updateEndpoint: "/api/users/update", // Usado para atualizar usuário
    deleteEndpoint: "/api/users/delete", // Usado para deletar usuário
    extract: (res) => res.users || [],
    single: (res) => res.user || null,
  },
  researches: {
    endpoint: "/api/researches",
    createEndpoint: "/api/researches/create",
    updateEndpoint: "/api/researches/update",
    deleteEndpoint: "/api/researches/delete",
    extract: (res) => res.researches || [],
    single: (res) => res.research || null,
  },
  surveys: {
    endpoint: "/api/surveys",
    createEndpoint: "/api/surveys/create",
    updateEndpoint: "/api/surveys/update",
    deleteEndpoint: "/api/surveys/delete",
    extract: (res) => res.surveys || [],
    single: (res) => res.research || null,
  },
};

// ======================
// CACHE FUNCTIONS
// ======================

export async function getCachedData(
  storeName,
  {
    paginated = false,
    page = 1,
    perPage = 20,
    order = "desc",
    search = "",
    filterStatus = "",
    filterRole = "",
  } = {}
) {
  const mainStore = await getStore(storeName);
  const baseItems = await mainStore.getAll();

  let pendingItems = [];
  try {
    const pendingStore = await getStore("itemTobeCreated");
    const allPending = await pendingStore.getAll();
    pendingItems = allPending.filter((item) => item._originStore === storeName);
  } catch (err) {
    // Se a store pending não estiver disponível, ignora
  }

  let allItems = [...baseItems, ...pendingItems];

  // 🔍 Filtro por busca (nome ou email)
  if (search) {
    const lowerSearch = search.toLowerCase();
    allItems = allItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.email?.toLowerCase().includes(lowerSearch)
    );
  }

  if (filterStatus) {
    allItems = allItems.filter((item) => item.status === filterStatus);
  }

  if (filterRole) {
    allItems = allItems.filter((item) => item.role === filterRole);
  }

  allItems.sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
    const dateB = new Date(b.created_at || b.createdAt || 0).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });

  if (!paginated) return allItems;

  const total = allItems.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const items = allItems.slice(start, start + perPage);

  return {
    items,
    total,
    page,
    perPage,
    totalPages,
  };
}

export async function getCachedItemById(storeName, id) {
  const store = await getStore(storeName);
  return (await store.get(id)) || null;
}

export async function addCachedItem(storeName, item) {
  const store = await getStore(storeName, "readwrite");
  if (await store.get(item.id)) throw new Error(`Item ${item.id} já existe`);
  await store.put(item);
}

export async function updateCachedItemById(storeName, id, updates) {
  const store = await getStore(storeName, "readwrite");
  const item = await store.get(id);
  if (!item) throw new Error(`Item ${id} não encontrado`);
  const updated = { ...item, ...updates };
  await store.put(updated);
  return updated;
}

export async function deleteCachedItemById(storeName, id) {
  const store = await getStore(storeName, "readwrite");
  if (!(await store.get(id))) throw new Error(`Item ${id} não encontrado`);
  await store.delete(id);
}

// ======================
// SYNC MARKERS
// ======================

export const markItemForCreate = async (store, item) => {
  const mainStore = await getStore(store, "readonly");
  const mainItems = await mainStore.getAll();
  const duplicateInMain = mainItems.find((i) => i.email === item.email);

  let duplicateInPending = false;
  try {
    const pendingStore = await getStore("itemTobeCreated", "readonly");
    const pendingItems = await pendingStore.getAll();
    duplicateInPending = pendingItems.some(
      (i) => i._originStore === store && i.email === item.email
    );
  } catch (err) {
    // Se não conseguir verificar duplicidade, segue sem bloquear.
  }

  if (duplicateInMain || duplicateInPending) {
    throw new Error(`Registro com email ${item.email} já existe.`);
  }

  const tempId = `temp-${uuidv4()}`;
  const newItem = {
    ...item,
    id: tempId,
    _syncStatus: "pendingCreate",
    _originStore: store,
  };

  const pendingStoreWrite = await getStore("itemTobeCreated", "readwrite");
  await pendingStoreWrite.put(newItem);
  return newItem;
};

export const markItemForUpdate = (store, id, updates) =>
  updateCachedItemById(store, id, { ...updates, _syncStatus: "pendingUpdate" });

export async function markItemForDelete(store, id) {
  const item = await getCachedItemById(store, id);
  if (item) {
    await updateCachedItemById(store, id, {
      ...item,
      _syncStatus: "pendingDelete",
    });
  }
}

// ======================
// SANITIZE
// ======================

export const sanitizeData = (data, fields = ["_syncStatus"]) =>
  Object.fromEntries(
    Object.entries(data || {}).filter(([key]) => !fields.includes(key))
  );

export const sanitizeDataArray = (arr, fields) =>
  arr.map((item) => sanitizeData(item, fields));

// ======================
// SYNC FUNCTIONS
// ======================

export async function syncCachedData(store) {
  const config = configMap[store];
  if (!config) throw new Error(`Sem config para ${store}`);
  try {
    const res = await fetch(config.endpoint);
    if (!res.ok) throw new Error(`Erro ao sync ${store}`);
    const items = config.extract(await res.json());
    const storeRef = await getStore(store, "readwrite");
    await storeRef.clear();
    for (const item of items) {
      await storeRef.put({ ...item, _syncStatus: "synced" });
    }
    return { success: true, updated: items.length };
  } catch (err) {
    throw err;
  }
}

export async function syncCachedDataById(store, id) {
  const config = configMap[store];
  if (!config) throw new Error(`Sem config para ${store}`);
  try {
    const res = await fetch(`${config.endpoint}/${id}`);
    if (!res.ok) throw new Error(`Erro ao sync ${store}/${id}`);
    const item = config.single(await res.json());
    if (!item) throw new Error(`Item ${id} não encontrado`);
    const storeRef = await getStore(store, "readwrite");
    await storeRef.put({ ...item, _syncStatus: "synced" });
    return { success: true, updated: item };
  } catch (err) {
    throw err;
  }
}

export async function syncLocalToServer(store) {
  const config = configMap[store];
  if (!config) throw new Error(`Sem config para ${store}`);
  if (!navigator.onLine) return { success: false, message: "Offline" };

  const db = await initCachedDB();

  // Sincroniza pendingCreate
  const mainItems = await db.getAll(store);
  const pendingItems = await db.getAll("itemTobeCreated");
  const toBeCreated = pendingItems.filter(
    (item) => item._originStore === store
  );

  await Promise.all(
    toBeCreated.map(async (item) => {
      try {
        const payload = sanitizeData(item, [
          "_syncStatus",
          "_originStore",
          "id",
        ]);
        const endpointForCreation = config.createEndpoint || config.endpoint;
        const res = await fetch(endpointForCreation, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const resData = await res.json();
          const serverItem = config.single(resData);
          if (serverItem) {
            await db.put(store, { ...serverItem, _syncStatus: "synced" });
            await db.delete("itemTobeCreated", item.id);
          }
        }
      } catch (err) {
        // Erro na criação é logado internamente se necessário
      }
    })
  );

  // Sincroniza update e delete
  await Promise.all(
    mainItems.map(async (item) => {
      const status = item._syncStatus;
      if (!status?.startsWith("pending")) return;
      const action = status.replace("pending", "").toLowerCase();
      const endpointForAction =
        action === "delete" ? config.deleteEndpoint : config.updateEndpoint;
      const method = action === "delete" ? "DELETE" : "PUT";
      const body = JSON.stringify(sanitizeData(item));
      try {
        const res = await fetch(endpointForAction, {
          method,
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (res.ok) {
          if (action === "delete") {
            await db.delete(store, item.id);
          } else {
            let updatedItem = item;
            try {
              const resData = await res.json();
              const serverItem = config.single(resData);
              if (serverItem) updatedItem = serverItem;
            } catch (_) {}
            await db.put(store, { ...updatedItem, _syncStatus: "synced" });
          }
        }
      } catch (err) {
        // Erro na sincronização de update/delete
      }
    })
  );

  return { success: true };
}

export async function syncServerToCache(store, queryParams = {}) {
  const config = configMap[store];
  if (!config) throw new Error(`Sem config para ${store}`);

  try {
    const url = new URL(config.endpoint, window.location.origin);
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });

    const res = await fetch(url.toString());
    
    if (res.status === 404  ) {
      return { success: false, message: "Nenhum dado encontrado" };
    }

    if (!res.ok) throw new Error(`Erro ao sync servidor->cache de ${store}`);

    const serverItems = config.extract(await res.json());

    const storeRef = await getStore(store, "readwrite");
    const localItems = await storeRef.getAll();
    const localMap = new Map(localItems.map((item) => [item.id, item]));

    for (const serverItem of serverItems) {
      const local = localMap.get(serverItem.id);
      if (
        !local ||
        local._syncStatus === "synced" ||
        local._syncStatus === "pendingUpdate" ||
        local._syncStatus === "pendingCreate"
      ) {
        await storeRef.put({ ...serverItem, _syncStatus: "synced" });
      }
    }

    return { success: true, updated: serverItems.length };
  } catch (err) {
    throw err;
  }
}
