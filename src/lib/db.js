import { openDB } from "idb";

export async function initAuthDB() {
    return openDB("UserCredentialsDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("auth")) {
          db.createObjectStore("auth", { keyPath: "id" });
        }
      },
    });
  }
  

export async function initResearchsDB() {
    return openDB("ResearchsDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("researchs")) {
          db.createObjectStore("researchs", { keyPath: "id" });
        }
      },
    });
  }
  