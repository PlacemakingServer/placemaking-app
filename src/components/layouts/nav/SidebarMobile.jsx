// src/components/SidebarMobile.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TABS, PERMISSION_TABS, TABSTYLES } from "@/config/tabs";
import { useRouter } from "next/router";
import { initAuthDB } from "@/lib/db";
import Button from "@/components/ui/Button";

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

export default function SidebarMobile({
  userRole,
  sidebarOpen,
  setSidebarOpen,
}) {
  const allowedTabs = getAllowedTabs(userRole);
  const router = useRouter();

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    // 2. Limpar IndexedDB
    try {
      const db = await initAuthDB();
      await db.clear("user-data");
      await db.clear("user-creds");
    } catch (err) {
      console.error("Erro ao limpar IndexedDB:", err);
    }

    // 3. Redirecionar
    window.location.href = "/login";
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay escuro */}
          <motion.div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar principal */}
          <motion.div
            className="relative flex flex-col max-w-xs w-full bg-white"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sidebarVariants}
            drag="x"
            dragConstraints={{ left: 0, right: 300 }}
            onDragEnd={(event, info) => {
              if (info.point.x < 50) {
                setSidebarOpen(false);
              }
            }}
          >
            {/* Botão de fechar */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:bg-gray-600"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Fechar menu</span>
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center h-16 px-4 bg-white border-b">
              <Link href="/" onClick={() => setSidebarOpen(false)}>
                <Image
                  src="/img/placemaking.png"
                  alt="Logo"
                  width={100}
                  height={40}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Tabs */}
            <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
              {allowedTabs.map(([name, { link, icon }]) => {
                const isActive = router.pathname === link;
                return (
                  <Link
                    key={name}
                    href={link}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${
                      isActive ? TABSTYLES.active : TABSTYLES.inactive
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {icon}
                    </span>
                    <span className="text-sm font-medium">{name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t px-4 py-3">
              <Button
                onClick={async () => {
                  await handleLogout();
                  setSidebarOpen(false);
                }}
                variant="transparent_vermelho"
                className="w-full flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  logout
                </span>
                <span className="text-sm font-medium">Logout</span>
              </Button>
            </div>
          </motion.div>

          {/* Spacer para scroll travado em fundo */}
          <div className="flex-shrink-0 w-14" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
