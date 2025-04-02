import { motion } from "framer-motion";

export default function ResearchCardCompact({ research }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-sm space-y-1 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold uppercase">
          {research.title?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{research.title}</h4>
          <p className="text-xs text-gray-500 truncate">ID: {research.id}</p>
          <p className="text-xs text-gray-500 truncate">Local: {research.location_title || "—"}</p>
          <p className="text-xs text-gray-500 truncate">Início: {research.release_date || "—"}</p>
          {/* Adicione mais campos aqui se quiser */}
        </div>
      </div>
    </motion.div>
  );
}
