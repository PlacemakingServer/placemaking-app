/*  Placemaking – Service Worker
 *  Requer:  idb.js (IndexedDB Promises) copiado para /public/idb.js
 */
importScripts("./idb.js");

/* ---------- CONFIG GERAL ---------- */
const CACHE        = "pwa-v1";
const STATIC       = ["/", "/login"];
const BATCH_SIZE   = 50;

/* ---------- CONFIG DO BANCO ---------- */
const DB_NAME      = "placemaking-db";
const DB_VERSION   = 2;                            // ← suba se criar novas stores
const TILE_STORE   = "map_tiles";

const ENTITIES = [
  "users",
  "researches",
  "research_contributors",
  "fields",
  "input_types",
  "field_options",
  "survey_answers",
  "static_surveys",
  "form_surveys",
  "dynamic_surveys",
  "survey_time_ranges",
  "survey_regions",
  "survey_group",
  "survey_contributors",
];

const dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // stores de dados
    for (const name of [...ENTITIES, TILE_STORE]) {
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, { keyPath: "id" });
      }
    }
  },
});

/* ---------- HELPERS INDEXEDDB ---------- */
async function getAllItems(store) {
  return (await dbPromise).getAll(store);
}

async function updateItem(store, id, changes, upsert = false) {
  const db = await dbPromise;
  const tx = db.transaction(store, "readwrite");
  const existing = await tx.store.get(id);

  if (upsert) {
    await tx.store.put({ ...existing, ...changes, id });
  } else {
    await tx.store.put({ ...existing, ...changes });
  }
  return tx.done;
}

/* ---------- MAP TILE HELPERS ---------- */
const TILE_REGEX = /^https:\/\/tile\.openstreetmap\.org\/(\d+)\/(\d+)\/(\d+)\.png$/;

async function getSavedTile(id) {
  return (await dbPromise).get(TILE_STORE, id);
}
async function saveTile(id, blob) {
  return (await dbPromise).put(TILE_STORE, { id, blob });
}

async function handleTileRequest(request) {
  const [, z, x, y] = request.url.match(TILE_REGEX);  // [full,z,x,y]
  const id = `${z}/${x}/${y}`;

  /* 1) tenta offline */
  const cached = await getSavedTile(id);
  if (cached?.blob) {
    return new Response(cached.blob, { headers: { "content-type": "image/png" } });
  }

  /* 2) rede – e salva p/ uso futuro */
  try {
    const netRes = await fetch(request);
    if (netRes.ok) {
      const clone = netRes.clone();
      saveTile(id, await clone.blob()).catch(() => {}); // não bloqueia resposta
    }
    return netRes;
  } catch {
    /* 3) offline e tile não salvo */
    return Response.error();
  }
}

/* ---------- INSTALAÇÃO & ATIVAÇÃO ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          STATIC.map((path) =>
            cache
              .add(new Request(path, { mode: "no-cors" }))
              .catch((err) => console.warn("[SW] Falha ao cachear:", path, err)),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/* ---------- FETCH ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  /* → tiles do OSM */
  if (TILE_REGEX.test(req.url)) {
    event.respondWith(handleTileRequest(req));
    return;
  }

  /* Navegação */
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match("/"))),
    );
    return;
  }

  /* Assets genéricos – CacheFirst */
  event.respondWith(caches.match(req).then((res) => res || fetch(req)));
});

/* ---------- SINCRONISMO OFFLINE ---------- */
async function pushPending() {
  for (const store of ENTITIES) {
    try {
      console.log(`[SW] Enviando pendências para ${store}`);
      const all = await getAllItems(store);
      const pendings = all.filter(
        (i) => i._syncStatus === "pending" || i._syncStatus === "error",
      );

      for (let i = 0; i < pendings.length; i += BATCH_SIZE) {
        const batch = pendings.slice(i, i + BATCH_SIZE);
        try {
          const res = await fetch(`/api/sync?entity=${store}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(batch),
          });
          if (!res.ok) throw new Error(`Erro ao sincronizar ${store}: ${res.status}`);

          for (const item of batch) {
            await updateItem(store, item.id, { _syncStatus: "synced" });
          }
        } catch (err) {
          console.error(`[SW] pushPending (${store})`, err);
          for (const item of batch) {
            await updateItem(store, item.id, { _syncStatus: "error" });
          }
        }
      }
    } catch (err) {
      console.error(`[SW] pushPending geral (${store})`, err);
    }
  }
}

async function pullUpdates() {
  for (const store of ENTITIES) {
    try {
      const res = await fetch(`/api/sync?entity=${store}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data  = await res.json();
      const items = data[store];
      console.log(`[SW] pull ${store}:`, items?.length ?? 0);

      if (!items?.length) continue;

      for (const item of items) {
        await updateItem(
          store,
          item.id,
          { ...item, _syncStatus: "synced" },
          true,
        );
      }
    } catch (err) {
      console.error(`[SW] pullUpdates (${store})`, err);
    }
  }
}

/* ---------- BACKGROUND / PERIODIC SYNC ---------- */
self.addEventListener("periodicsync", (event) => {
  console.info("[SW] periodicSync", event.tag);
  if (event.tag === "pull-updates") {
    event.waitUntil(pullUpdates());
  } else if (event.tag === "push-pending") {
    event.waitUntil(pushPending());
  } else {
    console.warn("[SW] Tag não reconhecida:", event.tag);
  }
});

self.addEventListener("sync", (event) => {
  console.info("[SW] sync", event.tag);
  if (event.tag === "push-pending") {
    event.waitUntil(pushPending());
  }
});

/* ---------- MENSAGENS MANUAIS ---------- */
self.addEventListener("message", (event) => {
  if (event.data === "TRIGGER_PULL") pullUpdates();
  if (event.data === "TRIGGER_PUSH") pushPending();
});
