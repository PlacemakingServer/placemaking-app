import { openDB } from "idb";

export async function initAuthDB() {
    return openDB("UserCredentialsDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("user-data")) {
          db.createObjectStore("user-data", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("user-creds")) {
          db.createObjectStore("user-creds", { keyPath: "id" });
        }
      },
    });
  }
  

export async function initResearchsDB() {
    return openDB("ResearchsDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("researches")) {
          db.createObjectStore("researches", { keyPath: "id" });
        }
      },
    });
}


export async function initCachedDB() {
  return openDB("CachedDB", 1, {
    upgrade(db) {
      const stores = ["users", "researches", "surveys", "itemTobeCreated"];
      for (const storeName of stores) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: "id" });
        }
      }
    },
  });
}


  