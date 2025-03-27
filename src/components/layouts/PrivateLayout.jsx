import { useState } from "react";
import Head from "next/head";

export default function PrivateLayout({ children, pageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{pageName ? pageName : "Área Logada"}</title>
      </Head>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white border-r border-gray-200">
            <div className="flex items-center h-16 px-4 bg-gray-100">
              <h1 className="text-lg font-semibold">Logo</h1>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
              <a
                href="/"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Dashboard
              </a>
              <a
                href="/profile"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Perfil
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Configurações
              </a>
            </nav>
          </div>
        </div>

        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
              <div className="flex items-center h-16 px-4 bg-gray-100">
                <h1 className="text-lg font-semibold">Logo</h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <a
                  href="/"
                  className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard
                </a>
                <a
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  Perfil
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
                  onClick={() => setSidebarOpen(false)}
                >
                  Configurações
                </a>
              </nav>
            </div>
            {/* Espaço vazio para evitar que o conteúdo se estique */}
            <div className="flex-shrink-0 w-14"></div>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Topbar */}
          <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Abrir menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h2 className="text-xl font-semibold ml-2">
                {pageName || "Área Logada"}
              </h2>
            </div>
            {/* Menu do usuário (exemplo: link para perfil ou avatar) */}
            <div>
              <a
                href="/profile"
                className="text-gray-600 hover:text-gray-800"
              >
                <span className="sr-only">Perfil</span>
                <svg
                  className="h-8 w-8 rounded-full border border-gray-300"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.7 0 4-1.3 4-4s-1.3-4-4-4-4 1.3-4 4 1.3 4 4 4zm0 2c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" />
                </svg>
              </a>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
