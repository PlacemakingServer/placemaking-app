// src/components/TopBar.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useNetworkStatus } from "@/lib/network";

export default function TopBar({ setSidebarOpen, pageName }) {
  const { userData } = useAuth();
  const isOnline = useNetworkStatus();
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
      <div className="flex items-center">
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Abrir menu</span>
          <motion.svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            whileHover={{ scale: 1.1 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </motion.svg>
        </button>
        <h2 className="text-xl font-semibold ml-2">
          {pageName || "Área Logada"}
        </h2>
        <p
          className={`text-xs flex items-center justify-center gap-2 rounded-md px-3 py-2 ml-2 font-medium transition-all
    ${isOnline ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}
  `}
        >
          <span
            className={`w-2 h-2 rounded-full inline-block 
      ${isOnline ? "bg-emerald-500" : "bg-rose-500"}
    `}
          />
          {isOnline ? "Conectado" : "Sem conexão"}
        </p>
      </div>
      <div>
        <Link
          href={`/users/${userData?.id}`}
          className="text-gray-600 hover:text-gray-800"
        >
          <span className="sr-only">Perfil</span>
          <motion.svg
            className="h-8 w-8 rounded-full border border-gray-300"
            fill="currentColor"
            viewBox="0 0 24 24"
            whileHover={{ scale: 1.05 }}
          >
            <path d="M12 12c2.7 0 4-1.3 4-4s-1.3-4-4-4-4 1.3-4 4 1.3 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
          </motion.svg>
        </Link>
      </div>
    </header>
  );
}
