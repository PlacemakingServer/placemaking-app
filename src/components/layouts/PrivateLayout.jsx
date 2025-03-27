// src/components/PrivateLayout.jsx
import { useState } from "react";
import Head from "next/head";
import SidebarDesktop from "./nav/SidebarDesktop";
import SidebarMobile from "./nav/SidebarMobile";
import TopBar from "./nav/TopBar";

export default function PrivateLayout({ children, pageName, userRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{pageName || "Área Logada"}</title>
      </Head>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar para desktop */}
        <SidebarDesktop userRole={userRole} />
        {/* Sidebar para mobile */}
        <SidebarMobile userRole={userRole} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar setSidebarOpen={setSidebarOpen} pageName={pageName} />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-white to-blue-50">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
