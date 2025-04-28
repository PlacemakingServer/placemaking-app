import { useEffect, useState } from "react";
import { Research } from "@/lib/types/indexeddb";
import {
  createResearch as createRemoteResearch,
  updateResearch as updateRemoteResearch,
  deleteResearch as deleteRemoteResearch,
  getResearches as getAllRemoteResearches,
} from "@/repositories/server/researchApi";
import {
  createResearch as createLocalResearch,
  getResearch as getLocalResearch,
  getAllResearchs as getAllLocalResearchs,
  updateResearch as updateLocalResearch,
  deleteResearch as deleteLocalResearch,
} from "@/repositories/indexeddb/researchRepository";
import { getUnsyncedItems, saveUnsyncedItem } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export function useResearches(especifico: boolean = false, id?: string) {
  const [researches, setResearches] = useState<Research[]>([]);
  const [researchData, setResearchData] = useState<Research | null>(null);
  const [unSyncedResearchs, setUnSyncedResearchs] = useState<Research[]>([]);
  const [loadingResearches, setLoadingResearches] = useState<boolean>(true);
  const [loadingUnsynced, setLoadingUnsynced] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUnsyncedResearches();
  }, []);

  useEffect(() => {
    if (especifico) {
      if (id) {
        fetchResearchById(id);
      } else {
        setResearchData(null);
        setLoadingResearches(false);
      }
    } else {
      fetchResearches();
    }
  }, [especifico, id]);

  const fetchUnsyncedResearches = async () => {
    try {
      const unsynced = await getUnsyncedItems();
      const researchesPending = unsynced
        .filter((item) => item.store === "researches")
        .map((item) => item.payload as Research);
      setUnSyncedResearchs(researchesPending);
    } catch (error) {
      console.error("[App] Erro ao carregar pesquisas pendentes:", error);
    } finally {
      setLoadingUnsynced(false);
    }
  };

  const fetchResearches = async () => {
    setLoadingResearches(true);
    try {
      const remoteResearches = await getAllRemoteResearches();
      setResearches(remoteResearches);
      await Promise.allSettled(
        remoteResearches.map((research) => createLocalResearch(research))
      );
    } catch (err) {
      console.warn("[App] Falha ao buscar pesquisas do servidor. Usando IndexedDB local.", err);
      try {
        const localResearches = await getAllLocalResearchs();
        setResearches(localResearches);
      } catch (errLocal) {
        console.error("[App] Falha ao carregar pesquisas locais:", errLocal);
        setError("Erro ao carregar pesquisas locais");
      }
    } finally {
      setLoadingResearches(false);
    }
  };

  const fetchResearchById = async (researchId: string) => {
    setLoadingResearches(true);
    try {
      const local = await getLocalResearch(researchId);
      if (local) {
        setResearchData(local);
      } else {
        throw new Error("Pesquisa não encontrada localmente");
      }
    } catch (err) {
      console.error("[App] Erro ao buscar pesquisa por ID:", err);
      setError("Pesquisa não encontrada localmente");
      setResearchData(null);
    } finally {
      setLoadingResearches(false);
    }
  };

  const addResearch = async (research: Research): Promise<Research> => {
    const newResearchId = uuidv4();
    const localResearch: Research = { ...research, id: newResearchId };

    setResearches((prev) => [...prev, localResearch]);

    try {
      const created = await createRemoteResearch(research);
      await createLocalResearch(created);
      return created;
    } catch (error) {
      console.error("[App] Erro ao criar pesquisa remotamente:", error);
      setError("Falha ao salvar no servidor. Salvo localmente para sincronizar depois.");
      await saveUnsyncedItem("researches", localResearch);
      setUnSyncedResearchs((prev) => [...prev, localResearch]);
      return localResearch;
    }
  };

  const updateResearch = async (id: string, updatedData: Research) => {
    await updateLocalResearch(id, updatedData);
  
    setResearches((prev) =>
      prev
        .map((r) => (r.id === id ? { ...r, ...updatedData } : r))
        .filter((r) => r.status === true)
    );
  
    try {
      await updateRemoteResearch({ ...updatedData, id });
    } catch (error) {
      console.error("[App] Erro ao atualizar pesquisa:", error);
      setError("Falha ao sincronizar atualização.");
      await saveUnsyncedItem("researches", { ...updatedData, id });
      setUnSyncedResearchs((prev) => [...prev, { ...updatedData, id }]);
    }
  };
  

  const removeResearch = async (id: string) => {
    try {
      await deleteLocalResearch(id);
      setResearches((prev) => prev.filter((r) => r.id !== id));

      try {
        await deleteRemoteResearch(id);
      } catch (error) {
        console.error("[App] Erro ao deletar pesquisa remotamente:", error);
        setError("Falha ao sincronizar remoção.");
        await saveUnsyncedItem("researches", { id, delete: true } as any);
        setUnSyncedResearchs((prev) => [...prev, { id, delete: true } as any]);
      }
    } catch {
      setError("Erro ao deletar pesquisa local");
    }
  };

  return {
    researches,
    researchData,
    unSyncedResearchs,
    loading: loadingResearches || loadingUnsynced,
    loadingResearches,
    loadingUnsynced,
    error,
    addResearch,
    updateResearch,
  };
}
