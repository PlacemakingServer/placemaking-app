// src/components/SidebarDesktop.jsx
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

export default function SidebarDesktop({ userRole }) {
  const allowedTabs = getAllowedTabs(userRole);
  const router = useRouter();
  

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex flex-row justify-center items-center h-16 px-4">
          <Link href="/">
            <Image
              src="/img/logo-no-bg-preto.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </Link>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
        {allowedTabs.map(([name, { link }]) => {
            const isActive = router.pathname === link;
            return (
              <Link
                key={name}
                href={link}
                className={`block px-4 py-2 rounded ${
                  isActive ? TABSTYLES.active : TABSTYLES.inactive
                }`}
              >
                {name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
