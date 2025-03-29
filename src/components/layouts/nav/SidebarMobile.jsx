// src/components/SidebarMobile.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { TABS, PERMISSION_TABS, TABSTYLES } from "@/config/tabs";
import { useRouter } from "next/router";

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
  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0 },
  };
  const router = useRouter();

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay com animação */}
          <motion.div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          ></motion.div>
          <motion.div
            className="relative flex-1 flex flex-col max-w-xs w-full bg-white"
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
            <div className="flex items-center h-16 px-4 bg-white">
              <Link href="/">
                <Image
                  src="/img/placemaking.png"
                  alt="Logo"
                  width={100}
                  height={100}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {allowedTabs.map(([name, { link, icon }]) => {
                const isActive = router.pathname === link;
                return (
                  <Link
                    key={name}
                    href={link}
                    className={`flex items-center gap-2 px-4 py-2 rounded ${
                      isActive ? TABSTYLES.active : TABSTYLES.inactive
                    }`}
                  >
                    {icon && (
                      <span className="material-symbols-outlined text-base">
                        {icon}
                      </span>
                    )}
                    <span className="text-sm font-medium">{name}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
          <div className="flex-shrink-0 w-14"></div>
        </div>
      )}
    </>
  );
}
