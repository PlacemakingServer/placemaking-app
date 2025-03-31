import Link from "next/link";
import Image from "next/image";
import { TABS, PERMISSION_TABS, TABSTYLES } from "@/config/tabs";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { initAuthDB } from "@/lib/db";


function getAllowedTabs(userRole) {
  return Object.entries(TABS).filter(([tabName]) => {
    let restrictedRoles = [];
    for (const role in PERMISSION_TABS) {
      if (PERMISSION_TABS[role].includes(tabName)) {
        restrictedRoles.push(role);
      }
    }
    if (restrictedRoles.length === 0) return true;
    return restrictedRoles.includes(userRole);
  });
}

export default function SidebarDesktop({ userRole }) {
  const [expanded, setExpanded] = useState(true);
  const [hoveredTab, setHoveredTab] = useState(null);
  const router = useRouter();
  const allowedTabs = getAllowedTabs(userRole);

  // Limpa o tooltip quando o sidebar é expandido
  useEffect(() => {
    if (expanded) {
      setHoveredTab(null);
    }
  }, [expanded]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    try {
      const db = await initAuthDB();
      await db.clear("user-data");
      await db.clear("user-creds");
    } catch (err) {
      console.error("Erro ao limpar IndexedDB:", err);
    }
    window.location.href = "/login";
  };

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: expanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex md:flex-shrink-0 bg-white border-r border-gray-200 p-4"
    >
      {/* Container principal estruturado em 3 partes: header, nav e footer */}
      <div className="flex flex-col h-full w-full justify-between">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          {expanded && (
            <Link href="/" onClick={(e) => e.stopPropagation()}>
              <Image
                src="/img/placemaking.png"
                alt="Logo"
                width={100}
                height={40}
                className="object-contain transition-all duration-300"
                priority
              />
            </Link>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
            className="text-gray-500 hover:text-gray-800"
          >
            <span className="material-symbols-outlined text-xl">
              {expanded ? "chevron_left" : "chevron_right"}
            </span>
          </button>
        </div>

        {/* Navegação (tabs) */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {allowedTabs.map(([name, { link, icon }]) => (
            <div
              key={name}
              className="relative"
              onMouseEnter={() => {
                if (!expanded) setHoveredTab(name);
              }}
              onMouseLeave={() => {
                if (!expanded) setHoveredTab(null);
              }}
            >
              <Link
                href={link}
                onClick={(e) => e.stopPropagation()}
                className={`group flex items-center gap-3 px-4 py-2 rounded-md transition-all ${
                  router.pathname === link
                    ? TABSTYLES.active
                    : TABSTYLES.inactive
                } ${!expanded ? "justify-center" : ""}`}
              >
                <span className="material-symbols-outlined text-xl">
                  {icon}
                </span>
                {expanded && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {name}
                  </span>
                )}
              </Link>
              <AnimatePresence>
                {!expanded && hoveredTab === name && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
                  >
                    {name}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        <div
          className="relative"
          onMouseEnter={() => {
            if (!expanded) setHoveredTab("Logout");
          }}
          onMouseLeave={() => {
            if (!expanded) setHoveredTab(null);
          }}
        >
          <Button
            onClick={handleLogout}
            variant="transparent_vermelho"
            className={`w-full flex items-center gap-2 px-4 py-2 rounded transition ${
              !expanded ? "justify-center" : ""
            }`}
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            {expanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                Logout
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
