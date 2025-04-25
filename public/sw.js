importScripts("./idb.js");
const BATCH_SIZE = 50;
const CACHE = "pwa-v1";
const STATIC = ["/", "/login"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        Promise.all(
          STATIC.map((path) =>
            cache
              .add(new Request(path, { mode: "no-cors" }))
              .catch((err) => console.warn("[SW] Falha ao cachear:", path, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match("/")))
    );
    return;
  }

  event.respondWith(caches.match(req).then((res) => res || fetch(req)));
});

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

async function pushPending() {
  for (const store of ENTITIES) {
    try {
      console.log(`[SW] Enviando pendências para ${store}`);
      const all = await getAllItems(store);
      const pendings = all.filter(
        (i) => i._syncStatus === "pending" || i._syncStatus === "error"
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
          const synced = await res.json();
          for (const item of batch) {
            await updateItem(store, item.id, { _syncStatus: "synced" });
          }
        } catch (err) {
          console.error(`[SW] Erro no pushPending (${store})`, err);
          for (const item of batch) {
            await updateItem(store, item.id, { _syncStatus: "error" });
          }
        }
      }
    } catch (err) {
      console.error(`[SW] Erro geral no pushPending para ${store}`, err);
    }
  }
}

async function pullUpdates() {
  for (const store of ENTITIES) {
    try {
      const res = await fetch(`/api/sync?entity=${store}`);
      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
      const data = await res.json();
      const items = data[store];
      console.log(`[SW] Atualizandom data ${store}`, data);
      console.log(`[SW] Atualizando items ${store}`, items);


      if (!items || items.length === 0) return;
      for (const item of items) {
        await updateItem(store, item.id, {
          ...item,
          _syncStatus: "synced"
        }, true);
      }
    } catch (err) {
      console.error(`[SW] pullUpdates falhou em ${store}`, err);
    }
  }
}



self.addEventListener("periodicsync", (event) => {
  console.info("[SW] periodicSync", event.tag);
  if (event.tag === "pull-updates") {
    event.waitUntil(pullUpdates());
  } else if (event.tag === "push-pending") {
    event.waitUntil(pushPending());
  } else {
    console.warn("[SW] Tag de periodicSync não reconhecida:", event.tag);
  }
});


self.addEventListener("sync", (event) => {
  console.info("[SW] sync", event.tag);
  if (event.tag === "push-pending") {
    event.waitUntil(pushPending());
  }
});


self.addEventListener("message", (event) => {
  if (event.data === "TRIGGER_PULL") {
    pullUpdates();
  }
  if (event.data === "TRIGGER_PUSH") {
    pushPending();
  }
});
