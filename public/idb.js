importScripts('./vendor/idb.min.js');

const DB_NAME = 'placemaking-db';
const DB_VERSION = 2;
const storeSchema = [
  'auth',
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
  'field_options'
];


const dbPromise = idb.openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    for (const name of storeSchema) {
      if (!db.objectStoreNames.contains(name)) {
        db.createObjectStore(name, { keyPath: 'id' });
      }
    }
  }
});

self.getAllItems = async (store) => (await dbPromise).getAll(store);

self.updateItem = async (store, id, changes, upsert = false) => {
  const db = await dbPromise;
  const tx = db.transaction(store, 'readwrite');
  if (upsert) {
    const existing = await tx.store.get(id);
    await tx.store.put({ ...existing, ...changes, id });
  } else {
    const existing = await tx.store.get(id);
    await tx.store.put({ ...existing, ...changes });
  }
  return tx.done;
};
