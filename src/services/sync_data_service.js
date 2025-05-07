/*  Serviço central de sincronismo offline + download de mapas  */
import { initPlacemakingDB } from '@/lib/db';   // ← banco único

/* ---------- LISTA DE ENTIDADES NO BACKEND ---------- */
const DATA_STORES = [
  'users',
  'fields',
  'researches',
  'survey_time_ranges',
  'survey_regions',
  'survey_group',
  'survey_contributors',
  'survey_answers',
  'static_surveys',
  'form_surveys',
  'dynamic_surveys',
  'research_contributors',
  'input_types',
  'field_options',
];

/* ---------- HELPERS (usam o mesmo DB) ---------- */
export async function getAllItems(store) {
  return (await initPlacemakingDB()).getAll(store);
}

export async function updateItem(store, id, changes, upsert = false) {
  const db = await initPlacemakingDB();
  const tx = db.transaction(store, 'readwrite');
  const existing = await tx.store.get(id);
  await tx.store.put(
    upsert ? { ...existing, ...changes, id } : { ...existing, ...changes },
  );
  return tx.done;
}

/* ---------- PULL DE DADOS ---------- */
export async function pullUpdates() {
  for (const store of DATA_STORES) {
    try {
      const res = await fetch(`/api/sync?entity=${store}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} em ${store}`);
      const items = (await res.json())[store];
      if (!items?.length) continue;

      for (const item of items) {
        await updateItem(store, item.id, { ...item, _syncStatus: 'synced' }, true);
      }
    } catch (err) {
      console.error(`[sync] falhou em ${store}`, err);
    }
  }
}

/* ---------- DOWNLOAD DE MAPAS ---------- */
const TILE_URL = (z, x, y) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
const ZOOMS    = [14, 15];   // cobertura ≈ 2 km com dois níveis
const RADIUS_M = 2000;

function deg2rad(d){return d*Math.PI/180}
function rad2deg(r){return r*180/Math.PI}

function latLonToTile(lat, lon, z) {
  const n = 2 ** z;
  return {
    x: Math.floor(((lon + 180) / 360) * n),
    y: Math.floor(
      (1 - Math.log(Math.tan(deg2rad(lat)) + 1 / Math.cos(deg2rad(lat))) / Math.PI) /
        2 *
        n,
    ),
  };
}
function tilesForRadius(lat, lon, r, z) {
  const R = 6378137;
  const dLat = rad2deg(r / R);
  const dLon = rad2deg(r / (R * Math.cos(deg2rad(lat))));
  const { x: xMin, y: yMax } = latLonToTile(lat - dLat, lon - dLon, z);
  const { x: xMax, y: yMin } = latLonToTile(lat + dLat, lon + dLon, z);

  const tiles = [];
  for (let x = xMin; x <= xMax; x++)
    for (let y = yMin; y <= yMax; y++)
      tiles.push({ z, x, y });
  return tiles;
}

/* ---------- DOWNLOAD DE MAPAS (fix) ---------- */
export async function downloadResearchMap(lat, lon) {
    if (!lat || !lon) return;
  
    const db = await initPlacemakingDB();
  
    for (const z of ZOOMS) {
      for (const { x, y } of tilesForRadius(lat, lon, RADIUS_M, z)) {
        const id = `${z}/${x}/${y}`;
  
        // 1) já salvo?
        if (await db.get('map_tiles', id)) continue;
  
        try {
          // 2) baixa da rede
          const resp = await fetch(TILE_URL(z, x, y));
          if (!resp.ok) continue;
  
          // 3) grava — idb cria uma transação curta internamente
          await db.put('map_tiles', { id, blob: await resp.blob() });
        } catch {
          /* falha de rede → ignora */
        }
      }
    }
  }
  

/* ---------- FUNÇÕES DE ALTO NÍVEL ---------- */
export async function syncAllStores() {
  await pullUpdates();                        // mantém compatibilidade
}
export async function syncResearchData(research) {
  await pullUpdates();                        // dados
  await downloadResearchMap(research.lat, research.long); // mapas
}
