import { useRouter } from "next/router";
import Button from "@/components/ui/Button_og";
import { VARIANTS } from "@/config/colors";
import { motion } from "framer-motion";

export default function ResearchCard({ research }) {
  const router = useRouter();
  const imageIndex = Math.floor(Math.random() * 5); // 0 a 4
  const imageUrl = `/img/cards/img-${imageIndex}.jpg`;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl shadow-md bg-white overflow-hidden flex flex-col justify-between border hover:shadow-xl"
    >
      {/* Header com imagem de fundo */}
      <div
        className="relative h-14 bg-cover bg-center"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="absolute inset-0 bg-black/30 rounded-t-2xl" />
        <div className="absolute inset-0 flex items-center px-4">
          <h3 className="text-white text-md font-semibold truncate drop-shadow-md z-10">
            {research.title}
          </h3>
        </div>
      </div>

      {/* Conteúdo textual abaixo da imagem */}
      <div className="p-4 space-y-2 text-sm">
        <p className="text-gray-600 truncate">
          Descrição: {research.description || "—"}
        </p>
        <p className="text-gray-600 truncate">
          Local: {research.location_title || "—"}
        </p>
        <p className="text-gray-600 truncate">
          Início: {research.release_date || "—"}
        </p>
      </div>

      {/* Rodapé com botões */}
      <div className="flex items-center justify-between gap-2 px-4 pb-4">
        {research._syncStatus && (
          <span
            className={`flex-shrink-0 truncate max-w-[100px] px-2 py-1 text-xs font-semibold rounded ${
              VARIANTS[research._syncStatus] || VARIANTS.verde
            }`}
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
            <span className="material-symbols-outlined text-base">
              visibility
            </span>
          </Button>
          <Button
            variant="transparent_cinza"
            className="p-2"
            title="Ver Respostas"
            onClick={() => router.push(`/researches/${research.id}/answers`)}
          >
            <span className="material-symbols-outlined text-base">
              question_answer
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
