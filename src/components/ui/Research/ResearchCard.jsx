import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { VARIANTS } from "@/config/colors";
import { motion } from "framer-motion";

export default function ResearchCard({ research }) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl shadow-md bg-white p-4 flex flex-col justify-between border hover:shadow-xl"
    >
      <div className="space-y-2 text-sm">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{research.title}</h3>
        <p className="text-gray-600 truncate">Descrição: {research.description || "—"}</p>
        <p className="text-gray-600 truncate">Local: {research.location_title || "—"}</p>
        <p className="text-gray-600 truncate">Início: {research.release_date || "—"}</p>
      </div>

      <div className="flex items-center justify-between gap-2 mt-4">
        {research._syncStatus && (
          <span
            className={`flex-shrink-0 truncate max-w-[100px] px-2 py-1 text-xs font-semibold rounded ${VARIANTS[research._syncStatus] || VARIANTS.verde}`}
          >
            {research._syncStatus}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="transparent_cinza"
            className="p-2"
            title="Ver Detalhes"
            onClick={() => router.push(`/researches/${research.id}`)}
          >
            <span className="material-symbols-outlined text-base">visibility</span>
          </Button>
          <Button
            variant="transparent_cinza"
            className="p-2"
            title="Ver Respostas"
            onClick={() => router.push(`/researches/${research.id}/answers`)}
          >
            <span className="material-symbols-outlined text-base">question_answer</span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
