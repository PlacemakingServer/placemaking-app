import { motion } from "framer-motion";

export default function UserCardCompact({ user }) {
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
          {user.name?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-800 truncate">{user.name}</h4>
          <p className="text-xs text-gray-500 truncate">ID: {user.id}</p>
          <p className="text-xs text-gray-500 truncate">Papel: {user.role || "N/A"}</p>
          <p className="text-xs text-gray-500 truncate">Status: {user.status  || "N/A"}</p>
          <p className="text-xs text-gray-500 truncate">Email: {user.email || "N/A"}</p>
          
        </div>
      </div>
    </motion.div>
  );
}
