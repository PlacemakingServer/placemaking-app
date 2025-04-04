import Link from "next/link";
import Image from "next/image";
import { TABS, PERMISSION_TABS, TABSTYLES } from "@/config/tabs";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { initAuthDB } from "@/lib/db";
import FullscreenButton from "@/components/ui/FullscreenButton";

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

export default function SidebarDesktop({ userRole }) {
  const [expanded, setExpanded] = useState(true);
  const [hoveredTab, setHoveredTab] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const router = useRouter();
  const allowedTabs = getAllowedTabs(userRole);

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

  const handleTabClick = (name, link, hasSubTabs) => {
    if (hasSubTabs) {
      setOpenDropdown(openDropdown === name ? null : name);
    } else {
      router.push(link);
    }
  };

  return (
    <motion.div
      initial={{ width: 256 }}
      animate={{ width: expanded ? 256 : 72 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="hidden md:flex md:flex-shrink-0 bg-white border-r border-gray-200 p-4"
    >
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
          {allowedTabs.map(([name, data]) => {
            const hasSubTabs = data.allowedSubTabs;
            const isActive =
              router.pathname === data.link ||
              (hasSubTabs &&
                data.allowedSubTabs.some(
                  ([, subData]) => subData.link === router.pathname
                ));
            return (
              <div key={name} className="relative">
                <div
                  onMouseEnter={() => {
                    if (!expanded) setHoveredTab(name);
                  }}
                  onMouseLeave={() => {
                    if (!expanded) setHoveredTab(null);
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTabClick(name, data.link, hasSubTabs);
                    }}
                    className={`group flex items-center gap-3 px-4 py-2 rounded-md transition-all w-full ${
                      isActive ? TABSTYLES.active : TABSTYLES.inactive
                    } ${!expanded ? "justify-center" : ""}`}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {data.icon}
                    </span>
                    {expanded && (
                      <span className="text-sm font-medium whitespace-nowrap">
                        {name}
                      </span>
                    )}
                    {hasSubTabs && expanded && (
                      <span className="ml-auto material-symbols-outlined">
                        {openDropdown === name ? "expand_less" : "expand_more"}
                      </span>
                    )}
                  </button>
                  {!expanded && hoveredTab === name && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
                      >
                        {name}
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
                {hasSubTabs && openDropdown === name && expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="ml-3 mt-1 space-y-1 bg-white rounded-md"
                  >
                    {data.allowedSubTabs.map(([subName, subData]) => {
                      const isSubActive = router.pathname === subData.link;
                      return (
                        <Link
                          key={subName}
                          href={subData.link}
                          onClick={(e) => e.stopPropagation()}
                          className={`flex items-center gap-2 px-4 py-2 transition-all rounded-md ${
                            isSubActive
                              ? "bg-black text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {subData.icon}
                          </span>
                          <span className="text-sm font-medium">{subName}</span>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer (Logout) */}
        {/* Footer (Fullscreen + Logout) */}
        <div className="space-y-1">
          <FullscreenButton
            expanded={expanded}
            hovered={hoveredTab}
            setHovered={setHoveredTab}
          />

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

            {!expanded && hoveredTab === "Logout" && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10"
                >
                  Logout
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
