import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { VARIANTS } from "@/config/colors";

export default function UserCard({ user, onViewDetails }) {
  const getBadgeVariant = (syncStatus) => {
    switch (syncStatus) {
      case "pendingCreate":
        return VARIANTS.azul_escuro;
      case "pendingUpdate":
        return VARIANTS.warning;
      case "pendingDelete":
        return VARIANTS.vermelho;
      default:
        return VARIANTS.verde;
    }
  };

  const getStatusDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ativo":
        return "bg-green-500";
      case "inactive":
      case "inativo":
        return "bg-yellow-400";
      case "pending":
      case "pendente":
        return "bg-orange-400";
      case "banned":
      case "banido":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusBackground = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ativo":
        return "bg-green-100 text-green-800"; // fundo verde claro
      case "inactive":
      case "inativo":
        return "bg-yellow-100 text-yellow-800"; // fundo amarelo claro
      case "pending":
      case "pendente":
        return "bg-orange-100 text-orange-800"; // fundo laranja claro
      case "banned":
      case "banido":
        return "bg-red-100 text-red-800"; // fundo vermelho claro
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
    >
      {/* Topo: Avatar + Nome e Papel */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm font-bold uppercase">
          {user.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">{user.name}</h4>
          <p className="text-xs text-gray-500 truncate">
            Papel: {user.role || "N/A"}
          </p>
        </div>
      </div>

      {/* Meio: Email e Status */}
      <div className="text-xs text-gray-600 space-y-1">
        <p className="truncate">Email: {user.email || "N/A"}</p>
        <div
          className={`inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium max-w-fit ${getStatusBackground(
            user.status
          )}`}
        >
          <span
            className={`w-3 h-3 rounded-full ${getStatusDotColor(user.status)}`}
          />
          <p className="truncate">{user.status || "N/A"}</p>
        </div>
      </div>

      {/* Rodapé: Badge de Sync + Botão Ver Detalhes */}
      <div className="flex items-center justify-between mt-2">
        {user._syncStatus && (
          <span
<<<<<<< HEAD
            className={`flex-shrink-0 truncate max-w-[100px] px-2 py-1 text-[10px] font-semibold rounded ${getBadgeVariant(
=======
            className={`flex-shrink-0 truncate max-w-[100px] px-2 py-1 text-xs font-semibold rounded ${getBadgeVariant(
>>>>>>> dashboard
              user._syncStatus
            )}`}
          >
            {user._syncStatus}
          </span>
        )}
        <Button
          variant="transparent_cinza"
          className="p-1 flex-shrink-0"
          onClick={onViewDetails}
          title="Ver Detalhes"
        >
          <span className="material-symbols-outlined text-base">info</span>
        </Button>
      </div>
    </motion.div>
  );
}
