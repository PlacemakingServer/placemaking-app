import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useLoading } from "@/context/LoadingContext";
import { useMessage } from "@/context/MessageContext";
import {
  getCachedData,
  syncLocalToServer,
  syncServerToCache,
} from "@/services/cache";

export default function ResearchView() {
  const [researches, setResearches] = useState([]);
  const [selectedResearch, setSelectedResearch] = useState(null);
  const { isLoading, setIsLoading } = useLoading();
  const { showMessage } = useMessage();
  const router = useRouter();
  const { id } = router.query;
  const [imageUrl, setImageUrl] = useState("");

  const loadCachedResearches = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCachedData("researches", { paginated: false });
      setResearches(result);

      if (id && Array.isArray(result)) {
        const found = result.find((r) => r.id === id);
        setSelectedResearch(found);
      }
    } catch (err) {
      console.error("Erro ao carregar pesquisas do cache:", err);
      showMessage("Erro ao carregar pesquisas.", "vermelho_claro", 5000);
    } finally {
      setIsLoading(false);
    }
  }, [id, setIsLoading, showMessage]);

  useEffect(() => {
    if (id) {
      loadCachedResearches();
    }
  }, [id, loadCachedResearches]);

  useEffect(() => {
    const idx = Math.floor(Math.random() * 5);
    setImageUrl(`/img/cards/img-${idx}.jpg`);
  }, []);

  return (
    <motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="max-w-90 mx-auto p-6 md:p-8 box-border"
>
  {selectedResearch ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col gap-4 p-6 md:p-8 bg-white rounded-lg shadow-md box-border"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-t-lg h-32 overflow-hidden box-border"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30 rounded-t-lg" />
        <div className="absolute inset-0 flex items-center px-4 z-10">
          <h2 className="text-white text-3xl font-semibold truncate drop-shadow-md">
            {selectedResearch.title}
          </h2>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <strong>Descrição:</strong> {selectedResearch.description}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <strong>Local:</strong> {selectedResearch.location_title}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <strong>Início:</strong> {selectedResearch.release_date}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <strong>Fim:</strong> {selectedResearch.end_date}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
      >
        <strong>Criada por:</strong> {selectedResearch.created_by.name}
      </motion.p>
    </motion.div>
  ) : (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="text-gray-500"
    >
      Nenhuma pesquisa encontrada com este ID.
    </motion.p>
  )}
</motion.section>
  );
}

ResearchView.pageName = "Visualizar Pesquisa";
ResearchView.layout = "private";
