// src/utils/checkAndSyncIfEmpty.js

import { getAllItems } from "@/repositories/indexeddb/indexedDBService"; 

export async function checkAndSyncIfEmpty() {
  try {
    const users = await getAllItems("users");
    if (
      (users.length === 0) &&
      navigator.serviceWorker.controller
    ) {
      navigator.serviceWorker.controller.postMessage("TRIGGER_PULL");
    } else {
      console.log("[App] IndexedDB já possui dados.");
    }
  } catch (error) {
    console.error("[App] Erro ao checar IndexedDB:", error);
  }
}
