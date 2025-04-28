import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TABS, PERMISSION_TABS, TABSTYLES } from "@/config/tabs";
import { useRouter } from "next/router";
import { useState } from "react";
import { initAuthDB } from "@/lib/db";
import Button from "@/components/ui/Button";

function getAllowedTabs(userRole) {
  const isAllowed = (name) => {
    let restrictedRoles = [];
    for (const role in PERMISSION_TABS) {
      if (PERMISSION_TABS[role].includes(name)) {
        restrictedRoles.push(role);
      }
    }
    return restrictedRoles.length === 0 || restrictedRoles.includes(userRole);
  };

  return Object.entries(TABS)
    .map(([tabName, tabData]) => {
      if (tabData.subTabs) {
        const allowedSubTabs = Object.entries(tabData.subTabs).filter(
          ([subTabName]) => isAllowed(subTabName)
        );
        if (allowedSubTabs.length > 0) {
          return [tabName, { ...tabData, allowedSubTabs }];
        }
        return null;
      } else {
        return isAllowed(tabName) ? [tabName, tabData] : null;
      }
    })
    .filter(Boolean);
}

export default function SidebarMobile({
  userRole,
  sidebarOpen,
  setSidebarOpen,
}) {
  const allowedTabs = getAllowedTabs(userRole);
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState(null);

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };

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

  const handleTabClick = (name, link, hasSubTabs) => {
    if (hasSubTabs) {
      setOpenDropdown(openDropdown === name ? null : name);
    } else {
      router.push(link);
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
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
              {allowedTabs.map(([name, data]) => {
                const hasSubTabs = data.allowedSubTabs;
                const isActive =
                  router.pathname === data.link ||
                  (hasSubTabs &&
                    data.allowedSubTabs.some(
                      ([, subData]) => subData.link === router.pathname
                    ));
                return (
                  <div key={name} className="space-y-1">
                    <button
                      onClick={() =>
                        handleTabClick(name, data.link, hasSubTabs)
                      }
                      className={`flex items-center gap-2 px-4 py-2 rounded w-full transition-all ${
                        isActive ? TABSTYLES.active : TABSTYLES.inactive
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        {data.icon}
                      </span>
                      <span className="text-sm font-medium">{name}</span>
                      {hasSubTabs && (
                        <span className="ml-auto material-symbols-outlined">
                          {openDropdown === name
                            ? "expand_less"
                            : "expand_more"}
                        </span>
                      )}
                    </button>
                    {hasSubTabs && openDropdown === name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="ml-4 mt-1 space-y-1 bg-white rounded-md"
                      >
                        {data.allowedSubTabs.map(([subName, subData]) => {
                          const isSubActive = router.pathname === subData.link;
                          return (
                            <Link
                              key={subName}
                              href={subData.link}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center gap-2 px-4 py-2 transition-all rounded-md ${
                                isSubActive
                                  ? "bg-black text-white"
                                  : "bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {subData.icon}
                              </span>
                              <span className="text-sm font-medium">
                                {subName}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>
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

          {/* Spacer para evitar scroll no fundo */}
          <div className="flex-shrink-0 w-14" aria-hidden="true" />
        </div>
      )}
    </>
  );
}
