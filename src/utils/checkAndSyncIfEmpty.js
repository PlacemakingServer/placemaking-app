import { initPlacemakingDB } from "@/lib/db";

export async function checkAndSyncIfEmpty() {
  const db = await initPlacemakingDB();
  const users = await db.getAll("users");

  if (
    (users.length === 0) &&
    navigator.serviceWorker.controller
  ) {
    console.log("[App] Tabelas vazias. Disparando pullUpdates via postMessage");
    navigator.serviceWorker.controller.postMessage("TRIGGER_PULL");
  } else {
    console.log("[App] IndexedDB já possui dados.");
  }
}
