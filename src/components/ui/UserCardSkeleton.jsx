import { motion } from "framer-motion";

export default function UserCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between space-y-3 animate-pulse"
    >
      {/* Topo: Avatar + Nome/Papel */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Meio: Email e Status */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>

      {/* Rodapé: Badge + Botão */}
      <div className="flex items-center justify-between mt-2">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
      </div>
    </motion.div>
  );
}
