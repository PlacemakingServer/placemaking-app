// src/components/PrivateLayout.jsx
import { useState } from "react";
import Head from "next/head";
import SidebarDesktop from "./nav/SidebarDesktop";
import SidebarMobile from "./nav/SidebarMobile";
import TopBar from "./nav/TopBar";
import { useAuth } from "@/context/AuthContext";

export default function PrivateLayout({ children, pageName}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userData } = useAuth();

  return (
    <>
      <Head>
        <title>{pageName || "Área Logada"}</title>
      </Head>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar para desktop */}
        <SidebarDesktop userRole={userData?.role} />
        {/* Sidebar para mobile */}
        <SidebarMobile userRole={userData?.role} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar setSidebarOpen={setSidebarOpen} pageName={pageName} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-gray-200">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
